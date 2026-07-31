import React from "react";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import AnnouncementBannerSlot from "@/components/AnnouncementBannerSlot";
import type { PublicAnnouncement } from "@/types";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean })
  .IS_REACT_ACT_ENVIRONMENT = true;

let pathname = "/";

vi.mock("next/navigation", () => ({
  usePathname: () => pathname,
}));

const announcement: PublicAnnouncement = {
  id: "announcement-1",
  title: "",
  message: "Doors open at 5 PM.",
  color: "theme",
  active: true,
  updatedAt: "2026-07-19T20:00:00.000Z",
};

function mockAnnouncementFetch() {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ announcement }),
  }));
}

describe("AnnouncementBannerSlot", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    pathname = "/";
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    mockAnnouncementFetch();
  });

  afterEach(() => {
    if (root) act(() => root.unmount());
    container.remove();
    vi.unstubAllGlobals();
  });

  async function renderSlot() {
    await act(async () => {
      root.render(React.createElement(AnnouncementBannerSlot));
    });
  }

  it("shows the banner on the main page", async () => {
    await renderSlot();

    expect(container.textContent).toContain(announcement.message);
  });

  it("hides the banner on dashboard routes", async () => {
    pathname = "/dashboard";
    await renderSlot();

    expect(container.querySelector('[aria-label="Announcement"]')).toBeNull();
    expect(fetch).not.toHaveBeenCalled();
  });
});
