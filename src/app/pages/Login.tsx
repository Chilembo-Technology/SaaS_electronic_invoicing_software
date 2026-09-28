import { Link, useNavigate } from "react-router";
import { LogIn, Mail, Lock, AlertCircle, Eye, EyeOff, ShieldCheck, Clock, Zap, FileCheck } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import axios from "axios";

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [showSenha, setShowSenha] = useState(false);
  const [lembrar, setLembrar] = useState(false);
  const [tentativas, setTentativas] = useState(0);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const bloqueado = tentativas >= 3;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (bloqueado || loading) return;

    setErro("");
    setLoading(true);

    try {
      if (!email || !senha) {
        throw new Error("Por favor, preencha o email e a senha.");
      }
      await login({ email, password: senha });
      navigate("/dashboard");
    } catch (err: unknown) {
      const novasTentativas = tentativas + 1;
      setTentativas(novasTentativas);
      if (novasTentativas >= 3) {
        setErro("Conta temporariamente bloqueada. Aguarde ou recupere a sua senha.");
      } else {
        let mensagem = "Credenciais inválidas ou dados incorretos.";
        if (axios.isAxiosError(err)) {
          const apiMessage = err.response?.data?.message || err.response?.data?.error;
          if (apiMessage && typeof apiMessage === "string") {
            mensagem = apiMessage;
          } else if (err.response?.status === 422) {
            mensagem = "Email ou senha incorretos.";
          } else if (err.response?.status === 401) {
            mensagem = "Credenciais inválidas.";
          }
        } else if (err instanceof Error) {
          mensagem = err.message;
        }
        setErro(`${mensagem} — ${3 - novasTentativas} tentativa(s) restante(s).`);
      }
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: ShieldCheck, label: "AGT Certificado", sub: "Conforme normas angolanas" },
    { icon: FileCheck, label: "SAF-T Integrado", sub: "Exportação automática" },
    { icon: Zap, label: "IVA Automático", sub: "0%, 7%, 14%, 21,5%" },
    { icon: Clock, label: "Suporte 24/7", sub: "Equipa sempre disponível" },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left — Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          {/* Logo */}
          <div className="text-center space-y-2">
         <div className="inline-flex items-center justify-center w-16 h-16    mb-4">
  <img src="/logo_with_name.png" alt="Fatura Mais" className="w-full h-full object-contain" />
</div>
            
            <p className="text-muted-foreground text-sm">Sistema de Faturação Eletrónica para Angola</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error / Block alert */}
            {(erro || bloqueado) && (
              <div className={`flex items-start gap-3 p-4 rounded-xl border ${
                bloqueado
                  ? "bg-destructive/10 border-destructive/25 text-destructive"
                  : "bg-orange-50 border-orange-200 text-orange-700 dark:bg-orange-500/10 dark:border-orange-500/25 dark:text-orange-400"
              }`}>
                <AlertCircle className="flex-shrink-0 mt-0.5" size={18} />
                <div>
                  <p className="text-sm font-semibold">
                    {bloqueado ? "Conta Bloqueada" : "Acesso negado"}
                  </p>
                  <p className="text-xs mt-0.5 opacity-80">
                    {bloqueado
                      ? "Várias tentativas falhadas. Recupere a sua senha para desbloquear."
                      : erro}
                  </p>
                  {bloqueado && (
                    <Link to="/recuperar-senha" className="text-xs font-semibold underline mt-1 inline-block">
                      Recuperar senha agora →
                    </Link>
                  )}
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-foreground mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" size={18} />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setErro(""); }}
                  disabled={bloqueado}
                  placeholder="seu@email.com"
                  autoComplete="email"
                  className={`w-full pl-11 pr-4 py-3 bg-card border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed ${
                    erro && !email ? "border-destructive" : "border-border"
                  }`}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="senha" className="text-sm font-semibold text-foreground">
                  Senha
                </label>
                <Link
                  to="/recuperar-senha"
                  className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  Esqueci a senha
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" size={18} />
                <input
                  id="senha"
                  type={showSenha ? "text" : "password"}
                  value={senha}
                  onChange={(e) => { setSenha(e.target.value); setErro(""); }}
                  disabled={bloqueado}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className={`w-full pl-11 pr-12 py-3 bg-card border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed ${
                    erro && !senha ? "border-destructive" : "border-border"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowSenha(!showSenha)}
                  disabled={bloqueado}
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors rounded disabled:opacity-40"
                  aria-label={showSenha ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <label className="flex items-center gap-3 cursor-pointer group">
              <div
                onClick={() => setLembrar(!lembrar)}
                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                  lembrar ? "bg-primary border-primary" : "border-border group-hover:border-primary/60"
                }`}
              >
                {lembrar && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 12 12">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <span className="text-sm text-muted-foreground select-none">Manter sessão iniciada</span>
            </label>

            {/* Submit */}
            <button
              type="submit"
              disabled={bloqueado || loading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/25 text-sm"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  A verificar...
                </>
              ) : (
                <>
                  <LogIn size={18} />
                  Entrar
                </>
              )}
            </button>

            {/* Attempt indicators */}
            {tentativas > 0 && !bloqueado && (
              <div className="flex items-center justify-center gap-2">
                <span className="text-xs text-muted-foreground">Tentativas:</span>
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full transition-all ${i <= tentativas ? "bg-destructive" : "bg-border"}`}
                  />
                ))}
              </div>
            )}
          </form>

          <p className="text-center text-xs text-muted-foreground pt-2">
            © 2026 CHILEMBO TECHNOLOGY · Todos os direitos reservados
          </p>
        </div>
      </div>

      {/* Right — Hero */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-primary via-primary/95 to-secondary p-12 items-center justify-center relative overflow-hidden">
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='g' width='60' height='60' patternUnits='userSpaceOnUse'%3E%3Cpath d='M10 0L0 0 0 10' fill='none' stroke='white' stroke-width='1'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23g)'/%3E%3C/svg%3E")`,
          }}
        />
        {/* Floating blobs */}
        <div className="absolute top-20 right-20 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-48 h-48 bg-secondary/20 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-lg text-white space-y-10">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-white/60 mb-4">
              Faturação Eletrónica · Angola
            </p>
            <h2 className="text-5xl font-bold leading-tight" style={{ fontFamily: "var(--font-display)" }}>
              Gerencie o seu negócio com confiança
            </h2>
            <p className="text-lg text-white/80 mt-4 leading-relaxed">
              Emita faturas conformes com a AGT, controle IVA e retenções, e exporte SAF-T automaticamente.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {features.map(({ icon: Icon, label, sub }) => (
              <div
                key={label}
                className="flex items-start gap-3 bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/15 hover:bg-white/15 transition-colors"
              >
                <div className="p-2 bg-white/15 rounded-lg flex-shrink-0">
                  <Icon size={18} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{label}</p>
                  <p className="text-xs text-white/65 mt-0.5">{sub}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3 pt-2">
            <div className="flex -space-x-2">
              {["LC", "AT", "JM", "MR"].map((i) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-primary bg-white/20 flex items-center justify-center text-xs font-bold">
                  {i}
                </div>
              ))}
            </div>
            <p className="text-sm text-white/70">
              <strong className="text-white">+500 empresas</strong> confiam no FATURA MAIS
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
