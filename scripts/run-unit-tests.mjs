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
      path.join(projectRoot, "src/data/selectors.ts"),
      path.join(projectRoot, "src/lib/cart-utils.ts"),
      path.join(projectRoot, "src/lib/menu-utils.ts"),
      path.join(projectRoot, "src/lib/omakase-utils.ts"),
      path.join(projectRoot, "src/lib/order-utils.ts"),
      path.join(projectRoot, "src/lib/reservation-utils.ts"),
    ],
    outdir,
    outbase: path.join(projectRoot, "src"),
    platform: "node",
    format: "esm",
    target: "node18",
    bundle: true,
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
  const { getMasterChefsOmakaseExperience, getReservationExperiences } = await importFromOutdir("data/selectors.js");
  const { calculateCartTotals, DEFAULT_TAX_RATE, groupCartItems } = await importFromOutdir("lib/cart-utils.js");
  const { defaultHighlightCategories, filterMenuItems, getHighlightDrops } = await importFromOutdir("lib/menu-utils.js");
  const { buildOmakaseSet } = await importFromOutdir("lib/omakase-utils.js");
  const { buildOrderSummary, createOrderCode, getOrderEtaMinutes } = await importFromOutdir("lib/order-utils.js");
  const {
    createDefaultReservationForm,
    createLocalDateTimeValue,
    getReservationSlots,
    validateReservationForm,
  } = await importFromOutdir("lib/reservation-utils.js");

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
    const result = filterMenuItems(sushiMenuData, "salMon nigiri", "All");
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].name, "Salmon Nigiri");
  });

  test("filterMenuItems filters by category when not All", () => {
    const result = filterMenuItems(sushiMenuData, "", "Vegetarian");
    assert.ok(result.every((item) => item.categories.includes("Vegetarian")));
  });

  test("filterMenuItems combines query and category filters", () => {
    const result = filterMenuItems(sushiMenuData, "roll", "Popular");
    assert.ok(result.length > 0);
    assert.ok(
      result.every((item) =>
        [item.name, item.description, item.chefNote, item.ingredients.join(" "), item.sakePairing.sakeName, item.categories.join(" ")]
          .join(" ")
          .toLowerCase()
          .includes("roll")
      )
    );
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

  // data selector tests
  test("getReservationExperiences maps corrected ambience roles", () => {
    const experiences = getReservationExperiences();
    const diningRoom = experiences.find((experience) => experience.id === "main-dining-room");
    const sushiBar = experiences.find((experience) => experience.id === "sushi-bar");

    assert.strictEqual(diningRoom?.image.experienceId, "main-dining-room");
    assert.strictEqual(sushiBar?.image.experienceId, "sushi-bar");
  });

  test("getMasterChefsOmakaseExperience scopes course assets to omakase", () => {
    const experience = getMasterChefsOmakaseExperience();
    const coursePaths = experience.courses.flatMap((course) => [
      course.appetizer.image.publicUrl,
      course.specialty.image.publicUrl,
      course.dessert.image.publicUrl,
    ]);

    assert.strictEqual(experience.courses.length, 4);
    assert.ok(coursePaths.every((publicUrl) => publicUrl.startsWith("/assets/omakase/")));
  });

  // omakase-utils tests
  test("buildOmakaseSet returns a deterministic chef set for the selected mood", () => {
    const set = buildOmakaseSet(sushiMenuData, "Chef's Luxe", 3);
    assert.strictEqual(set.mood, "Chef's Luxe");
    assert.strictEqual(set.items.length, 3);
    assert.ok(
      set.items.every((item) =>
        item.categories.some((category) => ["Chef Specials", "Premium", "Nigiri"].includes(category))
      )
    );
    assert.ok(set.total > 0);
  });

  test("buildOmakaseSet honors the target count when enough dishes match", () => {
    const set = buildOmakaseSet(sushiMenuData, "Fire & Crunch", 2);
    assert.strictEqual(set.items.length, 2);
  });

  // order-utils tests
  test("buildOrderSummary creates a confirmation-ready pickup order", () => {
    const order = buildOrderSummary({
      id: 123456,
      items: sampleCart,
      subtotal: 14.5,
      promoDiscount: 1.45,
      tax: 1.16,
      tip: 2,
      total: 16.21,
      method: "Credit Card",
      type: "Pickup",
      placedAt: 1_800_000,
      customerName: "Nick",
    });

    assert.strictEqual(order.confirmationCode, "SB-123456");
    assert.strictEqual(order.fulfillmentTime, order.placedAt + order.etaMinutes * 60 * 1000);
    assert.strictEqual(order.customerName, "Nick");
  });

  test("getOrderEtaMinutes uses a longer delivery ETA than pickup", () => {
    assert.ok(getOrderEtaMinutes("Delivery", 3) > getOrderEtaMinutes("Pickup", 3));
  });

  test("createOrderCode pads short ids", () => {
    assert.strictEqual(createOrderCode(42), "SB-000042");
  });

  // reservation-utils tests
  const bookedReservation = {
    id: 100,
    datetime: "2026-05-26T18:00",
    guests: 8,
    name: "Aki Tanaka",
    phone: "+1 555 0100",
    seating: "Counter",
    occasion: "Dinner",
    notes: "",
    confirmationCode: "SB-RSV-000100",
    createdAt: 100,
  };

  test("getReservationSlots marks fully booked slots unavailable", () => {
    const slots = getReservationSlots("2026-05-26", 1, [bookedReservation]);
    const bookedSlot = slots.find((slot) => slot.time === "18:00");
    assert.strictEqual(bookedSlot?.disabled, true);
    assert.strictEqual(bookedSlot?.seatsRemaining, 0);
  });

  test("getReservationSlots ignores the reservation being edited", () => {
    const slots = getReservationSlots("2026-05-26", 8, [bookedReservation], bookedReservation.id);
    const editedSlot = slots.find((slot) => slot.time === "18:00");
    assert.strictEqual(editedSlot?.disabled, false);
    assert.strictEqual(editedSlot?.seatsRemaining, 8);
  });

  test("validateReservationForm requires usable contact details", () => {
    const form = {
      ...createDefaultReservationForm(new Date(2026, 4, 26)),
      date: "2026-05-26",
      time: "18:30",
      guests: 2,
      name: "",
      phone: "555",
    };
    assert.strictEqual(validateReservationForm(form, []).valid, false);
  });

  test("createLocalDateTimeValue combines date and time", () => {
    assert.strictEqual(createLocalDateTimeValue("2026-05-26", "19:30"), "2026-05-26T19:30");
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
