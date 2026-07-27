import axios from "axios";
import type { ApiError } from "@/types/api";

export function getApiErrorMessage(error: unknown, fallback = "Não foi possível concluir a operação") {
  if (axios.isAxiosError<ApiError>(error)) {
    return error.response?.data?.message ?? error.message ?? fallback;
  }
  return error instanceof Error ? error.message : fallback;
}
export async function getApiErrorMessageAsync(error: unknown, fallback = "NÃ£o foi possÃ­vel concluir a operaÃ§Ã£o") {
  if (axios.isAxiosError<ApiError>(error)) {
    const responseData = error.response?.data;
    if (responseData instanceof Blob && responseData.type.includes("json")) {
      try { return (JSON.parse(await responseData.text()) as ApiError).message ?? error.message ?? fallback; } catch { return error.message ?? fallback; }
    }
    return responseData?.message ?? error.message ?? fallback;
  }
  return error instanceof Error ? error.message : fallback;
}
