import { Outlet } from "react-router-dom";
import { Header } from "@/components/layout/Header/Header";
import { Sidebar } from "@/components/layout/Sidebar/Sidebar";

import "./AppLayout.scss";
export function AppLayout() {
  return (
    <div className="app-shell">
      <Header />
      <Sidebar />
      <main className="app-content"><Outlet /></main>
    </div>
  );
}
