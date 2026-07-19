"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import type { PublicAnnouncement, AnnouncementColor } from "@/types";

// "theme" reuses the site's own primary color/foreground tokens; the rest are
// fixed swatches that don't depend on the event's theme.
export const ANNOUNCEMENT_COLOR_CLASSES: Record<AnnouncementColor, string> = {
  theme:  "bg-primary/75 text-primary-foreground",
  red:    "bg-red-600/75 text-white",
  blue:   "bg-blue-600/75 text-white",
  green:  "bg-green-600/75 text-white",
  yellow: "bg-yellow-400/75 text-gray-900",
};

export default function AnnouncementBanner() {
  const bannerRef = useRef<HTMLElement>(null);
  const [announcement, setAnnouncement] = useState<PublicAnnouncement | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetch("/api/announcements", { cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch announcement");
        return res.json();
      })
      .then((data: { announcement: PublicAnnouncement | null }) => {
        if (!data.announcement) return;
        setAnnouncement(data.announcement);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const banner = bannerRef.current;

    if (!announcement || dismissed || !banner) {
      root.style.setProperty("--announcement-height", "0px");
      return;
    }

    const updateHeight = () => {
      root.style.setProperty("--announcement-height", `${banner.offsetHeight}px`);
    };

    updateHeight();

    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(updateHeight);
    observer.observe(banner);

    return () => observer.disconnect();
  }, [announcement, dismissed]);

  useEffect(() => () => {
    document.documentElement.style.setProperty("--announcement-height", "0px");
  }, []);

  if (!announcement || dismissed) return null;

  const handleClose = () => {
    setDismissed(true);
  };

  return (
    <aside
      ref={bannerRef}
      aria-label="Announcement"
      className={`sticky top-0 z-[400] w-full px-10 py-3 text-center text-base shadow-sm backdrop-blur-lg ${ANNOUNCEMENT_COLOR_CLASSES[announcement.color]}`}
    >
      {announcement.title && <span className="font-semibold mr-2">{announcement.title}</span>}
      <span>{announcement.message}</span>
      <button
        onClick={handleClose}
        aria-label="Dismiss announcement"
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-black/10 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </aside>
  );
}
