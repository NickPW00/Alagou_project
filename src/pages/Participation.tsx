import { Card, PageHeader, StatusPill } from '../components/ui';

export default function Participation() {
  return (
    <div className="space-y-5">
      <PageHeader title="Minha Participação" subtitle="Seus relatos, confirmações e preferências." />
      <Card>
        <h2 className="flex items-center gap-2 font-bold text-navy">
          Entrar no Alag@u <StatusPill status="planejado" />
        </h2>
        <p className="mt-1 text-sm">
          Na Fase 3 você poderá entrar com um link enviado ao seu e-mail, sem senha. Para consultar o mapa, não é preciso entrar.
        </p>
        <p className="mt-2 text-sm text-muted">
          Seu nome e e-mail nunca aparecem publicamente. Não guardamos sua localização contínua.
        </p>
      </Card>
      <Card>
        <h2 className="font-bold text-navy">O que estará aqui</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
          <li>Meus relatos e confirmações</li>
          <li>Relatos salvos no aparelho e ainda não enviados</li>
          <li>Bairros acompanhados e notificações (com sua autorização)</li>
          <li>Excluir minha conta</li>
        </ul>
      </Card>
    </div>
  );
}
