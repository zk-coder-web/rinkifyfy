import { NextRequest, NextResponse } from 'next/server'
import { getUserIdFromToken } from '@/lib/auth-index'

export type InstagramProfile = {
  username: string
  fullName: string
  followers: string
  followersRaw: number | null
  avatarUrl: string | null
  status: 'ok' | 'not_found' | 'rate_limited' | 'unavailable'
  error?: string
}

type ParsedCount = { value: number; exact: boolean } | null

function parseCount(text: string): ParsedCount {
  const t = text.trim().replace(/\u00a0/g, ' ')
  const m = t.match(/([\d][\d.,]*)\s*([kmbKMB]|mil|mi|bi)?/)
  if (!m) return null
  const raw = m[1]
  const suffix = (m[2] || '').toLowerCase()
  const hasSuffix = suffix !== ''
  let numStr = raw
  const lastDot = raw.lastIndexOf('.')
  const lastComma = raw.lastIndexOf(',')
  if (lastDot !== -1 && lastComma !== -1) {
    numStr = lastComma > lastDot ? raw.replace(/\./g, '').replace(',', '.') : raw.replace(/,/g, '')
  } else if (lastComma !== -1) {
    const afterComma = raw.length - lastComma - 1
    numStr = hasSuffix || afterComma !== 3 ? raw.replace(',', '.') : raw.replace(/,/g, '')
  } else if (lastDot !== -1) {
    const afterDot = raw.length - lastDot - 1
    if (!hasSuffix && afterDot === 3) numStr = raw.replace(/\./g, '')
  }
  let num = parseFloat(numStr)
  if (Number.isNaN(num)) return null
  if (suffix === 'k') num *= 1_000
  else if (suffix === 'm' || suffix === 'mi') num *= 1_000_000
  else if (suffix === 'b' || suffix === 'bi') num *= 1_000_000_000
  else if (suffix === 'mil') num *= 1_000
  return { value: Math.round(num), exact: suffix === '' }
}

function decodeEntities(s: string): string {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&amp;/g, '&').replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'").replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ')
}

const NAME_NOISE = [
  /\bverified\b/gi, /\bverificad[oa]\b/gi, /\bofficial\b/gi, /\boficial\b/gi,
  /✓|✔|☑|🔵|☑️|✅/g, /\bon instagram\b.*$/i,
  /\binstagram photos and videos\b.*$/i, /\bfotos? e v[ií]deos?\b.*$/i,
]

