import React from "react";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import AnnouncementBanner, { ANNOUNCEMENT_REFRESH_EVENT } from "@/components/AnnouncementBanner";
import type { PublicAnnouncement } from "@/types";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean })
  .IS_REACT_ACT_ENVIRONMENT = true;

const announcement: PublicAnnouncement = {
  id: "announcement-1",
  title: "Parking update",
  message: "Overflow parking is available across the street.",
  color: "theme",
  active: true,
  updatedAt: "2026-07-19T20:00:00.000Z",
};

function mockAnnouncementFetch(value: PublicAnnouncement | null = announcement) {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ announcement: value }),
  }));
}

function mockAnnouncementFetchSequence(...values: Array<PublicAnnouncement | null>) {
  const fetchMock = vi.fn();
  values.forEach((value) => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ announcement: value }),
    });
  });
  vi.stubGlobal("fetch", fetchMock);
}

describe("AnnouncementBanner", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    if (root) act(() => root.unmount());
    container?.remove();
    vi.unstubAllGlobals();
  });

  const renderBanner = async () => {
    await act(async () => {
      root.render(React.createElement(AnnouncementBanner));
    });
  };

  it("renders the live announcement at the top-level banner", async () => {
    mockAnnouncementFetch();
    await renderBanner();

    expect(container.textContent).toContain("Parking update");
    expect(container.textContent).toContain(announcement.message);
    expect(container.querySelector('[aria-label="Announcement"]')).toHaveClass(
      "bg-primary/75",
      "sticky",
      "z-[400]",
    );
  });

  it("hides the announcement when it is dismissed", async () => {
    mockAnnouncementFetch();
    await renderBanner();

    const closeButton = container.querySelector<HTMLButtonElement>(
      'button[aria-label="Dismiss announcement"]',
    );
    expect(closeButton).not.toBeNull();
    act(() => closeButton?.click());

    expect(container.querySelector('[aria-label="Announcement"]')).toBeNull();
  });

  it("shows the announcement again after the component reloads", async () => {
    mockAnnouncementFetch();
    await renderBanner();

    const closeButton = container.querySelector<HTMLButtonElement>(
      'button[aria-label="Dismiss announcement"]',
    );
    act(() => closeButton?.click());
    expect(container.querySelector('[aria-label="Announcement"]')).toBeNull();

    act(() => root.unmount());
    root = createRoot(container);
    await renderBanner();

    expect(fetch).toHaveBeenCalledTimes(2);
    expect(container.querySelector('[aria-label="Announcement"]')).not.toBeNull();
  });

  it("refreshes the announcement when the dashboard publishes an update", async () => {
    const updatedAnnouncement: PublicAnnouncement = {
      ...announcement,
      message: "The south lot opens at 5 PM.",
      updatedAt: "2026-07-19T21:00:00.000Z",
    };
    mockAnnouncementFetchSequence(announcement, updatedAnnouncement);
    await renderBanner();

    expect(container.textContent).toContain(announcement.message);

    await act(async () => {
      window.dispatchEvent(new Event(ANNOUNCEMENT_REFRESH_EVENT));
    });

    expect(fetch).toHaveBeenCalledTimes(2);
    expect(container.textContent).toContain(updatedAnnouncement.message);
  });
});
