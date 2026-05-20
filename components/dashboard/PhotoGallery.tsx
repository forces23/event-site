"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import axios from "axios";
import { toast } from "sonner";
import {
  Trash2, Download, CheckSquare, Square, ImageIcon,
  Upload, X, CheckCircle, AlertCircle, Loader2, Camera,
  ChevronLeft, ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PhotoDocument, PresignRequest, PresignResponse } from "@/types";

// ── Types ─────────────────────────────────────────────────────────────────────

interface PhotoGalleryProps {
  photos: PhotoDocument[];
  isAdmin: boolean;
  onDelete: (id: string) => void;
}

interface FileItem {
  file: File;
  id: string;
  status: "pending" | "uploading" | "done" | "error";
  error?: string;
  progress: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const IMAGE_TYPES = new Set(["image/jpeg", "image/jpg", "image/png", "image/heic", "image/heif"]);
const MAX_IMAGE_BYTES = 20 * 1024 * 1024;
const MAX_IMAGES = 20;

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
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

// ── Carousel / Lightbox ───────────────────────────────────────────────────────

function Carousel({
  photos,
  startIndex,
  onClose,
}: {
  photos: PhotoDocument[];
  startIndex: number;
  onClose: () => void;
}) {
  const [current, setCurrent] = useState(startIndex);
  const touchStartX = useRef<number | null>(null);

  const prev = () => setCurrent((i) => (i - 1 + photos.length) % photos.length);
  const next = () => setCurrent((i) => (i + 1) % photos.length);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft")  setCurrent((i) => (i - 1 + photos.length) % photos.length);
      else if (e.key === "ArrowRight") setCurrent((i) => (i + 1) % photos.length);
      else if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [photos.length, onClose]);

