/**
 * `/recuperar-senha` — ecrã 1 do fluxo de recuperação de palavra-passe.
 *
 * A implementação vive em `features/auth/pages/ForgotPasswordPage.tsx`, junto
 * dos restantes ecrãs do fluxo (`ResetOtpPage` e `NewPasswordPage`). Este
 * ficheiro mantém-se como a porta de entrada da rota para não quebrar os links
 * públicos (`LoginForm` e rodapé da landing page) nem os testes que fixam
 * `href="/recuperar-senha"`.
 *
 * ⚠️ A versão anterior limitava-se a chamar `POST /v1/users/recuver-password`,
 * engolia qualquer erro e anunciava um «link de recuperação» que nunca era
 * enviado (o backend envia um código OTP de 9 dígitos). O fluxo completo
 * (código de verificação + nova senha) vive agora em `ForgotPasswordPage`.
 */
export { ForgotPasswordPage as RecuperarSenha } from "../../features/auth/pages/ForgotPasswordPage";
