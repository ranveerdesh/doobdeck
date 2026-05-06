import { type HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "accent" | "muted" | "danger";
}

function Badge({ className, variant = "default", children, ...props }: BadgeProps) {
  const variants = {
    default:
      "border border-border/70 bg-surface-raised text-text-secondary",
    accent:
      "border border-accent/25 bg-accent-subtle text-accent",
    muted: "border border-border/60 bg-surface text-text-muted",
    danger: "border border-danger/25 bg-danger-subtle text-danger",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2.5 py-0.5 text-[11px] font-medium tracking-wide",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export { Badge };
