import { Folder as FolderIcon } from "lucide-react";
import type { Folder, StoredFile } from "@/types/api";
import { formatDate, formatFileSize } from "@/utils/format";
import { DriveItemMenu } from "@/components/drive/DriveItemMenu/DriveItemMenu";
import { FileIcon } from "@/components/drive/FileIcon/FileIcon";

import "./DriveList.scss";
interface Props {
  folders: Folder[];
  files: StoredFile[];
  onOpenFolder: (folder: Folder) => void;
  onRenameFolder: (folder: Folder) => void;
  onDeleteFolder: (folder: Folder) => void;
  onRenameFile: (file: StoredFile) => void;
  onDeleteFile: (file: StoredFile) => void;
  onShareFile: (file: StoredFile) => void;
  onDownloadFile: (file: StoredFile) => void;
  onOpenFilePreview: (file: StoredFile) => void;
  selectedId?: string;
  onSelectFolder: (folder: Folder) => void;
  onSelectFile: (file: StoredFile) => void;
  onContextMenuFolder: (folder: Folder, x: number, y: number) => void;
  onContextMenuFile: (file: StoredFile, x: number, y: number) => void;
  onClearSelection: () => void;
}

export function DriveList(props: Props) {
  return <div className="drive-list" onClick={(event) => event.currentTarget === event.target && props.onClearSelection()}>
    <div className="drive-list__header"><span>Nome</span><span>Tipo</span><span>Tamanho</span><span>Modificado</span><span /></div>
    {props.folders.map((folder) => <div className={`drive-row${props.selectedId === folder.id ? " is-selected" : ""}`} key={folder.id} tabIndex={0} aria-selected={props.selectedId === folder.id} onClick={() => props.onSelectFolder(folder)} onContextMenu={(event) => { event.preventDefault(); const rect = event.currentTarget.getBoundingClientRect(); props.onContextMenuFolder(folder, rect.right - 190, rect.top); }} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); if (event.key === "Enter") props.onOpenFolder(folder); else props.onSelectFolder(folder); } if (event.key === "ContextMenu" || (event.key === "F10" && event.shiftKey)) { event.preventDefault(); const rect = event.currentTarget.getBoundingClientRect(); props.onContextMenuFolder(folder, rect.left, rect.bottom); } }} onDoubleClick={() => props.onOpenFolder(folder)}>
      <span className="drive-row__name"><FolderIcon size={22} />{folder.name}</span><span>Pasta</span><span>—</span><span>{formatDate(folder.createdAt)}</span><DriveItemMenu type="folder" onRename={() => props.onRenameFolder(folder)} onDelete={() => props.onDeleteFolder(folder)} />
    </div>)}
    {props.files.map((file) => <div className={`drive-row${props.selectedId === file.id ? " is-selected" : ""}`} key={file.id} tabIndex={0} aria-selected={props.selectedId === file.id} onClick={() => props.onSelectFile(file)} onDoubleClick={() => props.onOpenFilePreview(file)} onContextMenu={(event) => { event.preventDefault(); const rect = event.currentTarget.getBoundingClientRect(); props.onContextMenuFile(file, rect.right - 190, rect.top); }} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); props.onSelectFile(file); } if (event.key === "ContextMenu" || (event.key === "F10" && event.shiftKey)) { event.preventDefault(); const rect = event.currentTarget.getBoundingClientRect(); props.onContextMenuFile(file, rect.left, rect.bottom); } }}>
      <span className="drive-row__name"><FileIcon mimeType={file.mimeType} size={22} />{file.name}</span><span>{file.mimeType}</span><span>{formatFileSize(file.size)}</span><span>{formatDate(file.uploadedAt)}</span><DriveItemMenu type="file" onRename={() => props.onRenameFile(file)} onDelete={() => props.onDeleteFile(file)} onShare={() => props.onShareFile(file)} onDownload={() => props.onDownloadFile(file)} />
    </div>)}
  </div>;
}
