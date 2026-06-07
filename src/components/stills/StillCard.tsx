"use client";

import { useEffect, useState } from "react";
import { Calendar, Clapperboard } from "lucide-react";
import type { StillSummary } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";
import { StillViewer } from "./StillViewer";

interface StillCardProps {
  still: StillSummary;
  stills?: StillSummary[];
  index?: number;
  className?: string;
}

function StillCard({ still, stills, index, className }: StillCardProps) {
  const [open, setOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(index ?? 0);
  const hasGallery = Boolean(stills && stills.length > 1 && typeof index === "number");
  const safeIndex = hasGallery ? Math.min(currentIndex, stills!.length - 1) : 0;
  const activeStill = hasGallery ? stills![safeIndex] : still;

  useEffect(() => {
    if (typeof index === "number") {
      setCurrentIndex(index);
    }
  }, [index]);

  useEffect(() => {
    if (!hasGallery) {
      setCurrentIndex(0);
      return;
    }

    setCurrentIndex((prev) => Math.min(prev, stills!.length - 1));
  }, [hasGallery, stills]);

  useEffect(() => {
    if (!open || !hasGallery) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setCurrentIndex((prev) => Math.max(0, prev - 1));
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        setCurrentIndex((prev) => Math.min(stills!.length - 1, prev + 1));
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, hasGallery, stills]);

  return (
    <>
      <button
        onClick={() => {
          if (typeof index === "number") {
            setCurrentIndex(index);
          }
          setOpen(true);
        }}
        className={cn(
          "group block overflow-hidden rounded-md border border-border/80 bg-surface-container-low text-left shadow-card transition-all duration-200 hover:border-border hover:shadow-card-hover",
          className
        )}
      >
        <div className="relative aspect-video overflow-hidden bg-surface-container-high">
          <img
            src={still.imageUrl}
            alt={still.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_45%,rgba(0,0,0,0.55)_100%)]" />
          <div className="absolute left-3 right-3 top-3 flex items-center justify-between gap-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            {still.year && (
              <span className="rounded-md border border-white/10 bg-black/40 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.22em] text-white/80 backdrop-blur-sm">
                {still.year}
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-2 p-4">
          <h3 className="truncate text-sm font-medium tracking-tight text-text-primary leading-snug">
            {still.title}
          </h3>
          {(still.filmName || still.director) && (
            <div className="flex items-center gap-1.5 text-xs text-text-muted">
              <Clapperboard size={12} className="flex-shrink-0 text-accent" />
              <span className="truncate font-mono text-[11px] uppercase tracking-[0.16em]">
                {still.filmName}
                {still.filmName && still.director && " · "}
                {still.director}
              </span>
            </div>
          )}
          {still.year && (
            <div className="flex items-center gap-1.5 text-xs text-text-muted">
              <Calendar size={12} className="flex-shrink-0" />
              <span className="font-mono text-[11px] uppercase tracking-[0.16em]">{still.year}</span>
            </div>
          )}
          {still.tags.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1">
              {still.tags.slice(0, 3).map(({ tag }) => (
                <Badge key={tag.id} variant="muted" className="px-1.5 py-0 text-[10px]">
                  {tag.name}
                </Badge>
              ))}
              {still.tags.length > 3 && (
                <Badge variant="muted" className="px-1.5 py-0 text-[10px]">
                  +{still.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </div>
      </button>

      <StillViewer
        open={open}
        onClose={() => setOpen(false)}
        still={activeStill}
        onPrev={
          hasGallery
            ? () => setCurrentIndex((prev) => Math.max(0, prev - 1))
            : undefined
        }
        onNext={
          hasGallery
            ? () => setCurrentIndex((prev) => Math.min(stills!.length - 1, prev + 1))
            : undefined
        }
        canPrev={hasGallery ? currentIndex > 0 : false}
        canNext={hasGallery ? safeIndex < stills!.length - 1 : false}
        currentIndex={hasGallery ? safeIndex : undefined}
        total={hasGallery ? stills!.length : undefined}
      />
    </>
  );
}

export { StillCard };
