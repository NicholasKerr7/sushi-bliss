import { test, expect } from "@playwright/test";

async function addFirstMenuItem(page) {
  const addButtons = page.getByRole("button", { name: /Add .* to Cart/i });
  await expect(addButtons.first()).toBeVisible();
  await addButtons.first().click();
}

async function openCart(page) {
  const cartButton = page.getByRole("button", { name: "Cart" }).first();
  await cartButton.click();
  await expect(page.getByRole("heading", { name: /Checkout Console/i })).toBeVisible();
}

test("user can add an item to cart and view totals", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Chef-curated arrivals")).toBeVisible();

  await addFirstMenuItem(page);
  await expect(page.getByText("Cart Updated")).toBeVisible();

  await openCart(page);
  await expect(page.getByText("Subtotal")).toBeVisible();
  await expect(page.getByText("Total")).toBeVisible();
});
