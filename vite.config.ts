import { defineConfig, loadEnv, type ProxyOptions } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'


function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

/* ------------------------------------------------------------------ */
/* Proxy de desenvolvimento (`npm run dev`)                            */
/* ------------------------------------------------------------------ */

/**
 * Portas publicadas no host pelos `docker-compose.yml` de cada serviço:
 *   - auth_service         -> http://localhost:8000
 *   - organization_service -> http://localhost:8002
 */
const DEV_AUTH_TARGET = 'http://localhost:8000'
const DEV_ORGANIZATION_TARGET = 'http://localhost:8002'

/** Gateway nginx do `docker-compose.yml` da raiz deste projecto. */
const DEV_GATEWAY_TARGET = 'http://localhost:80'

/** Configuração de um alvo do proxy — a falha fica explícita no terminal. */
function proxyTo(target: string): ProxyOptions {
  return {
    target,
    changeOrigin: true,
    configure(proxy) {
      // Sem este aviso, um serviço em baixo devolvia apenas um 500 vazio no browser.
      proxy.on('error', (error) => {
        console.error(`[dev-proxy] Falha ao contactar ${target}: ${error.message}`)
        console.error(
          '[dev-proxy] Confirme que os serviços estão a correr (docker compose up -d) ou ajuste VITE_DEV_PROXY_TARGET / VITE_DEV_AUTH_TARGET / VITE_DEV_ORGANIZATION_TARGET no .env.',
        )
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  // Lê o `.env` do projecto (e não apenas as variáveis exportadas no shell) — é o
  // que faz VITE_DEV_PROXY_TARGET / VITE_DEV_AUTH_TARGET /
  // VITE_DEV_ORGANIZATION_TARGET definidas em `.env` funcionarem de facto.
  const env = loadEnv(mode, __dirname, '')

  const gatewayTarget = env.VITE_DEV_PROXY_TARGET?.trim()
  const authTarget = env.VITE_DEV_AUTH_TARGET?.trim() || DEV_AUTH_TARGET
  const organizationTarget = env.VITE_DEV_ORGANIZATION_TARGET?.trim() || DEV_ORGANIZATION_TARGET

  return {
    plugins: [
      figmaAssetResolver(),
      // The React and Tailwind plugins are both required for Make, even if
      // Tailwind is not being actively used – do not remove them
      react(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        // Alias @ to the src directory
        '@': path.resolve(__dirname, './src'),
      },
    },

    server: {
      // Em `npm run dev` o browser fala sempre com o Vite (`/api`) — sem CORS.
      // Com o gateway nginx (`VITE_DEV_PROXY_TARGET`) todos os pedidos passam por ele;
      // sem gateway, cada prefixo vai directamente ao serviço que o publica no host
      // pelo respectivo `docker-compose.yml`.
      // ⚠️ A ordem importa: o primeiro prefixo que coincide trata do pedido.
      proxy: gatewayTarget
        ? { '/api': proxyTo(gatewayTarget) }
        : {
            '/api/v1/auth': proxyTo(authTarget),
            '/api/v1/users': proxyTo(authTarget),
            // Reenvio do código OTP (`routes/otp/otp_rooter.php`) — vive no auth_service.
            '/api/v1/otp': proxyTo(authTarget),
            '/api/v1/company': proxyTo(organizationTarget),
            '/api/v1/organizations': proxyTo(organizationTarget),
            // Serviços ainda sem porta publicada no host (customer, product,
            // supplier e tax) só estão acessíveis através do gateway nginx.
            '/api': proxyTo(DEV_GATEWAY_TARGET),
          },
    },

    // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
    assetsInclude: ['**/*.svg', '**/*.csv'],
  }
})
