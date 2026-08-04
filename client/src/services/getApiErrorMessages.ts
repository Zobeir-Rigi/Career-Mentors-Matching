import axios from "axios";

interface ApiErrorResponse {
  message?: string | string[];
}

export function getApiErrorMessage(
  error: unknown,
  fallbackMessage: string,
): string {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return fallbackMessage;
  }

  const backendMessage = error.response?.data?.message;

  if (Array.isArray(backendMessage)) {
    return backendMessage.join(" ");
  }
  return backendMessage ?? fallbackMessage;
}
