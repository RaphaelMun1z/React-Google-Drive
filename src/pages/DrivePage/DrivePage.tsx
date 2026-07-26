import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Breadcrumbs } from "@/components/drive/Breadcrumbs/Breadcrumbs";
import { Button } from "@/components/common/Button/Button";
import { DriveGrid } from "@/components/drive/DriveGrid/DriveGrid";
import { DriveList } from "@/components/drive/DriveList/DriveList";
import { DriveToolbar } from "@/components/drive/DriveToolbar/DriveToolbar";
import { EmptyState } from "@/components/drive/EmptyState/EmptyState";
import { ConfirmModal } from "@/components/modals/ConfirmModal/ConfirmModal";
import { ShareModal } from "@/components/modals/ShareModal/ShareModal";
import { TextInputModal } from "@/components/modals/TextInputModal/TextInputModal";
import { UploadModal } from "@/components/modals/UploadModal/UploadModal";
import { useDrive } from "@/contexts/DriveContext";
import { driveService } from "@/services/driveService";
import type { Folder, SharePermission, StoredFile } from "@/types/api";
import { getApiErrorMessage } from "@/utils/apiError";

import "./DrivePage.scss";

function DriveSkeleton({ view }: { view: "grid" | "list" }) {
  if (view === "grid") return <div className="drive-skeleton-grid" aria-hidden="true">{Array.from({ length: 6 }, (_, index) => <div className="drive-skeleton-card" key={index}><span /><strong /><small /></div>)}</div>;
  return <div className="drive-skeleton-list" aria-hidden="true">{Array.from({ length: 6 }, (_, index) => <div className="drive-skeleton-row" key={index}><span /><strong /><i /><i /><i /></div>)}</div>;
}

