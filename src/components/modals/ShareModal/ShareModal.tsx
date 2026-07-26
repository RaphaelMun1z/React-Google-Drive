import { useEffect, useState } from "react";
import type { SharePermission, StoredFile } from "@/types/api";
import { Button } from "@/components/common/Button/Button";
import { Modal } from "@/components/common/Modal/Modal";

import "./ShareModal.scss";
interface Props { open: boolean; file: StoredFile | null; loading?: boolean; onClose: () => void; onConfirm: (email: string, permission: SharePermission) => void; }
export function ShareModal({ open, file, loading, onClose, onConfirm }: Props) {
  const [email, setEmail] = useState("");
  const [permission, setPermission] = useState<SharePermission>("READ");
  useEffect(() => { setEmail(""); setPermission("READ"); }, [open]);
  return <Modal title={`Compartilhar ${file?.name ?? "arquivo"}`} open={open} onClose={onClose}><form className="modal-form" onSubmit={(event) => { event.preventDefault(); onConfirm(email.trim(), permission); }}><label>E-mail do destinatário<input type="email" required autoFocus value={email} onChange={(event) => setEmail(event.target.value)} placeholder="usuario@exemplo.com" /></label><label>Permissão<select value={permission} onChange={(event) => setPermission(event.target.value as SharePermission)}><option value="READ">Leitura</option><option value="EDIT">Edição</option></select></label><footer><Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button><Button type="submit" disabled={!email.trim() || loading}>{loading ? "Compartilhando..." : "Compartilhar"}</Button></footer></form></Modal>;
}
