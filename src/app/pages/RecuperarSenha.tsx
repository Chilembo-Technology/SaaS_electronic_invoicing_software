import { Link } from "react-router";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { useState } from "react";
import { authService } from "../../services/authService";

import { useDocumentTitle } from "../../hooks/useDocumentTitle";

export function RecuperarSenha() {
  useDocumentTitle("Recuperar senha");

  const [email, setEmail] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || loading) return;

    setLoading(true);
    try {
      await authService.recoverPassword(email);
    } catch (err) {
      console.warn("Processando solicitação de recuperação de senha.", err);
    } finally {
      setLoading(false);
      setEnviado(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-background">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary shadow-lg shadow-primary/20 mb-4">
            <span className="text-2xl font-bold text-white">CF</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground" style={{ fontFamily: 'var(--font-display)' }}>
            Recuperar Senha
          </h1>
          <p className="text-muted-foreground">
            Digite seu email para receber o link de recuperação
          </p>
        </div>

        {!enviado ? (
          <form onSubmit={handleSubmit} className="space-y-6 mt-8">
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
                  placeholder="seu@email.com"
                  className="w-full pl-12 pr-4 py-3 bg-input-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 disabled:opacity-50"
            >
              <Mail size={20} />
              {loading ? "A Enviar..." : "Enviar Link de Recuperação"}
            </button>

            <Link
              to="/login"
              className="flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft size={16} />
              Voltar ao login
            </Link>
          </form>
        ) : (
          <div className="space-y-6 mt-8">
            <div className="flex flex-col items-center gap-4 p-6 bg-secondary/10 border border-secondary/20 rounded-lg">
              <CheckCircle className="text-secondary" size={48} />
              <div className="text-center">
                <p className="text-lg font-semibold text-foreground mb-2">Email Enviado!</p>
                <p className="text-sm text-muted-foreground">
                  Enviamos um link de recuperação para <strong>{email}</strong>. Verifique sua caixa de entrada.
                </p>
              </div>
            </div>

            <Link
              to="/login"
              className="flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft size={16} />
              Voltar ao login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
