"use client";

import { useState } from "react";
import Image from "next/image";
import axios from "axios";
import { toast } from "sonner";
import { Trash2, Download, CheckSquare, Square, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PhotoDocument } from "@/types";

interface PhotoGalleryProps {
  photos: PhotoDocument[];
  isAdmin: boolean;
  onDelete: (id: string) => void;
}

async function downloadFile(url: string, name: string) {
  const res = await fetch(url);
  const blob = await res.blob();
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  URL.revokeObjectURL(a.href);
}

export default function PhotoGallery({ photos, isAdmin, onDelete }: PhotoGalleryProps) {
  const [selected, setSelected]         = useState<Set<string>>(new Set());
  const [deleting, setDeleting]         = useState<string | null>(null);
  const [deletingBulk, setDeletingBulk] = useState(false);
  const [downloading, setDownloading]   = useState(false);

  const toggleSelect = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleAll = () => {
    if (selected.size === photos.length) setSelected(new Set());
    else setSelected(new Set(photos.map((p) => p._id)));
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this photo? This cannot be undone.")) return;
    setDeleting(id);
    try {
      await axios.delete(`/api/dashboard/photos/${id}`);
      onDelete(id);
      setSelected((prev) => { const next = new Set(prev); next.delete(id); return next; });
      toast.success("Photo deleted.");
    } catch {
      toast.error("Failed to delete photo.");
    } finally {
      setDeleting(null);
    }
  };

  const handleDeleteSelected = async () => {
    if (!confirm(`Delete ${selected.size} photo${selected.size > 1 ? "s" : ""}? This cannot be undone.`)) return;
    setDeletingBulk(true);
    const ids = Array.from(selected);
    let failed = 0;
    await Promise.all(
      ids.map(async (id) => {
        try {
          await axios.delete(`/api/dashboard/photos/${id}`);
          onDelete(id);
        } catch {
          failed++;
        }
      })
    );
    setSelected(new Set());
    setDeletingBulk(false);
    if (failed > 0) toast.error(`${failed} deletion${failed > 1 ? "s" : ""} failed.`);
    else toast.success(`${ids.length} photo${ids.length > 1 ? "s" : ""} deleted.`);
  };

  const handleDownloadSelected = async () => {
    const toDownload = photos.filter((p) => selected.has(p._id));
    if (toDownload.length === 0) return;
    setDownloading(true);
    try {
      for (const p of toDownload) {
        await downloadFile(p.url, p.original_name);
        await new Promise((r) => setTimeout(r, 300));
      }
      toast.success("Download complete.");
    } catch {
      toast.error("Some downloads failed.");
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadAll = async () => {
    setDownloading(true);
    try {
      for (const p of photos) {
        await downloadFile(p.url, p.original_name);
        await new Promise((r) => setTimeout(r, 300));
      }
      toast.success("All photos downloaded.");
    } catch {
      toast.error("Some downloads failed.");
    } finally {
      setDownloading(false);
    }
  };

  if (photos.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-muted-foreground">
        <ImageIcon className="w-12 h-12 opacity-20" />
        <p className="text-sm">No guest photos yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="outline" size="sm" onClick={toggleAll} className="gap-2">
          {selected.size === photos.length ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
          {selected.size === photos.length ? "Deselect All" : "Select All"}
        </Button>

        {selected.size > 0 && (
          <>
            <Button variant="outline" size="sm" onClick={handleDownloadSelected} disabled={downloading || deletingBulk} className="gap-2">
              <Download className="w-4 h-4" />
              Download {selected.size} selected
            </Button>
            {isAdmin && (
              <Button variant="destructive" size="sm" onClick={handleDeleteSelected} disabled={deletingBulk || !!deleting} className="gap-2">
                <Trash2 className="w-4 h-4" />
                {deletingBulk ? "Deleting…" : `Delete ${selected.size} selected`}
              </Button>
            )}
          </>
        )}

        <Button variant="outline" size="sm" onClick={handleDownloadAll} disabled={downloading} className="gap-2 ml-auto">
          <Download className="w-4 h-4" />
          Download All ({photos.length})
        </Button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {photos.map((photo) => {
          const isSelected = selected.has(photo._id);
          return (
            <div
              key={photo._id}
              className={`relative aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
                isSelected ? "border-primary" : "border-transparent"
              }`}
              onClick={() => toggleSelect(photo._id)}
            >
              {photo.type === "video" ? (
                <div className="w-full h-full bg-foreground/10 flex items-center justify-center">
                  <span className="text-xs text-muted-foreground text-center px-2">{photo.original_name}</span>
                </div>
              ) : (
                <Image
                  src={photo.url}
                  alt={photo.original_name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 25vw"
                  unoptimized
                />
              )}

              {/* Selected overlay */}
              {isSelected && (
                <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                  <CheckSquare className="w-8 h-8 text-white drop-shadow" />
                </div>
              )}

              {/* Admin delete button */}
              {isAdmin && (
                <button
                  className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-destructive text-white flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity shadow"
                  onClick={(e) => { e.stopPropagation(); handleDelete(photo._id); }}
                  disabled={deleting === photo._id}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
