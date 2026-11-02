import { CONDITION_INFO, OUTDATED_COLOR, TREND_INFO } from '../domain/labels';
import { STREET_CONDITIONS, WATER_TRENDS } from '../domain/types';

export default function Legend({ showHistorical }: { showHistorical?: boolean }) {
  const items = STREET_CONDITIONS.filter((c) => c !== 'cannot_assess');
  return (
    <div className="text-sm">
      <p className="mb-1 font-bold text-navy">Situação da rua</p>
      <ul className="space-y-1">
        {items.map((c) => (
          <li key={c} className="flex items-center gap-2">
            <span aria-hidden="true" className="h-4 w-4 rounded-full border-2 border-white shadow" style={{ background: CONDITION_INFO[c].color }} />
            {CONDITION_INFO[c].label}
          </li>
        ))}
        <li className="flex items-center gap-2">
          <span aria-hidden="true" className="h-4 w-4 rounded-full border-2 border-white shadow" style={{ background: OUTDATED_COLOR }} />
          Desconhecida ou desatualizada
        </li>
        <li className="flex items-center gap-2">
          <span aria-hidden="true" className="h-1.5 w-6 rounded-full bg-partial ring-2 ring-white" />
          Trecho de referência (aproxime o mapa)
        </li>
        {showHistorical && (
          <li className="flex items-center gap-2">
            <span aria-hidden="true" className="h-4 w-4 rounded-full border-[3px] border-[#6A1B9A] bg-white" />
            Já alagou (histórico)
          </li>
        )}
      </ul>
      <p className="mb-1 mt-2 font-bold text-navy">Tendência da água</p>
      <ul className="grid grid-cols-2 gap-x-2">
        {WATER_TRENDS.map((t) => (
          <li key={t}>
            <span aria-hidden="true" className="font-bold">{TREND_INFO[t].arrow}</span> {TREND_INFO[t].question}
          </li>
        ))}
      </ul>
      <p className="mt-2 text-xs text-muted">
        Cores são descrições comunitárias, não classificações oficiais. Verde não significa rua segura. A linha indica o trecho de referência
        do relato; a água pode não ocupar toda a extensão.
      </p>
    </div>
  );
}
