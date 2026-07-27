import { useCallback, useEffect, useMemo, useState } from "react";
import { Folder as FolderIcon, Upload, X } from "lucide-react";
import { useRef } from "react";
import type { DragEvent } from "react";
import { toast } from "sonner";
import { Breadcrumbs } from "@/components/drive/Breadcrumbs/Breadcrumbs";
import { Button } from "@/components/common/Button/Button";
import { Modal } from "@/components/common/Modal/Modal";
import { DriveGrid } from "@/components/drive/DriveGrid/DriveGrid";
import { DriveList } from "@/components/drive/DriveList/DriveList";
import { DriveToolbar } from "@/components/drive/DriveToolbar/DriveToolbar";
import { FileIcon } from "@/components/drive/FileIcon/FileIcon";
import { EmptyState } from "@/components/drive/EmptyState/EmptyState";
import { ConfirmModal } from "@/components/modals/ConfirmModal/ConfirmModal";
import { ShareModal } from "@/components/modals/ShareModal/ShareModal";
import { TextInputModal } from "@/components/modals/TextInputModal/TextInputModal";
import { UploadModal } from "@/components/modals/UploadModal/UploadModal";
import { useDrive } from "@/contexts/DriveContext";
import { driveService } from "@/services/driveService";
import type { Folder, SharePermission, StoredFile } from "@/types/api";
import { getApiErrorMessage, getApiErrorMessageAsync } from "@/utils/apiError";
import { formatDate, formatFileSize } from "@/utils/format";

import "./DrivePage.scss";

function DriveSkeleton({ view }: { view: "grid" | "list" }) {
  if (view === "grid") return <div className="drive-skeleton-grid" aria-hidden="true">{Array.from({ length: 6 }, (_, index) => <div className="drive-skeleton-card" key={index}><span /><strong /><small /></div>)}</div>;
  return <div className="drive-skeleton-list" aria-hidden="true">{Array.from({ length: 6 }, (_, index) => <div className="drive-skeleton-row" key={index}><span /><strong /><i /><i /><i /></div>)}</div>;
}

type SelectedDriveItem = { kind: "file"; data: StoredFile } | { kind: "folder"; data: Folder };
type ContextMenuState = { item: SelectedDriveItem; x: number; y: number } | null;
type PreviewStatus = "idle" | "loading" | "success" | "unsupported" | "error";
type PreviewState = { status: PreviewStatus; url: string | null; contentType: string; text: string | null; error: string | null };
const TEXT_PREVIEW_LIMIT = 2 * 1024 * 1024;
const isPreviewMimeType = (mimeType: string) => mimeType.startsWith("image/") || mimeType === "application/pdf" || mimeType.startsWith("text/") || mimeType === "application/json" || mimeType === "application/markdown" || mimeType.startsWith("audio/") || mimeType.startsWith("video/");
const isTextMimeType = (mimeType: string) => mimeType.startsWith("text/") || mimeType === "application/json" || mimeType === "application/markdown";

