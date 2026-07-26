import clsx from "clsx";
import type { ButtonHTMLAttributes } from "react";

import "./Button.scss";
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
}

export function Button({ variant = "primary", className, ...props }: ButtonProps) {
  return <button className={clsx("button", `button--${variant}`, className)} {...props} />;
}
