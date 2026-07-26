import axios from "axios";
import type { ApiError } from "@/types/api";

export function getApiErrorMessage(error: unknown, fallback = "Não foi possível concluir a operação") {
  if (axios.isAxiosError<ApiError>(error)) {
    return error.response?.data?.message ?? error.message ?? fallback;
  }
  return error instanceof Error ? error.message : fallback;
}
