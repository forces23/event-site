"use client";

import { usePathname } from "next/navigation";
import AnnouncementBanner from "@/components/AnnouncementBanner";

export default function AnnouncementBannerSlot() {
  const pathname = usePathname();

  if (pathname !== "/") return null;

  return <AnnouncementBanner />;
}
