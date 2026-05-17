import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const InputSchema = z.object({
  username: z
    .string()
    .min(1)
    .max(40)
    .transform((s) => s.trim().replace(/^@/, "").toLowerCase())
    .refine((s) => /^[a-zA-Z0-9._]+$/.test(s), "Usuário inválido"),
});

export type InstagramProfile = {
  username: string;
  fullName: string;
  followers: string;
  followersRaw: number | null;
  followersExact: boolean;
  avatarUrl: string | null;
  error?: string;
  status: "ok" | "not_found" | "rate_limited" | "unavailable";
};

type ParsedCount = {
  value: number;
  exact: boolean;
} | null;

function parseCount(text: string): ParsedCount {
  // Aceita: "1,234,567" (en), "1.234.567" (pt), "1.2M", "12.3K", "1,2 mil"
  const t = text.trim().replace(/\u00a0/g, " ");
  const m = t.match(/([\d][\d.,]*)\s*([kmbKMB]|mil|mi|bi)?/);
  if (!m) return null;
  const raw = m[1];
  const suffix = (m[2] || "").toLowerCase();
  const hasSuffix = suffix !== "";

  let numStr = raw;
  const lastDot = raw.lastIndexOf(".");
  const lastComma = raw.lastIndexOf(",");

  if (lastDot !== -1 && lastComma !== -1) {
    // ambos presentes: o mais à direita é decimal
    if (lastComma > lastDot) {
      numStr = raw.replace(/\./g, "").replace(",", ".");
    } else {
      numStr = raw.replace(/,/g, "");
    }
  } else if (lastComma !== -1) {
    const afterComma = raw.length - lastComma - 1;
    // se vier com sufixo (1,2K) ou não tiver 3 dígitos após, é decimal
    if (hasSuffix || afterComma !== 3) {
      numStr = raw.replace(",", ".");
    } else {
      numStr = raw.replace(/,/g, "");
    }
  } else if (lastDot !== -1) {
    const afterDot = raw.length - lastDot - 1;
    if (hasSuffix || afterDot !== 3) {
      // decimal: mantém
    } else {
      numStr = raw.replace(/\./g, "");
    }
  }

  let num = parseFloat(numStr);
  if (Number.isNaN(num)) return null;

  if (suffix === "k") num *= 1_000;
  else if (suffix === "m" || suffix === "mi") num *= 1_000_000;
  else if (suffix === "b" || suffix === "bi") num *= 1_000_000_000;
  else if (suffix === "mil") num *= 1_000;
  const exact = suffix === "";
  return { value: Math.round(num), exact };
}

function decodeEntities(s: string): string {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ");
}

