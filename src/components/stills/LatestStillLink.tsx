"use client";

import { useState } from "react";
import type { StillSummary } from "@/types";
import { StillViewer } from "./StillViewer";

interface LatestStillLinkProps {
  still?: StillSummary;
  fallbackTitle: string;
}

function LatestStillLink({ still, fallbackTitle }: LatestStillLinkProps) {
  const [open, setOpen] = useState(false);

  if (!still) {
    return <span className="italic text-[#c58c59]">&ldquo;{fallbackTitle}&rdquo;</span>;
  }

  const releaseYear = still.releaseDate ? new Date(still.releaseDate as Date | string).getFullYear() : null;
  const displayLabel = still.title || [still.filmName, releaseYear ? `(${releaseYear})` : null].filter(Boolean).join(" ") || fallbackTitle;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="italic text-[#c58c59] underline-offset-4 transition-colors hover:underline hover:decoration-[#c58c59]/80"
      >
        &ldquo;{displayLabel}&rdquo;
      </button>

      <StillViewer open={open} onClose={() => setOpen(false)} still={still} />
    </>
  );
}

export { LatestStillLink };