export function DrivePage() {
  const drive = useDrive();
  const loadCurrentFolder = drive.loadCurrentFolder;
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"grid" | "list">(() => (localStorage.getItem("google-drive:view") as "grid" | "list") || "grid");
  const [modal, setModal] = useState<"create" | "rename-folder" | "rename-file" | "delete-folder" | "delete-file" | "share" | "upload" | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
  const [selectedFile, setSelectedFile] = useState<StoredFile | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [droppedFiles, setDroppedFiles] = useState<File[]>([]);
  const [screenDropActive, setScreenDropActive] = useState(false);
  const [selectedItem, setSelectedItem] = useState<SelectedDriveItem | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenuState>(null);
  const [detailsItem, setDetailsItem] = useState<SelectedDriveItem | null>(null);
  const [detailsClosing, setDetailsClosing] = useState(false);
  const [detailsTimer, setDetailsTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [preview, setPreview] = useState<PreviewState>({ status: "idle", url: null, contentType: "", text: null, error: null });
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewRetry, setPreviewRetry] = useState(0);
  const [previewReady, setPreviewReady] = useState(false);
  const previewUrlRef = useRef<string | null>(null);

  const refresh = useCallback(async () => { try { await loadCurrentFolder(); } catch (error) { toast.error(getApiErrorMessage(error, "NÃ£o foi possÃ­vel carregar os arquivos")); } }, [loadCurrentFolder]);
  useEffect(() => { void refresh(); }, [refresh]);
  useEffect(() => { localStorage.setItem("google-drive:view", view); }, [view]);
  useEffect(() => { if (!contextMenu) return; const close = () => setContextMenu(null); const escape = (event: KeyboardEvent) => { if (event.key === "Escape") { event.preventDefault(); setContextMenu(null); } }; const outside = (event: MouseEvent) => { if (!(event.target as Element).closest(".context-menu")) close(); }; document.addEventListener("mousedown", outside); window.addEventListener("resize", close); window.addEventListener("scroll", close, true); window.addEventListener("keydown", escape); return () => { document.removeEventListener("mousedown", outside); window.removeEventListener("resize", close); window.removeEventListener("scroll", close, true); window.removeEventListener("keydown", escape); }; }, [contextMenu]);
  const normalized = search.trim().toLocaleLowerCase("pt-BR");
  const folders = useMemo(() => drive.folders.filter((item) => item.name.toLocaleLowerCase("pt-BR").includes(normalized)), [drive.folders, normalized]);
  const files = useMemo(() => drive.files.filter((item) => item.name.toLocaleLowerCase("pt-BR").includes(normalized)), [drive.files, normalized]);
  useEffect(() => {
    const file = detailsItem?.kind === "file" ? detailsItem.data : null;
    const controller = new AbortController();
    if (previewUrlRef.current) { URL.revokeObjectURL(previewUrlRef.current); previewUrlRef.current = null; }
    if (!file) { queueMicrotask(() => setPreview({ status: "idle", url: null, contentType: "", text: null, error: null })); return () => controller.abort(); }
    if (!isPreviewMimeType(file.mimeType) || file.mimeType === "image/svg+xml") { queueMicrotask(() => setPreview({ status: "unsupported", url: null, contentType: file.mimeType, text: null, error: null })); return () => controller.abort(); }
    void (async () => {
      setPreview({ status: "loading", url: null, contentType: file.mimeType, text: null, error: null });
      try {
        const result = await driveService.previewFile(file.id, controller.signal);
        if (controller.signal.aborted) return;
        const contentType = result.contentType || file.mimeType;
        if (isTextMimeType(contentType) && result.blob.size > TEXT_PREVIEW_LIMIT) { setPreview({ status: "unsupported", url: null, contentType, text: null, error: "Este arquivo de texto é grande demais para visualização." }); return; }
        const text = isTextMimeType(contentType) ? await result.blob.text() : null;
        if (controller.signal.aborted) return;
        const formattedText = contentType === "application/json" ? (() => { try { return JSON.stringify(JSON.parse(text ?? ""), null, 2); } catch { return text; } })() : text;
        const url = text === null ? URL.createObjectURL(result.blob) : null;
        if (url) previewUrlRef.current = url;
        setPreview({ status: "success", url, contentType, text: formattedText, error: null });
      } catch (error) {
        if (controller.signal.aborted) return;
        const status = (error as { response?: { status?: number } }).response?.status;
        const parsedMessage = await getApiErrorMessageAsync(error, "Não foi possível carregar a prévia do arquivo");
        const message = status === 403 ? "Você não possui permissão para visualizar este arquivo" : status === 404 ? "Arquivo não encontrado" : status === 416 ? "O intervalo solicitado não está disponível" : status === 401 ? "Sua sessão expirou" : parsedMessage;
        setPreview({ status: "error", url: null, contentType: file.mimeType, text: null, error: message });
      }
    })();
    return () => { controller.abort(); if (previewUrlRef.current) { URL.revokeObjectURL(previewUrlRef.current); previewUrlRef.current = null; } };
  }, [detailsItem, previewRetry]);

  const execute = async (action: () => Promise<void>, success: string) => { setActionLoading(true); try { await action(); toast.success(success); setModal(null); await refresh(); } catch (error) { toast.error(getApiErrorMessage(error)); } finally { setActionLoading(false); } };
  const uploadFile = async (file: File, onProgress: (progress: number | null) => void) => { await driveService.upload(file, drive.currentFolderId, onProgress); };
  const finishUploads = async (successfulCount: number, failedCount: number) => { if (successfulCount > 0) await refresh(); if (successfulCount > 0 && failedCount === 0) { toast.success(`${successfulCount} arquivo(s) enviado(s)`); setModal(null); } };
  const selectFolder = (folder: Folder) => { if (detailsTimer) clearTimeout(detailsTimer); const item = { kind: "folder" as const, data: folder }; setSelectedItem(item); setDetailsItem(item); setDetailsClosing(false); setPreviewReady(false); setContextMenu(null); };
  const selectFile = (file: StoredFile) => { if (detailsTimer) clearTimeout(detailsTimer); const item = { kind: "file" as const, data: file }; setSelectedItem(item); setDetailsItem(item); setDetailsClosing(false); setPreviewReady(false); setContextMenu(null); };
  const clearSelection = () => { setSelectedItem(null); setContextMenu(null); if (detailsItem) { setDetailsClosing(true); const timer = setTimeout(() => { setDetailsItem(null); setDetailsClosing(false); }, 220); setDetailsTimer(timer); } };
  const openFolderAction = (folder: Folder) => { setSearch(""); clearSelection(); drive.openFolder(folder); };
  const openContextMenu = (item: SelectedDriveItem, x: number, y: number) => { setSelectedItem(item); setContextMenu({ item, x: Math.max(8, Math.min(x, window.innerWidth - 230)), y: Math.max(8, Math.min(y, window.innerHeight - 250)) }); };
  const renameFolder = (folder: Folder) => { selectFolder(folder); setSelectedFolder(folder); setModal("rename-folder"); };
  const deleteFolder = (folder: Folder) => { selectFolder(folder); setSelectedFolder(folder); setModal("delete-folder"); };
  const renameFile = (file: StoredFile) => { selectFile(file); setSelectedFile(file); setModal("rename-file"); };
  const deleteFile = (file: StoredFile) => { selectFile(file); setSelectedFile(file); setModal("delete-file"); };
  const shareFile = (file: StoredFile) => { selectFile(file); setSelectedFile(file); setModal("share"); };
  const downloadFile = async (file: StoredFile) => { try { await driveService.downloadFile(file); } catch (error) { toast.error(getApiErrorMessage(error, "NÃ£o foi possÃ­vel baixar o arquivo")); } };
  const openFilePreview = (file: StoredFile) => { selectFile(file); if (isPreviewMimeType(file.mimeType) && file.mimeType !== "image/svg+xml") setPreviewModalOpen(true); };
  const commonProps = { folders, files, onOpenFolder: openFolderAction, onRenameFolder: renameFolder, onDeleteFolder: deleteFolder, onRenameFile: renameFile, onDeleteFile: deleteFile, onShareFile: shareFile, onDownloadFile: downloadFile, onOpenFilePreview: openFilePreview, selectedId: selectedItem?.data.id, onSelectFolder: selectFolder, onSelectFile: selectFile, onClearSelection: clearSelection, onContextMenuFolder: (folder: Folder, x: number, y: number) => openContextMenu({ kind: "folder", data: folder }, x, y), onContextMenuFile: (file: StoredFile, x: number, y: number) => openContextMenu({ kind: "file", data: file }, x, y) };
  const runContextAction = (action: "open" | "details" | "preview" | "download" | "rename" | "share" | "delete") => {
    if (!contextMenu) return;
    const item = contextMenu.item;
    setContextMenu(null);
    if (action === "details") { setDetailsItem(item); setDetailsClosing(false); return; }
    if (action === "preview" && item.kind === "file") { openFilePreview(item.data); return; }
    if (item.kind === "folder") {
      if (action === "open") openFolderAction(item.data);
      if (action === "rename") { setSelectedFolder(item.data); setModal("rename-folder"); }
      if (action === "delete") { setSelectedFolder(item.data); setModal("delete-folder"); }
    } else {
      if (action === "download") void downloadFile(item.data);
      if (action === "rename") { setSelectedFile(item.data); setModal("rename-file"); }
      if (action === "share") { setSelectedFile(item.data); setModal("share"); }
      if (action === "delete") { setSelectedFile(item.data); setModal("delete-file"); }
    }
  };

  const closeUpload = () => { setDroppedFiles([]); setModal(null); };
  const hasFiles = (event: DragEvent) => Array.from(event.dataTransfer?.types ?? []).includes("Files");
  const handleFilesDragEnter = (event: DragEvent) => { if (modal === null && hasFiles(event)) { event.preventDefault(); setScreenDropActive(true); } };
  const handleFilesDragOver = (event: DragEvent) => { if (modal === null && hasFiles(event)) event.preventDefault(); };
  const handleFilesDragLeave = (event: DragEvent) => { if (event.currentTarget === event.target) setScreenDropActive(false); };
  const handleFilesDrop = (event: DragEvent) => { if (modal !== null || !hasFiles(event)) return; event.preventDefault(); setScreenDropActive(false); const files = Array.from(event.dataTransfer?.files ?? []); if (files.length) { setDroppedFiles(files); setModal("upload"); } };
  const renderPreview = (expanded = false) => {
    if (!detailsItem || detailsItem.kind !== "file") return null;
    if (preview.status === "loading") return <div className={`file-preview-skeleton file-preview-skeleton--${isTextMimeType(preview.contentType) ? "text" : "media"}`} aria-hidden="true"><span /><strong /><small /></div>;
    if (preview.status === "error") return <div className="file-preview-state"><p>{preview.error}</p><Button type="button" variant="ghost" onClick={() => { setPreviewReady(false); setPreviewRetry((value) => value + 1); }}>Tentar novamente</Button></div>;
    if (preview.status === "unsupported") return <div className="file-preview-state"><FileIcon mimeType={detailsItem.data.mimeType} size={42} /><p>{preview.error ?? "Não há visualização disponível para este tipo de arquivo."}</p><Button type="button" variant="ghost" onClick={() => void downloadFile(detailsItem.data)}>Baixar arquivo</Button></div>;
    if (preview.status !== "success") return null;
    if (preview.text !== null) return <pre className={`file-preview-text${expanded ? " is-expanded" : ""}`}>{preview.text}</pre>;
    if (!preview.url) return null;
    if (preview.contentType.startsWith("image/")) return <div className="file-preview-media">{!previewReady && <span className="file-preview-media__placeholder" aria-hidden="true" />}<img src={preview.url} alt={`Prévia de ${detailsItem.data.name}`} onLoad={() => setPreviewReady(true)} onError={() => setPreview({ ...preview, status: "error", error: "Não foi possível exibir esta imagem." })} /></div>;
    if (preview.contentType === "application/pdf") return <iframe className="file-preview-pdf" src={preview.url} title={`Prévia de ${detailsItem.data.name}`} onLoad={() => setPreviewReady(true)} />;
    if (preview.contentType.startsWith("audio/")) return <audio className="file-preview-audio" controls src={preview.url} />;
    if (preview.contentType.startsWith("video/")) return <video className="file-preview-video" controls preload="metadata" src={preview.url} />;
    return <div className="file-preview-state"><p>O navegador não suporta a visualização deste arquivo.</p></div>;
  };
  return <section className="page"><header className="page-header"><div><span className="eyebrow">Arquivos</span><h1>Meu Drive</h1></div></header><Breadcrumbs /><DriveToolbar search={search} onSearchChange={setSearch} view={view} onViewChange={setView} onCreateFolder={() => setModal("create")} onUpload={() => setModal("upload")} /><div className="files-container" onDragEnter={handleFilesDragEnter} onDragOver={handleFilesDragOver} onDragLeave={handleFilesDragLeave} onDrop={handleFilesDrop} onClick={(event) => event.target === event.currentTarget && clearSelection()}>{screenDropActive && <div className="screen-drop-overlay" aria-hidden="true"><Upload size={32} /><strong>Solte os arquivos para iniciar o upload</strong></div>}<div key={`${drive.currentFolderId ?? "root"}-${view}-${drive.loading ? "loading" : "ready"}`} className="drive-content-transition">{drive.loading ? <div className="drive-loading" aria-busy="true" aria-live="polite"><span className="sr-only">Carregando arquivos</span><DriveSkeleton view={view} /></div> : drive.error ? <div className="error-state"><h3>Não foi possível carregar os arquivos</h3><p>{drive.error}</p><Button type="button" onClick={() => void refresh()}>Tentar novamente</Button></div> : folders.length + files.length === 0 ? <EmptyState search={search} /> : view === "grid" ? <DriveGrid {...commonProps} /> : <DriveList {...commonProps} />}</div>
    </div>
    {contextMenu && <div className="context-menu" role="menu" style={{ left: contextMenu.x, top: contextMenu.y }} onContextMenu={(event) => event.preventDefault()} onKeyDown={(event) => { const items = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>("[role=menuitem]")); const index = items.indexOf(document.activeElement as HTMLButtonElement); if (event.key === "ArrowDown" || event.key === "ArrowUp") { event.preventDefault(); items[(index + (event.key === "ArrowDown" ? 1 : items.length - 1)) % items.length]?.focus(); } if (event.key === "Home" || event.key === "End") { event.preventDefault(); (event.key === "Home" ? items[0] : items[items.length - 1])?.focus(); } }}>
      {contextMenu.item.kind === "folder" ? <><button role="menuitem" onClick={() => runContextAction("open")}>Abrir</button><button role="menuitem" onClick={() => runContextAction("details")}>Ver informações</button><button role="menuitem" onClick={() => runContextAction("rename")}>Renomear</button><button role="menuitem" className="danger" onClick={() => runContextAction("delete")}>Excluir</button></> : <><button role="menuitem" onClick={() => runContextAction("preview")}>Visualizar</button><button role="menuitem" onClick={() => runContextAction("details")}>Ver informações</button><button role="menuitem" onClick={() => runContextAction("download")}>Baixar</button><button role="menuitem" onClick={() => runContextAction("rename")}>Renomear</button><button role="menuitem" onClick={() => runContextAction("share")}>Compartilhar</button><button role="menuitem" className="danger" onClick={() => runContextAction("delete")}>Excluir</button></>}
    </div>}
    {detailsItem && <aside className={`drive-details${detailsClosing ? " is-closing" : ""}`} aria-label="Informações do item"><header><h2>Informações</h2><button className="icon-button" type="button" onClick={clearSelection} aria-label="Fechar informações"><X size={19} /></button></header><div className="drive-details__identity">{detailsItem.kind === "file" ? <FileIcon mimeType={detailsItem.data.mimeType} size={42} /> : <FolderIcon size={42} />}<strong title={detailsItem.data.name}>{detailsItem.data.name}</strong></div>{detailsItem.kind === "file" && <div className="file-preview" aria-busy={preview.status === "loading"}>{renderPreview()}</div>}<dl><div><dt>Tipo</dt><dd>{detailsItem.kind === "file" ? detailsItem.data.mimeType : "Pasta"}</dd></div>{detailsItem.kind === "file" ? <><div><dt>Tamanho</dt><dd>{formatFileSize(detailsItem.data.size)}</dd></div><div><dt>Enviado em</dt><dd>{formatDate(detailsItem.data.uploadedAt)}</dd></div></> : <div><dt>Criada em</dt><dd>{formatDate(detailsItem.data.createdAt)}</dd></div>}</dl><footer><Button type="button" variant="ghost" onClick={clearSelection}>Fechar</Button>{detailsItem.kind === "folder" ? <Button type="button" onClick={() => runContextAction("open")}>Abrir</Button> : <Button type="button" onClick={() => runContextAction("download")}>Baixar</Button>}</footer></aside>}
    <Modal title={detailsItem?.kind === "file" ? detailsItem.data.name : "Visualização"} open={previewModalOpen && detailsItem?.kind === "file"} onClose={() => setPreviewModalOpen(false)}><div className="preview-modal-content">{renderPreview(true)}<footer><Button type="button" variant="ghost" onClick={() => setPreviewModalOpen(false)}>Fechar</Button>{detailsItem?.kind === "file" && <Button type="button" onClick={() => void downloadFile(detailsItem.data)}>Baixar</Button>}</footer></div></Modal>   <TextInputModal open={modal === "create"} title="Nova pasta" label="Nome da pasta" confirmLabel="Criar" loading={actionLoading} onClose={() => setModal(null)} onConfirm={(name) => void execute(() => driveService.createFolder(name, drive.currentFolderId).then(() => undefined), "Pasta criada")} />
    <TextInputModal open={modal === "rename-folder"} title="Renomear pasta" label="Novo nome" initialValue={selectedFolder?.name} confirmLabel="Salvar" loading={actionLoading} onClose={() => setModal(null)} onConfirm={(name) => selectedFolder && void execute(() => driveService.renameFolder(selectedFolder.id, name).then(() => undefined), "Pasta renomeada")} />
    <TextInputModal open={modal === "rename-file"} title="Renomear arquivo" label="Novo nome" initialValue={selectedFile?.name} confirmLabel="Salvar" loading={actionLoading} onClose={() => setModal(null)} onConfirm={(name) => selectedFile && void execute(() => driveService.renameFile(selectedFile.id, name).then(() => undefined), "Arquivo renomeado")} />
    <ConfirmModal open={modal === "delete-folder"} title="Excluir pasta" message={`A pasta â€œ${selectedFolder?.name ?? ""}â€ serÃ¡ excluÃ­da. Ela precisa estar vazia.`} loading={actionLoading} onClose={() => setModal(null)} onConfirm={() => selectedFolder && void execute(() => driveService.deleteFolder(selectedFolder.id), "Pasta excluÃ­da")} />
    <ConfirmModal open={modal === "delete-file"} title="Excluir arquivo" message={`O arquivo â€œ${selectedFile?.name ?? ""}â€ serÃ¡ excluÃ­do permanentemente.`} loading={actionLoading} onClose={() => setModal(null)} onConfirm={() => selectedFile && void execute(() => driveService.deleteFile(selectedFile.id), "Arquivo excluÃ­do")} />
    <ShareModal open={modal === "share"} file={selectedFile} loading={actionLoading} onClose={() => setModal(null)} onConfirm={(email: string, permission: SharePermission) => selectedFile && void execute(() => driveService.shareFile(selectedFile.id, email, permission), "Arquivo compartilhado")} />
    <UploadModal open={modal === "upload"} initialFiles={droppedFiles} onClose={closeUpload} onConfirm={uploadFile} onComplete={async (successfulCount, failedCount) => { await finishUploads(successfulCount, failedCount); if (failedCount === 0) setDroppedFiles([]); }} />
  </section>;
}








