import type { Colour } from "@prisma/client";
import { cn } from "@/lib/cn";

interface ColourSwatchesProps {
  colours: Pick<Colour, "id" | "hex" | "name">[];
  size?: "sm" | "md";
  className?: string;
}

function ColourSwatches({ colours, size = "sm", className }: ColourSwatchesProps) {
  if (!colours.length) return null;

  const dotSize = size === "sm" ? "w-4 h-4" : "w-6 h-6";

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {colours.slice(0, 6).map((colour) => (
        <div
          key={colour.id}
          className={cn("rounded-full border border-white/10 flex-shrink-0", dotSize)}
          style={{ backgroundColor: colour.hex }}
          title={colour.name ?? colour.hex}
          aria-label={colour.name ?? colour.hex}
        />
      ))}
    </div>
  );
}

export { ColourSwatches };
