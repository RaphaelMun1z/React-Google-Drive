import { Button } from "@/components/common/Button/Button";
import { Modal } from "@/components/common/Modal/Modal";

import "./ConfirmModal.scss";
interface Props { open: boolean; title: string; message: string; loading?: boolean; onClose: () => void; onConfirm: () => void; }
export function ConfirmModal({ open, title, message, loading, onClose, onConfirm }: Props) {
  return <Modal title={title} open={open} onClose={onClose}><div className="confirm-content"><p>{message}</p><footer><Button variant="ghost" onClick={onClose}>Cancelar</Button><Button variant="danger" onClick={onConfirm} disabled={loading}>{loading ? "Excluindo..." : "Excluir"}</Button></footer></div></Modal>;
}
