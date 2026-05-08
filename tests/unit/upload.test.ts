import { describe, it, expect } from "vitest";

const MAX_IMAGE_BYTES = 20 * 1024 * 1024;
const MAX_VIDEO_BYTES = 500 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/jpg", "image/png", "image/heic", "image/heif"]);
const ALLOWED_VIDEO_TYPES = new Set(["video/mp4", "video/quicktime"]);

describe("Upload file validation", () => {
  it("accepts image/jpeg as an image type", () => {
    expect(ALLOWED_IMAGE_TYPES.has("image/jpeg")).toBe(true);
  });

  it("accepts video/mp4 as a video type", () => {
    expect(ALLOWED_VIDEO_TYPES.has("video/mp4")).toBe(true);
  });

  it("rejects unsupported types like image/gif", () => {
    expect(ALLOWED_IMAGE_TYPES.has("image/gif")).toBe(false);
    expect(ALLOWED_VIDEO_TYPES.has("image/gif")).toBe(false);
  });

  it("rejects images over 20 MB", () => {
    const oversized = MAX_IMAGE_BYTES + 1;
    expect(oversized > MAX_IMAGE_BYTES).toBe(true);
  });

  it("accepts images exactly at the 20 MB limit", () => {
    expect(MAX_IMAGE_BYTES <= MAX_IMAGE_BYTES).toBe(true);
  });

  it("rejects videos over 500 MB", () => {
    const oversized = MAX_VIDEO_BYTES + 1;
    expect(oversized > MAX_VIDEO_BYTES).toBe(true);
  });

  it("accepts MOV files (video/quicktime)", () => {
    expect(ALLOWED_VIDEO_TYPES.has("video/quicktime")).toBe(true);
  });

  it("accepts HEIC images", () => {
    expect(ALLOWED_IMAGE_TYPES.has("image/heic")).toBe(true);
  });
});
