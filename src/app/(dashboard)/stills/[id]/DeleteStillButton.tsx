"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

export default function DeleteStillButton({ stillId }: { stillId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await fetch(`/api/stills/${stillId}`, { method: "DELETE" });
      router.push("/library");
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-md border border-border/70 p-2 text-text-muted transition-colors hover:bg-danger-subtle hover:text-danger"
        title="Delete"
      >
        <Trash2 size={15} />
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Delete Still"
      >
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            Are you sure you want to delete this still? This action cannot be
            undone and the image will be removed from Cloudinary.
          </p>
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} loading={loading}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
