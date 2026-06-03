import { expect, test } from "@playwright/test";

test.describe("Sushi Bliss app shell", () => {
  test("renders the home screen", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByText("Sushi", { exact: false }).first()).toBeVisible();
    await expect(page.getByText("Bliss", { exact: false }).first()).toBeVisible();
  });

  test("opens the menu from direct URL state", async ({ page }) => {
    await page.goto("/?view=menu");

    await expect(page.getByText("Menu", { exact: false }).first()).toBeVisible();
    await expect(page.getByPlaceholder("Search sushi, rolls, or dishes...").first()).toBeVisible();
  });

  test("opens reservations from direct URL state", async ({ page }) => {
    await page.goto("/?view=reservations");

    await expect(page.getByText("Reservation", { exact: false }).first()).toBeVisible();
  });
});
