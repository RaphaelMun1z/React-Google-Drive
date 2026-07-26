import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/common/Button/Button";
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
  const [error, setError] = useState<string | null>(null);
  const loadFiles = useCallback(async () => { setLoading(true); setError(null); try { setFiles(await driveService.listSharedFiles()); } catch (loadError) { const message = getApiErrorMessage(loadError, "Não foi possível carregar os arquivos compartilhados"); setError(message); toast.error(message); } finally { setLoading(false); } }, []);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void loadFiles(); }, [loadFiles]);
  const visible = useMemo(() => files.filter((file) => file.name.toLocaleLowerCase("pt-BR").includes(search.trim().toLocaleLowerCase("pt-BR"))), [files, search]);
  return <section className="page"><header className="page-header"><div><span className="eyebrow">Colaboração</span><h1>Compartilhados comigo</h1></div></header><div className="shared-toolbar"><label className="search-field"><Search size={19} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar arquivos compartilhados" /></label></div>{loading ? <div className="shared-skeleton" aria-busy="true" aria-live="polite"><span className="sr-only">Carregando arquivos compartilhados</span>{Array.from({ length: 6 }, (_, index) => <div className="shared-skeleton__row" key={index} aria-hidden="true"><span /><strong /><i /><i /><i /></div>)}</div> : error ? <div className="error-state"><h3>Não foi possível carregar os arquivos</h3><p>{error}</p><Button type="button" onClick={() => void loadFiles()}>Tentar novamente</Button></div> : visible.length === 0 ? <div className="empty-state"><Share2 size={52} /><h3>Nenhum arquivo compartilhado</h3><p>Os arquivos compartilhados com você aparecerão aqui.</p></div> : <div className="drive-list"><div className="drive-list__header"><span>Nome</span><span>Tipo</span><span>Tamanho</span><span>Enviado em</span><span /></div>{visible.map((file) => <div className="drive-row" key={file.id}><span className="drive-row__name" title={file.name}><FileIcon mimeType={file.mimeType} size={22} />{file.name}</span><span>{file.mimeType}</span><span>{formatFileSize(file.size)}</span><span>{formatDate(file.uploadedAt)}</span><button className="icon-button" onClick={() => driveService.downloadFile(file).catch((downloadError) => toast.error(getApiErrorMessage(downloadError)))} aria-label={`Baixar ${file.name}`}><Download size={19} /></button></div>)}</div>}</section>;
}
