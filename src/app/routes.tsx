import { createBrowserRouter } from "react-router";
import { RecuperarSenha } from "./pages/RecuperarSenha";
import { Dashboard } from "./pages/Dashboard";
import { Clientes } from "./pages/Clientes";
import { Produtos } from "./pages/Produtos";
import { EmitirFatura } from "./pages/EmitirFatura";
import { Faturas } from "./pages/Faturas";
import { Relatorios } from "./pages/Relatorios";
import { Configuracoes } from "./pages/Configuracoes";
import { Usuarios } from "./pages/Usuarios";
import { Empresas } from "./pages/Empresas";
import { Planos } from "./pages/Planos";
import { Layout } from "./components/Layout";

// Páginas públicas (utilizadores NÃO autenticados)
import { LandingPage } from "../features/landing/pages/LandingPage";
import { RegisterPage } from "../features/auth/pages/RegisterPage";
import { LoginPage } from "../features/auth/pages/LoginPage";
import { VerifyOtpPage } from "../features/auth/pages/VerifyOtpPage";
// Recuperação de palavra-passe (3 ecrãs) — ver `features/auth/pages`.
import { ResetOtpPage } from "../features/auth/pages/ResetOtpPage";
import { NewPasswordPage } from "../features/auth/pages/NewPasswordPage";

// Client panel
import { ClientLayout } from "./components/ClientLayout";
import { ClientDashboard } from "./pages/cliente/ClientDashboard";
import { ClienteFaturas } from "./pages/cliente/ClienteFaturas";
import { ClienteRelatorios } from "./pages/cliente/ClienteRelatorios";
import { ClienteConfiguracoes } from "./pages/cliente/ClienteConfiguracoes";
import { Lixeira } from "./pages/Lixeira";

export const router = createBrowserRouter([
  // Landing page pública — `/` pertence agora a esta rota
  {
    path: "/",
    Component: LandingPage,
  },
  {
    path: "/registar",
    Component: RegisterPage,
  },
  {
    // Entrada em duas fases: credenciais (pede o OTP) e validação do código.
    path: "/login",
    Component: LoginPage,
  },
  {
    path: "/login/verify-otp",
    Component: VerifyOtpPage,
  },
  {
    // Recuperação de palavra-passe, em 3 passos. O `email` viaja no `state` do
    // router (memória): um refresh devolve o utilizador ao passo 1.
    path: "/recuperar-senha",
    Component: RecuperarSenha,
  },
  {
    path: "/recuperar-senha/verificar-codigo",
    Component: ResetOtpPage,
  },
  {
    path: "/recuperar-senha/nova-senha",
    Component: NewPasswordPage,
  },
  // Admin panel
  // Rota "pathless": fornece apenas o shell (Layout) aos filhos, sem reclamar
  // o path "/" — que passou a ser a Landing Page.
  {
    Component: Layout,
    children: [
      {
        path: "dashboard",
        Component: Dashboard,
      },
      {
        path: "clientes",
        Component: Clientes,
      },
      {
        path: "produtos",
        Component: Produtos,
      },
      {
        path: "faturas",
        Component: Faturas,
      },
      {
        path: "faturas/emitir",
        Component: EmitirFatura,
      },
      {
        path: "relatorios",
        Component: Relatorios,
      },
      {
        path: "configuracoes",
        Component: Configuracoes,
      },
      {
        path: "usuarios",
        Component: Usuarios,
      },
      {
        path: "empresas",
        Component: Empresas,
      },
      {
        path: "planos",
        Component: Planos,
      },
      {
        path: "lixeira",
        Component: Lixeira,
      },
    ],
  },
  // Client panel
  {
    path: "/cliente",
    Component: ClientLayout,
    children: [
      {
        index: true,
        Component: ClientDashboard,
      },
      {
        path: "clientes",
        Component: Clientes,
      },
      {
        path: "produtos",
        Component: Produtos,
      },
      {
        path: "faturas",
        Component: ClienteFaturas,
      },
      {
        path: "faturas/emitir",
        Component: EmitirFatura,
      },
      {
        path: "relatorios",
        Component: ClienteRelatorios,
      },
      {
        path: "configuracoes",
        Component: ClienteConfiguracoes,
      },
      {
        path: "lixeira",
        Component: Lixeira,
      },
    ],
  },
]);
