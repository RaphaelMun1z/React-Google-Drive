import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
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
  const currentFolderId = breadcrumbs.at(-1)?.id ?? null;

  const loadCurrentFolder = useCallback(async () => {
    setLoading(true);
    try {
      const [folderData, fileData] = await Promise.all([
        driveService.listFolders(currentFolderId),
        driveService.listFiles(currentFolderId),
      ]);
      setFolders(folderData);
      setFiles(fileData);
    } finally {
      setLoading(false);
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

  const value = useMemo(() => ({ folders, files, currentFolderId, breadcrumbs, loading, loadCurrentFolder, openFolder, navigateToBreadcrumb, resetNavigation }), [folders, files, currentFolderId, breadcrumbs, loading, loadCurrentFolder, openFolder, navigateToBreadcrumb, resetNavigation]);

  return <DriveContext.Provider value={value}>{children}</DriveContext.Provider>;
}

export function useDrive() {
  const context = useContext(DriveContext);
  if (!context) throw new Error("useDrive deve ser usado dentro de DriveProvider");
  return context;
}
