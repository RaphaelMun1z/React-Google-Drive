import { FolderOpen, Share2 } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useDrive } from "@/contexts/DriveContext";

import "./Sidebar.scss";
export function Sidebar() {
	const { resetNavigation } = useDrive();
	return (
		<aside className="sidebar">
			<nav>
				<NavLink
					to="/drive"
					onClick={resetNavigation}
					className={({ isActive }) =>
						`sidebar-link ${isActive ? "is-active" : ""}`
					}
				>
					<FolderOpen size={20} />
					Meu Drive
				</NavLink>
				<NavLink
					to="/compartilhados"
					className={({ isActive }) =>
						`sidebar-link ${isActive ? "is-active" : ""}`
					}
				>
					<Share2 size={20} />
					Compartilhados
				</NavLink>
			</nav>
		</aside>
	);
}
