import { Loader2 } from 'lucide-react';

import { FormAlert } from '../../../components/forms/FormAlert';
import { useAuth } from '../../../contexts/AuthContext';
import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { PasswordForm } from '../components/PasswordForm';
import { ProfileForm } from '../components/ProfileForm';
import { useProfile } from '../hooks/useProfile';
import { isAdmin } from '../utils/session';

/** Sub-página "O meu perfil": dados do utilizador logado + palavra-passe. */
export function ProfileSettingsPage() {
  useDocumentTitle('Configurações · O meu perfil');

  const { user } = useAuth();
  const { profile, isLoading, error, refresh } = useProfile();
  const canEdit = isAdmin(user);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">O meu perfil</h2>
        <p className="text-sm text-muted-foreground">Os seus dados pessoais e palavra-passe.</p>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 py-10 text-sm text-muted-foreground">
          <Loader2 size={18} className="animate-spin" aria-hidden="true" />
          A carregar o seu perfil…
        </div>
      ) : error ? (
        <FormAlert variant="error" title="Não foi possível carregar o perfil" message={error} />
      ) : profile ? (
        <>
          <ProfileForm profile={profile} canEdit={canEdit} onSaved={() => void refresh()} />

          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h2 className="mb-4 text-base font-semibold text-foreground">Alterar palavra-passe</h2>
            <PasswordForm
              userId={profile.id}
              companyId={profile.company_id}
              canEdit={canEdit}
            />
          </div>
        </>
      ) : null}
    </div>
  );
}
