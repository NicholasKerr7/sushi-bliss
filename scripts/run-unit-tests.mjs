import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { tmpdir } from "node:os";
import { pathToFileURL } from "node:url";
import { build } from "esbuild";

try {
  console.log("Building sources for tests...");

  const projectRoot = process.cwd();
  const outdir = fs.mkdtempSync(path.join(tmpdir(), "sushi-unit-tests-"));

  await build({
    absWorkingDir: projectRoot,
    entryPoints: [
      path.join(projectRoot, "src/data/menu.ts"),
      path.join(projectRoot, "src/lib/cart-utils.ts"),
      path.join(projectRoot, "src/lib/menu-utils.ts"),
    ],
    outdir,
    outbase: path.join(projectRoot, "src"),
    platform: "node",
    format: "esm",
    target: "node18",
    bundle: false,
    logLevel: "silent",
    tsconfigRaw: {
      compilerOptions: {
        target: "ES2020",
        module: "ESNext",
        moduleResolution: "NodeNext",
        jsx: "preserve",
      },
    },
  });

  console.log("Build complete, loading modules...");

  const importFromOutdir = async (relativePath) =>
    import(pathToFileURL(path.join(outdir, relativePath)).href);

  const { sushiMenuData } = await importFromOutdir("data/menu.js");
  const { calculateCartTotals, DEFAULT_TAX_RATE, groupCartItems } = await importFromOutdir("lib/cart-utils.js");
  const { defaultHighlightCategories, filterMenuItems, getHighlightDrops } = await importFromOutdir("lib/menu-utils.js");

  const tests = [];
  function test(name, fn) {
    tests.push({ name, fn });
  }

  function round(value) {
    return Number(value.toFixed(2));
  }

  // cart-utils tests
  const sampleCart = [sushiMenuData[0], sushiMenuData[1]];

  test("calculateCartTotals computes totals without promo", () => {
    const totals = calculateCartTotals({ cart: sampleCart, appliedPromo: null, tipPercent: 20, taxRate: 0.1 });
    const expectedSubtotal = sushiMenuData[0].price + sushiMenuData[1].price;
    assert.strictEqual(round(totals.subtotal), round(expectedSubtotal));
    const taxable = expectedSubtotal;
    assert.strictEqual(round(totals.tax), round(taxable * 0.1));
    assert.strictEqual(round(totals.tip), round(taxable * 0.2));
    assert.strictEqual(round(totals.grandTotal), round(taxable * 1.3));
  });

  test("calculateCartTotals applies WELCOME10 promo", () => {
    const totals = calculateCartTotals({ cart: sampleCart, appliedPromo: "WELCOME10", tipPercent: 0, taxRate: 0 });
    const subtotal = sushiMenuData[0].price + sushiMenuData[1].price;
    const expectedDiscount = Math.min(subtotal * 0.1, 10);
    assert.strictEqual(round(totals.promoDiscount), round(expectedDiscount));
    assert.strictEqual(round(totals.grandTotal), round(subtotal - expectedDiscount));
  });

  test("calculateCartTotals applies FREEROLL promo with cap", () => {
    const totals = calculateCartTotals({ cart: [sushiMenuData[0]], appliedPromo: "freeroll", tipPercent: 0, taxRate: 0 });
    const subtotal = sushiMenuData[0].price;
    const expectedDiscount = Math.min(6, subtotal);
    assert.strictEqual(round(totals.promoDiscount), round(expectedDiscount));
    assert.strictEqual(round(totals.grandTotal), round(Math.max(0, subtotal - expectedDiscount)));
  });

  test("calculateCartTotals uses default tax rate when none provided", () => {
    const totals = calculateCartTotals({ cart: sampleCart, appliedPromo: null, tipPercent: 0 });
    const subtotal = sushiMenuData[0].price + sushiMenuData[1].price;
    assert.strictEqual(round(totals.tax), round(subtotal * DEFAULT_TAX_RATE));
  });

  test("groupCartItems combines identical items and tracks quantity", () => {
    const cart = [sushiMenuData[0], sushiMenuData[1], sushiMenuData[0]];
    const grouped = groupCartItems(cart);
    assert.strictEqual(grouped.length, 2);
    const salmon = grouped.find((entry) => entry.item.id === sushiMenuData[0].id);
    assert.strictEqual(salmon?.qty, 2);
    const tuna = grouped.find((entry) => entry.item.id === sushiMenuData[1].id);
    assert.strictEqual(tuna?.qty, 1);
  });

  test("groupCartItems returns empty array for empty cart", () => {
    assert.deepStrictEqual(groupCartItems([]), []);
  });

  // menu-utils tests
  test("filterMenuItems matches query regardless of case", () => {
    const result = filterMenuItems(sushiMenuData, "salMon", "All");
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].name, "Salmon Nigiri");
  });

  test("filterMenuItems filters by category when not All", () => {
    const result = filterMenuItems(sushiMenuData, "", "Vegan");
    assert.ok(result.every((item) => item.categories.includes("Vegan")));
  });

  test("filterMenuItems combines query and category filters", () => {
    const result = filterMenuItems(sushiMenuData, "roll", "Popular");
    assert.ok(result.length > 0);
    assert.ok(result.every((item) => item.name.toLowerCase().includes("roll")));
    assert.ok(result.every((item) => item.categories.includes("Popular")));
  });

  test("getHighlightDrops returns only items belonging to highlight categories", () => {
    const drops = getHighlightDrops(sushiMenuData, defaultHighlightCategories);
    assert.ok(drops.length > 0);
    assert.ok(
      drops.every((item) => item.categories.some((category) => defaultHighlightCategories.includes(category)))
    );
  });

  test("getHighlightDrops respects the limit argument", () => {
    const drops = getHighlightDrops(sushiMenuData, defaultHighlightCategories, 2);
    assert.strictEqual(drops.length, 2);
  });

  let failed = 0;
  for (const { name, fn } of tests) {
    try {
      fn();
      console.log(`✓ ${name}`);
    } catch (error) {
      failed++;
      console.error(`✗ ${name}`);
      console.error(error?.stack || error);
    }
  }

  // Clean up temp build artifacts.
  fs.rmSync(outdir, { recursive: true, force: true });

  if (failed) {
    console.error(`\n${failed} test${failed === 1 ? "" : "s"} failed`);
    process.exitCode = 1;
  } else {
    console.log(`\nAll ${tests.length} tests passed`);
  }
} catch (error) {
  console.error("Test runner failed", error);
  process.exit(1);
}
