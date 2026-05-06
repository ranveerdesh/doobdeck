import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const base =
      "inline-flex items-center justify-center rounded-md font-medium tracking-wide transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50";

    const variants = {
      primary:
        "bg-accent text-accent-foreground shadow-[0_10px_24px_rgba(217,119,7,0.18)] hover:brightness-105 active:brightness-95",
      secondary:
        "border border-border/80 bg-surface-raised text-text-primary hover:border-border hover:bg-surface-overlay",
      ghost: "text-text-secondary hover:bg-white/[0.03] hover:text-text-primary",
      danger: "bg-danger text-on-error shadow-[0_10px_24px_rgba(255,180,171,0.12)] hover:brightness-105 active:brightness-95",
      outline:
        "border border-border/80 bg-transparent text-text-primary hover:bg-white/[0.03]",
    };

    const sizes = {
      sm: "h-8 px-3 text-xs gap-1.5 uppercase",
      md: "h-10 px-4 text-sm gap-2",
      lg: "h-11 px-6 text-sm gap-2",
    };

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg
              className="animate-spin h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            {children}
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
