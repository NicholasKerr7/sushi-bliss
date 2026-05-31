"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Award,
  Calendar,
  ChefHat,
  ChevronRight,
  Clock3,
  CreditCard,
  Flame,
  Gift,
  Heart,
  Home,
  Leaf,
  Mail,
  Minus,
  Plus,
  Search,
  Send,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Star,
  Store,
  User,
  Utensils,
  X,
} from "lucide-react";
import { HomeView } from "./home/HomeView";
import { AssetIcon } from "./icons/AssetIcon";
import { AppShell } from "./layout/AppShell";
import { PageContainer } from "./layout/PageContainer";
import { SectionHeader } from "./layout/SectionHeader";
import { ProfileView } from "./profile/ProfileView";
import type { GuestProfile } from "./profile/types";
import type { AppView, NavItem } from "./layout/types";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  filterCategories,
  type FilterCategory,
  type MenuCategory,
  type SushiMenuItem,
} from "../data/menu";
import {
  getAssetById,
  getAppContent,
  getAssetsByFolder,
  getBrand,
  getChefs,
  getFeaturedAssets,
  getFeaturedItems,
  getItemById,
  getMasterChefsOmakaseExperience,
  getMenuItems,
  getPairings,
  getRelatedItems,
  getReservationExperiences,
  getRewards,
} from "../data/selectors";
import { getSushiIconAssets } from "../data/icon-assets";
import { calculateCartTotals, DEFAULT_TAX_RATE, groupCartItems } from "../lib/cart-utils";
import { formatClockTime, formatCurrency } from "../lib/format-utils";
import { filterMenuItems } from "../lib/menu-utils";
import { buildOmakaseSet, omakaseMoods, type OmakaseMood } from "../lib/omakase-utils";
import { buildOrderSummary, hydrateOrders, type FulfillmentType, type OrderHistoryEntry } from "../lib/order-utils";
import {
  createDefaultReservationForm,
  createLocalDateTimeValue,
  createReservationCode,
  formatReservationDateTime,
  getReservationSlots,
  hydrateReservations,
  occasionOptions,
  seatingOptions,
  validateReservationForm,
  type Reservation,
  type ReservationFormState,
} from "../lib/reservation-utils";
import type { AssetRef, Chef, Reward, SakePairing } from "../data/types";

interface Notice {
  id: number;
  message: string;
  tone: "success" | "error" | "info";
}

const brand = getBrand();
const appContent = getAppContent();
const featuredAssets = getFeaturedAssets();
const menuItems = getMenuItems();
const chefs = getChefs();
const rewards = getRewards();
const pairings = getPairings();
const ambienceAssets = getAssetsByFolder("ambience");
const editorialAssets = getAssetsByFolder("editorial");
const ingredientAssets = getAssetsByFolder("ingredients");
const masterChefsOmakaseExperience = getMasterChefsOmakaseExperience();
const chefProfile = chefs.find((chef) => chef.id === "hiroshi-tanaka") ?? chefs[0];
const profileImage = chefProfile.profileImage?.publicUrl ?? chefProfile.standingImage.publicUrl;
const heroAsset = featuredAssets.heroSushi;

const iconAssets = getSushiIconAssets();

const desktopNav: NavItem[] = [
  { key: "home", label: "Home", icon: Home, assetIcon: iconAssets.home },
  { key: "menu", label: "Menu", icon: Utensils, assetIcon: iconAssets.menu },
  { key: "reservations", label: "Reservations", icon: Calendar, assetIcon: iconAssets.reservations },
  { key: "orderOnline", id: "order-online", label: "Order Online", icon: ShoppingBag, assetIcon: iconAssets.orders },
  { key: "loyalty", label: "Loyalty", icon: Award, assetIcon: iconAssets.loyalty },
  { key: "about", label: "About Us", icon: ChefHat, assetIcon: iconAssets.about },
  { key: "contact", label: "Contact", icon: Mail, assetIcon: iconAssets.contact },
];

const mobileNav: NavItem[] = [
  { key: "home", label: "Home", icon: Home, assetIcon: iconAssets.home },
  { key: "menu", label: "Menu", icon: Utensils, assetIcon: iconAssets.menu },
  { key: "reservations", label: "Reservations", icon: Calendar, assetIcon: iconAssets.reservations },
  { key: "orders", label: "Orders", icon: ShoppingBag, assetIcon: iconAssets.orders },
  { key: "profile", label: "Profile", icon: User, assetIcon: iconAssets.profile },
];

const mobileLoyaltyNav: NavItem[] = [
  { key: "home", label: "Home", icon: Home, assetIcon: iconAssets.home },
  { key: "menu", label: "Menu", icon: Utensils, assetIcon: iconAssets.menu },
  { key: "reservations", label: "Reservations", icon: Calendar, assetIcon: iconAssets.reservations },
  { key: "loyalty", label: "Loyalty", icon: Award, assetIcon: iconAssets.loyalty },
  { key: "profile", label: "Profile", icon: User, assetIcon: iconAssets.profile },
];

const categoryIcons: Partial<Record<MenuCategory, typeof Sparkles>> = {
  "Chef Specials": ChefHat,
  Classic: Star,
  Gunkan: Sparkles,
  Hot: Flame,
  Nigiri: Sparkles,
  Popular: Heart,
  Premium: Award,
  Rolls: Utensils,
  Sashimi: Utensils,
  Temaki: ShoppingBag,
  Vegetarian: Leaf,
};

/** Returns the human-readable label for a menu filter category. */
function categoryLabel(category: FilterCategory): string {
  return category === "All" ? "All" : category;
}

/** Resolves optional asset references before handing them to image components. */
function assetUrl(asset: AssetRef | undefined, fallback = heroAsset.publicUrl): string {
  return asset?.publicUrl ?? fallback;
}

