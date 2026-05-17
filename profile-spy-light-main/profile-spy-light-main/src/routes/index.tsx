import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { fetchInstagramProfile, type InstagramProfile } from "@/lib/instagram.functions";
import { Instagram, Users, Loader2 } from "lucide-react";
import { ScrapingProgress } from "@/components/ScrapingProgress";

function formatFollowers(
  followersRaw: number | null,
  followers: string,
  followersExact: boolean,
) {
  if (followersRaw === null) {
    return followers;
  }

  if (followersRaw >= 1_000_000) {
    const millions = followersRaw / 1_000_000;
    const compact = millions % 1 === 0 ? millions.toFixed(0) : millions.toFixed(1).replace(/\.0$/, "");
    return `${compact}M😳`;
  }

  if (!followersExact) {
    return followers;
  }

  return followersRaw.toLocaleString("pt-BR");
}

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Instagram Lookup — Nome e seguidores" },
      {
        name: "description",
        content: "Digite um @ do Instagram e descubra o nome do perfil e o número de seguidores.",
      },
    ],
  }),
});

function Index() {
  const lookup = useServerFn(fetchInstagramProfile);
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<InstagramProfile | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setProfile(null);
    setLoading(true);
    try {
      const result = await lookup({ data: { username } });
      if (result.status !== "ok") {
        setError(result.error ?? "Não foi possível obter os dados deste perfil.");
        return;
      }
      setProfile(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <header className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary text-primary-foreground mb-2">
            <Instagram className="w-7 h-7" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Instagram Lookup</h1>
          <p className="text-sm text-muted-foreground">
            Digite um @ para ver o nome e o número de seguidores
          </p>
        </header>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Buscar perfil</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  @
                </span>
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="usuario"
                  className="pl-7"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  disabled={loading}
                />
              </div>
              <Button type="submit" disabled={loading || !username.trim()}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Buscar"}
              </Button>
            </form>

            {loading && <ScrapingProgress />}

            {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

            {profile && (
              <div className="mt-6 rounded-lg border bg-muted/40 p-4 space-y-3">
                <div className="flex items-center gap-4">
                  <Avatar className="w-16 h-16">
                    {profile.avatarUrl ? (
                      <AvatarImage src={profile.avatarUrl} alt={`Foto de perfil de ${profile.username}`} />
                    ) : (
                      <AvatarFallback>{profile.fullName?.[0]?.toUpperCase() ?? "?"}</AvatarFallback>
                    )}
                  </Avatar>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">Nome</p>
                    <p className="text-lg font-semibold">{profile.fullName}</p>
                    <p className="text-xs text-muted-foreground">@{profile.username}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-2 border-t">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Seguidores:</span>
                  <span className="text-lg font-bold">
                    {formatFollowers(profile.followersRaw, profile.followers, profile.followersExact)}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          Apenas perfis públicos. Web scraping direto, sem APIs pagas.
        </p>
      </div>
    </main>
  );
}
