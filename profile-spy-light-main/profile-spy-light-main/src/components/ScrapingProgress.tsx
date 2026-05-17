import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles } from "lucide-react";

const STAGES = [
  "Conectando ao perfil…",
  "Lendo meta tags…",
  "Consultando fontes alternativas…",
  "Extraindo nome do perfil…",
  "Contando seguidores…",
  "Finalizando análise…",
];

export function ScrapingProgress() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIdx((i) => (i + 1) % STAGES.length), 1400);
    return () => clearInterval(id);
  }, []);

  const text = STAGES[idx];

  return (
    <div className="mt-6 rounded-lg border bg-gradient-to-br from-muted/40 to-muted/10 p-5 overflow-hidden">
      <div className="flex items-center gap-2 mb-3">
        <motion.div
          animate={{ rotate: [0, 15, -10, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 1.8, repeat: Infinity }}
          className="text-primary"
        >
          <Sparkles className="w-4 h-4" />
        </motion.div>
        <span className="text-xs uppercase tracking-widest text-muted-foreground">
          IA analisando
        </span>
      </div>

      <div className="relative h-7">
        <AnimatePresence mode="wait">
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 12, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -12, filter: "blur(6px)" }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="absolute inset-0 flex flex-wrap gap-x-[0.25em]"
          >
            {text.split("").map((ch, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.025, duration: 0.3 }}
                className="text-base font-medium bg-gradient-to-r from-primary via-foreground to-primary bg-[length:200%_auto] bg-clip-text text-transparent animate-[shimmer_2.5s_linear_infinite]"
                style={{ whiteSpace: ch === " " ? "pre" : "normal" }}
              >
                {ch}
              </motion.span>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-muted">
        <motion.div
          className="h-full w-1/3 rounded-full bg-gradient-to-r from-transparent via-primary to-transparent"
          animate={{ x: ["-100%", "300%"] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
      </div>
    </div>
  );
}
