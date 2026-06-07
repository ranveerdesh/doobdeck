"use client";

import React, { useEffect, useRef, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import type { StillSummary } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { ChevronLeft, ChevronRight, Expand } from "lucide-react";

interface StillViewerProps {
  open: boolean;
  onClose: () => void;
  still: StillSummary;
  onPrev?: () => void;
  onNext?: () => void;
  canPrev?: boolean;
  canNext?: boolean;
  currentIndex?: number;
  total?: number;
}

function StillViewer({
  open,
  onClose,
  still,
  onPrev,
  onNext,
  canPrev,
  canNext,
  currentIndex,
  total,
}: StillViewerProps) {
  const viewerWidthPx = 1320;
  const viewerHeightPx = 860;
  const entryId = still.id.slice(0, 8).toUpperCase();
  const palette = still.colours.slice(0, 6);
  const colourTags = Array.isArray(still.colourTags)
    ? still.colourTags.filter((colour): colour is string => typeof colour === "string" && colour.trim().length > 0)
    : [];
  const resolutionLabel = "unknown";
  const archivedYear = new Date(still.createdAt).getFullYear();
  const imageStageRef = useRef<HTMLDivElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const onFullChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener("fullscreenchange", onFullChange);
    return () => document.removeEventListener("fullscreenchange", onFullChange);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await imageStageRef.current?.requestFullscreen?.();
      } else {
        await document.exitFullscreen?.();
      }
    } catch (e) {
      // ignore fullscreen errors
    }
  };

  const metadataValueClass = "mt-1 text-sm font-medium leading-6 text-text-primary";
  const displayText = (value: unknown): string => {
    if (typeof value === "string") {
      const trimmed = value.trim();
      return trimmed.length > 0 ? trimmed : "—";
    }
    if (typeof value === "number" && Number.isFinite(value)) {
      return String(value);
    }
    return "—";
  };

  const description = typeof still.description === "string" ? still.description.trim() : "";
  const notes = typeof still.notes === "string" ? still.notes.trim() : "";
  const hasCore = Boolean(still.director) || Boolean(still.cinematographer) || Boolean(still.editor) || Boolean(still.actor) || Boolean(still.folder?.name) || Boolean(still.category?.name);
  const hasCreative = Boolean(still.shotType) || Boolean(still.composition) || Boolean(still.lighting) || Boolean(still.interiorExterior) || Boolean(still.timeOfDay) || Boolean(still.set);
  const hasTechnical = Boolean(still.aspectRatio) || Boolean(still.frameSize) || Boolean(still.lensSize);

  const renderField = (label: string, value: unknown): React.ReactNode => {
    if (!value && value !== 0) return null;
    return (
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-muted">{label}</p>
        <p className={metadataValueClass}>{displayText(value)}</p>
      </div>
    );
  };

  return (
    <Modal open={open} onClose={onClose} size="full" compact>
      <div className="flex w-full items-center justify-center px-1 sm:px-2">
        <div
          style={{
            width: `min(${viewerWidthPx}px, calc(100vw - 24px))`,
          }}
        >
          <div
            className="w-full"
            style={{
              width: "100%",
              height: isFullscreen ? "100vh" : `min(${viewerHeightPx}px, calc(100vh - 80px))`,
            }}
          >
            <div className="grid h-full gap-4 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_360px]">
              <section className="flex min-h-0 flex-col gap-4">
                <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-md border border-border/80 bg-surface/70">
                  <div
                    ref={imageStageRef}
                    className={`relative min-h-0 flex-1 ${isFullscreen ? "bg-black flex items-center justify-center" : ""}`}
                  >
                    <img
                      src={still.imageUrl}
                      alt={still.title}
                      className={isFullscreen ? "max-w-full max-h-full object-contain" : "h-full w-full object-cover"}
                    />
                    {typeof currentIndex === "number" && typeof total === "number" && total > 1 && (
                      <>
                        <button
                          type="button"
                          aria-label="Previous still"
                          onClick={onPrev}
                          disabled={!canPrev}
                          className="absolute left-3 top-1/2 -translate-y-1/2 rounded-md border border-white/15 bg-black/45 p-2 text-white/90 backdrop-blur-sm transition-colors hover:bg-black/65 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <ChevronLeft size={18} />
                        </button>
                        <button
                          type="button"
                          aria-label="Next still"
                          onClick={onNext}
                          disabled={!canNext}
                          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md border border-white/15 bg-black/45 p-2 text-white/90 backdrop-blur-sm transition-colors hover:bg-black/65 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <ChevronRight size={18} />
                        </button>
                      </>
                    )}
                  </div>
                  <div className="flex items-center justify-between border-t border-border/70 px-4 py-3">
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-muted">
                      rec: {entryId} · {resolutionLabel}
                    </p>
                    <div className="flex items-center gap-3 text-text-muted">
                      {typeof currentIndex === "number" && typeof total === "number" && total > 1 && (
                        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-muted">
                          {currentIndex + 1} / {total}
                        </span>
                      )}
                      <button
                        type="button"
                        aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                        onClick={toggleFullscreen}
                        className="rounded-md p-1 text-text-muted hover:bg-white/5"
                      >
                        <Expand size={14} className={isFullscreen ? "-rotate-45 transform" : undefined} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="rounded-md border border-border/80 bg-surface/50 p-4">
                  <div className="mb-3 flex items-end justify-between gap-3">
                    <h3 className="text-3xl font-semibold tracking-tight text-text-primary">Chromatic Analysis</h3>
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-muted">
                      Hexadecimal extract
                    </p>
                  </div>
                  {palette.length > 0 ? (
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
                      {palette.map((colour, index) => (
                        <div
                          key={colour.id}
                          className="rounded-sm border border-border/80 bg-surface-container-low p-2"
                        >
                          <div
                            className="mb-2 h-24 w-full rounded-sm border border-black/30"
                            style={{ backgroundColor: colour.hex }}
                          />
                          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted">
                            Base_{String(index + 1).padStart(2, "0")}
                          </p>
                          <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.08em] text-text-primary">
                            {colour.hex}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-text-muted">No extracted colours available for this still.</p>
                  )}
                </div>
              </section>

              <aside className="min-h-0 overflow-y-auto rounded-md border border-border/80 bg-surface/70 p-4 sm:p-5">
                <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-text-muted">
                  Entry ID: {entryId} · Archive {archivedYear}
                </p>

                <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-tight text-text-primary sm:text-[2.4rem]">
                  {still.title}
                </h2>

                <p className="mt-2 text-lg font-medium leading-snug text-accent sm:text-xl">
                  {still.filmName}
                  {still.year ? ` (${still.year})` : ""}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {still.tags.length > 0 && (
                    <>
                      {still.tags.map(({ tag }) => (
                        <Badge key={tag.id} variant="muted" className="px-2 py-1 text-[10px] uppercase tracking-[0.16em]">
                          {tag.name}
                        </Badge>
                      ))}
                    </>
                  )}
                  {colourTags.length > 0 && (
                    <>
                      {colourTags.map((colour) => (
                        <Badge key={colour} variant="accent" className="px-2 py-1 text-[10px] uppercase tracking-[0.16em]">
                          {colour}
                        </Badge>
                      ))}
                    </>
                  )}
                </div>

                <div className="mt-5 space-y-4 border-t border-border/70 pt-5">
                  {hasCore && (
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-muted">Core</p>
                      <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {renderField("Director", still.director)}
                        {renderField("Cinematographer", still.cinematographer)}
                        {renderField("Editor", still.editor)}
                        {renderField("Actor", still.actor)}
                        {renderField("Folder", still.folder?.name)}
                        {renderField("Category", still.category?.name)}
                      </div>
                    </div>
                  )}

                  {hasCreative && (
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-muted">Creative</p>
                      <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {renderField("Shot Type", still.shotType)}
                        {renderField("Composition", still.composition)}
                        {renderField("Lighting", still.lighting)}
                        {renderField("Interior / Exterior", still.interiorExterior)}
                        {renderField("Time of Day", still.timeOfDay)}
                        {renderField("Set", still.set)}
                      </div>
                    </div>
                  )}

                  {hasTechnical && (
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-muted">Technical</p>
                      <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {renderField("Aspect Ratio", still.aspectRatio)}
                        {renderField("Frame Size", still.frameSize)}
                        {renderField("Lens Size", still.lensSize)}
                      </div>
                    </div>
                  )}

                  {(description || notes) && (
                    <div className="grid grid-cols-1 gap-4 border-t border-border/70 pt-4">
                      {description && (
                        <div>
                          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-muted">Description</p>
                          <p className="mt-1 text-sm leading-6 text-text-secondary">{description}</p>
                        </div>
                      )}
                      {notes && (
                        <div>
                          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-muted">Other Notes</p>
                          <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-text-secondary">{notes}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-5 border-t border-border/70 pt-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-muted">Archived Record</p>
                  <p className="mt-3 text-base italic leading-7 text-text-secondary">
                    &quot;A pivotal frame from {still.filmName}, where light, palette, and composition define the still&apos;s narrative tension.&quot;
                  </p>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export { StillViewer };
