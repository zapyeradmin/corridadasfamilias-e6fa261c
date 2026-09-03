/**
 * Camadas decorativas (gradientes e brilhos) do cabeçalho.
 * Renderizadas com `pointer-events-none absolute inset-0` dentro de um
 * wrapper `relative w-full` para preencher toda a largura do header.
 */
export function HeaderDecorations() {
  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(231,2,2,0.92)_0%,rgba(215,2,2,0.85)_50%,rgba(231,2,2,0.92)_100%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-12 right-0 h-32 w-3/5 bg-[radial-gradient(ellipse_at_top_right,rgba(247,96,5,0.25),transparent_70%)] blur-2xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-12 left-0 h-32 w-2/5 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.08),transparent_70%)] blur-2xl"
      />
    </>
  );
}
