import { FileUp, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/common/Button/Button";
import { FileIcon } from "@/components/drive/FileIcon/FileIcon";
import { Modal } from "@/components/common/Modal/Modal";
import { formatFileSize } from "@/utils/format";

import "./UploadModal.scss";

export type UploadProgressHandler = (progress: number | null) => void;
type UploadStatus = "pending" | "preparing" | "uploading" | "success" | "error";
type UploadItem = { id: string; file: File; previewUrl?: string; status: UploadStatus; progress: number | null; errorMessage?: string };

interface Props {
  open: boolean;
  initialFiles?: File[];
  onClose: () => void;
  onConfirm: (file: File, onProgress: UploadProgressHandler) => Promise<void>;
  onComplete?: (successfulCount: number, failedCount: number) => Promise<void>;
}

const getFileId = (file: File) => `${file.name}-${file.size}-${file.lastModified}`;
const isImage = (file: File) => file.type.startsWith("image/");

export function UploadModal({ open, initialFiles = [], onClose, onConfirm, onComplete }: Props) {
  const [items, setItems] = useState<UploadItem[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const previewUrls = useRef(new Set<string>());
  const busy = uploading;

  useEffect(() => () => {
    previewUrls.current.forEach((url) => URL.revokeObjectURL(url));
    previewUrls.current.clear();
  }, []);

  const addFiles = (selectedFiles: File[]) => {
    if (busy) return;
    const knownIds = new Set(items.map((item) => item.id));
    const accepted: UploadItem[] = [];
    let duplicateCount = 0;
    selectedFiles.forEach((file) => {
      const id = getFileId(file);
      if (knownIds.has(id)) { duplicateCount += 1; return; }
      knownIds.add(id);
      const previewUrl = isImage(file) && typeof URL.createObjectURL === "function" ? URL.createObjectURL(file) : undefined;
      if (previewUrl) previewUrls.current.add(previewUrl);
      accepted.push({ id, file, previewUrl, status: "pending", progress: null });
    });
    if (accepted.length) setItems((current) => [...current, ...accepted]);
    setMessage(duplicateCount ? `${duplicateCount} arquivo(s) duplicado(s) não foram adicionados.` : "");
  };

  // The effect imports files dropped on the screen into the local queue.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (open && initialFiles.length) addFiles(initialFiles); }, [open, initialFiles]);

  const removeFile = (id: string) => {
    if (busy) return;
    setItems((current) => {
      const item = current.find((entry) => entry.id === id);
      if (item?.previewUrl) { URL.revokeObjectURL(item.previewUrl); previewUrls.current.delete(item.previewUrl); }
      return current.filter((entry) => entry.id !== id);
    });
  };

  const clearFiles = () => {
    if (busy) return;
    previewUrls.current.forEach((url) => URL.revokeObjectURL(url));
    previewUrls.current.clear();
    setItems([]);
    setMessage("");
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleUpload = async () => {
    if (busy || !items.some((item) => item.status === "pending" || item.status === "error")) return;
    setUploading(true);
    let successfulCount = 0;
    let failedCount = 0;
    for (const item of items) {
      if (item.status === "success") { successfulCount += 1; continue; }
      setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, status: "preparing", errorMessage: undefined } : entry));
      try {
        setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, status: "uploading", progress: null } : entry));
        await onConfirm(item.file, (progress) => setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, progress } : entry)));
        successfulCount += 1;
        setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, status: "success", progress: 100 } : entry));
      } catch (error) {
        failedCount += 1;
        const errorMessage = error instanceof Error ? error.message : "Falha no upload.";
        setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, status: "error", progress: null, errorMessage } : entry));
      }
    }
    setUploading(false);
    setMessage(failedCount ? `${successfulCount} concluído(s), ${failedCount} com erro.` : `${successfulCount} arquivo(s) enviado(s).`);
    await onComplete?.(successfulCount, failedCount);
    if (failedCount === 0) resetQueue();
  };

  const resetQueue = () => {
    previewUrls.current.forEach((url) => URL.revokeObjectURL(url));
    previewUrls.current.clear();
    setItems([]);
    setMessage("");
    setDragActive(false);
    if (inputRef.current) inputRef.current.value = "";
  };
  const handleClose = () => { if (!busy) { resetQueue(); onClose(); } };
  const completed = items.filter((item) => item.status === "success").length;
  const totalProgress = items.length && items.every((item) => item.progress !== null) ? Math.round(items.reduce((sum, item) => sum + (item.progress ?? 0), 0) / items.length) : null;

  return <Modal title="Enviar arquivos" open={open} onClose={handleClose}><div className="upload-content" aria-busy={busy}><button className={`drop-zone${dragActive ? " is-dragging" : ""}`} type="button" disabled={busy} onClick={() => inputRef.current?.click()} onDragEnter={(event) => { event.preventDefault(); setDragActive(true); }} onDragOver={(event) => event.preventDefault()} onDragLeave={(event) => { event.preventDefault(); setDragActive(false); }} onDrop={(event) => { event.preventDefault(); setDragActive(false); addFiles(Array.from(event.dataTransfer.files)); }}><FileUp size={34} /><strong>{dragActive ? "Solte os arquivos aqui" : "Arraste arquivos para esta área"}</strong><span>ou clique para selecionar um ou mais arquivos</span></button><input ref={inputRef} hidden type="file" multiple onChange={(event) => { addFiles(Array.from(event.target.files ?? [])); event.target.value = ""; }} /><div className="upload-summary"><span>{items.length ? `${items.length} arquivo(s) selecionado(s)` : "Nenhum arquivo selecionado"}</span>{items.length > 0 && <Button type="button" variant="ghost" disabled={busy} onClick={clearFiles}>Limpar seleção</Button>}</div>{items.length > 0 && <div className="upload-queue" aria-live="polite">{items.map((item) => <article className={`upload-item upload-item--${item.status}`} key={item.id}>{item.previewUrl ? <img className="upload-item__preview" src={item.previewUrl} alt="" /> : <span className="upload-item__icon"><FileIcon mimeType={item.file.type} size={28} /></span>}<div className="upload-item__info"><strong title={item.file.name}>{item.file.name}</strong><span>{formatFileSize(item.file.size)} · {item.status === "pending" ? "Aguardando" : item.status === "preparing" ? "Preparando arquivo" : item.status === "uploading" ? "Enviando arquivo" : item.status === "success" ? "Upload concluído" : item.errorMessage ?? "Falha no upload"}</span>{(item.status === "uploading" || item.status === "success") && <div className="upload-item__progress"><div style={{ width: `${item.progress ?? 0}%` }} /><span>{item.progress === null ? "Enviando..." : `${item.progress}%`}</span></div>}</div><button className="icon-button upload-item__remove" type="button" disabled={busy} onClick={() => removeFile(item.id)} aria-label={`Remover ${item.file.name}`}><X size={17} /></button></article>)}</div>}{items.length > 1 && <div className="upload-total"><span>Concluídos: {completed}/{items.length}</span>{totalProgress !== null && <span>{totalProgress}%</span>}</div>}{message && <p className="upload-message" role="status">{message}</p>}<footer><Button type="button" variant="ghost" onClick={handleClose} disabled={busy}>Cancelar</Button><Button type="button" onClick={() => void handleUpload()} disabled={busy || !items.some((item) => item.status === "pending" || item.status === "error")}>{busy ? "Enviando..." : items.some((item) => item.status === "error") ? "Tentar novamente" : "Enviar"}</Button></footer></div></Modal>;
}
