// E1 — logomarcas institucionais. As imagens são as originais, apenas redimensionadas (docs/marca/README.md).
const logo = (file: string) => `${import.meta.env.BASE_URL}logos/${file}`;

export const LOGOS = {
  mpc: { src: logo('meninas-pelo-clima.webp'), w: 494, h: 520, alt: 'Logomarca do projeto Meninas pelo Clima' },
  uerj: { src: logo('uerj.webp'), w: 256, h: 256, alt: 'Logomarca da UERJ — Universidade do Estado do Rio de Janeiro' },
  uerjFebf: { src: logo('uerj-febf.webp'), w: 454, h: 144, alt: 'Logomarcas da UERJ e da FEBF — UERJ-Caxias' },
};

type LogoKey = keyof typeof LOGOS;

export function Logo({ name, className = '', eager = false }: { name: LogoKey; className?: string; eager?: boolean }) {
  const l = LOGOS[name];
  return <img src={l.src} width={l.w} height={l.h} alt={l.alt} loading={eager ? 'eager' : 'lazy'} decoding="async" className={`w-auto ${className}`} />;
}

/** Rodapé: realização (todas as páginas, exceto a tela cheia do mapa). */
export function FooterCredits() {
  return (
    <div className="mt-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">Realização</p>
      <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-3">
        <Logo name="mpc" className="h-16" />
        <Logo name="uerjFebf" className="h-11" />
      </div>
      <p className="mt-2 text-xs text-muted">Uma iniciativa do projeto Meninas pelo Clima — LabPENSo/UERJ.</p>
    </div>
  );
}

/** Selo do Início: identificação institucional logo abaixo da marca do Alag@u. */
export function InitiativeBadge() {
  return (
    <div className="mt-4 inline-flex items-center gap-3 rounded-2xl bg-white py-1.5 pl-1.5 pr-4 text-navy shadow">
      <Logo name="mpc" className="h-12" eager />
      <p className="text-sm leading-tight">
        Uma iniciativa do projeto
        <br />
        <strong>Meninas pelo Clima</strong> — LabPENSo/UERJ
      </p>
    </div>
  );
}
