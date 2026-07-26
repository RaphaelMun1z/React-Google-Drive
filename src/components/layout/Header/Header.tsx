import { HardDrive, LogOut, Search } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getInitials } from "@/utils/format";

import "./Header.scss";
export function Header() {
  const { user, logout } = useAuth();
  return (
    <header className="header">
      <div className="brand"><HardDrive size={30} /><span>Google Drive</span></div>
      <div className="header-search"><Search size={20} /><span>Pesquise usando o campo da página</span></div>
      <div className="profile">
        <div className="avatar" title={user?.name}>{getInitials(user?.name ?? "U")}</div>
        <div className="profile__text"><strong>{user?.name}</strong><span>{user?.email}</span></div>
        <button className="icon-button" onClick={logout} aria-label="Sair"><LogOut size={20} /></button>
      </div>
    </header>
  );
}
