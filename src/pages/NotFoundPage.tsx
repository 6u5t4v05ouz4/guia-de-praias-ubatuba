import { Link } from 'react-router-dom';
import './NotFoundPage.css';

export function NotFoundPage() {
  return (
    <div className="page">
      <div className="container">
        <div className="empty-state not-found">
          <div className="empty-state__emoji">🧭</div>
          <h1 className="empty-state__title">Página não encontrada</h1>
          <p className="subtle">
            O endereço que você abriu não existe no guia. Talvez a praia tenha sido removida ou o
            link esteja com um erro de digitação.
          </p>
          <div className="row row-2" style={{ justifyContent: 'center', marginTop: 'var(--space-5)' }}>
            <Link className="btn btn--primary" to="/praias">
              🏖️ Ver praias
            </Link>
            <Link className="btn btn--secondary" to="/">
              Início
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
