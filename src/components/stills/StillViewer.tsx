"use client";

import { Modal } from "@/components/ui/Modal";
import type { StillSummary } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { ColourSwatches } from "./ColourSwatches";

interface StillViewerProps {
  open: boolean;
  onClose: () => void;
  still: StillSummary;
}

function StillViewer({ open, onClose, still }: StillViewerProps) {
  const viewerWidthPx = 1120;
  const viewerHeightPx = 780;

  return (
    <Modal open={open} onClose={onClose} size="full">
      <div className="flex w-full items-center justify-center">
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
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                height: "calc(100% - 170px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <img
                src={still.imageUrl}
                alt={still.title}
                style={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  width: "auto",
                  height: "auto",
                  objectFit: "contain",
                }}
              />
            </div>

            <div style={{ height: "170px", overflow: "auto" }} className="mt-4 w-full">
              <h3 className="text-lg font-semibold tracking-tight text-text-primary">{still.title}</h3>
              {(still.filmName || still.director) && (
                <p className="mt-1 text-sm text-text-muted">
                  {still.filmName}
                  {still.filmName && still.director && " · "}
                  {still.director}
                </p>
              )}
              {still.year && <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-text-muted">{still.year}</p>}

              {still.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {still.tags.map(({ tag }) => (
                    <Badge key={tag.id} variant="muted">
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              )}

              {still.colours.length > 0 && (
                <div className="mt-3">
                  <ColourSwatches colours={still.colours} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export { StillViewer };
