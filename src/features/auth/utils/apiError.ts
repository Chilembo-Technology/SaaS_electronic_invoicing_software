import axios from 'axios';

/**
 * Normalização de erros da API.
 *
 * Converte qualquer falha (422 do Laravel, 500, timeout ou queda de rede) num
 * formato único que a UI sabe mostrar:
 *   - `fieldErrors` -> mensagens inline por campo (nunca em toast);
 *   - `message`     -> mensagem amigável para o banner/toast global.
 */

export interface NormalizedApiError {
  /** Código HTTP (ausente quando não houve resposta — ex.: rede/timeout). */
  status?: number;
  /** Erros por campo, com as chaves já mapeadas para os nomes do formulário. */
  fieldErrors: Record<string, string>;
  /** Mensagem amigável em português. */
  message: string;
  /** Falha de rede/timeout (servidor não respondeu). */
  isNetworkError: boolean;
  /** Erro de validação (422) — corrigível nos campos do formulário. */
  isValidationError: boolean;
}

export const API_ERROR_MESSAGES = {
  network: 'Sem ligação ao servidor. Verifique a sua internet e tente novamente.',
  timeout: 'O servidor demorou demasiado tempo a responder. Tente novamente.',
  server: 'Não foi possível concluir o registo. Tente novamente dentro de instantes.',
  notFound: 'O serviço de cadastro não está disponível neste momento. Contacte o suporte.',
  rateLimit: 'Demasiadas tentativas. Aguarde um momento antes de tentar novamente.',
  unexpected: 'Ocorreu um erro inesperado. Tente novamente.',
  validation: 'Alguns campos precisam de correção. Reveja os campos assinalados.',
  conflict: 'Já existe um registo com estes dados.',
} as const;

interface LaravelErrorBody {
  message?: string;
  error?: string;
  errors?: Record<string, string[] | string>;
}

/** Extrai a primeira mensagem de cada campo devolvido pelo Laravel. */
function mapFieldErrors(
  errors: Record<string, string[]> | undefined,
  fieldMap: Record<string, string>,
): Record<string, string> {
  const mapped: Record<string, string> = {};
  if (!errors) return mapped;

  Object.entries(errors).forEach(([field, messages]) => {
    const message = Array.isArray(messages) ? messages[0] : messages;
    if (!message) return;
    const targetField = fieldMap[field] ?? field;
    mapped[targetField] = message;
  });

  return mapped;
}

/**
 * @param fieldMap mapa `campo_do_backend -> campo_do_formulário`
 *                 (ex.: `{ phone_number: 'phoneNumber' }`).
 */
export function normalizeApiError(
  error: unknown,
  fieldMap: Record<string, string> = {},
): NormalizedApiError {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;

    // Sem resposta: timeout, DNS, CORS ou servidor em baixo
    if (!error.response) {
      return {
        fieldErrors: {},
        message: error.code === 'ECONNABORTED' ? API_ERROR_MESSAGES.timeout : API_ERROR_MESSAGES.network,
        isNetworkError: true,
        isValidationError: false,
      };
    }

    const body = (error.response.data ?? {}) as LaravelErrorBody;

    if (status === 422) {
      return {
        status,
        fieldErrors: mapFieldErrors(body.errors as Record<string, string[]> | undefined, fieldMap),
        message: body.message || API_ERROR_MESSAGES.validation,
        isNetworkError: false,
        isValidationError: true,
      };
    }

    if (status === 409) {
      return {
        status,
        fieldErrors: {},
        message: body.message || API_ERROR_MESSAGES.conflict,
        isNetworkError: false,
        isValidationError: false,
      };
    }

    if (status === 429) {
      return {
        status,
        fieldErrors: {},
        message: body.message || API_ERROR_MESSAGES.rateLimit,
        isNetworkError: false,
        isValidationError: false,
      };
    }

    if (status === 404 || status === 405) {
      return {
        status,
        fieldErrors: {},
        message: API_ERROR_MESSAGES.notFound,
        isNetworkError: false,
        isValidationError: false,
      };
    }

    if (status && status >= 500) {
      return {
        status,
        fieldErrors: {},
        message: API_ERROR_MESSAGES.server,
        isNetworkError: false,
        isValidationError: false,
      };
    }

    return {
      status,
      fieldErrors: {},
      message: body.message || body.error || API_ERROR_MESSAGES.unexpected,
      isNetworkError: false,
      isValidationError: false,
    };
  }

  return {
    fieldErrors: {},
    message: error instanceof Error && error.message ? error.message : API_ERROR_MESSAGES.unexpected,
    isNetworkError: false,
    isValidationError: false,
  };
}
