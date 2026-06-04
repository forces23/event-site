"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Lock, Unlock, Gift, EyeOff, Loader2, Link, Check, Images } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EVENT } from "@/config/config";

interface Settings {
  upload_locked:       boolean;
  wishlist_enabled:    boolean;
  her_gallery_enabled: boolean;
  registry_url:        string;
}

interface SettingsPanelProps {
  isAdmin: boolean;
}

export default function SettingsPanel({ isAdmin }: SettingsPanelProps) {
  const [settings, setSettings]         = useState<Settings | null>(null);
  const [savingLock, setSavingLock]     = useState(false);
  const [savingWish, setSavingWish]     = useState(false);
  const [savingGallery, setSavingGallery] = useState(false);
  const [urlDraft, setUrlDraft]         = useState("");
  const [savingUrl, setSavingUrl]       = useState(false);

  useEffect(() => {
    axios
      .get<Settings>("/api/dashboard/settings")
      .then((res) => {
        setSettings(res.data);
        setUrlDraft(res.data.registry_url);
      })
      .catch(() => toast.error("Failed to load settings."));
  }, []);

  const toggleLock = async () => {
    if (!settings) return;
    const next = !settings.upload_locked;
    setSavingLock(true);
    try {
      const res = await axios.patch<Settings>("/api/dashboard/settings", { upload_locked: next });
      setSettings(res.data);
      toast.success(res.data.upload_locked
        ? "Uploads locked. Guests can no longer upload."
        : "Uploads unlocked. Guests can now upload photos.");
    } catch {
      toast.error("Failed to update setting.");
    } finally {
      setSavingLock(false);
    }
  };

  const toggleWishlist = async () => {
    if (!settings) return;
    const next = !settings.wishlist_enabled;
    setSavingWish(true);
    try {
      const res = await axios.patch<Settings>("/api/dashboard/settings", { wishlist_enabled: next });
      setSettings(res.data);
      toast.success(res.data.wishlist_enabled
        ? "Wishlist is now visible to guests."
        : "Wishlist hidden from guests.");
    } catch {
      toast.error("Failed to update setting.");
    } finally {
      setSavingWish(false);
    }
  };

  const toggleHerGallery = async () => {
    if (!settings) return;
    const next = !settings.her_gallery_enabled;
    setSavingGallery(true);
    try {
      const res = await axios.patch<Settings>("/api/dashboard/settings", { her_gallery_enabled: next });
      setSettings(res.data);
      toast.success(res.data.her_gallery_enabled
        ? "Her gallery is now visible to guests."
        : "Her gallery hidden from guests.");
    } catch {
      toast.error("Failed to update setting.");
    } finally {
      setSavingGallery(false);
    }
  };

  const saveUrl = async () => {
    setSavingUrl(true);
    try {
      const res = await axios.patch<Settings>("/api/dashboard/settings", { registry_url: urlDraft.trim() });
      setSettings(res.data);
      setUrlDraft(res.data.registry_url);
      toast.success("Wishlist link updated.");
    } catch {
      toast.error("Failed to update link.");
    } finally {
      setSavingUrl(false);
    }
  };

  const urlChanged = urlDraft.trim() !== (settings?.registry_url ?? "");

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h2 className="font-display font-semibold text-lg">Settings</h2>
        <p className="text-sm text-muted-foreground mt-0.5">{EVENT.fullTitle}</p>
      </div>

      {/* ── Admin-only toggles ──────────────────────────────────────────── */}
      {isAdmin && (
        <>
          {/* Upload lock */}
          <div className="bg-white border border-border rounded-2xl p-5 flex items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                {settings?.upload_locked
                  ? <Lock   className="w-5 h-5 text-destructive" />
                  : <Unlock className="w-5 h-5 text-green-600"   />}
              </div>
              <div>
                <p className="font-medium text-sm">Guest Photo Uploads</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {settings === null
                    ? "Loading…"
                    : settings.upload_locked
                    ? "Locked — guests cannot upload right now"
                    : "Open — guests can upload photos and videos"}
                </p>
              </div>
            </div>
            <Button
              variant={settings?.upload_locked ? "default" : "outline"}
              size="sm"
              onClick={toggleLock}
              disabled={settings === null || savingLock}
              className="shrink-0"
            >
              {savingLock
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : settings?.upload_locked ? "Unlock" : "Lock"}
            </Button>
          </div>

          {/* Wishlist visibility */}
          <div className="bg-white border border-border rounded-2xl p-5 flex items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                {settings?.wishlist_enabled
                  ? <Gift    className="w-5 h-5 text-green-600"   />
                  : <EyeOff  className="w-5 h-5 text-destructive" />}
              </div>
              <div>
                <p className="font-medium text-sm">Wishlist</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {settings === null
                    ? "Loading…"
                    : settings.wishlist_enabled
                    ? "Visible — guests can see the wishlist button"
                    : "Hidden — wishlist button is not shown to guests"}
                </p>
              </div>
            </div>
            <Button
              variant={settings?.wishlist_enabled ? "outline" : "default"}
              size="sm"
              onClick={toggleWishlist}
              disabled={settings === null || savingWish}
              className="shrink-0"
            >
              {savingWish
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : settings?.wishlist_enabled ? "Hide" : "Show"}
            </Button>
          </div>

          {/* Her gallery visibility */}
          <div className="bg-white border border-border rounded-2xl p-5 flex items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                {settings?.her_gallery_enabled
                  ? <Images  className="w-5 h-5 text-green-600"   />
                  : <EyeOff  className="w-5 h-5 text-destructive" />}
              </div>
              <div>
                <p className="font-medium text-sm">Her Gallery</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {settings === null
                    ? "Loading…"
                    : settings.her_gallery_enabled
                    ? "Visible — guests can see her gallery tab"
                    : "Hidden — her gallery tab is not shown to guests"}
                </p>
              </div>
            </div>
            <Button
              variant={settings?.her_gallery_enabled ? "outline" : "default"}
              size="sm"
              onClick={toggleHerGallery}
              disabled={settings === null || savingGallery}
              className="shrink-0"
            >
              {savingGallery
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : settings?.her_gallery_enabled ? "Hide" : "Show"}
            </Button>
          </div>
        </>
      )}

      {/* ── Wishlist link — visible to admin and viewer ─────────────────── */}
      <div className="bg-white border border-border rounded-2xl p-5 space-y-3">
        <div className="flex items-start gap-3">
          <Link className="w-5 h-5 mt-0.5 text-muted-foreground shrink-0" />
          <div>
            <p className="font-medium text-sm">Wishlist Link</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Paste the Amazon wishlist (or any registry) URL here. Leave blank to use the default from the config.
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <input
            type="url"
            value={urlDraft}
            onChange={(e) => setUrlDraft(e.target.value)}
            placeholder={EVENT.registry}
            disabled={settings === null}
            className="flex-1 min-w-0 rounded-lg border border-border px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
          />
          <Button
            size="sm"
            onClick={saveUrl}
            disabled={settings === null || savingUrl || !urlChanged}
            className="shrink-0 gap-1.5"
          >
            {savingUrl
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Check   className="w-4 h-4" />}
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}
