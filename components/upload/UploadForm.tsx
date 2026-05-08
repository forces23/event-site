"use client";

import { useState, useRef } from "react";
import { Upload, X, CheckCircle, AlertCircle, Film, ImageIcon } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useGalleryStore } from "@/stores/galleryStore";
import type { PhotoDocument, PresignRequest, PresignResponse } from "@/types";

const ACCEPTED = ".jpg,.jpeg,.png,.heic,.heif,.mp4,.mov";
const MAX_IMAGES = 20;
const MAX_VIDEOS = 5;
const MAX_IMAGE_BYTES = 20 * 1024 * 1024;
const MAX_VIDEO_BYTES = 500 * 1024 * 1024;
const IMAGE_TYPES = new Set(["image/jpeg", "image/jpg", "image/png", "image/heic", "image/heif"]);
const VIDEO_TYPES = new Set(["video/mp4", "video/quicktime"]);

interface FileItem {
  file: File;
  id: string;
  status: "pending" | "uploading" | "done" | "error";
  error?: string;
  progress: number;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function FileRow({ item, onRemove }: { item: FileItem; onRemove: (id: string) => void }) {
  const isVideo = VIDEO_TYPES.has(item.file.type);
  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl border ${
      item.status === "error" ? "border-destructive/30 bg-destructive/5"
      : item.status === "done" ? "border-primary/30 bg-primary/5"
      : "border-border bg-background"
    }`}>
      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
        {isVideo ? <Film className="w-4 h-4 text-primary" /> : <ImageIcon className="w-4 h-4 text-primary" />}
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
        {item.status === "done" && <CheckCircle className="w-5 h-5 text-primary" />}
        {item.status === "error" && <AlertCircle className="w-5 h-5 text-destructive" />}
        {(item.status === "pending") && (
          <button onClick={() => onRemove(item.id)} className="w-6 h-6 rounded-full hover:bg-muted flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

export default function UploadForm() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [allDone, setAllDone] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { addPhotos } = useGalleryStore();

  const validate = (incoming: File[]): { valid: FileItem[]; errors: string[] } => {
    const errors: string[] = [];
    const valid: FileItem[] = [];
    let imgCount = 0;
    let vidCount = 0;

    for (const f of incoming) {
      const isImg = IMAGE_TYPES.has(f.type);
      const isVid = VIDEO_TYPES.has(f.type);

      if (!isImg && !isVid) {
        errors.push(`"${f.name}" is not a supported file type.`);
        continue;
      }
      if (isImg) {
        imgCount++;
        if (imgCount > MAX_IMAGES) {
          errors.push(`Max ${MAX_IMAGES} images per upload.`);
          continue;
        }
        if (f.size > MAX_IMAGE_BYTES) {
          errors.push(`"${f.name}" exceeds the 20 MB image limit.`);
          continue;
        }
      }
      if (isVid) {
        vidCount++;
        if (vidCount > MAX_VIDEOS) {
          errors.push(`Max ${MAX_VIDEOS} videos per upload.`);
          continue;
        }
        if (f.size > MAX_VIDEO_BYTES) {
          errors.push(`"${f.name}" exceeds the 500 MB video limit.`);
          continue;
        }
      }
      valid.push({ file: f, id: `${f.name}-${Date.now()}-${Math.random()}`, status: "pending", progress: 0 });
    }
    return { valid, errors };
  };

  const handleFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    const { valid, errors } = validate(Array.from(incoming));
    errors.forEach((e) => toast.error(e));
    setFiles((prev) => [...prev, ...valid]);
  };

  const removeFile = (id: string) => setFiles((prev) => prev.filter((f) => f.id !== id));

  const updateFile = (id: string, patch: Partial<FileItem>) =>
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)));

  const handleUpload = async () => {
    const pending = files.filter((f) => f.status === "pending");
    if (pending.length === 0) return;

    setUploading(true);

    try {
      // Step 1: get presigned URLs
      const presignReqs: PresignRequest[] = pending.map((f) => ({
        name: f.file.name,
        type: f.file.type,
        size: f.file.size,
      }));

      const { data: presignData } = await axios.post<{
        files: (PresignResponse & { name: string; type: string; size: number })[];
      }>("/api/upload/presign", { files: presignReqs });

      const presigned = presignData.files;

      // Step 2: upload directly to R2
      const confirmed: { key: string; public_url: string; name: string; type: string; size: number }[] = [];

      await Promise.all(
        presigned.map(async (p, i) => {
          const item = pending[i];
          updateFile(item.id, { status: "uploading", progress: 0 });
          try {
            await axios.put(p.presigned_url, item.file, {
              headers: { "Content-Type": item.file.type },
              onUploadProgress: (evt) => {
                const progress = Math.round(((evt.loaded ?? 0) / (evt.total ?? 1)) * 100);
                updateFile(item.id, { progress });
              },
            });
            updateFile(item.id, { status: "done", progress: 100 });
            confirmed.push({ key: p.key, public_url: p.public_url, name: p.name, type: p.type, size: p.size });
          } catch {
            updateFile(item.id, {
              status: "error",
              error: "Upload failed. Please try again.",
            });
          }
        })
      );

      if (confirmed.length === 0) {
        toast.error("All uploads failed. Please try again.");
        return;
      }

      // Step 3: confirm with server
      const { data: confirmData } = await axios.post<{ photos: PhotoDocument[] }>(
        "/api/upload/confirm",
        { files: confirmed }
      );

      addPhotos(confirmData.photos);
      setAllDone(true);
      toast.success(`${confirmed.length} file${confirmed.length > 1 ? "s" : ""} uploaded!`);
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

  if (allDone) {
    return (
      <div className="text-center py-12 space-y-4">
        <div className="text-6xl animate-bounce">🎉</div>
        <h2 className="font-display text-2xl font-semibold text-primary">Photos uploaded!</h2>
        <p className="text-muted-foreground">Your moments are now in the guest gallery.</p>
        <Button onClick={() => { setFiles([]); setAllDone(false); }}>Upload more</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Drop zone */}
      <div
        className="border-2 border-dashed border-primary/30 rounded-2xl p-10 text-center cursor-pointer hover:border-primary/60 hover:bg-primary/5 transition-colors"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }}
      >
        <Upload className="w-10 h-10 text-primary/40 mx-auto mb-3" />
        <p className="font-display font-semibold text-lg mb-1">Drop files here</p>
        <p className="text-sm text-muted-foreground">or click to browse</p>
        <p className="text-xs text-muted-foreground mt-3">
          JPG, PNG, HEIC — up to 20 MB each, max {MAX_IMAGES} images<br />
          MP4, MOV — up to 500 MB each, max {MAX_VIDEOS} videos
        </p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPTED}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((item) => (
            <FileRow key={item.id} item={item} onRemove={removeFile} />
          ))}
        </div>
      )}

      {/* Upload button */}
      {pendingCount > 0 && (
        <Button
          className="w-full"
          size="lg"
          onClick={handleUpload}
          disabled={uploading}
        >
          {uploading ? "Uploading..." : `Upload ${pendingCount} file${pendingCount > 1 ? "s" : ""}`}
        </Button>
      )}
    </div>
  );
}
