import { Grid2X2, List, Plus, Search, Upload } from "lucide-react";
import { Button } from "@/components/common/Button/Button";

import "./DriveToolbar.scss";
interface DriveToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  view: "grid" | "list";
  onViewChange: (view: "grid" | "list") => void;
  onCreateFolder: () => void;
  onUpload: () => void;
}

export function DriveToolbar(props: DriveToolbarProps) {
  return (
    <div className="drive-toolbar">
      <div className="toolbar-actions">
        <Button onClick={props.onCreateFolder}><Plus size={18} />Nova pasta</Button>
        <Button variant="secondary" onClick={props.onUpload}><Upload size={18} />Upload</Button>
      </div>
      <label className="search-field"><Search size={19} /><input value={props.search} onChange={(event) => props.onSearchChange(event.target.value)} placeholder="Buscar nesta pasta" /></label>
      <div className="view-switch" aria-label="Modo de visualização">
        <button className={props.view === "grid" ? "is-active" : ""} onClick={() => props.onViewChange("grid")} aria-label="Grade"><Grid2X2 size={19} /></button>
        <button className={props.view === "list" ? "is-active" : ""} onClick={() => props.onViewChange("list")} aria-label="Lista"><List size={19} /></button>
      </div>
    </div>
  );
}
