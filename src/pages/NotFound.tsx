import { Link } from 'react-router-dom';
import { PageHeader } from '../components/ui';

export default function NotFound() {
  return (
    <div>
      <PageHeader title="Página não encontrada" />
      <Link to="/" className="font-semibold text-navy underline">
        Voltar para o início
      </Link>
    </div>
  );
}