/** Formats ISO date values into compact month/day reservation labels. */
function compactDate(dateValue: string): string {
  const date = new Date(`${dateValue}T12:00`);
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

/** Coordinates app view state, persistence, ordering, reservations, and modals. */
export default function SushiApp() {
  const [activeView, setActiveView] = useState<AppView>("home");
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<FilterCategory>("All");
  const [cart, setCart] = useState<SushiMenuItem[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [selectedItem, setSelectedItem] = useState<SushiMenuItem | null>(null);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState("Visa **** 4242");
  const [fulfillment, setFulfillment] = useState<FulfillmentType>("Delivery");
  const [tipPercent, setTipPercent] = useState(15);
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [loyaltyPoints, setLoyaltyPoints] = useState(appContent.member.points);
  const [omakaseMood, setOmakaseMood] = useState<OmakaseMood>("Chef's Luxe");
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [reservationForm, setReservationForm] = useState<ReservationFormState>(() => createDefaultReservationForm());
  const [orderHistory, setOrderHistory] = useState<OrderHistoryEntry[]>([]);
  const [latestOrder, setLatestOrder] = useState<OrderHistoryEntry | null>(null);
  const [storageReady, setStorageReady] = useState(false);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [profile, setProfile] = useState<GuestProfile>({
    name: appContent.member.name,
    email: appContent.member.email,
    phone: appContent.member.phone,
    address: appContent.member.address,
    deliveryAddress: appContent.member.deliveryAddress,
    dietary: appContent.member.dietary,
    marketingOptIn: appContent.member.marketingOptIn,
  });

  const groupedCart = useMemo(() => groupCartItems(cart), [cart]);
  const filteredMenu = useMemo(() => filterMenuItems(menuItems, query, activeCategory), [query, activeCategory]);
  const featuredItems = useMemo(() => getFeaturedItems(8), []);
  const omakaseSet = useMemo(() => buildOmakaseSet(menuItems, omakaseMood, 5), [omakaseMood]);
  const favoriteItems = useMemo(
    () => favorites.map((id) => getItemById(id)).filter((item): item is SushiMenuItem => Boolean(item)),
    [favorites]
  );
  const { subtotal, promoDiscount, tax, tip, grandTotal } = useMemo(
    () =>
      calculateCartTotals({
        cart,
        appliedPromo,
        tipPercent,
        taxRate: DEFAULT_TAX_RATE,
      }),
    [appliedPromo, cart, tipPercent]
  );
  const deliveryFee = fulfillment === "Delivery" && cart.length > 0 ? 4 : 0;
  const serviceFee = cart.length > 0 ? 2.5 : 0;
  const checkoutTotal = grandTotal + deliveryFee + serviceFee;
  const rewardsEarned = Math.round(checkoutTotal);

  const showNotice = useCallback((message: string, tone: Notice["tone"] = "info") => {
    const id = Date.now();
    setNotices((current) => [{ id, message, tone }, ...current].slice(0, 3));
    window.setTimeout(() => {
      setNotices((current) => current.filter((notice) => notice.id !== id));
    }, 3200);
  }, []);

  /** Changes the active in-app view and returns the viewport to the top. */
  const navigate = (view: AppView) => {
    setActiveView(view);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "auto" });
  };

  /** Adds one or more menu items to the cart and awards lightweight mock points. */
  const addToCart = (item: SushiMenuItem, quantity = 1) => {
    if (quantity < 1) return;
    setCart((current) => [...current, ...Array.from({ length: quantity }, () => item)]);
    setLoyaltyPoints((points) => points + quantity * 5);
    showNotice(`${item.name} added to your order.`, "success");
  };

  /** Adds the generated omakase set to the cart as a bundled tasting order. */
  const addOmakaseSet = () => {
    setCart((current) => [...current, ...omakaseSet.items]);
    setLoyaltyPoints((points) => points + omakaseSet.items.length * 5);
    showNotice(`${omakaseMood} tasting added.`, "success");
  };

  /** Adds another quantity of an existing cart item. */
  const increaseCartItem = (item: SushiMenuItem) => setCart((current) => [...current, item]);

  /** Removes exactly one quantity for the given cart item id. */
  const decreaseCartItem = (id: string) => {
    let removed = false;
    setCart((current) =>
      current.filter((item) => {
        if (!removed && item.id === id) {
          removed = true;
          return false;
        }
        return true;
      })
    );
  };
  /** Removes every quantity of a menu item from the cart. */
  const removeCartItem = (id: string) => setCart((current) => current.filter((item) => item.id !== id));

  /** Toggles an item id in the persisted favorites list. */
  const toggleFavorite = (id: string) => {
    setFavorites((current) => (current.includes(id) ? current.filter((itemId) => itemId !== id) : [id, ...current]));
  };

  /** Applies partial updates to the reservation form state. */
  const updateReservationForm = (patch: Partial<ReservationFormState>) => {
    setReservationForm((current) => ({ ...current, ...patch }));
  };

  /** Validates and saves a mock reservation into profile history. */
  const saveReservation = () => {
    const formToSave = {
      ...reservationForm,
      name: reservationForm.name || profile.name,
      phone: reservationForm.phone || profile.phone,
    };
    const validation = validateReservationForm(formToSave, reservations);
    if (!validation.valid) {
      showNotice(validation.message, "error");
      return;
    }
    const id = Date.now();
    const reservation: Reservation = {
      id,
      datetime: createLocalDateTimeValue(formToSave.date, formToSave.time),
      guests: formToSave.guests,
      name: formToSave.name.trim(),
      phone: formToSave.phone.trim(),
      seating: formToSave.seating,
      occasion: formToSave.occasion,
      notes: formToSave.notes.trim(),
      confirmationCode: createReservationCode(id),
      createdAt: id,
    };
    setReservations((current) => [reservation, ...current]);
    setProfile((current) => ({
      ...current,
      name: current.name || reservation.name,
      phone: current.phone || reservation.phone,
    }));
    setReservationForm(createDefaultReservationForm(new Date(), { name: reservation.name, phone: reservation.phone }));
    showNotice(`Reservation confirmed: ${reservation.confirmationCode}`, "success");
    navigate("profile");
  };

  /** Validates checkout state and creates a mock order history entry. */
  const placeOrder = () => {
    if (cart.length === 0) {
      showNotice("Add at least one item before checkout.", "error");
      return;
    }
    if (fulfillment === "Delivery" && !profile.deliveryAddress.trim()) {
      showNotice("Add a delivery address before placing the order.", "error");
      return;
    }
    const id = Date.now();
    const order = buildOrderSummary({
      id,
      items: cart,
      subtotal,
      promoDiscount,
      tax: tax + serviceFee + deliveryFee,
      tip,
      total: checkoutTotal,
      method: selectedPayment,
      type: fulfillment,
      placedAt: id,
      deliveryAddress: profile.deliveryAddress,
      customerName: profile.name,
    });
    setOrderHistory((current) => [order, ...current]);
    setLatestOrder(order);
    setLoyaltyPoints((points) => points + rewardsEarned);
    setCart([]);
    setShowCart(false);
    setShowCheckout(false);
    setAppliedPromo(null);
    setPromoCode("");
    showNotice(`Order ${order.confirmationCode} confirmed.`, "success");
    navigate("orders");
  };

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("sb_cart_ids");
      const savedFavorites = localStorage.getItem("sb_favorites");
      const savedProfile = localStorage.getItem("sb_profile");
      const savedReservations = localStorage.getItem("sb_reservations");
      const savedOrders = localStorage.getItem("sb_orders");
      const savedPoints = localStorage.getItem("sb_points");

      if (savedCart) {
        const ids = JSON.parse(savedCart);
        if (Array.isArray(ids)) {
          setCart(ids.map((id) => getItemById(String(id))).filter((item): item is SushiMenuItem => Boolean(item)));
        }
      }
      if (savedFavorites) {
        const ids = JSON.parse(savedFavorites);
        if (Array.isArray(ids)) setFavorites(ids.map(String));
      }
      if (savedProfile) setProfile((current) => ({ ...current, ...JSON.parse(savedProfile) }));
      if (savedReservations) setReservations(hydrateReservations(JSON.parse(savedReservations)));
      if (savedOrders) setOrderHistory(hydrateOrders(JSON.parse(savedOrders)));
      if (savedPoints) setLoyaltyPoints(Number(savedPoints));
    } catch {
      showNotice("Saved session could not be restored.", "error");
    } finally {
      setStorageReady(true);
    }
  }, [showNotice]);

  useEffect(() => {
    if (!storageReady) return;
    localStorage.setItem("sb_cart_ids", JSON.stringify(cart.map((item) => item.id)));
  }, [cart, storageReady]);

  useEffect(() => {
    if (!storageReady) return;
    localStorage.setItem("sb_favorites", JSON.stringify(favorites));
  }, [favorites, storageReady]);

  useEffect(() => {
    if (!storageReady) return;
    localStorage.setItem("sb_profile", JSON.stringify(profile));
  }, [profile, storageReady]);

  useEffect(() => {
    if (!storageReady) return;
    localStorage.setItem("sb_reservations", JSON.stringify(reservations));
  }, [reservations, storageReady]);

  useEffect(() => {
    if (!storageReady) return;
    localStorage.setItem("sb_orders", JSON.stringify(orderHistory));
  }, [orderHistory, storageReady]);

  useEffect(() => {
    if (!storageReady) return;
    localStorage.setItem("sb_points", String(loyaltyPoints));
  }, [loyaltyPoints, storageReady]);

  return (
    <AppShell
      brand={brand}
      activeView={activeView}
      cartCount={cart.length}
      iconUrls={{ bell: iconAssets.bell, cart: iconAssets.cart, menu: iconAssets.settings }}
      navItems={desktopNav}
      mobileNavItems={activeView === "loyalty" ? mobileLoyaltyNav : mobileNav}
      profileName={profile.name}
      profileImage={profileImage}
      onNavigate={navigate}
      onCartClick={() => setShowCart(true)}
    >
      <PageContainer variant={activeView === "home" ? "home" : "default"}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeView}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35 }}
          >
            {activeView === "home" ? (
              <HomeView
                featuredItems={featuredItems}
                query={query}
                activeCategory={activeCategory}
                reservations={reservations}
                loyaltyPoints={loyaltyPoints}
                onNavigate={navigate}
                onQueryChange={setQuery}
                onCategoryChange={setActiveCategory}
                onAddToCart={addToCart}
                onSelectItem={setSelectedItem}
              />
            ) : null}
            {activeView === "menu" ? (
              <MenuView
                query={query}
                activeCategory={activeCategory}
                items={filteredMenu}
                favorites={favorites}
                onQueryChange={setQuery}
                onCategoryChange={setActiveCategory}
                onAddToCart={addToCart}
                onSelectItem={setSelectedItem}
                onToggleFavorite={toggleFavorite}
              />
            ) : null}
            {activeView === "orderOnline" ? (
              <OrderOnlineView
                items={featuredItems}
                groupedCart={groupedCart}
                fulfillment={fulfillment}
                subtotal={subtotal}
                total={grandTotal}
                onAddToCart={addToCart}
                onCheckout={() => {
                  setShowCheckout(true);
                  setShowCart(false);
                }}
                onFulfillmentChange={setFulfillment}
                onNavigate={navigate}
                onRemove={removeCartItem}
                onSelectItem={setSelectedItem}
                onShowCart={() => setShowCart(true)}
              />
            ) : null}
            {activeView === "pairings" ? <PairingsView items={menuItems} onSelectItem={setSelectedItem} /> : null}
            {activeView === "reservations" ? (
              <ReservationsView
                form={reservationForm}
                reservations={reservations}
                profile={profile}
                onFormChange={updateReservationForm}
                onSave={saveReservation}
                onProfileChange={setProfile}
              />
            ) : null}
            {activeView === "orders" ? (
              <OrdersView
                latestOrder={latestOrder ?? orderHistory[0] ?? null}
                orderHistory={orderHistory}
                onNavigate={navigate}
                onReorder={(items) => {
                  setCart((current) => [...current, ...items]);
                  setShowCart(true);
                }}
              />
            ) : null}
            {activeView === "profile" ? (
              <ProfileView
                profile={profile}
                profileImage={profileImage}
                favorites={favoriteItems}
                reservations={reservations}
                orderHistory={orderHistory}
                loyaltyPoints={loyaltyPoints}
                onProfileChange={setProfile}
                onNavigate={navigate}
                onSelectItem={setSelectedItem}
              />
            ) : null}
            {activeView === "loyalty" ? (
              <LoyaltyView
                loyaltyPoints={loyaltyPoints}
                rewards={rewards}
                onRedeem={(reward) => {
                  const rewardItem = getItemById(reward.id);
                  if (loyaltyPoints < reward.points) {
                    showNotice("More points are needed for that reward.", "error");
                    return;
                  }
                  setLoyaltyPoints((points) => points - reward.points);
                  if (rewardItem) addToCart(rewardItem, 1);
                  showNotice(`${reward.title} redeemed.`, "success");
                }}
              />
            ) : null}
            {activeView === "about" ? <AboutView chefs={chefs} onSelectItem={setSelectedItem} /> : null}
            {activeView === "contact" ? <ContactView onNavigate={navigate} showNotice={showNotice} /> : null}
          </motion.div>
        </AnimatePresence>
      </PageContainer>

      <AnimatePresence>
        {selectedItem ? (
          <ProductDetailModal
            item={selectedItem}
            isFavorite={favorites.includes(selectedItem.id)}
            onClose={() => setSelectedItem(null)}
            onAddToCart={(item, quantity) => {
              addToCart(item, quantity);
              setSelectedItem(null);
            }}
            onToggleFavorite={toggleFavorite}
            onSelectItem={setSelectedItem}
          />
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {showCart ? (
          <CartDrawer
            groupedCart={groupedCart}
            subtotal={subtotal}
            promoDiscount={promoDiscount}
            tax={tax}
            tip={tip}
            grandTotal={grandTotal}
            deliveryFee={deliveryFee}
            serviceFee={serviceFee}
            total={checkoutTotal}
            promoCode={promoCode}
            appliedPromo={appliedPromo}
            tipPercent={tipPercent}
            fulfillment={fulfillment}
            onPromoChange={setPromoCode}
            onApplyPromo={() => setAppliedPromo(promoCode.trim() || null)}
            onTipChange={setTipPercent}
            onFulfillmentChange={setFulfillment}
            onIncrease={increaseCartItem}
            onDecrease={decreaseCartItem}
            onRemove={removeCartItem}
            onClose={() => setShowCart(false)}
            onCheckout={() => setShowCheckout(true)}
            onNavigateMenu={() => {
              setShowCart(false);
              navigate("menu");
            }}
          />
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {showCheckout ? (
          <CheckoutModal
            groupedCart={groupedCart}
            profile={profile}
            fulfillment={fulfillment}
            selectedPayment={selectedPayment}
            tipPercent={tipPercent}
            subtotal={subtotal}
            promoDiscount={promoDiscount}
            tax={tax}
            tip={tip}
            deliveryFee={deliveryFee}
            serviceFee={serviceFee}
            total={checkoutTotal}
            onClose={() => setShowCheckout(false)}
            onFulfillmentChange={setFulfillment}
            onProfileChange={setProfile}
            onPaymentChange={setSelectedPayment}
            onTipChange={setTipPercent}
            onPlaceOrder={placeOrder}
          />
        ) : null}
      </AnimatePresence>

      <NoticeStack notices={notices} />
    </AppShell>
  );
}

interface MenuViewProps {
  query: string;
  activeCategory: FilterCategory;
  items: SushiMenuItem[];
  favorites: string[];
  onQueryChange: (query: string) => void;
  onCategoryChange: (category: FilterCategory) => void;
  onAddToCart: (item: SushiMenuItem) => void;
  onSelectItem: (item: SushiMenuItem) => void;
  onToggleFavorite: (id: string) => void;
}

/** Renders the searchable ordering menu with category filters and favorite controls. */
function MenuView({ query, activeCategory, items, favorites, onQueryChange, onCategoryChange, onAddToCart, onSelectItem, onToggleFavorite }: MenuViewProps) {
  return (
    <div className="space-y-6">
      <section className="space-y-5 lg:hidden">
        <div className="pt-3 text-center">
          <p className="text-xs uppercase tracking-[0.24em] text-[var(--sb-gold)]">Our Menu</p>
          <h1 className="editorial-title mt-2 text-4xl text-white">Our Menu</h1>
        </div>
        <div className="app-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
          {(["Nigiri", "Rolls", "Sashimi", "Chef Specials"] as FilterCategory[]).map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => onCategoryChange(category)}
              className={`h-10 shrink-0 rounded-full border px-5 text-xs uppercase tracking-[0.12em] transition ${
                activeCategory === category || (activeCategory === "All" && category === "Nigiri")
                  ? "border-[var(--sb-red-bright)] bg-[var(--sb-red)] text-white shadow-[0_0_22px_var(--sb-red-glow)]"
                  : "border-[var(--sb-border)] bg-black/42 text-white/74"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
        <div className="space-y-3">
          {(items.length ? items : menuItems).slice(0, 10).map((item) => (
            <MenuListRow key={item.id} item={item} onAddToCart={onAddToCart} onSelectItem={onSelectItem} />
          ))}
        </div>
      </section>

      <section className="hidden space-y-6 lg:block">
      <PageHero
        eyebrow="Our Menu"
        title="Handcrafted With Precision"
        copy="Browse nigiri, sashimi, rolls, vegetarian pieces, and chef-only cuts from the final data set."
        image={heroAsset.publicUrl}
      />
      <div className="luxury-panel p-4 sm:p-5">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
          <div className="flex min-h-12 items-center gap-3 rounded-2xl border border-[var(--sb-border)] bg-black/35 px-4">
            <Search className="h-4 w-4 text-[var(--sb-gold)]" />
            <Input
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="Search menu, ingredient, or sake..."
              className="h-11 border-none bg-transparent px-0 text-white placeholder:text-[var(--sb-muted)] focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
          <div className="app-scrollbar flex gap-2 overflow-x-auto">
            {filterCategories.map((category) => {
              const active = activeCategory === category;
              const Icon = category === "All" ? Sparkles : categoryIcons[category];
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => onCategoryChange(category)}
                  className={`flex h-12 shrink-0 items-center gap-2 rounded-2xl border px-4 text-sm font-semibold transition ${
                    active ? "border-[var(--sb-red-bright)] bg-[var(--sb-red)]/30 text-white" : "border-[var(--sb-border)] bg-white/[0.03] text-[var(--sb-muted)] hover:text-[var(--sb-gold)]"
                  }`}
                >
                  {Icon ? <Icon className="h-4 w-4" /> : null}
                  {categoryLabel(category)}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      {items.length === 0 ? (
        <EmptyState title="No matching dishes" copy="Try another category or search term." actionLabel="Show all" onAction={() => onCategoryChange("All")} />
      ) : (
        <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
          <aside className="luxury-panel hidden h-max p-5 lg:block">
            <p className="text-xs uppercase tracking-[0.24em] text-[var(--sb-gold)]">Filters</p>
            <div className="mt-4 space-y-2">
              {filterCategories.slice(0, 10).map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => onCategoryChange(category)}
                  className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-sm transition ${
                    activeCategory === category ? "border-[var(--sb-red-bright)] text-white" : "border-white/10 text-[var(--sb-muted)] hover:text-[var(--sb-gold)]"
                  }`}
                >
                  <span>{categoryLabel(category)}</span>
                  <span>{category === "All" ? menuItems.length : menuItems.filter((item) => item.categories.includes(category)).length}</span>
                </button>
              ))}
            </div>
          </aside>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => (
              <MenuCard
                key={item.id}
                item={item}
                isFavorite={favorites.includes(item.id)}
                onAddToCart={onAddToCart}
                onSelectItem={onSelectItem}
                onToggleFavorite={onToggleFavorite}
              />
            ))}
          </section>
        </div>
      )}
      </section>
    </div>
  );
}

/** Renders the compact mobile menu row used by the phone screenshots. */
function MenuListRow({ item, onAddToCart, onSelectItem }: { item: SushiMenuItem; onAddToCart: (item: SushiMenuItem) => void; onSelectItem: (item: SushiMenuItem) => void }) {
  return (
    <article className="relative grid min-h-[128px] grid-cols-[132px_1fr] overflow-hidden rounded-[18px] border border-[var(--sb-border)] bg-black/58 shadow-[0_16px_40px_rgba(0,0,0,0.42)]">
      <button type="button" onClick={() => onSelectItem(item)} className="relative text-left">
        <Image src={item.image.publicUrl} alt="" fill sizes="132px" className="object-cover" />
        {item.tag ? <span className="absolute left-0 top-0 rounded-br-xl bg-[var(--sb-red)] px-2 py-1 text-[10px] uppercase text-white">{item.tag}</span> : null}
      </button>
      <div className="flex min-w-0 flex-col justify-center px-4 py-3">
        <button type="button" onClick={() => onSelectItem(item)} className="text-left">
          <h2 className="font-serif text-lg text-white">{item.name}</h2>
          <p className="mt-1 line-clamp-2 text-xs leading-5 text-[var(--sb-muted)]">{item.description}</p>
          <p className="mt-3 text-lg text-[var(--sb-gold)]">{formatCurrency(item.price)}</p>
        </button>
        <button
          type="button"
          aria-label={`Add ${item.name} to cart`}
          onClick={() => onAddToCart(item)}
          className="absolute bottom-4 right-4 grid h-10 w-10 place-items-center rounded-full border border-[var(--sb-border-strong)] bg-black/58 text-[var(--sb-gold)]"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>
    </article>
  );
}

