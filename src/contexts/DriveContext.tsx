import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { driveService } from "@/services/driveService";
import type { Folder, StoredFile } from "@/types/api";

interface BreadcrumbItem {
  id: string | null;
  name: string;
}

interface DriveContextValue {
  folders: Folder[];
  files: StoredFile[];
  currentFolderId: string | null;
  breadcrumbs: BreadcrumbItem[];
  loading: boolean;
  error: string | null;
  loadCurrentFolder: () => Promise<void>;
  openFolder: (folder: Folder) => void;
  navigateToBreadcrumb: (index: number) => void;
  resetNavigation: () => void;
}

const DriveContext = createContext<DriveContextValue | null>(null);

export function DriveProvider({ children }: { children: ReactNode }) {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [files, setFiles] = useState<StoredFile[]>([]);
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([{ id: null, name: "Meu Drive" }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);
  const currentFolderId = breadcrumbs.at(-1)?.id ?? null;

  const loadCurrentFolder = useCallback(async () => {
    const currentRequest = ++requestId.current;
    const folderId = currentFolderId;
    setLoading(true);
    setError(null);
    try {
      const [folderData, fileData] = await Promise.all([
        driveService.listFolders(folderId),
        driveService.listFiles(folderId),
      ]);
      if (currentRequest === requestId.current) {
        setFolders(folderData);
        setFiles(fileData);
      }
    } catch (loadError) {
      if (currentRequest === requestId.current) setError(loadError instanceof Error ? loadError.message : "Não foi possível carregar os arquivos.");
      throw loadError;
    } finally {
      if (currentRequest === requestId.current) setLoading(false);
    }
  }, [currentFolderId]);

  const openFolder = useCallback((folder: Folder) => {
    setBreadcrumbs((items) => [...items, { id: folder.id, name: folder.name }]);
  }, []);

  const navigateToBreadcrumb = useCallback((index: number) => {
    setBreadcrumbs((items) => items.slice(0, index + 1));
  }, []);

  const resetNavigation = useCallback(() => {
    setBreadcrumbs([{ id: null, name: "Meu Drive" }]);
  }, []);

  const value = useMemo(() => ({ folders, files, currentFolderId, breadcrumbs, loading, error, loadCurrentFolder, openFolder, navigateToBreadcrumb, resetNavigation }), [folders, files, currentFolderId, breadcrumbs, loading, error, loadCurrentFolder, openFolder, navigateToBreadcrumb, resetNavigation]);

  return <DriveContext.Provider value={value}>{children}</DriveContext.Provider>;
}

export function useDrive() {
  const context = useContext(DriveContext);
  if (!context) throw new Error("useDrive deve ser usado dentro de DriveProvider");
  return context;
}
