// Verificação de variáveis de ambiente críticas no boot do servidor Node (VPS).
// Falha cedo (com mensagem clara) se algo essencial estiver faltando.
// É invocado a partir de src/start.ts — só roda no servidor.

type EnvSpec = {
  name: string;
  required: boolean;
  // Onde a var é usada — só para mensagem de erro.
  usedFor: string;
};

const SPEC: EnvSpec[] = [
  // Supabase server (admin) — obrigatórias para qualquer server function/rota.
  { name: "SUPABASE_URL", required: true, usedFor: "Supabase admin client" },
  { name: "SUPABASE_SERVICE_ROLE_KEY", required: true, usedFor: "Supabase admin client (bypass RLS)" },
  { name: "SUPABASE_PUBLISHABLE_KEY", required: true, usedFor: "Supabase server-side leitura pública" },

  // Cliente — bundled em build time, mas precisam existir no momento do build.
  { name: "VITE_SUPABASE_URL", required: true, usedFor: "Supabase client (browser)" },
  { name: "VITE_SUPABASE_PUBLISHABLE_KEY", required: true, usedFor: "Supabase client (browser)" },

  // URL pública — usada para montar redirect_url do checkout InfinitePay.
  // Opcional: em runtimes serverless (Lovable Cloud / Cloudflare Worker) podemos
  // derivar do request. Obrigatória apenas em deploys self-hosted (VPS).
  { name: "PUBLIC_SITE_URL", required: false, usedFor: "Redirect/webhook callbacks (InfinitePay)" },

  // Opcionais, mas avisamos se faltarem.
  { name: "INFINITEPAY_WEBHOOK_SECRET", required: false, usedFor: "Verificação da assinatura do webhook InfinitePay" },
  { name: "LOVABLE_API_KEY", required: false, usedFor: "Lovable AI Gateway (somente se usado em server functions)" },
];

let didRun = false;

export function verifyServerEnv(): void {
  if (didRun) return;
  didRun = true;

  // Só faz sentido em runtime de servidor Node. Pula em build/SSR-de-prerender.
  if (typeof process === "undefined" || !process.env) return;

  const missingRequired: EnvSpec[] = [];
  const missingOptional: EnvSpec[] = [];

  for (const spec of SPEC) {
    const value = process.env[spec.name];
    if (!value || value.trim() === "") {
      (spec.required ? missingRequired : missingOptional).push(spec);
    }
  }

  if (missingOptional.length > 0) {
    console.warn(
      "[env-check] Variáveis opcionais ausentes (algumas features podem não funcionar):\n" +
        missingOptional.map((s) => `  - ${s.name}  (${s.usedFor})`).join("\n"),
    );
  }

  if (missingRequired.length > 0) {
    const message =
      "[env-check] AVISO — variáveis de ambiente obrigatórias ausentes no boot:\n" +
      missingRequired.map((s) => `  - ${s.name}  (${s.usedFor})`).join("\n") +
      "\n\nO erro real aparecerá no ponto de uso (ex.: Supabase client). " +
      "Em deploy self-hosted, preencha .env e reinicie.";
    console.error(message);
    // NÃO derrubar o processo: em runtimes serverless (Cloudflare Worker / Lovable Cloud)
    // process.env só é populado dentro do fetch handler, e um throw aqui mata o módulo
    // antes do error handler ser registrado, mascarando o erro real.
  } else {
    console.log("[env-check] OK — todas as variáveis de ambiente obrigatórias estão presentes.");
  }
}