interface OrderOnlineViewProps {
  fulfillment: FulfillmentType;
  groupedCart: { item: SushiMenuItem; qty: number }[];
  items: SushiMenuItem[];
  subtotal: number;
  total: number;
  onAddToCart: (item: SushiMenuItem) => void;
  onCheckout: () => void;
  onFulfillmentChange: (value: FulfillmentType) => void;
  onNavigate: (view: AppView) => void;
  onRemove: (id: string) => void;
  onSelectItem: (item: SushiMenuItem) => void;
  onShowCart: () => void;
}

/** Renders the dedicated Order Online screen from the ordering screenshots. */
function OrderOnlineView({
  fulfillment,
  groupedCart,
  items,
  subtotal,
  total,
  onAddToCart,
  onCheckout,
  onFulfillmentChange,
  onNavigate,
  onRemove,
  onSelectItem,
  onShowCart,
}: OrderOnlineViewProps) {
  const heroItem = getItemById("otoro-nigiri") ?? items[0];
  const recommendedItems = heroItem ? items.filter((item) => item.id !== heroItem.id).slice(0, 4) : items.slice(0, 4);
  const cartCount = groupedCart.reduce((sum, row) => sum + row.qty, 0);
  const deliveryMinutes = fulfillment === "Delivery" ? "30-45 MIN" : "20-25 MIN";

  return (
    <div className="space-y-5">
      <section className="luxury-panel overflow-hidden p-0">
        <div className="relative min-h-[258px] px-5 py-7 sm:px-8 lg:min-h-[315px] lg:px-14">
          <Image src={heroAsset.publicUrl} alt="" fill priority sizes="100vw" className="object-cover object-[62%_50%]" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.94)_0%,rgba(0,0,0,0.76)_38%,rgba(0,0,0,0.28)_78%,rgba(0,0,0,0.82)_100%)]" />
          <div className="relative z-10 max-w-lg">
            <p className="text-sm uppercase tracking-[0.22em] text-[var(--sb-gold)]">Order Now</p>
            <h1 className="editorial-title mt-3 text-[38px] leading-[0.96] text-white sm:text-6xl">
              Exceptional Sushi,
              <span className="block text-[var(--sb-red-bright)]">Delivered.</span>
            </h1>
            <p className="mt-4 text-sm text-[var(--sb-gold)] sm:text-base">Fresh. Authentic. Unforgettable.</p>
            <div className="mt-6 grid max-w-sm grid-cols-2 rounded-[14px] border border-[var(--sb-border)] bg-black/42 p-1">
              {(["Delivery", "Pickup"] as FulfillmentType[]).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => onFulfillmentChange(option)}
                  className={`h-10 rounded-[11px] text-xs uppercase tracking-[0.14em] transition ${
                    fulfillment === option ? "bg-[var(--sb-red)] text-white shadow-[0_0_24px_var(--sb-red-glow)]" : "text-white/70"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          <div className="luxury-panel space-y-4 p-4">
            <div className="app-scrollbar flex gap-2 overflow-x-auto">
              {["Recommended", "Nigiri", "Rolls", "Sashimi", "Chef Specials", "Vegetarian", "Drinks"].map((category, index) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => (category === "Recommended" ? undefined : onNavigate("menu"))}
                  className={`h-11 shrink-0 rounded-xl border px-4 text-xs uppercase tracking-[0.12em] transition ${
                    index === 0 ? "border-[var(--sb-gold)] bg-[var(--sb-gold)] text-black" : "border-[var(--sb-border)] bg-black/28 text-white/78"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
            <div className="grid gap-3 md:grid-cols-[1fr_auto_auto_auto]">
              <label className="flex h-12 items-center gap-3 rounded-xl border border-[var(--sb-border)] bg-black/35 px-4">
                <Search className="h-4 w-4 text-[var(--sb-gold)]" />
                <span className="sr-only">Search menu items</span>
                <input className="w-full bg-transparent text-sm text-white outline-none placeholder:text-[var(--sb-muted)]" placeholder="Search menu items..." />
              </label>
              {["Dietary", "Spicy Level", "Sort By"].map((label) => (
                <button key={label} type="button" className="h-12 rounded-xl border border-[var(--sb-border)] bg-black/35 px-4 text-xs uppercase tracking-[0.12em] text-white/72">
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-[0.95fr_1fr]">
            {heroItem ? (
              <article className="luxury-panel group relative min-h-[280px] overflow-hidden p-5 text-left">
                <Image src={heroItem.image.publicUrl} alt="" fill sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover transition group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/88 via-black/50 to-transparent" />
                <button type="button" onClick={() => onSelectItem(heroItem)} className="relative z-10 block max-w-xs text-left">
                  <span className="rounded-full border border-[var(--sb-border)] bg-black/45 px-3 py-1 text-xs uppercase text-[var(--sb-gold)]">Chef&apos;s Special</span>
                  <h2 className="editorial-title mt-5 text-4xl text-white">{heroItem.name}</h2>
                  <p className="mt-3 text-sm leading-6 text-white/72">{heroItem.description}</p>
                  <p className="mt-4 text-2xl text-[var(--sb-gold)]">{formatCurrency(heroItem.price)}</p>
                </button>
                <button
                  type="button"
                  aria-label={`Add ${heroItem.name} to cart`}
                  onClick={(event) => {
                    event.stopPropagation();
                    onAddToCart(heroItem);
                  }}
                  className="absolute bottom-5 right-5 z-20 grid h-12 w-12 place-items-center rounded-full border border-[var(--sb-border-strong)] bg-black/62 text-[var(--sb-gold)]"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </article>
            ) : null}

            <section className="luxury-panel p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm uppercase tracking-[0.18em] text-[var(--sb-gold)]">Recommended For You</h2>
                <button type="button" onClick={() => onNavigate("menu")} className="text-xs uppercase tracking-[0.16em] text-[var(--sb-red-bright)]">View All</button>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {recommendedItems.map((item) => (
                  <MenuMiniCard key={item.id} item={item} onAddToCart={onAddToCart} onSelectItem={onSelectItem} />
                ))}
              </div>
            </section>
          </div>

          <section className="luxury-panel grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Clock3, title: "Est. Delivery Time", value: deliveryMinutes, copy: "Real-time tracking provided" },
              { icon: Store, title: "Delivery Fee", value: fulfillment === "Delivery" ? "$3.99" : "$0.00", copy: "Free on orders over $75" },
              { icon: CreditCard, title: "Minimum Order", value: "$25.00", copy: "Before taxes and fees" },
              { icon: Gift, title: "Sushi Bliss Rewards", value: "Earn points", copy: "Join for free" },
            ].map(({ icon: Icon, title, value, copy }) => (
              <div key={title} className="flex gap-3">
                <Icon className="mt-1 h-6 w-6 shrink-0 text-[var(--sb-gold)]" />
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-[var(--sb-gold)]">{title}</p>
                  <p className="mt-1 text-lg text-white">{value}</p>
                  <p className="text-xs text-[var(--sb-muted)]">{copy}</p>
                </div>
              </div>
            ))}
          </section>
        </div>

        <aside className="luxury-panel hidden h-max p-4 xl:block">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="editorial-title text-2xl text-white">Your Order</h2>
              <p className="mt-1 text-sm text-[var(--sb-muted)]">{cartCount} Items</p>
            </div>
            <button type="button" onClick={onShowCart} className="text-xs uppercase tracking-[0.16em] text-[var(--sb-red-bright)]">View Cart</button>
          </div>
          <div className="mt-4 space-y-3">
            {groupedCart.length === 0 ? (
              <p className="rounded-xl border border-[var(--sb-border)] p-4 text-sm text-[var(--sb-muted)]">Your order is waiting for a chef selection.</p>
            ) : (
              groupedCart.map(({ item, qty }) => (
                <div key={item.id} className="grid grid-cols-[72px_1fr_auto] gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-2">
                  <div className="relative h-16 overflow-hidden rounded-lg"><Image src={item.image.publicUrl} alt="" fill sizes="72px" className="object-cover" /></div>
                  <div>
                    <p className="text-sm text-white">{item.name}</p>
                    <p className="text-xs text-[var(--sb-muted)]">Qty {qty}</p>
                    <p className="text-sm text-[var(--sb-gold)]">{formatCurrency(item.price * qty)}</p>
                  </div>
                  <button type="button" aria-label={`Remove ${item.name}`} onClick={() => onRemove(item.id)} className="grid h-7 w-7 place-items-center rounded-full border border-white/10 text-[var(--sb-muted)]">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
          <label className="mt-4 block">
            <span className="sr-only">Order note</span>
            <input className="h-11 w-full rounded-xl border border-[var(--sb-border)] bg-black/35 px-3 text-sm text-white outline-none placeholder:text-[var(--sb-muted)]" placeholder="Add a note (optional)" />
          </label>
          <div className="mt-5 space-y-2 text-sm text-[var(--sb-muted)]">
            <SummaryLine label="Subtotal" value={formatCurrency(subtotal)} />
            <SummaryLine label="Estimated Total" value={formatCurrency(total)} strong />
          </div>
          <Button className="red-glow-button mt-5 h-12 w-full rounded-xl uppercase tracking-[0.14em]" onClick={onCheckout}>
            Proceed To Checkout
          </Button>
        </aside>
      </section>

      <div className="fixed inset-x-4 bottom-[96px] z-40 rounded-[18px] border border-[var(--sb-border)] bg-black/88 p-3 shadow-[0_0_32px_rgba(0,0,0,0.7)] backdrop-blur-xl xl:hidden">
        <div className="mb-2 flex items-center justify-between text-sm text-white">
          <span>{cartCount} Items</span>
          <span>{formatCurrency(total)}</span>
          <span>{deliveryMinutes}</span>
        </div>
        <Button className="red-glow-button h-12 w-full rounded-xl uppercase tracking-[0.14em]" onClick={onShowCart}>
          View Cart & Checkout
        </Button>
      </div>
    </div>
  );
}

/** Renders the sake pairing gallery using menu-linked pairing data. */
function PairingsView({ items, onSelectItem }: { items: SushiMenuItem[]; onSelectItem: (item: SushiMenuItem) => void }) {
  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="Sake Pairings"
        title="A Signature Part Of The Experience"
        copy="Every pairing image is used as atmosphere while the pairing text is rendered from structured data."
        image={assetUrl(featuredAssets.sakeSets[1], heroAsset.publicUrl)}
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <button
            key={item.sakePairing.id}
            type="button"
            onClick={() => onSelectItem(item)}
            className="luxury-panel group overflow-hidden text-left transition hover:-translate-y-1 hover:border-[var(--sb-gold)]"
          >
            <div className="relative h-56">
              <Image src={item.sakePairing.image.publicUrl} alt="" fill sizes="(min-width: 1024px) 33vw, 100vw" className="object-cover transition group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/24 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <span className="rounded-full border border-[var(--sb-border)] bg-black/45 px-3 py-1 text-xs uppercase tracking-[0.18em] text-[var(--sb-gold)]">{item.categoryLabel}</span>
                <h3 className="mt-3 text-xl font-semibold text-white">{item.name}</h3>
                <p className="text-sm text-[var(--sb-gold)]">{item.sakePairing.sakeName}</p>
              </div>
            </div>
            <div className="p-5">
              <p className="text-sm leading-6 text-[var(--sb-muted)]">{item.sakePairing.whyItWorks}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {item.sakePairing.flavorNotes.map((note) => (
                  <span key={note} className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-[var(--sb-muted)]">{note}</span>
                ))}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

interface ReservationsViewProps {
  form: ReservationFormState;
  reservations: Reservation[];
  profile: GuestProfile;
  onFormChange: (patch: Partial<ReservationFormState>) => void;
  onSave: () => void;
  onProfileChange: (profile: GuestProfile | ((profile: GuestProfile) => GuestProfile)) => void;
}

/** Renders the complete reservation booking flow and live summary. */
function ReservationsView({ form, reservations, profile, onFormChange, onSave, onProfileChange }: ReservationsViewProps) {
  const slots = getReservationSlots(form.date, form.guests, reservations);
  const experiences = getReservationExperiences();
  const selectedSlot = slots.find((slot) => slot.time === form.time);
  const selectedExperience = getReservationExperienceTitle(form.seating);
  const featuredOmakaseCourse =
    masterChefsOmakaseExperience.courses.find((course) => course.chefId === "ren-mori") ??
    masterChefsOmakaseExperience.courses[0];
  const summaryImage = assetUrl(featuredOmakaseCourse?.specialty.image, heroAsset.publicUrl);

  return (
    <div className="space-y-5">
      <PageHero
        eyebrow="Reserve your experience."
        title="Reservations"
        copy="An unforgettable dining experience awaits. Choose your date, time, and dining room."
        image={heroAsset.publicUrl}
      />
      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <section className="grid gap-5 lg:grid-cols-[320px_1fr]">
          <div className="luxury-panel p-5">
            <NumberedTitle number="1" title="Party Details" />
            <div className="mt-4 rounded-2xl border border-[var(--sb-border)] bg-black/30 p-3">
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--sb-muted)]">Party Size</p>
              <div className="mt-3 flex items-center justify-between">
                <button type="button" onClick={() => onFormChange({ guests: Math.max(1, form.guests - 1) })} className="grid h-10 w-10 place-items-center rounded-full border border-[var(--sb-border)] text-[var(--sb-gold)]"><Minus className="h-4 w-4" /></button>
                <span className="text-2xl font-semibold text-white">{form.guests} Guests</span>
                <button type="button" onClick={() => onFormChange({ guests: Math.min(8, form.guests + 1) })} className="grid h-10 w-10 place-items-center rounded-full border border-[var(--sb-border)] text-[var(--sb-gold)]"><Plus className="h-4 w-4" /></button>
              </div>
            </div>
            <NumberedTitle number="2" title="Select Date" className="mt-6" />
            <div className="mt-4 grid grid-cols-2 gap-2">
              {Array.from({ length: 6 }, (_, index) => {
                const date = new Date();
                date.setDate(date.getDate() + index);
                const value = date.toISOString().slice(0, 10);
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => onFormChange({ date: value })}
                    className={`rounded-2xl border p-3 text-left transition ${form.date === value ? "border-[var(--sb-red-bright)] bg-[var(--sb-red)]/24" : "border-[var(--sb-border)] bg-white/[0.03]"}`}
                  >
                    <span className="block text-xs uppercase tracking-[0.18em] text-[var(--sb-muted)]">{index === 0 ? "Today" : compactDate(value)}</span>
                    <span className="mt-1 block text-lg font-semibold text-white">{date.toLocaleDateString(undefined, { weekday: "short" })}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-5">
            <div className="luxury-panel p-5">
              <NumberedTitle number="3" title="Select Time" />
              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {slots.map((slot) => (
                  <button
                    key={slot.time}
                    type="button"
                    disabled={slot.disabled}
                    onClick={() => onFormChange({ time: slot.time })}
                    className={`relative rounded-2xl border p-3 text-left transition disabled:cursor-not-allowed disabled:opacity-40 ${
                      form.time === slot.time ? "border-[var(--sb-red-bright)] bg-[var(--sb-red)]/24 shadow-[0_0_24px_rgba(184,20,20,0.26)]" : "border-[var(--sb-border)] bg-white/[0.03] hover:border-[var(--sb-gold)]"
                    }`}
                  >
                    {slot.service.toLowerCase().includes("counter") ? <span className="absolute right-2 top-2 rounded-full border border-[var(--sb-border)] px-2 py-0.5 text-[9px] uppercase text-[var(--sb-gold)]">Chef&apos;s Counter</span> : null}
                    <span className="block font-semibold text-white">{slot.label}</span>
                    <span className="mt-1 block text-xs text-[var(--sb-muted)]">{slot.seatsRemaining} open</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="luxury-panel p-5">
              <NumberedTitle number="4" title="Choose Your Experience" />
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {experiences.map((experience) => {
                  const seating = getSeatingForExperience(experience.id);
                  const active = form.seating === seating;
                  return (
                    <button
                      key={experience.id}
                      type="button"
                      onClick={() => onFormChange({ seating })}
                      className={`group grid grid-cols-[1fr_112px] overflow-hidden rounded-2xl border bg-white/[0.03] text-left transition ${
                        active ? "border-[var(--sb-red-bright)] bg-[var(--sb-red)]/12" : "border-[var(--sb-border)] hover:border-[var(--sb-gold)]"
                      }`}
                    >
                      <span className="p-4">
                        <span className="block font-semibold uppercase tracking-[0.08em] text-white">{experience.title}</span>
                        <span className="mt-1 block text-xs leading-5 text-[var(--sb-muted)]">{experience.description}</span>
                        {experience.premium ? <span className="mt-2 inline-block rounded-full bg-[var(--sb-red)] px-2 py-1 text-[10px] uppercase text-white">Premium</span> : null}
                      </span>
                      <span className="relative min-h-28 overflow-hidden">
                        <Image src={experience.image.publicUrl} alt="" fill sizes="140px" className="object-cover transition group-hover:scale-105" />
                        <span className="absolute inset-0 bg-gradient-to-l from-transparent to-black/28" />
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="luxury-panel p-5">
              <NumberedTitle number="5" title="Special Occasion" />
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Input value={form.name || profile.name} onChange={(event) => onFormChange({ name: event.target.value })} placeholder="Full name" className="h-12 rounded-2xl border-[var(--sb-border)] bg-black/30 text-white" />
                <Input value={form.phone || profile.phone} onChange={(event) => onFormChange({ phone: event.target.value })} placeholder="Phone" className="h-12 rounded-2xl border-[var(--sb-border)] bg-black/30 text-white" />
                <select value={form.occasion} onChange={(event) => onFormChange({ occasion: event.target.value as ReservationFormState["occasion"] })} className="h-12 rounded-2xl border border-[var(--sb-border)] bg-black/30 px-3 text-sm text-white sm:col-span-2">
                  {occasionOptions.map((occasion) => <option key={occasion}>{occasion}</option>)}
                </select>
                <textarea value={form.notes} onChange={(event) => onFormChange({ notes: event.target.value })} placeholder="We're celebrating a special birthday. Looking forward to an amazing experience!" className="min-h-28 rounded-2xl border border-[var(--sb-border)] bg-black/30 px-3 py-3 text-sm text-white placeholder:text-[var(--sb-muted)] sm:col-span-2" />
              </div>
              <label className="mt-4 flex items-center justify-between rounded-2xl border border-[var(--sb-border)] bg-white/[0.03] p-3 text-sm text-[var(--sb-muted)]">
                Save reservation contact to profile
                <input
                  type="checkbox"
                  checked={profile.marketingOptIn}
                  onChange={(event) => onProfileChange((current) => ({ ...current, marketingOptIn: event.target.checked }))}
                  className="accent-[var(--sb-red)]"
                />
              </label>
            </div>
          </div>
        </section>
        <ReservationSummaryCard
          date={formatReservationDateForSummary(form.date)}
          experience={selectedExperience}
          image={summaryImage}
          occasion={form.occasion}
          party={`${form.guests} Guests`}
          time={selectedSlot?.label ?? form.time}
          onSave={onSave}
        />
      </div>
    </div>
  );
}

/** Converts internal seating values into the more editorial labels used in screenshots. */
function getReservationExperienceTitle(seating: ReservationFormState["seating"]): string {
  if (seating === "Counter") return "Chef's Counter";
  if (seating === "Dining Room") return "Main Dining Room";
  return "Outdoor Lantern Terrace";
}

/** Maps reservation experience cards back to the stored seating preference. */
function getSeatingForExperience(experienceId: string): ReservationFormState["seating"] {
  if (experienceId === "sushi-bar" || experienceId === "chef-counter") return "Counter";
  if (experienceId === "main-dining-room") return "Dining Room";
  return "Window";
}

/** Formats a YYYY-MM-DD value to the long reservation summary text. */
function formatReservationDateForSummary(dateValue: string): string {
  return new Date(`${dateValue}T12:00`).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

/** Renders the mobile-first reservation summary card shown before editing controls. */
function ReservationSummaryCard({
  date,
  experience,
  image,
  occasion,
  party,
  time,
  onSave,
}: {
  date: string;
  experience: string;
  image: string;
  occasion: string;
  party: string;
  time: string;
  onSave: () => void;
}) {
  const rows = [
    { icon: iconAssets.reservations, label: "Date", value: date },
    { icon: iconAssets.clock, label: "Time", value: time },
    { icon: iconAssets.group, label: "Party Size", value: party },
    { icon: iconAssets.dining, label: "Experience", value: experience },
    { icon: iconAssets.reservations, label: "Occasion", value: occasion },
  ];

  return (
    <aside className="luxury-panel order-first h-max overflow-hidden p-3.5 sm:p-5 xl:order-none">
      <p className="editorial-title text-lg text-white sm:text-xl xl:text-2xl">Your Reservation</p>
      <div className="mt-2 divide-y divide-[var(--sb-border)] sm:mt-4">
        {rows.map((row) => (
          <ReservationSummaryRow key={row.label} icon={row.icon} label={row.label} value={row.value} />
        ))}
      </div>
      <div className="relative mt-3 h-20 overflow-hidden rounded-2xl border border-[var(--sb-border)] sm:mt-5 sm:h-44">
        <Image src={image} alt="" fill sizes="360px" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/58 to-transparent" />
      </div>
      <Button className="red-glow-button mt-3 h-10 w-full rounded-2xl uppercase tracking-[0.18em] sm:mt-4 sm:h-12" onClick={onSave}>
        Confirm Reservation
      </Button>
    </aside>
  );
}

/** Displays one icon-led reservation summary line. */
function ReservationSummaryRow({ icon, label, value }: { icon?: string; label: string; value: string }) {
  return (
    <div className="grid grid-cols-[28px_1fr] gap-2.5 py-1.5 sm:grid-cols-[34px_1fr] sm:gap-3 sm:py-3">
      <span className="grid h-6 w-6 place-items-center rounded-full border border-[var(--sb-border)] bg-black/35 sm:h-8 sm:w-8">
        {icon ? <AssetIcon src={icon} size={17} /> : null}
      </span>
      <span>
        <span className="block text-[10px] uppercase tracking-[0.18em] text-[var(--sb-muted)] sm:text-xs">{label}</span>
        <span className="block text-[13px] text-white sm:mt-1 sm:text-sm">{value}</span>
      </span>
    </div>
  );
}

/** Renders active order tracking, receipts, and reorder actions. */
function OrdersView({ latestOrder, orderHistory, onNavigate, onReorder }: { latestOrder: OrderHistoryEntry | null; orderHistory: OrderHistoryEntry[]; onNavigate: (view: AppView) => void; onReorder: (items: SushiMenuItem[]) => void }) {
  const pastOrders = latestOrder ? orderHistory.filter((order) => order.id !== latestOrder.id) : orderHistory;

  return (
    <div className="space-y-5">
      <PageHero
        eyebrow="Your orders, delivered with care."
        title="Orders"
        copy="Track your current orders and view your delicious history."
        image={heroAsset.publicUrl}
      />
      {!latestOrder ? (
        <EmptyState title="No orders yet" copy="Your confirmed orders and receipts will appear here." actionLabel="Order now" onAction={() => onNavigate("orderOnline")} />
      ) : (
        <ActiveOrderPanel order={latestOrder} onReorder={onReorder} />
      )}
      <section className="luxury-panel p-5 sm:p-6">
        <div className="flex items-center gap-3">
          {iconAssets.flower ? <AssetIcon src={iconAssets.flower} size={25} /> : null}
          <h2 className="editorial-title text-xl text-white">Past Orders</h2>
        </div>
        <div className="mt-5 space-y-3">
          {pastOrders.length === 0 ? <p className="text-sm text-[var(--sb-muted)]">No past orders yet.</p> : null}
          {pastOrders.slice(0, 5).map((order) => (
            <PastOrderRow key={order.id} order={order} onReorder={onReorder} />
          ))}
        </div>
      </section>
    </div>
  );
}

/** Displays the screenshot-style active order card with timeline and actions. */
function ActiveOrderPanel({ order, onReorder }: { order: OrderHistoryEntry; onReorder: (items: SushiMenuItem[]) => void }) {
  return (
    <section className="luxury-panel overflow-hidden p-0">
      <div className="border-b border-[var(--sb-border)] px-5 py-4">
        <div className="flex items-center gap-3">
          {iconAssets.orders ? <AssetIcon src={iconAssets.orders} size={24} /> : null}
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--sb-gold)]">Active Order</p>
        </div>
      </div>
      <div className="grid gap-5 p-5 lg:grid-cols-[1fr_1.1fr_0.85fr]">
        <div>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="editorial-title text-2xl text-white">Order #{order.confirmationCode}</h2>
              <p className="mt-2 text-sm text-[var(--sb-muted)]">{new Date(order.placedAt).toLocaleString()}</p>
            </div>
            <span className="rounded-full bg-[var(--sb-red)]/84 px-3 py-1 text-[10px] uppercase tracking-[0.14em] text-white">{order.type}</span>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <StatCard label={order.type === "Delivery" ? "Est. Delivery" : "Est. Ready"} value={formatClockTime(order.fulfillmentTime)} />
            <StatCard label="Minutes" value={`${order.etaMinutes} min`} />
          </div>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--sb-gold)]">Order Status</p>
          <OrderTimeline orderType={order.type} />
          <div className="mt-5 flex items-center gap-2">
            <span className="text-sm text-[var(--sb-muted)]">{order.items.length} Items</span>
            <div className="flex flex-1 gap-2 overflow-hidden">
              {order.items.slice(0, 4).map((item, index) => (
                <span key={`${order.id}-${item.id}-${index}`} className="relative h-14 w-16 overflow-hidden rounded-xl border border-[var(--sb-border)] bg-black/35">
                  <Image src={item.image.publicUrl} alt="" fill sizes="64px" className="object-cover" />
                </span>
              ))}
              {order.items.length > 4 ? <span className="grid h-14 w-14 place-items-center rounded-xl border border-[var(--sb-border)] text-sm text-white">+{order.items.length - 4}</span> : null}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--sb-border)] bg-black/32 p-4">
          <SummaryLine label="Total" value={formatCurrency(order.total)} strong />
          <Button variant="outline" className="mt-4 h-11 w-full rounded-xl border-[var(--sb-border)] bg-transparent text-[var(--sb-gold)]">
            View Details
          </Button>
          <Button className="red-glow-button mt-3 h-11 w-full rounded-xl uppercase tracking-[0.14em]" onClick={() => onReorder(order.items)}>
            Order Again
          </Button>
        </div>
      </div>
    </section>
  );
}

/** Renders the three-step status line used by active orders. */
function OrderTimeline({ orderType }: { orderType: FulfillmentType }) {
  const stages = [
    { label: "Preparing", icon: iconAssets.about, active: true },
    { label: orderType === "Delivery" ? "On The Way" : "Ready Soon", icon: iconAssets.delivery, active: false },
    { label: "Delivered", icon: iconAssets.check, active: false },
  ];

  return (
    <div className="mt-5 grid grid-cols-3 items-start gap-2">
      {stages.map((stage, index) => (
        <div key={stage.label} className="relative text-center">
          {index > 0 ? <span className="absolute right-1/2 top-5 h-px w-full bg-[var(--sb-border)]" /> : null}
          <span className={`relative z-10 mx-auto grid h-11 w-11 place-items-center rounded-full border bg-black/55 ${stage.active ? "border-[var(--sb-red-bright)] shadow-[0_0_18px_var(--sb-red-glow)]" : "border-[var(--sb-border)]"}`}>
            {stage.icon ? <AssetIcon src={stage.icon} size={24} /> : null}
          </span>
          <span className={`mt-2 block text-xs ${stage.active ? "text-[var(--sb-red-bright)]" : "text-[var(--sb-muted)]"}`}>{stage.label}</span>
        </div>
      ))}
    </div>
  );
}

/** Shows one past order row with image thumbnails and a reorder action. */
function PastOrderRow({ order, onReorder }: { order: OrderHistoryEntry; onReorder: (items: SushiMenuItem[]) => void }) {
  return (
    <div className="grid gap-3 rounded-2xl border border-[var(--sb-border)] bg-white/[0.03] p-3 md:grid-cols-[1fr_auto_auto] md:items-center">
      <div className="flex items-center gap-3">
        <div className="flex -space-x-2">
          {order.items.slice(0, 3).map((item, index) => (
            <span key={`${order.id}-${item.id}-${index}`} className="relative h-12 w-14 overflow-hidden rounded-xl border border-black bg-black">
              <Image src={item.image.publicUrl} alt="" fill sizes="56px" className="object-cover" />
            </span>
          ))}
        </div>
        <div>
          <p className="font-semibold text-white">Order #{order.confirmationCode}</p>
          <p className="text-sm text-[var(--sb-muted)]">{new Date(order.placedAt).toLocaleDateString()} / {order.items.length} items</p>
        </div>
      </div>
      <span className="text-lg font-semibold text-[var(--sb-gold)]">{formatCurrency(order.total)}</span>
      <Button variant="outline" className="h-10 rounded-xl border-[var(--sb-border)] bg-transparent text-[var(--sb-gold)]" onClick={() => onReorder(order.items)}>
        Order Again
      </Button>
    </div>
  );
}

/** Renders the member loyalty dashboard and reward redemption cards. */
function LoyaltyView({ loyaltyPoints, rewards, onRedeem }: { loyaltyPoints: number; rewards: Reward[]; onRedeem: (reward: Reward) => void }) {
  const progressValue = Math.min(loyaltyPoints, appContent.member.maxTierPoints);
  const featuredRewards = rewards.slice(0, 4);

  return (
    <div className="space-y-5">
      <section className="luxury-panel relative overflow-hidden p-5 sm:p-7">
        <Image src={heroAsset.publicUrl} alt="" fill sizes="100vw" className="object-cover opacity-70" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.94)_0%,rgba(0,0,0,0.72)_42%,rgba(0,0,0,0.34)_78%,rgba(0,0,0,0.84)_100%)]" />
        <div className="sb-wave-pattern absolute bottom-4 left-4 h-32 w-72 opacity-20" />
        <div className="relative z-10 grid gap-5 lg:grid-cols-[1fr_320px]">
          <div className="max-w-xl">
            <p className="text-xs uppercase tracking-[0.24em] text-[var(--sb-gold)]">Welcome back, Hiroshi.</p>
            <h1 className="editorial-title mt-3 text-5xl leading-[0.94] text-white md:text-7xl">
              Loyalty
              <span className="block text-[var(--sb-red-bright)]">Rewards</span>
            </h1>
            <p className="mt-4 max-w-sm text-sm leading-6 text-white/78">Savor more than exceptional sushi. Earn points, unlock exclusive rewards, and enjoy elevated dining experiences.</p>
          </div>
          <MemberStatusCard loyaltyPoints={loyaltyPoints} progressValue={progressValue} />
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[320px_1fr]">
        <MemberPassCard />
        <div className="luxury-panel p-5">
          <div className="flex items-center justify-between gap-4">
            <h2 className="editorial-title text-xl text-white">Redeem Your Points</h2>
            <button type="button" className="text-xs uppercase tracking-[0.16em] text-[var(--sb-red-bright)]">View all rewards</button>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
            {featuredRewards.map((reward) => (
              <RewardCard key={reward.id} reward={reward} onRedeem={onRedeem} />
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr_0.9fr]">
        <LoyaltyInfoCard
          action="Invite Friends"
          copy="Share Sushi Bliss with friends. You both earn 500 points."
          image={assetUrl(featuredAssets.sakeSets[0], heroAsset.publicUrl)}
          title="Refer & Earn"
        />
        <div className="luxury-panel p-5">
          <div className="flex items-center justify-between gap-4">
            <h2 className="editorial-title text-xl text-white">Member Perks</h2>
            <button type="button" className="text-xs uppercase tracking-[0.16em] text-[var(--sb-red-bright)]">View all</button>
          </div>
          <div className="mt-5 grid grid-cols-4 gap-3 text-center">
            {[
              { icon: iconAssets.star, title: "10 pts", copy: "per $1 spent" },
              { icon: iconAssets.gift, title: "Birthday", copy: "reward" },
              { icon: iconAssets.group, title: "Exclusive", copy: "access" },
              { icon: iconAssets.reservations, title: "Priority", copy: "reservations" },
            ].map((perk) => (
              <div key={perk.title} className="rounded-2xl border border-[var(--sb-border)] bg-black/30 p-3">
                {perk.icon ? <AssetIcon src={perk.icon} size={30} className="mx-auto" /> : null}
                <p className="mt-2 text-xs font-semibold text-[var(--sb-gold)]">{perk.title}</p>
                <p className="text-[11px] text-[var(--sb-muted)]">{perk.copy}</p>
              </div>
            ))}
          </div>
        </div>
        <LoyaltyInfoCard
          action="Explore Rewards"
          copy="Exclusive rewards for our most devoted members."
          image={assetUrl(getItemById("uni-gunkan")?.image, heroAsset.publicUrl)}
          title="Chef's Tasting Rewards"
        />
      </section>

      <section className="luxury-panel p-5">
        <div className="flex items-center justify-between gap-4">
          <h2 className="editorial-title text-xl text-white">Recent Rewards Activity</h2>
          <button type="button" className="text-xs uppercase tracking-[0.16em] text-[var(--sb-red-bright)]">View all activity</button>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          {[
            ["Earned Points", "Dinner at Sushi Bliss", "+350 pts"],
            ["Reward Redeemed", "Spicy Tuna Roll", "-1,000 pts"],
            ["Earned Points", "Lunch at Sushi Bliss", "+250 pts"],
            ["Bonus Points", "Birthday Reward", "+500 pts"],
          ].map(([title, copy, points]) => (
            <div key={`${title}-${copy}`} className="rounded-2xl border border-[var(--sb-border)] bg-white/[0.03] p-4">
              <p className="text-xs text-[var(--sb-muted)]">{title}</p>
              <p className="mt-1 text-sm text-white">{copy}</p>
              <p className="mt-2 text-sm text-[var(--sb-gold)]">{points}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

/** Displays the glass member status card from the loyalty screenshots. */
function MemberStatusCard({ loyaltyPoints, progressValue }: { loyaltyPoints: number; progressValue: number }) {
  return (
    <aside className="rounded-2xl border border-[var(--sb-border)] bg-black/52 p-5 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        {iconAssets.flower ? <AssetIcon src={iconAssets.flower} size={46} /> : null}
        <div>
          <p className="editorial-title text-lg text-white">Bliss Member</p>
          <p className="text-sm uppercase tracking-[0.16em] text-[var(--sb-gold)]">{appContent.member.tier} Tier</p>
        </div>
      </div>
      <p className="mt-6 text-xs uppercase tracking-[0.18em] text-[var(--sb-muted)]">Points Balance</p>
      <p className="mt-2 text-4xl text-white">{loyaltyPoints.toLocaleString()} <span className="text-lg uppercase text-[var(--sb-muted)]">pts</span></p>
      <div className="mt-4 flex items-center justify-between text-xs text-[var(--sb-muted)]">
        <span>{appContent.member.pointsToNextTier.toLocaleString()} pts to reach {appContent.member.nextTier}</span>
        <span>{progressValue.toLocaleString()} / {appContent.member.maxTierPoints.toLocaleString()}</span>
      </div>
      <progress className="mt-2 h-2 w-full" value={progressValue} max={appContent.member.maxTierPoints} />
      <Button variant="outline" className="mt-5 h-11 w-full rounded-xl border-[var(--sb-border)] bg-black/30 uppercase tracking-[0.14em] text-[var(--sb-gold)]">
        View Benefits
      </Button>
    </aside>
  );
}

/** Renders the scannable member pass panel using the packaged QR icon asset. */
function MemberPassCard() {
  return (
    <section className="luxury-panel p-5">
      <h2 className="editorial-title text-xl text-white">Your Member Pass</h2>
      <p className="mt-1 text-sm text-[var(--sb-muted)]">Scan to earn and redeem.</p>
      <div className="mt-5 grid gap-4 sm:grid-cols-[132px_1fr] xl:block">
        <div className="grid aspect-square place-items-center rounded-xl border border-[var(--sb-border)] bg-white p-3">
          {iconAssets.qr ? <AssetIcon src={iconAssets.qr} size={104} /> : <span className="font-mono text-3xl font-bold text-black">SB</span>}
        </div>
        <div className="text-sm text-[var(--sb-muted)] xl:mt-4">
          <p className="font-semibold text-white">{appContent.member.name}</p>
          <p className="mt-3 uppercase tracking-[0.16em] text-[var(--sb-gold)]">Member ID</p>
          <p>SB12567890</p>
          <p className="mt-3 uppercase tracking-[0.16em] text-[var(--sb-gold)]">Joined</p>
          <p>Jan 15, 2024</p>
        </div>
      </div>
    </section>
  );
}

/** Renders one reward redemption card with image, points, and value. */
function RewardCard({ reward, onRedeem }: { reward: Reward; onRedeem: (reward: Reward) => void }) {
  return (
    <button type="button" onClick={() => onRedeem(reward)} className="group overflow-hidden rounded-2xl border border-[var(--sb-border)] bg-black/34 text-left transition hover:border-[var(--sb-gold)]">
      <div className="relative h-32">
        <Image src={reward.image.publicUrl} alt="" fill sizes="220px" className="object-cover transition group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/88 via-black/16 to-transparent" />
      </div>
      <div className="p-3">
        <p className="text-xs font-semibold text-[var(--sb-gold)]">{reward.points.toLocaleString()} pts</p>
        <p className="mt-1 line-clamp-1 font-semibold text-white">{reward.title}</p>
        <p className="mt-1 text-[11px] uppercase tracking-[0.12em] text-[var(--sb-gold)]">{reward.value}</p>
      </div>
    </button>
  );
}

/** Shows a compact image-backed loyalty information module. */
function LoyaltyInfoCard({ action, copy, image, title }: { action: string; copy: string; image: string; title: string }) {
  return (
    <section className="luxury-panel relative min-h-[168px] overflow-hidden p-5">
      <Image src={image} alt="" fill sizes="360px" className="object-cover opacity-38" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/88 via-black/52 to-transparent" />
      <div className="relative z-10 max-w-[230px]">
        <h2 className="editorial-title text-xl text-white">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--sb-muted)]">{copy}</p>
        <button type="button" className="mt-4 rounded-xl border border-[var(--sb-border)] px-4 py-2 text-xs uppercase tracking-[0.16em] text-[var(--sb-gold)]">{action}</button>
      </div>
    </section>
  );
}

/** Renders the editorial restaurant story, sourcing cards, and chef lineup. */
function AboutView({ chefs, onSelectItem }: { chefs: Chef[]; onSelectItem: (item: SushiMenuItem) => void }) {
  return (
    <div className="space-y-6">
      <PageHero eyebrow="About Sushi Bliss" title="A Legacy Of Craft" copy="Rooted in tradition, shaped for the future, and paced around omotenashi." image={assetUrl(ambienceAssets[1], heroAsset.publicUrl)} />
      <section className="grid gap-5 lg:grid-cols-3">
        {[
          { title: "Sourcing", image: ingredientAssets[1], copy: "Bluefin, uni, scallop, wasabi, and seasonal vegetables selected for balance." },
          { title: "Omotenashi", image: ambienceAssets[0], copy: "Hospitality through pacing, attention, warmth, and quiet precision." },
          { title: "Atmosphere", image: ambienceAssets[4], copy: "Black stone, lantern glow, smoke, sake, and a counter designed for memory." },
        ].map((card) => (
          <div key={card.title} className="luxury-panel overflow-hidden">
            <div className="relative h-52"><Image src={assetUrl(card.image, heroAsset.publicUrl)} alt="" fill sizes="33vw" className="object-cover" /></div>
            <div className="p-5"><h2 className="editorial-title text-2xl text-white">{card.title}</h2><p className="mt-2 text-sm leading-6 text-[var(--sb-muted)]">{card.copy}</p></div>
          </div>
        ))}
      </section>
      <section className="luxury-panel p-5 sm:p-6">
        <SectionHeader eyebrow="Master Chefs" title="The Team" copy="Chef data is wired from the final package, including distinct standing and plating images." />
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {chefs.map((chef) => {
            const signature = menuItems.find((item) => item.name === chef.sushi || item.name === chef.specialty);
            return (
              <article key={chef.id} className="overflow-hidden rounded-2xl border border-[var(--sb-border)] bg-white/[0.03]">
                <div className="relative h-72">
                  <Image src={chef.standingImage.publicUrl} alt="" fill sizes="280px" className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/92 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-xl font-semibold text-white">{chef.name}</h3>
                    <p className="text-sm text-[var(--sb-gold)]">{chef.position}</p>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-sm leading-6 text-[var(--sb-muted)]">{chef.about}</p>
                  {signature ? (
                    <Button variant="outline" className="mt-4 h-10 w-full rounded-xl border-[var(--sb-border)] bg-transparent text-[var(--sb-gold)]" onClick={() => onSelectItem(signature)}>
                      View Signature
                    </Button>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}

/** Renders contact details and validates private event inquiries. */
function ContactView({ onNavigate, showNotice }: { onNavigate: (view: AppView) => void; showNotice: (message: string, tone?: Notice["tone"]) => void }) {
  const contactHero = getAssetById("sushi-bliss-ambience-detail") ?? ambienceAssets[0];
  const { hours, location } = appContent;
  const socialLinks = [
    { label: "Instagram", icon: iconAssets.instagram },
    { label: "Facebook", icon: iconAssets.facebook },
    { label: "X", icon: iconAssets.x },
  ];

  return (
    <div className="space-y-5">
      <PageHero
        eyebrow="We'd love to hear from you"
        title="Contact Sushi Bliss"
        copy="Have a question, special request, or want to book a private dining experience?"
        image={assetUrl(contactHero, heroAsset.publicUrl)}
      />
      <section className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <ContactInfoCard icon={iconAssets.mapPin} title="Location" lines={[`${location.city}, ${location.country}`, location.street, location.postalLine]} action="View on map" />
            <ContactInfoCard icon={iconAssets.phone} title="Contact Info" lines={[location.phone, "Call us anytime", location.email]} />
            <ContactInfoCard icon={iconAssets.clock} title="Hours" lines={[hours.days, hours.service, hours.lastOrder]} action="Open now" />
            <ContactInfoCard icon={iconAssets.flower} title="Follow Us" lines={socialLinks.map((link) => link.label)} socialLinks={socialLinks} />
          </div>
          <section className="grid gap-4 sm:grid-cols-2">
            <Button className="red-glow-button h-14 rounded-2xl uppercase tracking-[0.18em]" onClick={() => onNavigate("reservations")}>
              {iconAssets.reservations ? <AssetIcon src={iconAssets.reservations} size={24} className="mr-3" /> : null}
              Reserve a Table
              <ChevronRight className="ml-auto h-4 w-4" />
            </Button>
            <Button variant="outline" className="h-14 rounded-2xl border-[var(--sb-border-strong)] bg-black/30 uppercase tracking-[0.18em] text-[var(--sb-gold)]" onClick={() => onNavigate("orderOnline")}>
              {iconAssets.orders ? <AssetIcon src={iconAssets.orders} size={24} className="mr-3" /> : null}
              Order Now
              <ChevronRight className="ml-auto h-4 w-4" />
            </Button>
          </section>
        </div>
        <ContactMapCard />
      </section>

      <section className="grid gap-5 xl:grid-cols-[0.78fr_1.22fr]">
        <FAQPanel />
        <div className="luxury-panel relative overflow-hidden p-5">
          <Image src={heroAsset.publicUrl} alt="" fill sizes="760px" className="object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/88 via-black/74 to-black/30" />
          <div className="relative z-10">
            <SectionHeader eyebrow="Message" title="Send Us A Message" />
            <div className="mt-5 grid gap-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <Input placeholder="Full name" className="h-12 rounded-2xl border-[var(--sb-border)] bg-black/40 text-white" />
                <Input placeholder="Email address" className="h-12 rounded-2xl border-[var(--sb-border)] bg-black/40 text-white" />
              </div>
              <Input placeholder="Subject" className="h-12 rounded-2xl border-[var(--sb-border)] bg-black/40 text-white" />
              <textarea placeholder="Your message" className="min-h-32 rounded-2xl border border-[var(--sb-border)] bg-black/40 px-3 py-3 text-sm text-white placeholder:text-[var(--sb-muted)]" />
              <Button className="red-glow-button h-12 rounded-2xl uppercase tracking-[0.18em]" onClick={() => showNotice("Message sent. We will reply shortly.", "success")}>
                Send Message
                <Send className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>
      <DesktopBenefitsBar />
    </div>
  );
}

/** Displays one contact information card with packaged raster icons. */
function ContactInfoCard({ action, icon, lines, socialLinks, title }: { action?: string; icon?: string; lines: string[]; socialLinks?: Array<{ icon?: string; label: string }>; title: string }) {
  return (
    <section className="luxury-panel p-5">
      <div className="flex items-center gap-3">
        {icon ? <AssetIcon src={icon} size={26} /> : null}
        <h2 className="text-xs uppercase tracking-[0.22em] text-[var(--sb-gold)]">{title}</h2>
      </div>
      {socialLinks ? (
        <div className="mt-5 flex gap-3">
          {socialLinks.map((link) => (
            <button key={link.label} type="button" aria-label={link.label} className="grid h-10 w-10 place-items-center rounded-full border border-[var(--sb-border)] bg-black/34">
              {link.icon ? <AssetIcon src={link.icon} size={24} /> : null}
            </button>
          ))}
        </div>
      ) : (
        <div className="mt-4 space-y-1 text-sm text-[var(--sb-muted)]">
          {lines.map((line) => <p key={line}>{line}</p>)}
        </div>
      )}
      {action ? <button type="button" className="mt-5 rounded-full border border-[var(--sb-border)] px-4 py-2 text-xs uppercase tracking-[0.18em] text-[var(--sb-gold)]">{action}</button> : null}
    </section>
  );
}

/** Renders the dark map module from the contact references without external map dependencies. */
function ContactMapCard() {
  const mapAsset = getAssetById("sushi-bliss-tokyo-map-transparent");

  return (
    <section className="luxury-panel relative min-h-[280px] overflow-hidden p-5" aria-label="Sushi Bliss Tokyo map">
      {mapAsset ? (
        <Image src={mapAsset.publicUrl} alt="" fill sizes="540px" className="object-cover opacity-95" />
      ) : (
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[length:42px_42px] opacity-45" />
      )}
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(0,0,0,0.04),rgba(0,0,0,0.28))]" />
    </section>
  );
}

/** Shows the compact FAQ list used on the contact screen. */
function FAQPanel() {
  const questions = [
    "Do you take reservations?",
    "Do you offer delivery?",
    "Are there vegetarian or vegan options?",
    "Do you accommodate allergies?",
    "Is private dining available?",
  ];

  return (
    <section className="luxury-panel p-5">
      <h2 className="editorial-title text-xl text-[var(--sb-gold)]">Frequently Asked Questions</h2>
      <div className="mt-5 space-y-2">
        {questions.map((question) => (
          <button key={question} type="button" className="flex h-11 w-full items-center justify-between rounded-xl border border-[var(--sb-border)] bg-black/30 px-3 text-left text-sm text-[var(--sb-muted)]">
            {question}
            <Plus className="h-4 w-4 text-[var(--sb-gold)]" />
          </button>
        ))}
      </div>
    </section>
  );
}

/** Shared cinematic page hero used by non-home app views. */
function PageHero({ eyebrow, title, copy, image }: { eyebrow: string; title: string; copy: string; image: string }) {
  return (
    <section className="luxury-panel relative min-h-[190px] overflow-hidden rounded-[28px] p-5 sm:min-h-[320px] sm:p-8 lg:min-h-[360px]">
      <Image src={image} alt="" fill sizes="(min-width: 1024px) 1200px, 100vw" className="object-cover opacity-72" priority={false} />
      <div className="absolute inset-0 bg-gradient-to-r from-black/92 via-black/58 to-black/20" />
      <div className="smoke-overlay absolute inset-0" />
      <div className="relative z-10 max-w-3xl pt-8 sm:pt-16 lg:pt-4">
        <p className="text-xs uppercase tracking-[0.24em] text-[var(--sb-gold)] sm:text-sm">{eyebrow}</p>
        <h1 className="editorial-title mt-3 text-[36px] leading-[0.94] text-white sm:text-6xl lg:text-7xl">{title}</h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--sb-text)]/80 sm:mt-5 sm:text-base sm:leading-7">{copy}</p>
      </div>
    </section>
  );
}

/** Renders a full menu item card with image, pairing chip, favorite, and cart action. */
function MenuCard({ item, isFavorite, onAddToCart, onSelectItem, onToggleFavorite }: { item: SushiMenuItem; isFavorite: boolean; onAddToCart: (item: SushiMenuItem) => void; onSelectItem: (item: SushiMenuItem) => void; onToggleFavorite: (id: string) => void }) {
  return (
    <article className="luxury-panel group overflow-hidden transition hover:-translate-y-1 hover:border-[var(--sb-gold)]">
      <button type="button" onClick={() => onSelectItem(item)} className="block w-full text-left">
        <div className="relative h-52 overflow-hidden">
          <Image src={item.image.publicUrl} alt="" fill sizes="(min-width: 1024px) 33vw, 100vw" className="object-cover transition group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
          {item.tag ? <span className="absolute left-4 top-4 rounded-full bg-[var(--sb-red)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-white">{item.tag}</span> : null}
          {item.standaloneImageMissing ? <span className="absolute right-4 top-4 rounded-full border border-[var(--sb-border)] bg-black/55 px-3 py-1 text-[10px] uppercase text-[var(--sb-gold)]">Pairing visual</span> : null}
        </div>
      </button>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-[var(--sb-gold)]">{item.categoryLabel}</p>
            <h3 className="mt-1 text-xl font-semibold text-white">{item.name}</h3>
          </div>
          <span className="text-lg font-semibold text-[var(--sb-gold)]">{formatCurrency(item.price)}</span>
        </div>
        <p className="mt-3 line-clamp-2 text-sm leading-6 text-[var(--sb-muted)]">{item.description}</p>
        <div className="mt-4 rounded-2xl border border-[var(--sb-border)] bg-black/30 p-3 text-xs text-[var(--sb-muted)]">
          <span className="text-[var(--sb-gold)]">Pairs with</span> {item.sakePairing.sakeName}
        </div>
        <div className="mt-4 flex items-center justify-between gap-3">
          <button type="button" onClick={() => onToggleFavorite(item.id)} aria-label={isFavorite ? "Remove favorite" : "Save favorite"} className={`grid h-11 w-11 place-items-center rounded-full border transition ${isFavorite ? "border-[var(--sb-red-bright)] text-[var(--sb-red-bright)]" : "border-[var(--sb-border)] text-[var(--sb-gold)]"}`}>
            <Heart className="h-5 w-5" />
          </button>
          <Button className="red-glow-button h-11 flex-1 rounded-2xl uppercase tracking-[0.16em]" onClick={() => onAddToCart(item)}>
            Add
            <Plus className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </article>
  );
}

/** Renders a compact horizontal menu recommendation card. */
function MenuMiniCard({ item, onAddToCart, onSelectItem }: { item: SushiMenuItem; onAddToCart: (item: SushiMenuItem) => void; onSelectItem: (item: SushiMenuItem) => void }) {
  return (
    <article className="w-64 shrink-0 overflow-hidden rounded-2xl border border-[var(--sb-border)] bg-white/[0.03]">
      <button type="button" onClick={() => onSelectItem(item)} className="relative block h-36 w-full">
        <Image src={item.image.publicUrl} alt="" fill sizes="256px" className="object-cover" />
      </button>
      <div className="p-4">
        <p className="truncate font-semibold text-white">{item.name}</p>
        <p className="mt-1 text-sm text-[var(--sb-muted)]">{item.sakePairing.sakeName}</p>
        <div className="mt-3 flex items-center justify-between">
          <span className="font-semibold text-[var(--sb-gold)]">{formatCurrency(item.price)}</span>
          <button type="button" onClick={() => onAddToCart(item)} aria-label={`Add ${item.name}`} className="grid h-9 w-9 place-items-center rounded-full border border-[var(--sb-border)] text-[var(--sb-gold)] transition hover:border-[var(--sb-red-bright)] hover:text-white">
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>
    </article>
  );
}

/** Renders the item detail story modal with pairing, texture, and recommendations. */
function ProductDetailModal({ item, isFavorite, onClose, onAddToCart, onToggleFavorite, onSelectItem }: { item: SushiMenuItem; isFavorite: boolean; onClose: () => void; onAddToCart: (item: SushiMenuItem, quantity: number) => void; onToggleFavorite: (id: string) => void; onSelectItem: (item: SushiMenuItem) => void }) {
  const [quantity, setQuantity] = useState(1);
  const related = getRelatedItems(item.id, 4);
  const textureEntries = Object.entries(item.textureProfile).filter(([, value]) => typeof value === "number");

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[80] flex items-end bg-black/75 backdrop-blur-sm lg:items-center lg:justify-center" role="dialog" aria-modal="true">
      <motion.section initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }} className="app-scrollbar max-h-[94vh] w-full overflow-y-auto rounded-t-[34px] border border-[var(--sb-border)] bg-[var(--sb-bg)] p-4 text-white shadow-[0_-30px_90px_rgba(0,0,0,0.8)] lg:max-w-5xl lg:rounded-[34px] lg:p-5">
        <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
          <div className="relative min-h-[420px] overflow-hidden rounded-[28px] border border-[var(--sb-border)]">
            <Image src={item.image.publicUrl} alt="" fill sizes="(min-width: 1024px) 480px, 100vw" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/88 via-black/12 to-transparent" />
            <div className="absolute left-4 top-4 rounded-full border border-[var(--sb-border)] bg-black/50 px-3 py-1 text-xs uppercase tracking-[0.18em] text-[var(--sb-gold)]">{item.tag}</div>
          </div>
          <div className="flex flex-col">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-[var(--sb-gold)]">{item.categoryLabel}</p>
                <h2 className="editorial-title mt-2 text-5xl leading-[0.95] text-white">{item.name}</h2>
                <p className="mt-3 text-sm leading-6 text-[var(--sb-muted)]">{item.chefNote}</p>
              </div>
              <button type="button" onClick={onClose} aria-label="Close details" className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-[var(--sb-border)] text-[var(--sb-gold)]"><X className="h-5 w-5" /></button>
            </div>
            <div className="mt-5 flex items-center justify-between rounded-2xl border border-[var(--sb-border)] bg-white/[0.03] p-3">
              <span className="text-2xl font-semibold text-[var(--sb-gold)]">{formatCurrency(item.price)}</span>
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))} className="grid h-10 w-10 place-items-center rounded-full border border-[var(--sb-border)]"><Minus className="h-4 w-4" /></button>
                <span className="min-w-8 text-center text-xl font-semibold">{quantity}</span>
                <button type="button" onClick={() => setQuantity((value) => value + 1)} className="grid h-10 w-10 place-items-center rounded-full border border-[var(--sb-border)]"><Plus className="h-4 w-4" /></button>
              </div>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Button className="red-glow-button h-12 rounded-2xl uppercase tracking-[0.16em]" onClick={() => onAddToCart(item, quantity)}>Add to Cart</Button>
              <Button variant="outline" className="h-12 rounded-2xl border-[var(--sb-border)] bg-transparent text-[var(--sb-gold)]" onClick={() => onToggleFavorite(item.id)}>
                <Heart className="mr-2 h-4 w-4" />
                {isFavorite ? "Saved" : "Favorite"}
              </Button>
            </div>
            <div className="mt-5 grid gap-4">
              <InfoPanel title="Ingredients">{item.ingredients.map((ingredient) => <span key={ingredient} className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-[var(--sb-muted)]">{ingredient}</span>)}</InfoPanel>
              <div className="overflow-hidden rounded-2xl border border-[var(--sb-border)] bg-white/[0.03]">
                <div className="relative h-36">
                  <Image src={item.sakePairing.image.publicUrl} alt="" fill sizes="480px" className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/88 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-[var(--sb-gold)]">Pairing</p>
                    <p className="font-semibold text-white">{item.sakePairing.sakeName}</p>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-sm leading-6 text-[var(--sb-muted)]">{item.sakePairing.whyItWorks}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.18em] text-[var(--sb-gold)]">Serve {item.sakePairing.serveTemperature}</p>
                </div>
              </div>
              <InfoPanel title="Texture Profile">
                {textureEntries.map(([label, value]) => (
                  <div key={label} className="w-full">
                    <div className="mb-1 flex justify-between text-xs uppercase tracking-[0.16em] text-[var(--sb-muted)]"><span>{label}</span><span>{value}</span></div>
                    <progress className="h-2 w-full accent-[var(--sb-gold)]" value={value} max={100} />
                  </div>
                ))}
              </InfoPanel>
            </div>
          </div>
        </div>
        <div className="mt-5">
          <SectionHeader eyebrow="You May Also Like" title="Related Bites" />
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((relatedItem) => (
              <button key={relatedItem.id} type="button" onClick={() => onSelectItem(relatedItem)} className="overflow-hidden rounded-2xl border border-[var(--sb-border)] bg-white/[0.03] text-left">
                <div className="relative h-28"><Image src={relatedItem.image.publicUrl} alt="" fill sizes="220px" className="object-cover" /></div>
                <div className="p-3"><p className="font-semibold text-white">{relatedItem.name}</p><p className="text-sm text-[var(--sb-gold)]">{formatCurrency(relatedItem.price)}</p></div>
              </button>
            ))}
          </div>
        </div>
      </motion.section>
    </motion.div>
  );
}

/** Renders the cart drawer with quantity controls, fees, promo, and checkout action. */
function CartDrawer({ groupedCart, subtotal, promoDiscount, tax, tip, grandTotal, deliveryFee, serviceFee, total, promoCode, appliedPromo, tipPercent, fulfillment, onPromoChange, onApplyPromo, onTipChange, onFulfillmentChange, onIncrease, onDecrease, onRemove, onClose, onCheckout, onNavigateMenu }: { groupedCart: { item: SushiMenuItem; qty: number }[]; subtotal: number; promoDiscount: number; tax: number; tip: number; grandTotal: number; deliveryFee: number; serviceFee: number; total: number; promoCode: string; appliedPromo: string | null; tipPercent: number; fulfillment: FulfillmentType; onPromoChange: (value: string) => void; onApplyPromo: () => void; onTipChange: (value: number) => void; onFulfillmentChange: (value: FulfillmentType) => void; onIncrease: (item: SushiMenuItem) => void; onDecrease: (id: string) => void; onRemove: (id: string) => void; onClose: () => void; onCheckout: () => void; onNavigateMenu: () => void }) {
  const freeDeliveryTarget = 75;
  const itemCount = groupedCart.reduce((sum, row) => sum + row.qty, 0);
  const deliveryRemaining = Math.max(0, freeDeliveryTarget - subtotal);
  const deliveryProgress = Math.min(subtotal, freeDeliveryTarget);
  const cartSections = groupedCart.reduce<Array<{ category: string; rows: { item: SushiMenuItem; qty: number }[] }>>((sections, row) => {
    const category = row.item.categories.includes("Sashimi") ? "Sashimi" : "Sushi & Rolls";
    const existingSection = sections.find((section) => section.category === category);
    if (existingSection) {
      existingSection.rows.push(row);
      return sections;
    }
    return [...sections, { category, rows: [row] }];
  }, []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[70] flex items-end bg-black/65 backdrop-blur-sm lg:justify-end">
      <motion.aside initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 34, stiffness: 260 }} className="app-scrollbar max-h-[92vh] w-full overflow-y-auto rounded-t-[34px] border border-[var(--sb-border)] bg-[var(--sb-bg)] p-4 text-white shadow-[0_-24px_90px_rgba(0,0,0,0.75)] lg:h-full lg:max-h-none lg:max-w-xl lg:rounded-l-[34px] lg:rounded-tr-none lg:p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-[var(--sb-gold)]">Your Cart</p>
            <h2 className="editorial-title mt-2 text-4xl text-white">{itemCount} Items</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close cart" className="grid h-11 w-11 place-items-center rounded-full border border-[var(--sb-border)] text-[var(--sb-gold)]"><X className="h-5 w-5" /></button>
        </div>
        <div className="mt-4 rounded-2xl border border-[var(--sb-border)] bg-black/30 p-4">
          <div className="flex items-center justify-between gap-3 text-xs text-[var(--sb-muted)]">
            <span>
              {deliveryRemaining > 0 ? (
                <>Add <span className="text-[var(--sb-gold)]">{formatCurrency(deliveryRemaining)}</span> more for free delivery.</>
              ) : (
                <span className="text-[var(--sb-gold)]">Free delivery unlocked.</span>
              )}
            </span>
            <span className="flex items-center gap-1">{formatCurrency(freeDeliveryTarget)} {iconAssets.delivery ? <AssetIcon src={iconAssets.delivery} size={18} /> : null}</span>
          </div>
          <progress className="mt-3 h-2 w-full" value={deliveryProgress} max={freeDeliveryTarget} />
        </div>
        {groupedCart.length === 0 ? (
          <EmptyState title="Your cart is empty" copy="Start with a chef favorite or build a pairing-led order." actionLabel="Browse menu" onAction={onNavigateMenu} />
        ) : (
          <div className="mt-5 space-y-5">
            <div className="space-y-3">
              {cartSections.map((section) => (
                <section key={section.category} className="rounded-2xl border border-[var(--sb-border)] bg-white/[0.03]">
                  <div className="flex items-center justify-between border-b border-[var(--sb-border)] px-4 py-3">
                    <span className="flex items-center gap-2 text-sm uppercase tracking-[0.16em] text-white">
                      {iconAssets.flower ? <AssetIcon src={iconAssets.flower} size={20} /> : null}
                      {section.category}
                    </span>
                    <span className="text-xs text-[var(--sb-muted)]">{section.rows.reduce((sum, row) => sum + row.qty, 0)} items</span>
                  </div>
                  <div className="divide-y divide-[var(--sb-border)]">
                    {section.rows.map(({ item, qty }) => (
                      <div key={item.id} className="grid grid-cols-[86px_1fr] gap-3 p-3">
                        <div className="relative h-24 overflow-hidden rounded-xl"><Image src={item.image.publicUrl} alt="" fill sizes="86px" className="object-cover" /></div>
                        <div>
                          <div className="flex items-start justify-between gap-3">
                            <div><p className="font-semibold text-white">{item.name}</p><p className="text-xs text-[var(--sb-muted)]">{item.categoryLabel}</p></div>
                            <p className="font-semibold text-[var(--sb-gold)]">{formatCurrency(item.price * qty)}</p>
                          </div>
                          <div className="mt-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <button type="button" onClick={() => onDecrease(item.id)} className="grid h-9 w-9 place-items-center rounded-full border border-[var(--sb-border)]"><Minus className="h-4 w-4" /></button>
                              <span className="min-w-6 text-center font-semibold">{qty}</span>
                              <button type="button" onClick={() => onIncrease(item)} className="grid h-9 w-9 place-items-center rounded-full border border-[var(--sb-border)]"><Plus className="h-4 w-4" /></button>
                            </div>
                            <button type="button" onClick={() => onRemove(item.id)} className="text-xs uppercase tracking-[0.16em] text-[var(--sb-red-bright)]">Remove</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
            <SegmentedControl
              options={["Delivery", "Pickup"]}
              value={fulfillment}
              onChange={(value) => onFulfillmentChange(value as FulfillmentType)}
            />
            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <Input value={promoCode} onChange={(event) => onPromoChange(event.target.value)} placeholder="Promo code" className="h-12 rounded-2xl border-[var(--sb-border)] bg-black/30 text-white" />
              <Button variant="outline" className="h-12 rounded-2xl border-[var(--sb-border)] bg-transparent text-[var(--sb-gold)]" onClick={onApplyPromo}>Apply</Button>
            </div>
            {appliedPromo ? <p className="text-sm text-[var(--sb-gold)]">Applied {appliedPromo.toUpperCase()}</p> : null}
            <div className="rounded-2xl border border-[var(--sb-border)] bg-white/[0.03] p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-[var(--sb-gold)]">Add a Tip</p>
              <div className="mt-3 grid grid-cols-4 gap-2">
                {[0, 10, 15, 20].map((tipOption) => (
                  <button key={tipOption} type="button" onClick={() => onTipChange(tipOption)} className={`rounded-xl border px-3 py-2 text-sm ${tipPercent === tipOption ? "border-[var(--sb-red-bright)] bg-[var(--sb-red)]/24 text-white" : "border-[var(--sb-border)] text-[var(--sb-muted)]"}`}>
                    {tipOption === 0 ? "None" : `${tipOption}%`}
                  </button>
                ))}
              </div>
            </div>
            <TotalsPanel subtotal={subtotal} promoDiscount={promoDiscount} tax={tax} tip={tip} grandTotal={grandTotal} deliveryFee={deliveryFee} serviceFee={serviceFee} total={total} />
            <Button className="red-glow-button h-14 w-full rounded-2xl py-4 text-base uppercase tracking-[0.18em]" onClick={onCheckout}>Proceed to Checkout</Button>
          </div>
        )}
      </motion.aside>
    </motion.div>
  );
}

/** Renders the multi-section checkout modal with fulfillment and payment fields. */
function CheckoutModal({ groupedCart, profile, fulfillment, selectedPayment, tipPercent, subtotal, promoDiscount, tax, tip, deliveryFee, serviceFee, total, onClose, onFulfillmentChange, onProfileChange, onPaymentChange, onTipChange, onPlaceOrder }: { groupedCart: { item: SushiMenuItem; qty: number }[]; profile: GuestProfile; fulfillment: FulfillmentType; selectedPayment: string; tipPercent: number; subtotal: number; promoDiscount: number; tax: number; tip: number; deliveryFee: number; serviceFee: number; total: number; onClose: () => void; onFulfillmentChange: (value: FulfillmentType) => void; onProfileChange: (profile: GuestProfile) => void; onPaymentChange: (value: string) => void; onTipChange: (value: number) => void; onPlaceOrder: () => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[90] flex items-end bg-black/75 backdrop-blur-sm lg:items-center lg:justify-center">
      <motion.section initial={{ y: 36, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 36, opacity: 0 }} className="app-scrollbar max-h-[94vh] w-full overflow-y-auto rounded-t-[34px] border border-[var(--sb-border)] bg-[var(--sb-bg)] p-4 text-white shadow-[0_-30px_90px_rgba(0,0,0,0.8)] lg:max-w-6xl lg:rounded-[34px] lg:p-6">
        <div className="flex items-start justify-between gap-4">
          <div><p className="text-xs uppercase tracking-[0.25em] text-[var(--sb-gold)]">Checkout</p><h2 className="editorial-title mt-2 text-5xl text-white">Place Order</h2></div>
          <button type="button" onClick={onClose} aria-label="Close checkout" className="grid h-11 w-11 place-items-center rounded-full border border-[var(--sb-border)] text-[var(--sb-gold)]"><X className="h-5 w-5" /></button>
        </div>
        <div className="mt-6 grid gap-5 xl:grid-cols-[1fr_380px]">
          <div className="space-y-5">
            <CheckoutStep number="1" title="Delivery Or Pickup">
              <div className="grid gap-3 sm:grid-cols-2">
                {(["Delivery", "Pickup"] as FulfillmentType[]).map((option) => (
                  <button key={option} type="button" onClick={() => onFulfillmentChange(option)} className={`rounded-2xl border p-4 text-left ${fulfillment === option ? "border-[var(--sb-red-bright)] bg-[var(--sb-red)]/24" : "border-[var(--sb-border)] bg-white/[0.03]"}`}>
                    <p className="font-semibold text-white">{option}</p>
                    <p className="text-sm text-[var(--sb-muted)]">{option === "Delivery" ? "30-45 min" : "20-25 min"}</p>
                  </button>
                ))}
              </div>
            </CheckoutStep>
            <CheckoutStep number="2" title="Contact And Address">
              <div className="grid gap-3 sm:grid-cols-2">
                <Input value={profile.name} onChange={(event) => onProfileChange({ ...profile, name: event.target.value })} placeholder="Name" className="h-12 rounded-2xl border-[var(--sb-border)] bg-black/30 text-white" />
                <Input value={profile.phone} onChange={(event) => onProfileChange({ ...profile, phone: event.target.value })} placeholder="Phone" className="h-12 rounded-2xl border-[var(--sb-border)] bg-black/30 text-white" />
                <Input value={profile.deliveryAddress} onChange={(event) => onProfileChange({ ...profile, deliveryAddress: event.target.value, address: profile.address || event.target.value })} placeholder="Delivery address" className="h-12 rounded-2xl border-[var(--sb-border)] bg-black/30 text-white sm:col-span-2" />
              </div>
            </CheckoutStep>
            <CheckoutStep number="3" title="Date And Time">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-[var(--sb-border)] bg-white/[0.03] p-4"><p className="text-sm text-[var(--sb-muted)]">Today</p><p className="font-semibold text-white">Next available window</p></div>
                <div className="rounded-2xl border border-[var(--sb-border)] bg-white/[0.03] p-4"><p className="text-sm text-[var(--sb-muted)]">Estimated</p><p className="font-semibold text-white">{fulfillment === "Delivery" ? "30-45 min" : "20-25 min"}</p></div>
              </div>
            </CheckoutStep>
            <CheckoutStep number="4" title="Payment Method">
              <div className="grid gap-3 sm:grid-cols-3">
                {["Visa **** 4242", "Mastercard **** 8888", "Apple Pay"].map((method) => (
                  <button key={method} type="button" onClick={() => onPaymentChange(method)} className={`rounded-2xl border p-4 text-left ${selectedPayment === method ? "border-[var(--sb-red-bright)] bg-[var(--sb-red)]/24" : "border-[var(--sb-border)] bg-white/[0.03]"}`}>
                    <CreditCard className="h-5 w-5 text-[var(--sb-gold)]" />
                    <p className="mt-2 text-sm font-semibold text-white">{method}</p>
                  </button>
                ))}
              </div>
            </CheckoutStep>
            <CheckoutStep number="5" title="Tip">
              <div className="grid grid-cols-4 gap-2">
                {[0, 10, 15, 20].map((tipOption) => (
                  <button key={tipOption} type="button" onClick={() => onTipChange(tipOption)} className={`rounded-xl border px-3 py-2 text-sm ${tipPercent === tipOption ? "border-[var(--sb-red-bright)] bg-[var(--sb-red)]/24 text-white" : "border-[var(--sb-border)] text-[var(--sb-muted)]"}`}>
                    {tipOption === 0 ? "None" : `${tipOption}%`}
                  </button>
                ))}
              </div>
            </CheckoutStep>
          </div>
          <aside className="luxury-panel h-max p-5">
            <p className="text-xs uppercase tracking-[0.25em] text-[var(--sb-gold)]">Order Summary</p>
            <div className="mt-4 space-y-3">
              {groupedCart.map(({ item, qty }) => (
                <div key={item.id} className="flex items-center gap-3 rounded-2xl border border-[var(--sb-border)] bg-white/[0.03] p-3">
                  <div className="relative h-16 w-20 overflow-hidden rounded-xl"><Image src={item.image.publicUrl} alt="" fill sizes="80px" className="object-cover" /></div>
                  <div className="flex-1"><p className="font-semibold text-white">{item.name}</p><p className="text-sm text-[var(--sb-muted)]">Qty {qty}</p></div>
                  <span className="font-semibold text-[var(--sb-gold)]">{formatCurrency(item.price * qty)}</span>
                </div>
              ))}
            </div>
            <TotalsPanel subtotal={subtotal} promoDiscount={promoDiscount} tax={tax} tip={tip} grandTotal={subtotal + tax + tip - promoDiscount} deliveryFee={deliveryFee} serviceFee={serviceFee} total={total} />
            <Button className="red-glow-button mt-5 h-14 w-full rounded-2xl py-4 text-base uppercase tracking-[0.18em]" onClick={onPlaceOrder}>Place Order</Button>
          </aside>
        </div>
      </motion.section>
    </motion.div>
  );
}

/** Displays reusable subtotal, fee, discount, and total lines. */
function TotalsPanel({ subtotal, promoDiscount, tax, tip, grandTotal, deliveryFee, serviceFee, total }: { subtotal: number; promoDiscount: number; tax: number; tip: number; grandTotal: number; deliveryFee: number; serviceFee: number; total: number }) {
  return (
    <div className="rounded-2xl border border-[var(--sb-border)] bg-white/[0.03] p-4 text-sm text-[var(--sb-muted)]">
      <SummaryLine label="Subtotal" value={formatCurrency(subtotal)} />
      {promoDiscount > 0 ? <SummaryLine label="Promo" value={`- ${formatCurrency(promoDiscount)}`} /> : null}
      <SummaryLine label="Estimated Tax" value={formatCurrency(tax)} />
      <SummaryLine label="Service Fee" value={formatCurrency(serviceFee)} />
      {deliveryFee > 0 ? <SummaryLine label="Delivery Fee" value={formatCurrency(deliveryFee)} /> : null}
      {tip > 0 ? <SummaryLine label="Tip" value={formatCurrency(tip)} /> : null}
      <div className="gold-divider my-3" />
      <SummaryLine label="Cart Total" value={formatCurrency(grandTotal)} strong />
      <SummaryLine label="Total" value={formatCurrency(total)} strong />
    </div>
  );
}

/** Displays a compact order receipt with reorder support. */
function ReceiptPanel({ order, onReorder }: { order: OrderHistoryEntry; onReorder: (items: SushiMenuItem[]) => void }) {
  const grouped = groupCartItems(order.items);
  return (
    <aside className="luxury-panel h-max p-5">
      <p className="text-xs uppercase tracking-[0.25em] text-[var(--sb-gold)]">Receipt</p>
      <div className="mt-4 space-y-3">
        {grouped.map(({ item, qty }) => (
          <SummaryLine key={item.id} label={`${item.name} x${qty}`} value={formatCurrency(item.price * qty)} />
        ))}
      </div>
      <div className="gold-divider my-4" />
      <SummaryLine label="Total" value={formatCurrency(order.total)} strong />
      <Button className="red-glow-button mt-5 h-12 w-full rounded-2xl uppercase tracking-[0.18em]" onClick={() => onReorder(order.items)}>Reorder</Button>
    </aside>
  );
}

/** Shows transient toast notices for app actions and validation errors. */
function NoticeStack({ notices }: { notices: Notice[] }) {
  return (
    <div className="pointer-events-none fixed right-4 top-20 z-[100] flex w-[min(92vw,380px)] flex-col gap-3 lg:top-28">
      <AnimatePresence>
        {notices.map((notice) => (
          <motion.div
            key={notice.id}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className={`luxury-panel pointer-events-auto rounded-2xl px-4 py-3 text-sm ${
              notice.tone === "error" ? "border-[var(--sb-red-bright)] text-red-100" : notice.tone === "success" ? "border-[var(--sb-gold)] text-white" : "text-white"
            }`}
          >
            {notice.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

/** Renders a reusable empty-state panel with one recovery action. */
function EmptyState({ title, copy, actionLabel, onAction }: { title: string; copy: string; actionLabel: string; onAction: () => void }) {
  return (
    <div className="luxury-panel grid min-h-64 place-items-center p-8 text-center">
      <div>
        <Sparkles className="mx-auto h-9 w-9 text-[var(--sb-gold)]" />
        <h2 className="mt-4 text-2xl font-semibold text-white">{title}</h2>
        <p className="mt-2 text-sm text-[var(--sb-muted)]">{copy}</p>
        <Button className="red-glow-button mt-5 rounded-2xl px-5" onClick={onAction}>{actionLabel}</Button>
      </div>
    </div>
  );
}

/** Displays a compact key-value stat block. */
function StatCard({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl border border-[var(--sb-border)] bg-white/[0.03] p-3"><p className="text-xs uppercase tracking-[0.2em] text-[var(--sb-muted)]">{label}</p><p className="mt-1 text-lg font-semibold text-white">{value}</p></div>;
}

/** Displays one aligned label/value row for totals and receipts. */
function SummaryLine({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return <div className={`flex items-center justify-between gap-4 py-1 ${strong ? "text-base font-semibold text-white" : ""}`}><span>{label}</span><span>{value}</span></div>;
}

/** Displays numbered section headings for checkout and reservation steps. */
function NumberedTitle({ number, title, className = "" }: { number: string; title: string; className?: string }) {
  return <div className={`flex items-center gap-3 ${className}`}><span className="grid h-7 w-7 place-items-center rounded-full border border-[var(--sb-gold)] text-sm text-[var(--sb-gold)]">{number}</span><h2 className="editorial-title text-xl text-white">{title}</h2></div>;
}

/** Wraps one checkout section in the shared step styling. */
function CheckoutStep({ number, title, children }: { number: string; title: string; children: ReactNode }) {
  return <section className="luxury-panel p-5"><NumberedTitle number={number} title={title} /><div className="mt-4">{children}</div></section>;
}

/** Renders a small info panel with a tokenized title and flexible content. */
function InfoPanel({ title, children }: { title: string; children: ReactNode }) {
  return <div className="rounded-2xl border border-[var(--sb-border)] bg-white/[0.03] p-4"><p className="text-xs uppercase tracking-[0.22em] text-[var(--sb-gold)]">{title}</p><div className="mt-3 flex flex-wrap gap-2">{children}</div></div>;
}

/** Renders a two-option segmented control for fulfillment choices. */
function SegmentedControl({ options, value, onChange }: { options: string[]; value: string; onChange: (value: string) => void }) {
  return (
    <div className="grid grid-cols-2 gap-2 rounded-2xl border border-[var(--sb-border)] bg-black/30 p-1">
      {options.map((option) => (
        <button key={option} type="button" onClick={() => onChange(option)} className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${value === option ? "bg-[var(--sb-red)] text-white" : "text-[var(--sb-muted)]"}`}>{option}</button>
      ))}
    </div>
  );
}

/** Displays the shared trust badges that sit at the bottom of desktop references. */
function DesktopBenefitsBar() {
  return (
    <div className="luxury-panel hidden grid-cols-4 gap-0 p-0 lg:grid">
      {appContent.benefits.map((benefit) => (
        <div key={benefit.title} className="flex items-center justify-center gap-4 border-r border-[var(--sb-border)] px-6 py-4 last:border-r-0">
          {iconAssets[benefit.icon as keyof typeof iconAssets] ? <AssetIcon src={iconAssets[benefit.icon as keyof typeof iconAssets] as string} size={30} /> : null}
          <span>
            <span className="block text-sm uppercase tracking-[0.16em] text-white/82">{benefit.title}</span>
            <span className="block text-sm text-white/58">{benefit.copy}</span>
          </span>
        </div>
      ))}
    </div>
  );
}
