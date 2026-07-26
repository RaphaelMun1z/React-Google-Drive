import { File, FileArchive, FileImage, FileText, FileVideo, Music } from "lucide-react";

import "./FileIcon.scss";
export function FileIcon({ mimeType, size = 28 }: { mimeType: string; size?: number }) {
  if (mimeType.startsWith("image/")) return <FileImage size={size} />;
  if (mimeType.startsWith("video/")) return <FileVideo size={size} />;
  if (mimeType.startsWith("audio/")) return <Music size={size} />;
  if (mimeType.includes("pdf") || mimeType.includes("text") || mimeType.includes("document")) return <FileText size={size} />;
  if (mimeType.includes("zip") || mimeType.includes("compressed")) return <FileArchive size={size} />;
  return <File size={size} />;
}
