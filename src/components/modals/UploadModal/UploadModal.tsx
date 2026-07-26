import { FileUp } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/common/Button/Button";
import { Modal } from "@/components/common/Modal/Modal";

import "./UploadModal.scss";
interface Props { open: boolean; progress: number; loading?: boolean; onClose: () => void; onConfirm: (file: File) => void; }
export function UploadModal({ open, progress, loading, onClose, onConfirm }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  return <Modal title="Enviar arquivo" open={open} onClose={onClose}><div className="upload-content"><button className="drop-zone" type="button" onClick={() => inputRef.current?.click()}><FileUp size={42} /><strong>{file ? file.name : "Selecione um arquivo"}</strong><span>{file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : "Clique para escolher no computador"}</span></button><input ref={inputRef} hidden type="file" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />{loading && <div className="progress"><div style={{ width: `${progress}%` }} /><span>{progress}%</span></div>}<footer><Button variant="ghost" onClick={onClose} disabled={loading}>Cancelar</Button><Button onClick={() => file && onConfirm(file)} disabled={!file || loading}>{loading ? "Enviando..." : "Enviar"}</Button></footer></div></Modal>;
}
