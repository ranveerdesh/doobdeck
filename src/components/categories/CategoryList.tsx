"use client";

import { useState } from "react";
import Link from "next/link";
import { Tag, Plus, Pencil, Trash2 } from "lucide-react";
import type { CategoryWithCount } from "@/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { useRouter } from "next/navigation";

interface CategoryListProps {
  categories: CategoryWithCount[];
}

function CategoryList({ categories }: CategoryListProps) {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<CategoryWithCount | null>(null);
  const [deleteCategory, setDeleteCategory] = useState<CategoryWithCount | null>(null);
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
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      if (!res.ok) {
        const j = await res.json();
        setError(j.error ?? "Failed to create category");
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
    if (!editCategory || !name.trim()) { setError("Name is required"); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/categories/${editCategory.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      if (!res.ok) {
        const j = await res.json();
        setError(j.error ?? "Failed to update category");
        return;
      }
      setEditCategory(null);
      resetModal();
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteCategory) return;
    setLoading(true);
    try {
      await fetch(`/api/categories/${deleteCategory.id}`, { method: "DELETE" });
      setDeleteCategory(null);
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 rounded-md bg-surface-container-low/60 px-4 py-3">
        <h2 className="text-sm font-medium text-text-muted">
          {categories.length} categor{categories.length !== 1 ? "ies" : "y"}
        </h2>
        <Button size="sm" onClick={() => { resetModal(); setCreateOpen(true); }}>
          <Plus size={14} />
          New Category
        </Button>
      </div>

      {categories.length === 0 ? (
        <div className="rounded-md border border-dashed border-border/80 px-6 py-12 text-center text-sm text-text-muted">
          No categories yet. Create one to classify your stills.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <div
              key={category.id}
              className="flex items-stretch justify-between gap-3 rounded-md border border-border/80 bg-surface-container-low/75 p-4 transition-colors hover:border-border hover:bg-surface-container/80"
            >
              <Link
                href={`/categories/${category.id}`}
                className="flex min-w-0 flex-1 items-center gap-3"
                aria-label={`Open category ${category.name}`}
              >
                <Tag size={18} className="flex-shrink-0 text-accent" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium tracking-tight text-text-primary">
                    {category.name}
                  </p>
                  <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-text-muted">
                    {category._count.stills} still{category._count.stills !== 1 ? "s" : ""}
                  </p>
                </div>
              </Link>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    setEditCategory(category);
                    setName(category.name);
                    setError("");
                  }}
                  className="rounded-md p-1.5 text-text-muted transition-colors hover:bg-white/[0.03] hover:text-text-primary"
                >
                  <Pencil size={13} />
                </button>
                <button
                  onClick={() => setDeleteCategory(category)}
                  className="rounded-md p-1.5 text-text-muted transition-colors hover:bg-danger-subtle hover:text-danger"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal
        open={createOpen}
        onClose={() => { setCreateOpen(false); resetModal(); }}
        title="New Category"
      >
        <div className="space-y-4">
          <Input
            label="Category name"
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
        open={!!editCategory}
        onClose={() => { setEditCategory(null); resetModal(); }}
        title="Rename Category"
      >
        <div className="space-y-4">
          <Input
            label="Category name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleEdit()}
            error={error}
            autoFocus
          />
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => { setEditCategory(null); resetModal(); }}>
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
        open={!!deleteCategory}
        onClose={() => setDeleteCategory(null)}
        title="Delete Category"
      >
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            Are you sure you want to delete{" "}
            <span className="font-medium text-text-primary">
              {deleteCategory?.name}
            </span>
            ? The category&apos;s stills will not be deleted, just unassigned.
          </p>
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setDeleteCategory(null)}>
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

export { CategoryList };
