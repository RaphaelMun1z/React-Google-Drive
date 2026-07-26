import { FolderOpen } from "lucide-react";

import "./EmptyState.scss";
export function EmptyState({ search }: { search: string }) {
  return <div className="empty-state"><FolderOpen size={52} /><h3>{search ? "Nenhum item encontrado" : "Esta pasta está vazia"}</h3><p>{search ? "Tente pesquisar por outro nome." : "Crie uma pasta ou envie seu primeiro arquivo."}</p></div>;
}
