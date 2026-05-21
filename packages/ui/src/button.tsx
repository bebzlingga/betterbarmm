import { type ButtonHTMLAttributes, type PropsWithChildren } from "react";
import { clsx } from "clsx";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
}

export function Button({
  children,
  variant = "primary",
  className,
  ...props
}: PropsWithChildren<ButtonProps>) {
  return (
    <button
      type="button"
      className={clsx(
        "border px-4 py-2.5 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] transition duration-150",
        variant === "primary"
          ? "border-[#16140f] bg-[#16140f] text-[#f7f5f0] hover:bg-[#8a2418]"
          : "border-[#cbc1a8] bg-[#f7f5f0] text-[#16140f] hover:border-[#8a2418] hover:text-[#8a2418]",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