  // Prevent body scroll while open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const photo = photos[current];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/92 flex items-center justify-center"
      onClick={onClose}
      onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => {
        if (touchStartX.current === null) return;
        const diff = touchStartX.current - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) diff > 0 ? next() : prev();
        touchStartX.current = null;
      }}
    >
      {/* Inner — stop propagation so click on content doesn't close */}
      <div
        className="relative w-full h-full flex items-center justify-center p-4 md:p-12"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white transition-colors"
          onClick={onClose}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Counter */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 px-3 py-1 rounded-full bg-black/50 text-white/80 text-sm select-none">
          {current + 1} / {photos.length}
        </div>

        {/* Prev */}
        {photos.length > 1 && (
          <button
            className="absolute left-2 md:left-4 z-20 w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white transition-colors"
            onClick={(e) => { e.stopPropagation(); prev(); }}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Photo */}
        <div className="relative w-full h-full max-w-5xl max-h-[85vh]">
          {photo.type === "video" ? (
            <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-white/50">
              <ImageIcon className="w-12 h-12" />
              <p className="text-sm">{photo.original_name}</p>
            </div>
          ) : (
            <Image
              key={photo._id}
              src={photo.url}
              alt={photo.original_name}
              fill
              className="object-contain"
              unoptimized
              priority
            />
          )}
        </div>

        {/* Next */}
        {photos.length > 1 && (
          <button
            className="absolute right-2 md:right-4 z-20 w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white transition-colors"
            onClick={(e) => { e.stopPropagation(); next(); }}
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}

        {/* Caption */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 px-3 py-1 rounded-full bg-black/50 text-white/70 text-xs max-w-xs truncate select-none">
          {photo.original_name}
        </div>
      </div>
    </div>
  );
}

// ── Her Gallery Uploader ──────────────────────────────────────────────────────

function HerUploader({ onUploaded }: { onUploaded: (photos: PhotoDocument[]) => void }) {
  const [files, setFiles]         = useState<FileItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    const next: FileItem[] = [];
    for (const f of Array.from(incoming)) {
      if (!IMAGE_TYPES.has(f.type)) {
        toast.error(`"${f.name}" is not a supported image type.`);
        continue;
      }
      if (f.size > MAX_IMAGE_BYTES) {
        toast.error(`"${f.name}" exceeds the 20 MB limit.`);
        continue;
      }
      next.push({ file: f, id: `${f.name}-${Date.now()}-${Math.random()}`, status: "pending", progress: 0 });
    }
    setFiles((prev) => [...prev, ...next].slice(0, MAX_IMAGES));
  };

  const removeFile = (id: string) => setFiles((prev) => prev.filter((f) => f.id !== id));

  const updateFile = (id: string, patch: Partial<FileItem>) =>
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)));

  const handleUpload = async () => {
    const pending = files.filter((f) => f.status === "pending");
    if (pending.length === 0) return;
    setUploading(true);
    try {
      const { data: presignData } = await axios.post<{
        files: (PresignResponse & { name: string; type: string; size: number })[];
      }>("/api/dashboard/upload/presign", {
        files: pending.map((f): PresignRequest => ({ name: f.file.name, type: f.file.type, size: f.file.size })),
      });

      const confirmed: { key: string; public_url: string; name: string; type: string; size: number }[] = [];

      await Promise.all(
        presignData.files.map(async (p, i) => {
          const item = pending[i];
          updateFile(item.id, { status: "uploading", progress: 0 });
          try {
            await axios.put(p.presigned_url, item.file, {
              headers: { "Content-Type": item.file.type },
              onUploadProgress: (evt) => {
                updateFile(item.id, { progress: Math.round(((evt.loaded ?? 0) / (evt.total ?? 1)) * 100) });
              },
            });
            updateFile(item.id, { status: "done", progress: 100 });
            confirmed.push({ key: p.key, public_url: p.public_url, name: p.name, type: p.type, size: p.size });
          } catch {
            updateFile(item.id, { status: "error", error: "Upload failed. Please try again." });
          }
        })
      );

      if (confirmed.length === 0) {
        toast.error("All uploads failed. Please try again.");
        return;
      }

      const { data: confirmData } = await axios.post<{ photos: PhotoDocument[] }>(
        "/api/dashboard/upload/confirm",
        { files: confirmed }
      );

      onUploaded(confirmData.photos);
      toast.success(`${confirmed.length} photo${confirmed.length > 1 ? "s" : ""} added to her gallery.`);
      setFiles((prev) => prev.filter((f) => f.status !== "done"));
    } catch (err: unknown) {
      const msg =
        axios.isAxiosError(err) && err.response?.data?.error
          ? err.response.data.error
          : "Something went wrong. Please try again.";
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  };

  const pendingCount = files.filter((f) => f.status === "pending").length;

  return (
    <div className="space-y-4">
      <div
        className="border-2 border-dashed border-primary/30 rounded-2xl p-8 text-center cursor-pointer hover:border-primary/60 hover:bg-primary/5 transition-colors"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); addFiles(e.dataTransfer.files); }}
      >
        <Camera className="w-8 h-8 text-primary/40 mx-auto mb-2" />
        <p className="font-display font-semibold mb-1">Add photos to her gallery</p>
        <p className="text-sm text-muted-foreground">Drop images here or click to browse</p>
        <p className="text-xs text-muted-foreground mt-2">JPG, PNG, HEIC — up to 20 MB each</p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".jpg,.jpeg,.png,.heic,.heif"
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((item) => (
            <div
              key={item.id}
              className={`flex items-center gap-3 p-3 rounded-xl border ${
                item.status === "error" ? "border-destructive/30 bg-destructive/5"
                : item.status === "done"  ? "border-primary/30 bg-primary/5"
                : "border-border bg-background"
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <ImageIcon className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.file.name}</p>
                <p className="text-xs text-muted-foreground">{formatBytes(item.file.size)}</p>
                {item.status === "uploading" && (
                  <div className="mt-1 h-1 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${item.progress}%` }} />
                  </div>
                )}
                {item.error && <p className="text-xs text-destructive mt-0.5">{item.error}</p>}
              </div>
              <div className="shrink-0">
                {item.status === "done"    && <CheckCircle className="w-5 h-5 text-primary"     />}
                {item.status === "error"   && <AlertCircle className="w-5 h-5 text-destructive" />}
                {item.status === "pending" && (
                  <button onClick={() => removeFile(item.id)} className="w-6 h-6 rounded-full hover:bg-muted flex items-center justify-center">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {pendingCount > 0 && (
        <Button className="w-full" onClick={handleUpload} disabled={uploading}>
          {uploading
            ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Uploading…</>
            : <><Upload className="w-4 h-4 mr-2" />Upload {pendingCount} photo{pendingCount > 1 ? "s" : ""}</>}
        </Button>
      )}
    </div>
  );
}

// ── Shared Photo Grid ─────────────────────────────────────────────────────────

