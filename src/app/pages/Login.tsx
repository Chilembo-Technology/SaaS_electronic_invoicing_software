import { Link, useNavigate } from "react-router";
import { LogIn, Mail, Lock, AlertCircle } from "lucide-react";
import { useState } from "react";

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [tentativas, setTentativas] = useState(0);
  const bloqueado = tentativas >= 3;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (bloqueado) return;

    // Simulação de login - aceita qualquer email/senha
    if (email && senha) {
      navigate("/");
    } else {
      setTentativas(prev => prev + 1);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8 animate-fadeIn">
          {/* Logo */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary shadow-lg shadow-primary/20 mb-4">
              <span className="text-2xl font-bold text-white">CF</span>
            </div>
            <h1 className="text-3xl font-bold text-foreground" style={{ fontFamily: 'var(--font-display)' }}>
              CHILEMBO FATURA
            </h1>
            <p className="text-muted-foreground">
              Sistema de Faturação Eletrónica
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6 mt-8">
            {bloqueado && (
              <div className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <AlertCircle className="text-destructive mt-0.5" size={20} />
                <div>
                  <p className="text-sm font-semibold text-destructive">Conta Bloqueada</p>
                  <p className="text-xs text-destructive/80 mt-1">
                    Múltiplas tentativas de login falharam. Entre em contato com o suporte.
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-foreground mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={bloqueado}
                    placeholder="seu@email.com"
                    className="w-full pl-12 pr-4 py-3 bg-input-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="senha" className="block text-sm font-semibold text-foreground mb-2">
                  Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                  <input
                    id="senha"
                    type="password"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    disabled={bloqueado}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-4 py-3 bg-input-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary"
                />
                <span className="text-sm text-muted-foreground">Lembrar-me</span>
              </label>

              <Link
                to="/recuperar-senha"
                className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              >
                Esqueci minha senha
              </Link>
            </div>

            <button
              type="submit"
              disabled={bloqueado}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30"
            >
              <LogIn size={20} />
              Entrar
            </button>

            {tentativas > 0 && tentativas < 3 && (
              <p className="text-sm text-center text-muted-foreground">
                Tentativa {tentativas} de 3
              </p>
            )}
          </form>

          <div className="text-center text-sm text-muted-foreground pt-4">
            <p>© 2026 CHILEMBO TECHNOLOGY</p>
          </div>
        </div>
      </div>

      {/* Right Side - Hero */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-primary via-primary to-secondary p-12 items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>

        <div className="relative z-10 max-w-lg text-white space-y-8">
          <h2 className="text-5xl font-bold leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
            Faturação Eletrónica Simplificada
          </h2>
          <p className="text-xl text-white/90">
            Emita faturas conformes com a AGT, gerencie clientes e produtos, e tenha controle total do seu negócio.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-8">
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/20">
              <div className="text-3xl font-bold mb-1">99.9%</div>
              <div className="text-sm text-white/80">Disponibilidade</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/20">
              <div className="text-3xl font-bold mb-1">24/7</div>
              <div className="text-sm text-white/80">Suporte</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/20">
              <div className="text-3xl font-bold mb-1">AGT</div>
              <div className="text-sm text-white/80">Certificado</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/20">
              <div className="text-3xl font-bold mb-1">SAF-T</div>
              <div className="text-sm text-white/80">Integrado</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
