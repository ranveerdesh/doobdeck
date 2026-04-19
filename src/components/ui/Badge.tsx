import { type HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "accent" | "muted" | "danger";
}

function Badge({ className, variant = "default", children, ...props }: BadgeProps) {
  const variants = {
    default:
      "bg-surface-raised text-text-secondary border border-border",
    accent:
      "bg-accent-subtle text-accent border border-accent/20",
    muted: "bg-surface text-text-muted border border-border-subtle",
    danger: "bg-danger-subtle text-danger border border-danger/20",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
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
