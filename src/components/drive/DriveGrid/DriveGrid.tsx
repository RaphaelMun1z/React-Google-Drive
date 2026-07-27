import { Folder as FolderIcon } from "lucide-react";
import type { Folder, StoredFile } from "@/types/api";
import { formatDate, formatFileSize } from "@/utils/format";
import { DriveItemMenu } from "@/components/drive/DriveItemMenu/DriveItemMenu";
import { FileIcon } from "@/components/drive/FileIcon/FileIcon";

import "./DriveGrid.scss";
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

export function DriveGrid(props: Props) {
  return <div className="drive-grid" onClick={(event) => event.currentTarget === event.target && props.onClearSelection()}>
    {props.folders.map((folder) => <article className={`drive-card folder-card${props.selectedId === folder.id ? " is-selected" : ""}`} key={folder.id} tabIndex={0} aria-selected={props.selectedId === folder.id} onClick={() => props.onSelectFolder(folder)} onContextMenu={(event) => { event.preventDefault(); const rect = event.currentTarget.getBoundingClientRect(); props.onContextMenuFolder(folder, rect.right + 8, rect.top); }} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); if (event.key === "Enter") props.onOpenFolder(folder); else props.onSelectFolder(folder); } if (event.key === "ContextMenu" || (event.key === "F10" && event.shiftKey)) { event.preventDefault(); const rect = event.currentTarget.getBoundingClientRect(); props.onContextMenuFolder(folder, rect.left, rect.bottom); } }} onDoubleClick={() => props.onOpenFolder(folder)}>
      <div className="drive-card__top"><FolderIcon size={32} /><DriveItemMenu type="folder" onRename={() => props.onRenameFolder(folder)} onDelete={() => props.onDeleteFolder(folder)} /></div>
      <strong title={folder.name}>{folder.name}</strong><span>Pasta</span>
    </article>)}
    {props.files.map((file) => <article className={`drive-card${props.selectedId === file.id ? " is-selected" : ""}`} key={file.id} tabIndex={0} aria-selected={props.selectedId === file.id} onClick={() => props.onSelectFile(file)} onDoubleClick={() => props.onOpenFilePreview(file)} onContextMenu={(event) => { event.preventDefault(); const rect = event.currentTarget.getBoundingClientRect(); props.onContextMenuFile(file, rect.right + 8, rect.top); }} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); props.onSelectFile(file); } if (event.key === "ContextMenu" || (event.key === "F10" && event.shiftKey)) { event.preventDefault(); const rect = event.currentTarget.getBoundingClientRect(); props.onContextMenuFile(file, rect.left, rect.bottom); } }}>
      <div className="drive-card__top"><FileIcon mimeType={file.mimeType} size={32} /><DriveItemMenu type="file" onRename={() => props.onRenameFile(file)} onDelete={() => props.onDeleteFile(file)} onShare={() => props.onShareFile(file)} onDownload={() => props.onDownloadFile(file)} /></div>
      <strong title={file.name}>{file.name}</strong><span>{formatFileSize(file.size)} · {formatDate(file.uploadedAt)}</span>
    </article>)}
  </div>;
}
