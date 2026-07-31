import React from "react";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import axios from "axios";
import AnnouncementPanel from "@/components/dashboard/AnnouncementPanel";
import { ANNOUNCEMENT_REFRESH_EVENT } from "@/components/AnnouncementBanner";

vi.mock("axios", () => ({
  default: {
    get: vi.fn(),
    patch: vi.fn(),
  },
}));

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean })
  .IS_REACT_ACT_ENVIRONMENT = true;

const mockAxios = axios as unknown as {
  get: Mock;
  patch: Mock;
};

const savedAnnouncement = {
  title: "Parking update",
  message: "Overflow parking is available across the street.",
  color: "theme" as const,
  active: false,
};

async function changeValue(element: HTMLInputElement, value: string) {
  await act(async () => {
    const descriptor = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(element), "value");
    descriptor?.set?.call(element, value);
    element.dispatchEvent(new Event("input", { bubbles: true }));
  });
}

describe("AnnouncementPanel", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    vi.clearAllMocks();
  });

  afterEach(() => {
    if (root) act(() => root.unmount());
    container.remove();
  });

  async function renderPanel() {
    mockAxios.get.mockResolvedValue({ data: savedAnnouncement });

    await act(async () => {
      root.render(React.createElement(AnnouncementPanel, { isAdmin: true }));
    });
  }

  it("allows saving an announcement with only a message", async () => {
    await renderPanel();

    const titleInput = container.querySelector<HTMLInputElement>('input[type="text"]');
    expect(titleInput).toBeTruthy();
    await changeValue(titleInput!, "");

    const saveButton = Array.from(container.querySelectorAll("button"))
      .find((button) => button.textContent?.includes("Save")) as HTMLButtonElement | undefined;

    expect(saveButton).toBeTruthy();
    expect(saveButton).not.toBeDisabled();
  });

  it("refreshes the live banner after saving", async () => {
    await renderPanel();

    const titleInput = container.querySelector<HTMLInputElement>('input[type="text"]');
    expect(titleInput).toBeTruthy();
    await changeValue(titleInput!, "");

    const refreshListener = vi.fn();
    window.addEventListener(ANNOUNCEMENT_REFRESH_EVENT, refreshListener);
    mockAxios.patch.mockResolvedValueOnce({
      data: { ...savedAnnouncement, title: "" },
    });

    const saveButton = Array.from(container.querySelectorAll("button"))
      .find((button) => button.textContent?.includes("Save")) as HTMLButtonElement | undefined;
    expect(saveButton).toBeTruthy();

    await act(async () => {
      saveButton?.click();
    });

    expect(refreshListener).toHaveBeenCalledTimes(1);
    window.removeEventListener(ANNOUNCEMENT_REFRESH_EVENT, refreshListener);
  });
});
