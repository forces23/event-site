import { test, expect } from "@playwright/test";

test.describe("RSVP modal", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /rsvp now/i }).click();
    await expect(page.getByText("Your Info")).toBeVisible();
  });

  test("step 1 requires name and contact", async ({ page }) => {
    await page.getByRole("button", { name: /next/i }).click();
    await expect(page.getByText("Full name is required")).toBeVisible();
  });

  test("step 1 validates email or phone required", async ({ page }) => {
    await page.getByLabel("Full Name").fill("Maria Garcia");
    await page.getByRole("button", { name: /next/i }).click();
    await expect(page.getByText(/email or phone is required/i)).toBeVisible();
  });

  test("can navigate to step 2 with valid step 1 data", async ({ page }) => {
    await page.getByLabel("Full Name").fill("Maria Garcia");
    await page.getByLabel("Email").fill("maria@test.com");
    await page.selectOption("select", "family");
    await page.getByRole("button", { name: /next/i }).click();
    await expect(page.getByText("Will you be joining us?")).toBeVisible();
  });

  test("selecting No goes to step 3", async ({ page }) => {
    await page.getByLabel("Full Name").fill("Maria Garcia");
    await page.getByLabel("Email").fill("maria@test.com");
    await page.selectOption("select", "friend");
    await page.getByRole("button", { name: /next/i }).click();
    await page.getByText("Sadly, I can't").click();
    await expect(page.getByText(/leave a message/i)).toBeVisible();
  });

  test("close button dismisses modal", async ({ page }) => {
    await page.keyboard.press("Escape");
    await expect(page.getByText("Your Info")).not.toBeVisible();
  });
});
