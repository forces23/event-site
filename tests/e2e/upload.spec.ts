import { test, expect } from "@playwright/test";

test.describe("Upload page", () => {
  test("is accessible without login", async ({ page }) => {
    const res = await page.goto("/upload");
    expect(res?.status()).toBeLessThan(400);
  });

  test("shows upload drop zone", async ({ page }) => {
    await page.goto("/upload");
    await expect(page.getByText("Drop files here")).toBeVisible();
  });

  test("shows file type limits", async ({ page }) => {
    await page.goto("/upload");
    await expect(page.getByText(/20 MB/i)).toBeVisible();
    await expect(page.getByText(/500 MB/i)).toBeVisible();
  });

  test("has a back link to the main page", async ({ page }) => {
    await page.goto("/upload");
    await expect(page.getByRole("link", { name: /back to invitation/i })).toBeVisible();
  });

  test("QR code on home page links to upload", async ({ page }) => {
    await page.goto("/");
    const uploadLink = page.getByRole("link", { name: /upload photos/i }).first();
    await expect(uploadLink).toBeVisible();
  });
});
