import type { StillSummary } from "@/types";
import { StillCard } from "./StillCard";
import { cn } from "@/lib/cn";
import { Film } from "lucide-react";

interface StillGridProps {
  stills: StillSummary[];
  className?: string;
  emptyMessage?: string;
}

function StillGrid({ stills, className, emptyMessage }: StillGridProps) {
  if (stills.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="rounded-full bg-surface-raised p-4 mb-4">
          <Film size={32} className="text-text-muted" />
        </div>
        <p className="text-text-muted text-sm">
          {emptyMessage ?? "No stills found"}
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4",
        className
      )}
    >
      {stills.map((still) => (
        <StillCard key={still.id} still={still} />
      ))}
    </div>
  );
}

export { StillGrid };
