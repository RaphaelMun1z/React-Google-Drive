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
}

export function DriveGrid(props: Props) {
  return <div className="drive-grid">
    {props.folders.map((folder) => <article className="drive-card folder-card" key={folder.id} onDoubleClick={() => props.onOpenFolder(folder)}>
      <div className="drive-card__top"><FolderIcon size={32} /><DriveItemMenu type="folder" onRename={() => props.onRenameFolder(folder)} onDelete={() => props.onDeleteFolder(folder)} /></div>
      <strong title={folder.name}>{folder.name}</strong><span>Pasta</span>
    </article>)}
    {props.files.map((file) => <article className="drive-card" key={file.id}>
      <div className="drive-card__top"><FileIcon mimeType={file.mimeType} size={32} /><DriveItemMenu type="file" onRename={() => props.onRenameFile(file)} onDelete={() => props.onDeleteFile(file)} onShare={() => props.onShareFile(file)} onDownload={() => props.onDownloadFile(file)} /></div>
      <strong title={file.name}>{file.name}</strong><span>{formatFileSize(file.size)} · {formatDate(file.uploadedAt)}</span>
    </article>)}
  </div>;
}
