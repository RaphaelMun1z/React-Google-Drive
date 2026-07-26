import { useEffect, useMemo, useState } from "react";
import { Download, Search, Share2 } from "lucide-react";
import { toast } from "sonner";
import { FileIcon } from "@/components/drive/FileIcon/FileIcon";
import { driveService } from "@/services/driveService";
import type { StoredFile } from "@/types/api";
import { getApiErrorMessage } from "@/utils/apiError";
import { formatDate, formatFileSize } from "@/utils/format";

import "./SharedPage.scss";
export function SharedPage() {
  const [files, setFiles] = useState<StoredFile[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => { driveService.listSharedFiles().then(setFiles).catch((error) => toast.error(getApiErrorMessage(error))).finally(() => setLoading(false)); }, []);
  const visible = useMemo(() => files.filter((file) => file.name.toLocaleLowerCase("pt-BR").includes(search.trim().toLocaleLowerCase("pt-BR"))), [files, search]);
  return <section className="page"><header className="page-header"><div><span className="eyebrow">Colaboração</span><h1>Compartilhados comigo</h1></div></header><div className="shared-toolbar"><label className="search-field"><Search size={19} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar arquivos compartilhados" /></label></div>{loading ? <div className="loading-state"><div className="spinner" />Carregando...</div> : visible.length === 0 ? <div className="empty-state"><Share2 size={52} /><h3>Nenhum arquivo compartilhado</h3><p>Os arquivos compartilhados com você aparecerão aqui.</p></div> : <div className="drive-list"><div className="drive-list__header"><span>Nome</span><span>Tipo</span><span>Tamanho</span><span>Enviado em</span><span /></div>{visible.map((file) => <div className="drive-row" key={file.id}><span className="drive-row__name"><FileIcon mimeType={file.mimeType} size={22} />{file.name}</span><span>{file.mimeType}</span><span>{formatFileSize(file.size)}</span><span>{formatDate(file.uploadedAt)}</span><button className="icon-button" onClick={() => driveService.downloadFile(file).catch((error) => toast.error(getApiErrorMessage(error)))} aria-label="Baixar"><Download size={19} /></button></div>)}</div>}</section>;
}
