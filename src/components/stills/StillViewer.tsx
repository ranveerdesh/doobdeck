"use client";

import { Modal } from "@/components/ui/Modal";
import type { StillSummary } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { ChevronLeft, ChevronRight, Expand, Search } from "lucide-react";

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
  const resolutionLabel = "unknown";
  const archivedYear = new Date(still.createdAt).getFullYear();

  return (
    <Modal open={open} onClose={onClose} size="full">
      <div className="flex w-full items-center justify-center px-2 sm:px-4">
        <div
          style={{
            width: `min(${viewerWidthPx}px, calc(100vw - 96px))`,
          }}
        >
          <div
            className="rounded-md border border-border/80 bg-surface-container-low/60 p-4 shadow-card"
            style={{
              width: "100%",
              height: `min(${viewerHeightPx}px, calc(100vh - 160px))`,
            }}
          >
            <div className="grid h-full gap-4 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_360px]">
              <section className="flex min-h-0 flex-col gap-4">
                <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-md border border-border/80 bg-surface/70">
                  <div className="relative min-h-0 flex-1">
                    <img
                      src={still.imageUrl}
                      alt={still.title}
                      className="h-full w-full object-cover"
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
                      <Search size={14} />
                      <Expand size={14} />
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

              <aside className="min-h-0 overflow-y-auto rounded-md border border-border/80 bg-surface/70 p-5">
                <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-text-muted">
                  Entry ID: {entryId} · Archive {archivedYear}
                </p>

                <h2 className="mt-4 text-4xl font-semibold leading-tight tracking-tight text-text-primary">
                  {still.title}
                </h2>

                {(still.filmName || still.year) && (
                  <p className="mt-3 text-4xl font-medium leading-tight text-accent">
                    {still.filmName}
                    {still.filmName && still.year && " "}
                    {still.year && `(${still.year})`}
                  </p>
                )}

                <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-5 border-t border-border/70 pt-5">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-muted">Director</p>
                    <p className="mt-1 text-2xl font-medium text-text-primary">{still.director ?? "Unknown"}</p>
                  </div>
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-muted">Production Year</p>
                    <p className="mt-1 text-2xl font-medium text-text-primary">{still.year ?? "—"}</p>
                  </div>
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-muted">Folder</p>
                    <p className="mt-1 text-2xl font-medium text-text-primary">{still.folder?.name ?? "Unfiled"}</p>
                  </div>
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-muted">Category</p>
                    <p className="mt-1 text-2xl font-medium text-text-primary">{still.category?.name ?? "Uncategorized"}</p>
                  </div>
                </div>

                {still.tags.length > 0 && (
                  <div className="mt-6 flex flex-wrap gap-2">
                    {still.tags.map(({ tag }) => (
                      <Badge key={tag.id} variant="muted" className="px-2 py-1 text-[10px] uppercase tracking-[0.16em]">
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="mt-6 border-t border-border/70 pt-5">
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-muted">Archived Record</p>
                  <p className="mt-3 text-lg italic leading-7 text-text-secondary">
                    &quot;A pivotal frame from {still.filmName ?? "the archive"}, where light, palette, and composition define the still&apos;s narrative tension.&quot;
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
