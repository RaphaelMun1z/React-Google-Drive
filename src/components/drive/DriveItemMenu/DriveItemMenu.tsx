import { Download, MoreVertical, Pencil, Share2, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import "./DriveItemMenu.scss";
interface Props {
  type: "file" | "folder";
  onRename: () => void;
  onDelete: () => void;
  onDownload?: () => void;
  onShare?: () => void;
}

export function DriveItemMenu({ type, onRename, onDelete, onDownload, onShare }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (event: MouseEvent) => !ref.current?.contains(event.target as Node) && setOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const run = (action: () => void) => { setOpen(false); action(); };

  return (
    <div className="item-menu" ref={ref}>
      <button className="icon-button" onClick={(event) => { event.stopPropagation(); setOpen((value) => !value); }} aria-label="Mais opções"><MoreVertical size={19} /></button>
      {open && <div className="item-menu__popover">
        {type === "file" && onDownload && <button onClick={() => run(onDownload)}><Download size={17} />Baixar</button>}
        <button onClick={() => run(onRename)}><Pencil size={17} />Renomear</button>
        {type === "file" && onShare && <button onClick={() => run(onShare)}><Share2 size={17} />Compartilhar</button>}
        <button className="danger" onClick={() => run(onDelete)}><Trash2 size={17} />Excluir</button>
      </div>}
    </div>
  );
}
