import { test, expect } from "@playwright/test";

test.describe("Home page", () => {
  test("loads and shows Alexa's name", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toContainText("Alexa");
  });

  test("shows event date", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText(/July 24, 2026/i)).toBeVisible();
  });

  test("has RSVP button that opens modal", async ({ page }) => {
    await page.goto("/");
    const rsvpButton = page.getByRole("button", { name: /rsvp now/i });
    await expect(rsvpButton).toBeVisible();
    await rsvpButton.click();
    await expect(page.getByText("Your Info")).toBeVisible();
  });

  test("has directions button", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("button", { name: /directions/i })).toBeVisible();
  });

  test("shows venue name", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("La Roma Banquet Hall")).toBeVisible();
  });

  test("shows guest gallery section", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Guest Gallery")).toBeVisible();
  });

  test("is mobile responsive", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await expect(page.locator("h1")).toBeVisible();
  });
});
