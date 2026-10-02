import { Loader2 } from 'lucide-react';

import { FormAlert } from '../../../components/forms/FormAlert';
import { useAuth } from '../../../contexts/AuthContext';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { CompanyForm } from '../components/CompanyForm';
import { useCompany } from '../hooks/useCompany';
import { isSuperAdmin } from '../utils/session';

/** Sub-página "Empresa": dados fiscais, AGT, localização, logo e chave privada. */
export function CompanySettingsPage() {
  useDocumentTitle('Configurações · Empresa');

  const { user } = useAuth();
  const { company, isLoading, error, setCompany } = useCompany();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Empresa</h2>
        <p className="text-sm text-muted-foreground">
          Dados fiscais e de identificação usados na emissão de documentos.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 py-10 text-sm text-muted-foreground">
          <Loader2 size={18} className="animate-spin" aria-hidden="true" />
          A carregar dados da empresa…
        </div>
      ) : error ? (
        <FormAlert variant="error" title="Não foi possível carregar a empresa" message={error} />
      ) : !company ? (
        <FormAlert variant="warning" message="Nenhuma empresa associada à sua sessão." />
      ) : (
        <CompanyForm
          company={company}
          canEdit={isSuperAdmin(user)}
          onSaved={(updated) => setCompany(updated)}
        />
      )}
    </div>
  );
}
