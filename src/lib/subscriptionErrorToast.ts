import axios from 'axios';
import { toast } from 'sonner';

import { subscriptionErrorFromResponse } from './subscriptionErrors';

/**
 * Interceptor de resposta (fiscal_core, auth_service, organization_service):
 * num erro de subscrição (402, ou 503 USER_SEATS_BUSY) mostra um toast com o
 * título, a mensagem e o botão da acção (ex.: "Ver planos e pacotes").
 *
 * O ecrã continua a receber o erro (o `normalizeApiError` dá-lhe a mesma
 * mensagem para o banner/inline); o toast acrescenta a acção clicável. O `id`
 * por código evita toasts repetidos se o utilizador insistir.
 */
export function notifySubscriptionError(error: unknown): Promise<never> {
  if (axios.isAxiosError(error) && error.response) {
    const info = subscriptionErrorFromResponse(error.response.status, error.response.data);

    if (info) {
      toast.error(info.title, {
        id: `subscription-${info.code}`,
        description: info.message,
        action: info.action
          ? {
              label: info.action.label,
              onClick: () => {
                window.location.assign(info.action!.href);
              },
            }
          : undefined,
      });
    }
  }

  return Promise.reject(error);
}
