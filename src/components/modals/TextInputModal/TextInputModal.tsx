import { useEffect, useState } from "react";
import { Button } from "@/components/common/Button/Button";
import { Modal } from "@/components/common/Modal/Modal";

import "./TextInputModal.scss";
interface Props {
  open: boolean;
  title: string;
  label: string;
  initialValue?: string;
  confirmLabel: string;
  loading?: boolean;
  onClose: () => void;
  onConfirm: (value: string) => void;
}

export function TextInputModal({ open, title, label, initialValue = "", confirmLabel, loading, onClose, onConfirm }: Props) {
  const [value, setValue] = useState(initialValue);
  useEffect(() => setValue(initialValue), [initialValue, open]);
  return <Modal title={title} open={open} onClose={onClose}><form className="modal-form" onSubmit={(event) => { event.preventDefault(); if (value.trim()) onConfirm(value.trim()); }}><label>{label}<input autoFocus value={value} onChange={(event) => setValue(event.target.value)} maxLength={255} /></label><footer><Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button><Button type="submit" disabled={!value.trim() || loading}>{loading ? "Salvando..." : confirmLabel}</Button></footer></form></Modal>;
}
