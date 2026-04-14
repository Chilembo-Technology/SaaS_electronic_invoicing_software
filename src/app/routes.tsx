import { createBrowserRouter } from "react-router";
import { Login } from "./pages/Login";
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

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/recuperar-senha",
    Component: RecuperarSenha,
  },
  {
    path: "/",
    Component: Layout,
    children: [
      {
        index: true,
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
    ],
  },
]);
