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
}

export function DriveList(props: Props) {
  return <div className="drive-list">
    <div className="drive-list__header"><span>Nome</span><span>Tipo</span><span>Tamanho</span><span>Modificado</span><span /></div>
    {props.folders.map((folder) => <div className="drive-row" key={folder.id} onDoubleClick={() => props.onOpenFolder(folder)}>
      <span className="drive-row__name"><FolderIcon size={22} />{folder.name}</span><span>Pasta</span><span>—</span><span>{formatDate(folder.createdAt)}</span><DriveItemMenu type="folder" onRename={() => props.onRenameFolder(folder)} onDelete={() => props.onDeleteFolder(folder)} />
    </div>)}
    {props.files.map((file) => <div className="drive-row" key={file.id}>
      <span className="drive-row__name"><FileIcon mimeType={file.mimeType} size={22} />{file.name}</span><span>{file.mimeType}</span><span>{formatFileSize(file.size)}</span><span>{formatDate(file.uploadedAt)}</span><DriveItemMenu type="file" onRename={() => props.onRenameFile(file)} onDelete={() => props.onDeleteFile(file)} onShare={() => props.onShareFile(file)} onDownload={() => props.onDownloadFile(file)} />
    </div>)}
  </div>;
}
