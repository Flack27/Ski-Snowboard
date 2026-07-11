import Link from "next/link";
import clsx from "clsx";
import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "soft";
export type ButtonSize = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 font-display font-semibold rounded-ctl transition-colors select-none disabled:cursor-not-allowed";

const variantCls: Record<ButtonVariant, string> = {
  primary:
    "bg-ice text-on-ice hover:bg-ice-hover hover:shadow-[0_8px_24px_-6px_rgba(52,227,242,0.5)] disabled:bg-ink-500 disabled:text-fg-faint disabled:shadow-none",
  secondary: "bg-white/[0.06] text-fg border border-white/20 hover:border-white/40",
  soft: "bg-ice/10 text-ice border border-ice/30 hover:bg-ice/[0.16]",
};

const sizeCls: Record<ButtonSize, string> = {
  sm: "text-xs px-4 py-2.5",
  md: "text-sm px-5 py-3",
  lg: "text-[15px] px-6 py-3.5",
};

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  href?: string;
  fullWidth?: boolean;
  children: ReactNode;
};

export function Button({
  variant = "primary",
  size = "md",
  href,
  fullWidth,
  className,
  children,
  ...rest
}: Props) {
  const cls = clsx(base, variantCls[variant], sizeCls[size], fullWidth && "w-full", className);
  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button className={cls} {...rest}>
      {children}
    </button>
  );
}
