"use client";

import { useState } from "react";
import { Folder, Plus, Pencil, Trash2 } from "lucide-react";
import type { FolderWithCount } from "@/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { useRouter } from "next/navigation";
import Link from "next/link";

type DeckCardFolder = FolderWithCount & {
  stills: Array<{
    id: string;
    imageUrl: string;
  }>;
};

interface FolderListProps {
  folders: DeckCardFolder[];
}

function FolderList({ folders }: FolderListProps) {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const [editFolder, setEditFolder] = useState<DeckCardFolder | null>(null);
  const [deleteFolder, setDeleteFolder] = useState<DeckCardFolder | null>(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const resetModal = () => {
    setName("");
    setError("");
    setLoading(false);
  };

  const handleCreate = async () => {
    if (!name.trim()) { setError("Name is required"); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      if (!res.ok) {
        const j = await res.json();
        setError(j.error ?? "Failed to create folder");
        return;
      }
      setCreateOpen(false);
      resetModal();
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!editFolder || !name.trim()) { setError("Name is required"); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/folders/${editFolder.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      if (!res.ok) {
        const j = await res.json();
        setError(j.error ?? "Failed to update folder");
        return;
      }
      setEditFolder(null);
      resetModal();
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteFolder) return;
    setLoading(true);
    try {
      await fetch(`/api/folders/${deleteFolder.id}`, { method: "DELETE" });
      setDeleteFolder(null);
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 rounded-md bg-surface-container-low/60 px-4 py-3">
        <h2 className="text-sm font-medium text-text-muted">
          {folders.length} deck{folders.length !== 1 ? "s" : ""}
        </h2>
        <Button
          size="sm"
          onClick={() => { resetModal(); setCreateOpen(true); }}
        >
          <Plus size={14} />
          New Deck
        </Button>
      </div>

      {folders.length === 0 ? (
        <div className="rounded-md border border-dashed border-border/80 px-6 py-12 text-center text-sm text-text-muted">
          No decks yet. Create one to organise your stills.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {folders.map((folder) => (
            <div
              key={folder.id}
              className="overflow-hidden rounded-md border border-border/80 bg-surface-container-low/75 transition-colors hover:border-border hover:bg-surface-container/80"
            >
              <Link
                href={`/folders/${folder.id}`}
                className="block"
              >
                <div className="flex aspect-[4/3] w-full items-center justify-center overflow-hidden bg-surface-container-low">
                  {folder.stills[0]?.imageUrl ? (
                    <img
                      src={folder.stills[0].imageUrl}
                      alt={folder.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Folder size={28} className="text-accent" />
                  )}
                </div>
              </Link>

              <div className="flex items-end justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium tracking-tight text-text-primary">
                    {folder.name}
                  </p>
                  <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-text-muted">
                    {folder._count.stills} still{folder._count.stills !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setEditFolder(folder);
                      setName(folder.name);
                      setError("");
                    }}
                    className="rounded-md p-1.5 text-text-muted transition-colors hover:bg-white/[0.03] hover:text-text-primary"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={() => setDeleteFolder(folder)}
                    className="rounded-md p-1.5 text-text-muted transition-colors hover:bg-danger-subtle hover:text-danger"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal
        open={createOpen}
        onClose={() => { setCreateOpen(false); resetModal(); }}
        title="New Deck"
      >
        <div className="space-y-4">
          <Input
            label="Deck name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            error={error}
            autoFocus
          />
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => { setCreateOpen(false); resetModal(); }}>
              Cancel
            </Button>
            <Button onClick={handleCreate} loading={loading}>
              Create
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal
        open={!!editFolder}
        onClose={() => { setEditFolder(null); resetModal(); }}
        title="Rename Deck"
      >
        <div className="space-y-4">
          <Input
            label="Deck name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleEdit()}
            error={error}
            autoFocus
          />
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => { setEditFolder(null); resetModal(); }}>
              Cancel
            </Button>
            <Button onClick={handleEdit} loading={loading}>
              Save
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal
        open={!!deleteFolder}
        onClose={() => setDeleteFolder(null)}
        title="Delete Deck"
      >
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            Are you sure you want to delete{" "}
            <span className="font-medium text-text-primary">
              {deleteFolder?.name}
            </span>
            ? The deck&apos;s stills will not be deleted, just unassigned.
          </p>
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setDeleteFolder(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} loading={loading}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export { FolderList };
