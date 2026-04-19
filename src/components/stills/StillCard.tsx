import Image from "next/image";
import Link from "next/link";
import { Calendar, Clapperboard } from "lucide-react";
import type { StillSummary } from "@/types";
import { ColourSwatches } from "./ColourSwatches";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";

interface StillCardProps {
  still: StillSummary;
  className?: string;
}

function StillCard({ still, className }: StillCardProps) {
  return (
    <Link
      href={`/stills/${still.id}`}
      className={cn(
        "group block rounded-lg overflow-hidden bg-surface-raised border border-border",
        "hover:border-border-strong transition-all duration-200 hover:shadow-card-hover",
        className
      )}
    >
      <div className="aspect-video relative overflow-hidden bg-surface">
        <Image
          src={still.imageUrl}
          alt={still.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="p-3 flex flex-col gap-2">
        <h3 className="text-sm font-medium text-text-primary truncate leading-snug">
          {still.title}
        </h3>
        {(still.filmName || still.director) && (
          <div className="flex items-center gap-1.5 text-xs text-text-muted">
            <Clapperboard size={12} className="flex-shrink-0 text-accent" />
            <span className="truncate">
              {still.filmName}
              {still.filmName && still.director && " · "}
              {still.director}
            </span>
          </div>
        )}
        {still.year && (
          <div className="flex items-center gap-1.5 text-xs text-text-muted">
            <Calendar size={12} className="flex-shrink-0" />
            <span>{still.year}</span>
          </div>
        )}
        {still.colours.length > 0 && (
          <ColourSwatches colours={still.colours} size="sm" />
        )}
        {still.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-0.5">
            {still.tags.slice(0, 3).map(({ tag }) => (
              <Badge key={tag.id} variant="muted" className="text-[10px] px-1.5 py-0">
                {tag.name}
              </Badge>
            ))}
            {still.tags.length > 3 && (
              <Badge variant="muted" className="text-[10px] px-1.5 py-0">
                +{still.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}

export { StillCard };
