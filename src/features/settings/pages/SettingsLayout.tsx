import { Outlet } from 'react-router';

import { useDocumentTitle } from '../../../hooks/useDocumentTitle';
import { SettingsMenu } from '../components/SettingsMenu';

/**
 * Layout da secção de Configurações: cabeçalho + menu lateral (3 itens) e o
 * `<Outlet/>` com a sub-página ativa.
 */
export function SettingsLayout() {
  useDocumentTitle('Configurações');

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div>
        <h1
          className="mb-1 text-3xl font-bold text-foreground"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Configurações
        </h1>
        <p className="text-muted-foreground">
          Gerencie os dados da empresa, o seu perfil e os utilizadores.
        </p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <SettingsMenu />
        <div className="min-w-0 flex-1">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
