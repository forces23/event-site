"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Loader2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ANNOUNCEMENT_COLOR_CLASSES } from "@/components/AnnouncementBanner";
import type { AnnouncementColor } from "@/types";

interface Announcement {
  title: string;
  message: string;
  color: AnnouncementColor;
  active: boolean;
}

interface AnnouncementPanelProps {
  isAdmin: boolean;
}

interface ApiError {
  response?: { data?: { error?: string } };
}

const MAX_TITLE_LENGTH = 120;
const MAX_MESSAGE_LENGTH = 500;

const COLOR_OPTIONS: { value: AnnouncementColor; label: string }[] = [
  { value: "theme",  label: "Theme (site color)" },
  { value: "red",    label: "Red" },
  { value: "blue",   label: "Blue" },
  { value: "green",  label: "Green" },
  { value: "yellow", label: "Yellow" },
];

export default function AnnouncementPanel({ isAdmin }: AnnouncementPanelProps) {
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [titleDraft, setTitleDraft]     = useState("");
  const [messageDraft, setMessageDraft] = useState("");
  const [colorDraft, setColorDraft]     = useState<AnnouncementColor>("theme");
  const [saving, setSaving]             = useState(false);
  const [togglingActive, setTogglingActive] = useState(false);

  useEffect(() => {
    if (!isAdmin) return;

    axios
      .get<Announcement>("/api/dashboard/announcements")
      .then((res) => {
        setAnnouncement(res.data);
        setTitleDraft(res.data.title);
        setMessageDraft(res.data.message);
        setColorDraft(res.data.color);
      })
      .catch(() => toast.error("Failed to load announcement."));
  }, [isAdmin]);

  const draftChanged =
    !!announcement &&
    (titleDraft !== announcement.title ||
      messageDraft !== announcement.message ||
      colorDraft !== announcement.color);
  const draftComplete = Boolean(titleDraft.trim() && messageDraft.trim());

  const getErrorMessage = (error: unknown, fallback: string) =>
    (error as ApiError)?.response?.data?.error ?? fallback;

  const saveDraft = async () => {
    setSaving(true);
    try {
      const res = await axios.patch<Announcement>("/api/dashboard/announcements", {
        title: titleDraft.trim(),
        message: messageDraft.trim(),
        color: colorDraft,
      });
      setAnnouncement(res.data);
      setTitleDraft(res.data.title);
      setMessageDraft(res.data.message);
      setColorDraft(res.data.color);
      toast.success("Announcement saved.");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to save announcement."));
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async () => {
    if (!announcement) return;
    const next = !announcement.active;
    setTogglingActive(true);
    try {
      const res = await axios.patch<Announcement>("/api/dashboard/announcements", { active: next });
      setAnnouncement(res.data);
      toast.success(res.data.active
        ? "Announcement is now live on the site."
        : "Announcement hidden from guests.");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to update announcement."));
    } finally {
      setTogglingActive(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="max-w-lg">
        <p className="text-sm text-muted-foreground">
          Admin access is required to manage announcements.
        </p>
      </div>
    );
  }

  const previewMessage = messageDraft.trim();

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h2 className="font-display font-semibold text-lg">Announcement Banner</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Shown at the top of the site for every guest until they dismiss it.
        </p>
      </div>

      {/* Live/off toggle */}
      <div className="bg-white border border-border rounded-2xl p-5 flex items-center justify-between gap-4">
        <div>
          <p className="font-medium text-sm">Status</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {announcement === null
              ? "Loading…"
              : announcement.active
              ? "Live — visible to guests"
              : "Off — not shown to guests"}
          </p>
        </div>
        <Button
          variant={announcement?.active ? "outline" : "default"}
          size="sm"
          onClick={toggleActive}
          disabled={
            announcement === null ||
            saving ||
            togglingActive ||
            (!announcement.active && (draftChanged || !draftComplete))
          }
          className="shrink-0"
        >
          {togglingActive
            ? <Loader2 className="w-4 h-4 animate-spin" />
            : announcement?.active ? "Turn off" : "Go live"}
        </Button>
      </div>

      {/* Content form */}
      <div className="bg-white border border-border rounded-2xl p-5 space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Title</label>
          <input
            type="text"
            required
            maxLength={MAX_TITLE_LENGTH}
            value={titleDraft}
            onChange={(e) => setTitleDraft(e.target.value)}
            placeholder="e.g. Parking update"
            disabled={announcement === null}
            className="w-full rounded-lg border border-border px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Message</label>
          <Textarea
            required
            maxLength={MAX_MESSAGE_LENGTH}
            value={messageDraft}
            onChange={(e) => setMessageDraft(e.target.value)}
            placeholder="e.g. Overflow parking is available across the street."
            disabled={announcement === null}
            className="min-h-[70px]"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium">Color</label>
          <select
            value={colorDraft}
            onChange={(e) => setColorDraft(e.target.value as AnnouncementColor)}
            disabled={announcement === null}
            className="w-full rounded-lg border border-border px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
          >
            {COLOR_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <Button
          size="sm"
          onClick={saveDraft}
          disabled={
            announcement === null ||
            saving ||
            togglingActive ||
            !draftChanged ||
            !draftComplete
          }
          className="gap-1.5"
        >
          {saving
            ? <Loader2 className="w-4 h-4 animate-spin" />
            : <Check   className="w-4 h-4" />}
          Save
        </Button>
      </div>

      {/* Preview */}
      <div className="space-y-1.5">
        <p className="text-sm font-medium">Preview</p>
        <div className={`relative rounded-xl px-10 py-3 text-base text-center ${ANNOUNCEMENT_COLOR_CLASSES[colorDraft]}`}>
          {titleDraft.trim() && <span className="font-semibold mr-2">{titleDraft.trim()}</span>}
          <span>{previewMessage || "Your announcement message will appear here."}</span>
          <span className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full opacity-60">
            <X className="w-4 h-4" />
          </span>
        </div>
      </div>
    </div>
  );
}