export function DrivePage() {
  const drive = useDrive();
  const loadCurrentFolder = drive.loadCurrentFolder;
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"grid" | "list">(() => (localStorage.getItem("google-drive:view") as "grid" | "list") || "grid");
  const [modal, setModal] = useState<"create" | "rename-folder" | "rename-file" | "delete-folder" | "delete-file" | "share" | "upload" | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
  const [selectedFile, setSelectedFile] = useState<StoredFile | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const refresh = useCallback(async () => { try { await loadCurrentFolder(); } catch (error) { toast.error(getApiErrorMessage(error, "NÃ£o foi possÃ­vel carregar os arquivos")); } }, [loadCurrentFolder]);
  useEffect(() => { void refresh(); }, [refresh]);
  useEffect(() => { localStorage.setItem("google-drive:view", view); }, [view]);

  const normalized = search.trim().toLocaleLowerCase("pt-BR");
  const folders = useMemo(() => drive.folders.filter((item) => item.name.toLocaleLowerCase("pt-BR").includes(normalized)), [drive.folders, normalized]);
  const files = useMemo(() => drive.files.filter((item) => item.name.toLocaleLowerCase("pt-BR").includes(normalized)), [drive.files, normalized]);

  const execute = async (action: () => Promise<void>, success: string) => { setActionLoading(true); try { await action(); toast.success(success); setModal(null); await refresh(); } catch (error) { toast.error(getApiErrorMessage(error)); } finally { setActionLoading(false); } };
  const uploadFile = async (file: File, onProgress: (progress: number | null) => void) => { await driveService.upload(file, drive.currentFolderId, onProgress); };
  const finishUploads = async (successfulCount: number, failedCount: number) => { if (successfulCount > 0) await refresh(); if (successfulCount > 0 && failedCount === 0) { toast.success(`${successfulCount} arquivo(s) enviado(s)`); setModal(null); } };
  const openFolderAction = (folder: Folder) => { setSearch(""); drive.openFolder(folder); };
  const commonProps = { folders, files, onOpenFolder: openFolderAction, onRenameFolder: (folder: Folder) => { setSelectedFolder(folder); setModal("rename-folder"); }, onDeleteFolder: (folder: Folder) => { setSelectedFolder(folder); setModal("delete-folder"); }, onRenameFile: (file: StoredFile) => { setSelectedFile(file); setModal("rename-file"); }, onDeleteFile: (file: StoredFile) => { setSelectedFile(file); setModal("delete-file"); }, onShareFile: (file: StoredFile) => { setSelectedFile(file); setModal("share"); }, onDownloadFile: async (file: StoredFile) => { try { await driveService.downloadFile(file); } catch (error) { toast.error(getApiErrorMessage(error, "NÃ£o foi possÃ­vel baixar o arquivo")); } } };

  return <section className="page"><header className="page-header"><div><span className="eyebrow">Arquivos</span><h1>Meu Drive</h1></div></header><Breadcrumbs /><DriveToolbar search={search} onSearchChange={setSearch} view={view} onViewChange={setView} onCreateFolder={() => setModal("create")} onUpload={() => setModal("upload")} />{drive.loading ? <div className="drive-loading" aria-busy="true" aria-live="polite"><span className="sr-only">Carregando arquivos</span><DriveSkeleton view={view} /></div> : drive.error ? <div className="error-state"><h3>Não foi possível carregar os arquivos</h3><p>{drive.error}</p><Button type="button" onClick={() => void refresh()}>Tentar novamente</Button></div> : folders.length + files.length === 0 ? <EmptyState search={search} /> : view === "grid" ? <DriveGrid {...commonProps} /> : <DriveList {...commonProps} />}
    <TextInputModal open={modal === "create"} title="Nova pasta" label="Nome da pasta" confirmLabel="Criar" loading={actionLoading} onClose={() => setModal(null)} onConfirm={(name) => void execute(() => driveService.createFolder(name, drive.currentFolderId).then(() => undefined), "Pasta criada")} />
    <TextInputModal open={modal === "rename-folder"} title="Renomear pasta" label="Novo nome" initialValue={selectedFolder?.name} confirmLabel="Salvar" loading={actionLoading} onClose={() => setModal(null)} onConfirm={(name) => selectedFolder && void execute(() => driveService.renameFolder(selectedFolder.id, name).then(() => undefined), "Pasta renomeada")} />
    <TextInputModal open={modal === "rename-file"} title="Renomear arquivo" label="Novo nome" initialValue={selectedFile?.name} confirmLabel="Salvar" loading={actionLoading} onClose={() => setModal(null)} onConfirm={(name) => selectedFile && void execute(() => driveService.renameFile(selectedFile.id, name).then(() => undefined), "Arquivo renomeado")} />
    <ConfirmModal open={modal === "delete-folder"} title="Excluir pasta" message={`A pasta â€œ${selectedFolder?.name ?? ""}â€ serÃ¡ excluÃ­da. Ela precisa estar vazia.`} loading={actionLoading} onClose={() => setModal(null)} onConfirm={() => selectedFolder && void execute(() => driveService.deleteFolder(selectedFolder.id), "Pasta excluÃ­da")} />
    <ConfirmModal open={modal === "delete-file"} title="Excluir arquivo" message={`O arquivo â€œ${selectedFile?.name ?? ""}â€ serÃ¡ excluÃ­do permanentemente.`} loading={actionLoading} onClose={() => setModal(null)} onConfirm={() => selectedFile && void execute(() => driveService.deleteFile(selectedFile.id), "Arquivo excluÃ­do")} />
    <ShareModal open={modal === "share"} file={selectedFile} loading={actionLoading} onClose={() => setModal(null)} onConfirm={(email: string, permission: SharePermission) => selectedFile && void execute(() => driveService.shareFile(selectedFile.id, email, permission), "Arquivo compartilhado")} />
    <UploadModal open={modal === "upload"} onClose={() => setModal(null)} onConfirm={uploadFile} onComplete={finishUploads} />
  </section>;
}


