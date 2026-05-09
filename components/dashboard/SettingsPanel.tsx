"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Lock, Unlock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EVENT } from "@/config/alexa";

export default function SettingsPanel() {
  const [uploadLocked, setUploadLocked] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    axios
      .get<{ upload_locked: boolean }>("/api/dashboard/settings")
      .then((res) => setUploadLocked(res.data.upload_locked))
      .catch(() => toast.error("Failed to load settings."));
  }, []);

  const toggle = async () => {
    if (uploadLocked === null) return;
    const next = !uploadLocked;
    setSaving(true);
    try {
      const res = await axios.patch<{ upload_locked: boolean }>(
        "/api/dashboard/settings",
        { upload_locked: next }
      );
      setUploadLocked(res.data.upload_locked);
      toast.success(
        res.data.upload_locked
          ? "Uploads locked. Guests can no longer upload."
          : "Uploads unlocked. Guests can now upload photos."
      );
    } catch {
      toast.error("Failed to update setting.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h2 className="font-display font-semibold text-lg">Settings</h2>
        <p className="text-sm text-muted-foreground mt-0.5">{EVENT.fullTitle}</p>
      </div>

      <div className="bg-white border border-border rounded-2xl p-5 flex items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5">
            {uploadLocked ? (
              <Lock className="w-5 h-5 text-destructive" />
            ) : (
              <Unlock className="w-5 h-5 text-green-600" />
            )}
          </div>
          <div>
            <p className="font-medium text-sm">Guest Photo Uploads</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {uploadLocked === null
                ? "Loading…"
                : uploadLocked
                ? "Locked — guests cannot upload right now"
                : "Open — guests can upload photos and videos"}
            </p>
          </div>
        </div>

        <Button
          variant={uploadLocked ? "default" : "outline"}
          size="sm"
          onClick={toggle}
          disabled={uploadLocked === null || saving}
          className="shrink-0"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : uploadLocked ? (
            "Unlock"
          ) : (
            "Lock"
          )}
        </Button>
      </div>
    </div>
  );
}
