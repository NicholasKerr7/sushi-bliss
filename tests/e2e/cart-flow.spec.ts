import { test, expect, type Page } from "@playwright/test";

/** Adds the first visible menu item from the redesigned home/menu surface. */
async function addFirstMenuItem(page: Page) {
  const addButtons = page.getByRole("button", { name: /Add .* to Cart/i });
  await expect(addButtons.first()).toBeVisible();
  await addButtons.first().click();
}

/** Opens the cart drawer from the shared app header. */
async function openCart(page: Page) {
  const cartButton = page.getByRole("button", { name: "Open cart" }).first();
  await cartButton.click();
  await expect(page.getByText("Your Cart")).toBeVisible();
}

test("user can add an item to cart and view totals", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText(/timeless japanese artistry/i).first()).toBeVisible();

  await addFirstMenuItem(page);
  await expect(page.getByText(/added to your order/i)).toBeVisible();

  await openCart(page);
  await expect(page.getByText("Subtotal", { exact: true })).toBeVisible();
  await expect(page.getByText("Total", { exact: true })).toBeVisible();
});
