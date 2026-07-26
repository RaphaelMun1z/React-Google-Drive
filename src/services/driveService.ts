import type { Folder, SharePermission, StoredFile } from "@/types/api";
import { http } from "@/services/http";

export const driveService = {
  async listFolders(parentFolderId: string | null) {
    const { data } = await http.get<Folder[]>("/api/pastas", {
      params: parentFolderId ? { pastaPaiId: parentFolderId } : undefined,
    });
    return data;
  },

  async createFolder(name: string, parentFolderId: string | null) {
    const { data } = await http.post<Folder>("/api/pastas", { name, parentFolderId });
    return data;
  },

  async renameFolder(id: string, name: string) {
    const { data } = await http.put<Folder>(`/api/pastas/${id}`, { name });
    return data;
  },

  async deleteFolder(id: string) {
    await http.delete(`/api/pastas/${id}`);
  },

  async listFiles(folderId: string | null) {
    const { data } = await http.get<StoredFile[]>("/api/arquivos", {
      params: folderId ? { pastaId: folderId } : undefined,
    });
    return data;
  },

  async listSharedFiles() {
    const { data } = await http.get<StoredFile[]>("/api/arquivos/compartilhados");
    return data;
  },

  async upload(file: File, folderId: string | null, onProgress?: (value: number) => void) {
    const body = new FormData();
    body.append("file", file);
    if (folderId) body.append("pastaId", folderId);

    const { data } = await http.post<StoredFile>("/api/arquivos/upload", body, {
      onUploadProgress: (event) => {
        if (event.total) onProgress?.(Math.round((event.loaded * 100) / event.total));
      },
    });
    return data;
  },

  async renameFile(id: string, name: string) {
    const { data } = await http.put<StoredFile>(`/api/arquivos/${id}`, { name });
    return data;
  },

  async deleteFile(id: string) {
    await http.delete(`/api/arquivos/${id}`);
  },

  async shareFile(id: string, destinationEmail: string, permission: SharePermission) {
    await http.post(`/api/arquivos/${id}/compartilhar`, { destinationEmail, permission });
  },

  async downloadFile(file: StoredFile) {
    const response = await http.get<Blob>(`/api/arquivos/${file.id}/download`, { responseType: "blob" });
    const url = URL.createObjectURL(response.data);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = file.name;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  },
};