interface PhotoGridProps {
  photos: PhotoDocument[];
  isAdmin: boolean;
  onDeletePhoto: (id: string) => void;
  emptyMessage: string;
}

function PhotoGrid({ photos, isAdmin, onDeletePhoto, emptyMessage }: PhotoGridProps) {
  const [selected, setSelected]         = useState<Set<string>>(new Set());
  const [deleting, setDeleting]         = useState<string | null>(null);
  const [deletingBulk, setDeletingBulk] = useState(false);
  const [downloading, setDownloading]   = useState(false);
  const [carouselIndex, setCarouselIndex] = useState<number | null>(null);

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
      onDeletePhoto(id);
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
          onDeletePhoto(id);
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
        <p className="text-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <>
      {/* Carousel lightbox */}
      {carouselIndex !== null && (
        <Carousel
          photos={photos}
          startIndex={carouselIndex}
          onClose={() => setCarouselIndex(null)}
        />
      )}

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
          {photos.map((photo, index) => {
            const isSelected = selected.has(photo._id);
            return (
              <div
                key={photo._id}
                className={`relative aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition-all group ${
                  isSelected ? "border-primary" : "border-transparent"
                }`}
                onClick={() => setCarouselIndex(index)}
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
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 768px) 50vw, 25vw"
                    unoptimized
                  />
                )}

                {/* Selected tint */}
                {isSelected && (
                  <div className="absolute inset-0 bg-primary/15 pointer-events-none" />
                )}

                {/* Select checkbox — top-left */}
                <button
                  className={`absolute top-1.5 left-1.5 w-7 h-7 rounded-full flex items-center justify-center transition-all shadow ${
                    isSelected
                      ? "bg-primary text-white opacity-100"
                      : "bg-black/40 text-white opacity-0 group-hover:opacity-100"
                  }`}
                  onClick={(e) => { e.stopPropagation(); toggleSelect(photo._id); }}
                >
                  {isSelected ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
                </button>

                {/* Admin delete — top-right */}
                {isAdmin && (
                  <button
                    className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-destructive text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
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
    </>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function PhotoGallery({ photos, isAdmin, onDelete }: PhotoGalleryProps) {
  const [subTab, setSubTab]         = useState<"guest" | "her">("guest");
  const [herPhotos, setHerPhotos]   = useState<PhotoDocument[]>([]);
  const [loadingHer, setLoadingHer] = useState(true);

  useEffect(() => {
    axios
      .get<{ photos: PhotoDocument[] }>("/api/her-gallery")
      .then((r) => setHerPhotos(r.data.photos))
      .catch(() => {})
      .finally(() => setLoadingHer(false));
  }, []);

  const handleHerDelete   = (id: string) => setHerPhotos((prev) => prev.filter((p) => p._id !== id));
  const handleHerUploaded = (added: PhotoDocument[]) => setHerPhotos((prev) => [...added, ...prev]);

  return (
    <div className="space-y-6">
      {/* Sub-tab switcher */}
      <div className="flex gap-1 p-1 bg-muted rounded-xl w-fit">
        <button
          onClick={() => setSubTab("guest")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            subTab === "guest"
              ? "bg-white shadow-sm text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Guest Photos
          {photos.length > 0 && (
            <span className="ml-1.5 text-xs text-muted-foreground">({photos.length})</span>
          )}
        </button>
        <button
          onClick={() => setSubTab("her")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            subTab === "her"
              ? "bg-white shadow-sm text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Her Gallery
          {!loadingHer && herPhotos.length > 0 && (
            <span className="ml-1.5 text-xs text-muted-foreground">({herPhotos.length})</span>
          )}
        </button>
      </div>

      {subTab === "guest" && (
        <PhotoGrid
          photos={photos}
          isAdmin={isAdmin}
          onDeletePhoto={onDelete}
          emptyMessage="No guest photos yet."
        />
      )}

      {subTab === "her" && (
        <div className="space-y-6">
          <HerUploader onUploaded={handleHerUploaded} />

          {loadingHer ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary/40" />
            </div>
          ) : (
            <PhotoGrid
              photos={herPhotos}
              isAdmin={isAdmin}
              onDeletePhoto={handleHerDelete}
              emptyMessage="No photos in her gallery yet. Upload some above!"
            />
          )}
        </div>
      )}
    </div>
  );
}
