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
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(22,9,31,0.85)_0%,rgba(67,17,129,0.55)_45%,rgba(67,17,129,0.6)_60%,rgba(120,30,80,0.55)_100%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-12 right-0 h-32 w-3/5 bg-[radial-gradient(ellipse_at_top_right,rgba(255,83,0,0.22),transparent_70%)] blur-2xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-12 left-0 h-32 w-2/5 bg-[radial-gradient(ellipse_at_top_left,rgba(123,58,237,0.28),transparent_70%)] blur-2xl"
      />
    </>
  );
}
