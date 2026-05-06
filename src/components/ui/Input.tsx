import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="font-mono text-[11px] uppercase tracking-[0.18em] text-text-muted"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "h-11 w-full rounded-md border border-border/80 bg-surface-container-low/80 px-3 py-2 text-sm text-text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]",
            "placeholder:text-text-muted",
            "focus:border-accent/70 focus:outline-none focus:ring-2 focus:ring-accent/30",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "transition-colors",
            error && "border-danger focus:ring-danger",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-danger">{error}</p>}
        {hint && !error && <p className="text-xs text-text-muted">{hint}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="font-mono text-[11px] uppercase tracking-[0.18em] text-text-muted"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            "w-full min-h-[80px] rounded-md border border-border/80 bg-surface-container-low/80 px-3 py-2 text-sm text-text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]",
            "placeholder:text-text-muted resize-y",
            "focus:border-accent/70 focus:outline-none focus:ring-2 focus:ring-accent/30",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "transition-colors",
            error && "border-danger focus:ring-danger",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-danger">{error}</p>}
        {hint && !error && <p className="text-xs text-text-muted">{hint}</p>}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

export { Input, Textarea };