function getImageExtension(url: string, contentType: string | null): string {
  const extMatch = url.match(/\.(jpg|jpeg|png|webp|avif)(?:[?#]|$)/i);
  if (extMatch) return `.${extMatch[1].toLowerCase()}`;
  if (contentType) {
    if (contentType.includes("jpeg")) return ".jpg";
    if (contentType.includes("png")) return ".png";
    if (contentType.includes("webp")) return ".webp";
    if (contentType.includes("avif")) return ".avif";
  }
  return ".jpg";
}

async function saveProfileImage(username: string, imageUrl: string | null): Promise<string | null> {
  if (!imageUrl) return null;
  if (typeof process === "undefined" || !process.versions?.node) return null;

  try {
    const fs = await import("fs/promises");
    const imagesDir = new URL("../UsersImages/", import.meta.url);
    await fs.mkdir(imagesDir, { recursive: true });

    const safeUsername = username.replace(/[^a-zA-Z0-9_-]/g, "_").toLowerCase();
    const res = await fetch(imageUrl, {
      headers: { "User-Agent": shuffle(USER_AGENTS)[0] },
    });
    if (!res.ok) return null;

    const contentType = res.headers.get("content-type");
    const extension = getImageExtension(imageUrl, contentType);
    const fileName = `${safeUsername}${extension}`;
    const fileUrl = new URL(fileName, imagesDir);
    const buffer = new Uint8Array(await res.arrayBuffer());

    await fs.writeFile(fileUrl, buffer);
    return fileUrl.pathname;
  } catch {
    return null;
  }
}

function cleanName(s: string): string {
  // Mantém apenas letras (com acentos), espaços, hífen e apóstrofo.
  // Remove números, pontuação, barras, emojis e símbolos.
  return s
    .replace(/[^\p{L}\s'-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const USER_AGENTS = [
  // Bots conhecidos (IG geralmente libera para preview de link)
  "Mozilla/5.0 (compatible; facebookexternalhit/1.1; +http://www.facebook.com/externalhit_uatext.php)",
  "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
  "WhatsApp/2.23.20.0",
  "TelegramBot (like TwitterBot)",
  "LinkedInBot/1.0 (compatible; Mozilla/5.0; +http://www.linkedin.com)",
  "Twitterbot/1.0",
  "Slackbot-LinkExpanding 1.0 (+https://api.slack.com/robots)",
  "Discordbot/2.0 (+https://discordapp.com)",
  "Googlebot/2.1 (+http://www.google.com/bot.html)",
  // Browsers reais como fallback
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0",
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function randomIp(): string {
  // IP "público" aleatório (não-reservado) para X-Forwarded-For
  const r = () => Math.floor(Math.random() * 254) + 1;
  return `${r()}.${r()}.${r()}.${r()}`;
}

async function tryFetch(target: string, ua: string): Promise<Response> {
  const ip = randomIp();
  return fetch(target, {
    headers: {
      "User-Agent": ua,
      "Accept-Language": "en-US,en;q=0.9,pt-BR;q=0.8",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      "Accept-Encoding": "gzip, deflate, br",
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
      "Sec-Fetch-Dest": "document",
      "Sec-Fetch-Mode": "navigate",
      "Sec-Fetch-Site": "none",
      "Sec-Fetch-User": "?1",
      "Upgrade-Insecure-Requests": "1",
      Referer: "https://www.google.com/",
      "X-Forwarded-For": ip,
      "X-Real-IP": ip,
      "CF-Connecting-IP": ip,
    },
    redirect: "follow",
  });
}

type Parsed = Pick<
  InstagramProfile,
  "fullName" | "followers" | "followersRaw" | "followersExact" | "avatarUrl" | "error" | "status"
>;

function fallbackProfile(
  username: string,
  status: Exclude<InstagramProfile["status"], "ok">,
  error: string,
): Parsed {
  return {
    fullName: username,
    followers: "—",
    followersRaw: null,
    followersExact: false,
    avatarUrl: null,
    status,
    error,
  };
}

function parseFromHtml(html: string, username: string): Parsed | null {
  const ogTitle = html.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i)?.[1];
  const ogDesc = html.match(
    /<meta\s+(?:property|name)=["'](?:og:)?description["']\s+content=["']([^"']+)["']/i,
  )?.[1];
  const ogImage = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i)?.[1] ?? null;

  return extractFrom(ogTitle, ogDesc, username, ogImage);
}

function parseFromJina(text: string, username: string): Parsed | null {
  // r.jina.ai retorna markdown tipo:
  // Title: Nome (@user) • Instagram photos and videos
  // Description: 1,234 Followers, 567 Following ...
  const title =
    text.match(/^Title:\s*(.+)$/im)?.[1] ?? text.match(/og:title["'\s:=]+([^\n"']+)/i)?.[1];
  const desc =
    text.match(/^Description:\s*(.+)$/im)?.[1] ??
    text.match(/og:description["'\s:=]+([^\n"']+)/i)?.[1] ??
    text.match(/([\d.,]+\s*[kmbKMB]?)\s+Followers[^\n]*/i)?.[0] ??
    text.match(/([\d.,]+\s*(?:mil|mi|bi)?)\s+seguidores[^\n]*/i)?.[0];
  const ogImage =
    text.match(/og:image["'\s:=]+([^\n"']+)/i)?.[1] ??
    text.match(/https?:\/\/[^\s"'<>]+\.(?:jpg|jpeg|png|webp)/i)?.[0] ??
    null;
  return extractFrom(title, desc, username, ogImage);
}

// Tokens que NÃO fazem parte do nome (badges, marcadores de conta verificada,
// sufixos institucionais de páginas grandes). Removidos antes do cleanName.
const NAME_NOISE = [
  /\bverified\b/gi,
  /\bverificad[oa]\b/gi,
  /\bofficial\b/gi,
  /\boficial\b/gi,
  /✓|✔|☑|🔵|☑️|✅/g,
  /\bon instagram\b.*$/i,
  /\binstagram photos and videos\b.*$/i,
  /\bfotos? e v[ií]deos?\b.*$/i,
];

function stripTitle(raw: string): string {
  let s = raw;
  // Corta a parte do @handle e qualquer "on Instagram: ..."
  s = s.split(/\(@/)[0];
  s = s.replace(/\s+on\s+Instagram\s*[:|·•-].*$/i, "");
  s = s.split(/[•·|]/)[0];
  s = s.replace(/\s*[-–—]\s*Instagram.*$/i, "");
  for (const re of NAME_NOISE) s = s.replace(re, " ");
  return s.trim();
}

function extractFrom(
  rawTitle: string | undefined,
  rawDesc: string | undefined,
  username: string,
  rawImage: string | null = null,
): Parsed | null {
  if (!rawDesc) return null;
  const desc = decodeEntities(rawDesc);

  // Suporta formatos: "1,234 Followers", "1.2M Followers", "1.2 mi seguidores",
  // "Followers: 1234", "1,234 seguidores" e variantes com NBSP.
  const followersMatch =
    desc.match(/([\d][\d.,\s\u00a0]*\s*[kmbKMB]?)\s+Followers/i) ||
    desc.match(/Followers[:\s]+([\d][\d.,\s\u00a0]*\s*[kmbKMB]?)/i) ||
    desc.match(/([\d][\d.,\s\u00a0]*\s*(?:mil|mi|bi)?)\s+seguidores/i) ||
    desc.match(/seguidores[:\s]+([\d][\d.,\s\u00a0]*\s*(?:mil|mi|bi)?)/i);
  if (!followersMatch) return null;

  let fullName = username;
  if (rawTitle) {
    const decoded = decodeEntities(rawTitle);
    const stripped = stripTitle(decoded);
    const cleaned = cleanName(stripped);
    if (cleaned && cleaned.toLowerCase() !== "instagram") {
      fullName = cleaned;
    }
  }

  const rawCount = followersMatch[1].replace(/\u00a0/g, " ").trim();
  const parsed = parseCount(rawCount);
  return {
    fullName,
    followers: rawCount,
    followersRaw: parsed?.value ?? null,
    followersExact: parsed?.exact ?? false,
    avatarUrl: rawImage,
    status: "ok",
  };
}

type MicrolinkResp = {
  status?: string;
  statusCode?: number;
  data?: {
    title?: string;
    description?: string;
    author?: string;
    publisher?: string;
    url?: string;
    image?: { url?: string };
  };
  redirects?: { url?: string }[];
};

// Detecta resposta "página de login" que o IG devolve quando bloqueia o IP do scraper.
// Acontece com contas grandes/verificadas. Quando isso ocorre, repetimos com force=true.
function isIgLoginPage(d: MicrolinkResp["data"]): boolean {
  if (!d) return true;
  const t = (d.title || "").trim().toLowerCase();
  const desc = (d.description || "").toLowerCase();
  if (t === "instagram" || t === "login • instagram") return true;
  if (desc.includes("create an account or log in")) return true;
  if (desc.includes("crie uma conta ou entre")) return true;
  // Redirecionou pra raiz do IG (login)
  const finalUrl = d.url || "";
  if (/^https?:\/\/(www\.)?instagram\.com\/?$/i.test(finalUrl)) return true;
  return false;
}

async function tryMicrolink(igUrl: string, force: boolean): Promise<MicrolinkResp | null> {
  const params = new URLSearchParams({
    url: igUrl,
    meta: "true",
    audio: "false",
    video: "false",
    iframe: "false",
  });
  if (force) {
    params.set("force", "true");
    params.set("ttl", "1d");
  }
  try {
    const res = await fetch(`https://api.microlink.io/?${params.toString()}`, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok && res.status !== 200) return { statusCode: res.status };
    return (await res.json()) as MicrolinkResp;
  } catch {
    return null;
  }
}

async function fetchAndParse(username: string): Promise<Parsed> {
  const igUrl = `https://www.instagram.com/${username}/`;
  const ua = shuffle(USER_AGENTS)[0];
  let notFound = false;
  let last429 = false;

  // 1) microlink.io — tenta cache primeiro (rápido), e se vier login page,
  // retenta com force=true (mais lento mas funciona pra contas grandes/verificadas).
  for (const force of [false, true]) {
    const json = await tryMicrolink(igUrl, force);
    if (!json) continue;
    if (json.statusCode === 429) {
      last429 = true;
      continue;
    }
    if (json.status === "success" && json.data && !isIgLoginPage(json.data)) {
      const title = json.data.title || json.data.author || json.data.publisher;
      const parsed = extractFrom(
        title,
        json.data.description,
        username,
        json.data.image?.url ?? null,
      );
      if (parsed) {
        await saveProfileImage(username, parsed.avatarUrl);
        return parsed;
      }
    }
  }

  // 2) r.jina.ai — renderiza a página e devolve markdown com meta tags
  try {
    const res = await fetch(`https://r.jina.ai/${igUrl}`, {
      headers: { "User-Agent": ua, "X-Return-Format": "markdown" },
    });
    if (res.status === 404) notFound = true;
    if (res.status === 429) last429 = true;
    if (res.ok) {
      const text = await res.text();
      const parsed = parseFromJina(text, username);
      if (parsed) {
        await saveProfileImage(username, parsed.avatarUrl);
        return parsed;
      }
    }
  } catch {
    /* próximo */
  }

  // 3) Proxies HTML que leem as meta tags da página
  const htmlProxies = [
    `https://api.allorigins.win/raw?url=${encodeURIComponent(igUrl)}`,
    `https://api.codetabs.com/v1/proxy/?quest=${encodeURIComponent(igUrl)}`,
    `https://corsproxy.io/?${encodeURIComponent(igUrl)}`,
  ];
  for (const proxyUrl of htmlProxies) {
    try {
      const res = await fetch(proxyUrl, { headers: { "User-Agent": ua } });
      if (res.status === 404) notFound = true;
      if (res.status === 429) last429 = true;
      if (!res.ok) continue;
      const html = await res.text();
      const parsed = parseFromHtml(html, username);
      if (parsed) {
        await saveProfileImage(username, parsed.avatarUrl);
        return parsed;
      }
    } catch {
      /* próximo */
    }
  }

  // 4) Fallback final pra contas grandes: socialblade (mantém a página em cache
  // com a contagem em JSON inline). Só conseguimos os seguidores aqui — o nome
  // fica como o username, melhor do que falhar.
  try {
    const res = await fetch(`https://socialblade.com/instagram/user/${username}`, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
      },
    });
    if (res.status === 404) notFound = true;
    if (res.ok) {
      const html = await res.text();
      const followersMatch = html.match(/"followers"\s*:\s*"(\d{4,})"/);
      if (followersMatch) {
        const n = parseInt(followersMatch[1], 10);
        return {
          fullName: username,
          followers: n.toLocaleString("en-US"),
          followersRaw: n,
          followersExact: true,
          avatarUrl: null,
          status: "ok",
        };
      }
    }
  } catch {
    /* segue pro fallback */
  }

  if (notFound) return fallbackProfile(username, "not_found", "Usuário não encontrado");
  if (last429) {
    return fallbackProfile(
      username,
      "rate_limited",
      "Limite temporário atingido. Aguarde alguns segundos e tente novamente.",
    );
  }
  return fallbackProfile(
    username,
    "unavailable",
    "Não foi possível obter os dados deste perfil (pode ser privado ou indisponível).",
  );
}

export const fetchInstagramProfile = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => InputSchema.parse(d))
  .handler(async ({ data }): Promise<InstagramProfile> => {
    const parsed = await fetchAndParse(data.username);
    return {
      username: data.username,
      ...parsed,
    };
  });
