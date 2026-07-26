import { ChevronRight, Home } from "lucide-react";
import { useDrive } from "@/contexts/DriveContext";

import "./Breadcrumbs.scss";
export function Breadcrumbs() {
  const { breadcrumbs, navigateToBreadcrumb } = useDrive();
  return (
    <nav className="breadcrumbs" aria-label="Navegação de pastas">
      {breadcrumbs.map((item, index) => (
        <span key={`${item.id}-${index}`}>
          {index > 0 && <ChevronRight size={16} />}
          <button onClick={() => navigateToBreadcrumb(index)}>{index === 0 && <Home size={16} />}{item.name}</button>
        </span>
      ))}
    </nav>
  );
}
