import { Loader2, LogOut } from "lucide-react";

import { Button } from "../app/components/ui/button";
import { cn } from "../app/components/ui/utils";
import { useAuth } from "../contexts/AuthContext";

interface UserMenuProps {
  /**
   * Texto do botão de saída. Sem texto, o botão mostra apenas o ícone de
   * `LogOut` (exactamente como o botão da sidebar) e o rótulo acessível fica no
   * `title`.
   */
  logoutLabel?: string;
  /** Mostra o avatar com as iniciais, o nome e o perfil (como na sidebar). */
  showIdentity?: boolean;
  /** Chamado depois de o utilizador confirmar a saída (ex.: fechar o menu mobile). */
  onLogoutConfirmed?: () => void;
  /**
   * Oculta o perfil (role) e o botão de saída, com uma transição suave
   * (~200ms). Usado na navbar da página inicial enquanto a faixa "Sessão
   * iniciada" (Zona 2) está no ecrã — essa faixa já mostra "Sair da conta" e
   * "Ir para Dashboard", pelo que a navbar não duplica as acções.
   *
   * Os elementos permanecem no DOM (esbatidos + colapsados e retirados da
   * árvore de acessibilidade), para a transição ser animável.
   */
  hideActions?: boolean;
  className?: string;
}

/**
 * Bloco de conta reutilizável: iniciais + nome (+ perfil) e o botão "Sair da Conta".
 *
 * Existe para não duplicar lógica: o `handleLogout` abaixo é o ÚNICO ponto desta
 * zona da aplicação que confirma a intenção e chama o `logout()` do
 * `AuthContext` — o mesmo caminho usado pela sidebar (`Layout`): avisa o backend
 * (`POST /v1/auth/logout`, que invalida o JWT), limpa a sessão local e volta a
 * `/login`. Nenhum pedido HTTP é feito aqui.
 *
 * Não usa o router (sem `<Link>`), pelo que pode ser renderizado em qualquer
 * contexto de testes sem `Router`.
 */
export function UserMenu({
  logoutLabel,
  showIdentity = true,
  onLogoutConfirmed,
  hideActions = false,
  className,
}: UserMenuProps) {
  const { user, logout, isLoggingOut } = useAuth();

  /** `toUser()` (authService) garante `name` preenchido na sessão autenticada. */
  const userName = user?.name || "Utilizador";
  const userRole = (user?.role || user?.perfil || "").toString();

  const getInitials = (name?: string) => {
    if (!name) return "US";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  /**
   * "Sair da conta" — mesma mensagem e mesmo comportamento do botão da sidebar:
   * confirma com `window.confirm` (sem dependências novas) e delega no contexto.
   */
  const handleLogout = () => {
    if (isLoggingOut) return;
    if (window.confirm("Tem a certeza que quer sair da conta?")) {
      logout();
      onLogoutConfirmed?.();
    }
  };

  return (
    <div className={cn("flex items-center gap-3", className)}>
      {showIdentity ? (
        <>
          <div className="w-10 h-10 shrink-0 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold">
            {getInitials(userName)}
          </div>
          <div className="min-w-0 text-left">
            <p className="text-sm font-semibold text-foreground truncate">{userName}</p>
            {userRole ? (
              <p
                className={cn(
                  "text-xs text-muted-foreground truncate transition-opacity duration-200",
                  hideActions && "opacity-0",
                )}
                aria-hidden={hideActions || undefined}
              >
                {userRole}
              </p>
            ) : null}
          </div>
        </>
      ) : null}

      {logoutLabel ? (
        <Button
          type="button"
          variant="ghost"
          onClick={handleLogout}
          disabled={isLoggingOut}
          aria-busy={isLoggingOut}
          title="Sair da Conta"
          aria-hidden={hideActions || undefined}
          tabIndex={hideActions ? -1 : undefined}
          className={cn(
            "rounded-xl font-semibold text-destructive hover:bg-destructive/10 hover:text-destructive duration-200",
            hideActions && "w-0 overflow-hidden px-0! opacity-0 pointer-events-none",
          )}
        >
          {isLoggingOut ? (
            <Loader2 className="animate-spin" aria-hidden="true" />
          ) : (
            <LogOut aria-hidden="true" />
          )}
          {isLoggingOut ? "A sair..." : logoutLabel}
        </Button>
      ) : (
        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          aria-busy={isLoggingOut}
          title="Sair da Conta"
          aria-hidden={hideActions || undefined}
          tabIndex={hideActions ? -1 : undefined}
          className={cn(
            "text-muted-foreground hover:text-destructive transition-all duration-200 p-1.5 rounded-lg hover:bg-background disabled:opacity-60 disabled:cursor-not-allowed",
            hideActions && "w-0 overflow-hidden p-0 opacity-0 pointer-events-none",
          )}
        >
          {isLoggingOut ? (
            <Loader2 size={18} className="animate-spin" aria-hidden="true" />
          ) : (
            <LogOut size={18} />
          )}
        </button>
      )}
    </div>
  );
}