function stripTitle(raw: string): string {
  let s = raw.split(/\(@/)[0]
  s = s.replace(/\s+on\s+Instagram\s*[:|·•-].*$/i, '')
  s = s.split(/[•·|]/)[0]
  s = s.replace(/\s*[-–—]\s*Instagram.*$/i, '')
  for (const re of NAME_NOISE) s = s.replace(re, ' ')
  return s.trim()
}

function cleanName(s: string): string {
  return s.replace(/[^\p{L}\s'-]/gu, ' ').replace(/\s+/g, ' ').trim()
}

type Parsed = Pick<InstagramProfile, 'fullName' | 'followers' | 'followersRaw' | 'avatarUrl' | 'status' | 'error'>

function extractFrom(rawTitle: string | undefined, rawDesc: string | undefined, username: string, rawImage: string | null = null): Parsed | null {
  if (!rawDesc) return null
  const desc = decodeEntities(rawDesc)
  const followersMatch =
    desc.match(/([\d][\d.,\s\u00a0]*\s*[kmbKMB]?)\s+Followers/i) ||
    desc.match(/Followers[:\s]+([\d][\d.,\s\u00a0]*\s*[kmbKMB]?)/i) ||
    desc.match(/([\d][\d.,\s\u00a0]*\s*(?:mil|mi|bi)?)\s+seguidores/i) ||
    desc.match(/seguidores[:\s]+([\d][\d.,\s\u00a0]*\s*(?:mil|mi|bi)?)/i)
  if (!followersMatch) return null
  let fullName = username
  if (rawTitle) {
    const decoded = decodeEntities(rawTitle)
    const stripped = stripTitle(decoded)
    const cleaned = cleanName(stripped)
    if (cleaned && cleaned.toLowerCase() !== 'instagram') fullName = cleaned
  }
  const rawCount = followersMatch[1].replace(/\u00a0/g, ' ').trim()
  const parsed = parseCount(rawCount)
  return { fullName, followers: rawCount, followersRaw: parsed?.value ?? null, avatarUrl: rawImage, status: 'ok' }
}

function parseFromHtml(html: string, username: string): Parsed | null {
  const ogTitle = html.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i)?.[1]
  const ogDesc = html.match(/<meta\s+(?:property|name)=["'](?:og:)?description["']\s+content=["']([^"']+)["']/i)?.[1]
  const ogImage = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i)?.[1] ?? null
  return extractFrom(ogTitle, ogDesc, username, ogImage)
}

function parseFromJina(text: string, username: string): Parsed | null {
  const title = text.match(/^Title:\s*(.+)$/im)?.[1] ?? text.match(/og:title["'\s:=]+([^\n"']+)/i)?.[1]
  const desc =
    text.match(/^Description:\s*(.+)$/im)?.[1] ??
    text.match(/og:description["'\s:=]+([^\n"']+)/i)?.[1] ??
    text.match(/([\d.,]+\s*[kmbKMB]?)\s+Followers[^\n]*/i)?.[0] ??
    text.match(/([\d.,]+\s*(?:mil|mi|bi)?)\s+seguidores[^\n]*/i)?.[0]
  const ogImage =
    text.match(/og:image["'\s:=]+([^\n"']+)/i)?.[1] ??
    text.match(/https?:\/\/[^\s"'<>]+\.(?:jpg|jpeg|png|webp)/i)?.[0] ??
    null
  return extractFrom(title, desc, username, ogImage)
}

const USER_AGENTS = [
  'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
  'Twitterbot/1.0',
  'Googlebot/2.1 (+http://www.google.com/bot.html)',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Mobile/15E148 Safari/604.1',
]

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

type MicrolinkResp = {
  status?: string
  statusCode?: number
  data?: { title?: string; description?: string; author?: string; publisher?: string; url?: string; image?: { url?: string } }
}

function isIgLoginPage(d: MicrolinkResp['data']): boolean {
  if (!d) return true
  const t = (d.title || '').trim().toLowerCase()
  const desc = (d.description || '').toLowerCase()
  if (t === 'instagram' || t === 'login • instagram') return true
  if (desc.includes('create an account or log in')) return true
  if (desc.includes('crie uma conta ou entre')) return true
  const finalUrl = d.url || ''
  if (/^https?:\/\/(www\.)?instagram\.com\/?$/i.test(finalUrl)) return true
  return false
}

async function tryMicrolink(igUrl: string, force: boolean): Promise<MicrolinkResp | null> {
  const params = new URLSearchParams({ url: igUrl, meta: 'true', audio: 'false', video: 'false', iframe: 'false' })
  if (force) { params.set('force', 'true'); params.set('ttl', '1d') }
  try {
    const res = await fetch(`https://api.microlink.io/?${params.toString()}`, { headers: { Accept: 'application/json' } })
    if (!res.ok && res.status !== 200) return { statusCode: res.status }
    return await res.json() as MicrolinkResp
  } catch { return null }
}

async function fetchAndParse(username: string): Promise<Parsed> {
  const igUrl = `https://www.instagram.com/${username}/`
  const ua = shuffle(USER_AGENTS)[0]
  let notFound = false
  let last429 = false

  // 1) microlink.io
  for (const force of [false, true]) {
    const json = await tryMicrolink(igUrl, force)
    if (!json) continue
    if (json.statusCode === 429) { last429 = true; continue }
    if (json.status === 'success' && json.data && !isIgLoginPage(json.data)) {
      const title = json.data.title || json.data.author || json.data.publisher
      const parsed = extractFrom(title, json.data.description, username, json.data.image?.url ?? null)
      if (parsed) return parsed
    }
  }

  // 2) r.jina.ai
  try {
    const res = await fetch(`https://r.jina.ai/${igUrl}`, { headers: { 'User-Agent': ua, 'X-Return-Format': 'markdown' } })
    if (res.status === 404) notFound = true
    if (res.status === 429) last429 = true
    if (res.ok) {
      const text = await res.text()
      const parsed = parseFromJina(text, username)
      if (parsed) return parsed
    }
  } catch { /* próximo */ }

  // 3) Proxies HTML
  const htmlProxies = [
    `https://api.allorigins.win/raw?url=${encodeURIComponent(igUrl)}`,
    `https://corsproxy.io/?${encodeURIComponent(igUrl)}`,
  ]
  for (const proxyUrl of htmlProxies) {
    try {
      const res = await fetch(proxyUrl, { headers: { 'User-Agent': ua } })
      if (res.status === 404) notFound = true
      if (res.status === 429) last429 = true
      if (!res.ok) continue
      const html = await res.text()
      const parsed = parseFromHtml(html, username)
      if (parsed) return parsed
    } catch { /* próximo */ }
  }

  if (notFound) return { fullName: username, followers: '—', followersRaw: null, avatarUrl: null, status: 'not_found', error: 'Usuário não encontrado' }
  if (last429) return { fullName: username, followers: '—', followersRaw: null, avatarUrl: null, status: 'rate_limited', error: 'Limite temporário atingido. Tente novamente em alguns segundos.' }
  return { fullName: username, followers: '—', followersRaw: null, avatarUrl: null, status: 'unavailable', error: 'Não foi possível obter os dados deste perfil.' }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromToken(request)
    if (!userId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const raw = (body.username as string || '').trim().replace(/^@/, '').toLowerCase()

    if (!raw || !/^[a-zA-Z0-9._]+$/.test(raw)) {
      return NextResponse.json({ error: 'Username inválido' }, { status: 400 })
    }

    const parsed = await fetchAndParse(raw)

    return NextResponse.json({
      username: raw,
      ...parsed,
    } satisfies InstagramProfile)
  } catch (error) {
    console.error('[instagram/lookup] erro:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
