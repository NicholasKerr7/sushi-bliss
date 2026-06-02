"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Award,
  Calendar,
  Check,
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
import { AboutStoryView, AtmosphereGalleryView, ChefsTeamView, SourcingIngredientsView } from "./about/AboutScreens";
import { HomeView } from "./home/HomeView";
import { AccountSettingsView, PersonalInformationView, PrivacySecurityView } from "./account/AccountScreens";
import {
  AddAddressView,
  AddCardView,
  DietaryPreferencesView,
  PaymentMethodsView,
  ReservationHistoryView,
  SavedAddressesView,
} from "./account/ProfileUtilityScreens";
import {
  FaqArticleView,
  FavoritesView,
  GiftCheckoutView,
  GiftConfirmationView,
  GiftExperienceView,
  HelpCenterView,
  LocationDetailsView,
  LocationsView,
  OmakaseExperienceView,
  OfferDetailsView,
  OffersView,
  RecentlyViewedView,
  ReferralView,
  SupportChatView,
} from "./experience/ExperienceScreens";
import { OmakasePackageReviewView } from "./experience/OmakasePackageReviewView";
import { AssetIcon } from "./icons/AssetIcon";
import { AppShell } from "./layout/AppShell";
import { PageContainer } from "./layout/PageContainer";
import { SectionHeader } from "./layout/SectionHeader";
import { MemberPassRewardsView } from "./loyalty/MemberPassRewardsView";
import { NotificationDetailView, NotificationsCenterView } from "./notifications/NotificationScreens";
import { LiveOrderTrackingView } from "./orders/LiveOrderTrackingView";
import { ProfileView } from "./profile/ProfileView";
import type { GuestProfile } from "./profile/types";
import { ReservationConfirmationView } from "./reservations/ReservationConfirmationView";
import { ReservationDetailsView } from "./reservations/ReservationDetailsView";
import { CancelReservationView, ModifyReservationView } from "./reservations/ReservationManagementViews";
import { ReservationReviewView } from "./reservations/ReservationReviewView";
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
import type { AssetRef, Reward, SakePairing } from "../data/types";

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
const masterChefsOmakaseExperience = getMasterChefsOmakaseExperience();
const chefProfile = chefs.find((chef) => chef.id === "hiroshi-tanaka") ?? chefs[0];
const profileImage = chefProfile.profileImage?.publicUrl ?? chefProfile.standingImage.publicUrl;
const heroAsset = featuredAssets.heroSushi;

const iconAssets = getSushiIconAssets();

const baseDesktopNav: NavItem[] = [
  { key: "home", label: "Home", icon: Home, assetIcon: iconAssets.home },
  { key: "menu", label: "Menu", icon: Utensils, assetIcon: iconAssets.menu },
  { key: "reservations", label: "Reservations", icon: Calendar, assetIcon: iconAssets.reservations },
  { key: "orderOnline", id: "order-online", label: "Order Online", icon: ShoppingBag, assetIcon: iconAssets.orders },
  { key: "about", label: "About Us", icon: ChefHat, assetIcon: iconAssets.about },
  { key: "contact", label: "Contact", icon: Mail, assetIcon: iconAssets.contact },
];

const loyaltyDesktopNavItem: NavItem = { key: "loyalty", label: "Loyalty", icon: Award, assetIcon: iconAssets.loyalty };
const ordersDesktopNavItem: NavItem = { key: "orders", label: "Orders", icon: ShoppingBag, assetIcon: iconAssets.orders };

const mobileNav: NavItem[] = [
  { key: "home", label: "Home", icon: Home, assetIcon: iconAssets.home },
  { key: "menu", label: "Menu", icon: Utensils, assetIcon: iconAssets.menu },
  { key: "reservations", label: "Reservations", icon: Calendar, assetIcon: iconAssets.reservations },
  { key: "orders", label: "Orders", icon: ShoppingBag, assetIcon: iconAssets.orders },
  { key: "profile", label: "Profile", icon: User, assetIcon: iconAssets.profile },
];

const tabletNav: NavItem[] = [
  { key: "home", label: "Home", icon: Home, assetIcon: iconAssets.home },
  { key: "menu", label: "Menu", icon: Utensils, assetIcon: iconAssets.menu },
  { key: "reservations", label: "Reservations", icon: Calendar, assetIcon: iconAssets.reservations },
  { key: "orderOnline", id: "tablet-order-online", label: "Order Online", icon: ShoppingBag, assetIcon: iconAssets.orders },
  { key: "loyalty", label: "Loyalty", icon: Award, assetIcon: iconAssets.loyalty },
  { key: "profile", label: "Account", icon: User, assetIcon: iconAssets.profile },
];

/** Builds the contextual desktop nav used by screenshot groups with section-specific tabs. */
function getDesktopNavItems(activeView: AppView): NavItem[] {
  if (activeView === "loyalty" || activeView === "memberPass") {
    return [...baseDesktopNav.slice(0, 4), loyaltyDesktopNavItem, ...baseDesktopNav.slice(4)];
  }
  if (activeView === "orders" || activeView === "orderTracking") {
    return [...baseDesktopNav, ordersDesktopNavItem];
  }
  return baseDesktopNav;
}

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

/** Builds a deterministic demo order so fresh sessions match the active-order references. */
function createDemoOrderHistory(): OrderHistoryEntry[] {
  const placedAt = new Date("2024-05-24T18:42:00").getTime();
  const orderItems = [
    getItemById("otoro-nigiri"),
    getItemById("spicy-tuna-roll"),
    getItemById("salmon-nigiri"),
    getItemById("miso-soup"),
  ].filter((item): item is SushiMenuItem => Boolean(item));
  const subtotal = orderItems.reduce((sum, item) => sum + item.price, 0);

  return [
    {
      id: 2024052401,
      confirmationCode: "SB-2024-0524",
      items: orderItems,
      subtotal,
      promoDiscount: 0,
      tax: 6.49,
      tip: 0,
      total: 40.99,
      method: "Visa **** 4242",
      type: "Delivery",
      ts: placedAt,
      placedAt,
      etaMinutes: 48,
      fulfillmentTime: new Date("2024-05-24T19:30:00").getTime(),
      deliveryAddress: appContent.member.deliveryAddress,
      customerName: appContent.member.name,
    },
    {
      id: 2024052101,
      confirmationCode: "SB-84105",
      items: [
        getItemById("dragon-roll"),
        getItemById("salmon-sashimi"),
        getItemById("ikura-gunkan"),
      ].filter((item): item is SushiMenuItem => Boolean(item)),
      subtotal: 72.5,
      promoDiscount: 0,
      tax: 10,
      tip: 10,
      total: 92.5,
      method: "Visa **** 4242",
      type: "Pickup",
      ts: new Date("2024-05-21T20:32:00").getTime(),
      placedAt: new Date("2024-05-21T20:32:00").getTime(),
      etaMinutes: 0,
      fulfillmentTime: new Date("2024-05-21T21:05:00").getTime(),
      deliveryAddress: "",
      customerName: appContent.member.name,
    },
  ];
}

/** Builds the default upcoming reservation used before local user history exists. */
function createDemoReservations(): Reservation[] {
  return [
    {
      id: 2024052407,
      datetime: "2024-05-24T19:00",
      guests: 2,
      name: appContent.member.name,
      phone: appContent.member.phone,
      seating: "Counter",
      occasion: "Birthday",
      notes: "Please prepare a small surprise if possible. Thank you!",
      confirmationCode: "SB-RSV-0524",
      createdAt: new Date("2024-05-20T12:00:00").getTime(),
    },
  ];
}

const demoOrderHistory = createDemoOrderHistory();
const demoReservations = createDemoReservations();

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
  const [reservations, setReservations] = useState<Reservation[]>(demoReservations);
  const [reservationForm, setReservationForm] = useState<ReservationFormState>(() => createDefaultReservationForm());
  const [orderHistory, setOrderHistory] = useState<OrderHistoryEntry[]>(demoOrderHistory);
  const [latestOrder, setLatestOrder] = useState<OrderHistoryEntry | null>(demoOrderHistory[0] ?? null);
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

  /** Redeems a loyalty reward and adds matching menu rewards to the cart when available. */
  const redeemReward = (reward: Reward) => {
    const rewardItem = getItemById(reward.id);
    if (loyaltyPoints < reward.points) {
      showNotice("More points are needed for that reward.", "error");
      return;
    }
    setLoyaltyPoints((points) => points - reward.points);
    if (rewardItem) addToCart(rewardItem, 1);
    showNotice(`${reward.title} redeemed.`, "success");
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

  /** Validates the draft reservation before showing the final review page. */
  const reviewReservation = () => {
    const formToReview = {
      ...reservationForm,
      name: reservationForm.name || profile.name,
      phone: reservationForm.phone || profile.phone,
    };
    const validation = validateReservationForm(formToReview, reservations);
    if (!validation.valid) {
      showNotice(validation.message, "error");
      return;
    }
    setReservationForm((current) => ({ ...current, name: formToReview.name, phone: formToReview.phone }));
    navigate("reservationReview");
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
    navigate("reservationConfirmation");
  };

  /** Persists edits to the active reservation and returns guests to the details page. */
  const updateReservation = (updatedReservation: Reservation) => {
    setReservations((current) =>
      current.map((reservation) => (reservation.id === updatedReservation.id ? updatedReservation : reservation))
    );
    showNotice("Reservation changes saved.", "success");
    navigate("reservationDetails");
  };

  /** Removes a reservation after the cancellation confirmation flow is completed. */
  const cancelReservation = (reservationId: number) => {
    setReservations((current) => current.filter((reservation) => reservation.id !== reservationId));
    showNotice("Reservation cancelled.", "success");
    navigate("reservations");
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
      if (savedReservations) {
        const hydratedReservations = hydrateReservations(JSON.parse(savedReservations));
        setReservations(hydratedReservations.length ? hydratedReservations : demoReservations);
      }
      if (savedOrders) {
        const hydratedOrders = hydrateOrders(JSON.parse(savedOrders));
        const nextOrders = hydratedOrders.length ? hydratedOrders : demoOrderHistory;
        setOrderHistory(nextOrders);
        setLatestOrder(nextOrders[0] ?? null);
      }
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
      iconUrls={{ bell: iconAssets.bell, cart: iconAssets.cart }}
      navItems={getDesktopNavItems(activeView)}
      mobileNavItems={mobileNav}
      tabletNavItems={tabletNav}
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
                cartCount={cart.length}
                groupedCart={groupedCart}
                subtotal={subtotal}
                deliveryFee={deliveryFee}
                serviceFee={serviceFee}
                tax={tax}
                total={checkoutTotal}
                favorites={favorites}
                onQueryChange={setQuery}
                onCategoryChange={setActiveCategory}
                onAddToCart={addToCart}
                onDecreaseCartItem={decreaseCartItem}
                onIncreaseCartItem={increaseCartItem}
                onRemoveCartItem={removeCartItem}
                onSelectItem={setSelectedItem}
                onShowCart={() => setShowCart(true)}
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
                onNavigate={navigate}
                onSave={reviewReservation}
                onProfileChange={setProfile}
              />
            ) : null}
            {activeView === "reservationReview" ? (
              <ReservationReviewView
                form={reservationForm}
                onConfirm={saveReservation}
                onNavigate={navigate}
              />
            ) : null}
            {activeView === "reservationDetails" ? (
              <ReservationDetailsView
                profile={profile}
                profileImage={profileImage}
                reservations={reservations}
                loyaltyPoints={loyaltyPoints}
                onNavigate={navigate}
                showNotice={showNotice}
              />
            ) : null}
            {activeView === "reservationConfirmation" ? (
              <ReservationConfirmationView
                profile={profile}
                reservations={reservations}
                onNavigate={navigate}
                showNotice={showNotice}
              />
            ) : null}
            {activeView === "modifyReservation" ? (
              <ModifyReservationView
                profile={profile}
                reservations={reservations}
                onCancelReservation={cancelReservation}
                onNavigate={navigate}
                onUpdateReservation={updateReservation}
                showNotice={showNotice}
              />
            ) : null}
            {activeView === "cancelReservation" ? (
              <CancelReservationView
                profile={profile}
                reservations={reservations}
                onCancelReservation={cancelReservation}
                onNavigate={navigate}
                onUpdateReservation={updateReservation}
                showNotice={showNotice}
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
            {activeView === "orderTracking" ? (
              <LiveOrderTrackingView
                order={latestOrder ?? orderHistory[0] ?? null}
                profileImage={profileImage}
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
            {activeView === "personalInformation" ? (
              <PersonalInformationView
                profile={profile}
                profileImage={profileImage}
                loyaltyPoints={loyaltyPoints}
                onProfileChange={setProfile}
                onNavigate={navigate}
                showNotice={showNotice}
              />
            ) : null}
            {activeView === "accountSettings" ? (
              <AccountSettingsView
                profile={profile}
                profileImage={profileImage}
                loyaltyPoints={loyaltyPoints}
                onProfileChange={setProfile}
                onNavigate={navigate}
                showNotice={showNotice}
              />
            ) : null}
            {activeView === "savedAddresses" ? (
              <SavedAddressesView
                profile={profile}
                onNavigate={navigate}
                onProfileChange={setProfile}
                showNotice={showNotice}
              />
            ) : null}
            {activeView === "addAddress" ? (
              <AddAddressView
                profile={profile}
                onNavigate={navigate}
                onProfileChange={setProfile}
                showNotice={showNotice}
              />
            ) : null}
            {activeView === "paymentMethods" ? (
              <PaymentMethodsView
                profile={profile}
                onNavigate={navigate}
                onProfileChange={setProfile}
                showNotice={showNotice}
              />
            ) : null}
            {activeView === "addCard" ? (
              <AddCardView
                profile={profile}
                onNavigate={navigate}
                onProfileChange={setProfile}
                showNotice={showNotice}
              />
            ) : null}
            {activeView === "dietaryPreferences" ? (
              <DietaryPreferencesView
                profile={profile}
                onNavigate={navigate}
                onProfileChange={setProfile}
                showNotice={showNotice}
              />
            ) : null}
            {activeView === "reservationHistory" ? (
              <ReservationHistoryView
                profile={profile}
                reservations={reservations}
                onNavigate={navigate}
                onProfileChange={setProfile}
                showNotice={showNotice}
              />
            ) : null}
            {activeView === "privacySecurity" ? <PrivacySecurityView onNavigate={navigate} /> : null}
            {activeView === "notifications" ? <NotificationsCenterView onNavigate={navigate} /> : null}
            {activeView === "notificationDetail" ? <NotificationDetailView onNavigate={navigate} /> : null}
            {activeView === "help" ? <HelpCenterView onNavigate={navigate} /> : null}
            {activeView === "supportChat" ? <SupportChatView onNavigate={navigate} /> : null}
            {activeView === "faq" ? <FaqArticleView onNavigate={navigate} /> : null}
            {activeView === "locations" ? <LocationsView onNavigate={navigate} /> : null}
            {activeView === "locationDetails" ? <LocationDetailsView onNavigate={navigate} /> : null}
            {activeView === "offers" ? <OffersView onNavigate={navigate} /> : null}
            {activeView === "offerDetails" ? <OfferDetailsView onNavigate={navigate} /> : null}
            {activeView === "referral" ? <ReferralView showNotice={showNotice} /> : null}
            {activeView === "giftExperience" ? <GiftExperienceView onNavigate={navigate} /> : null}
            {activeView === "giftCheckout" ? <GiftCheckoutView profile={profile} onNavigate={navigate} /> : null}
            {activeView === "giftConfirmation" ? <GiftConfirmationView onNavigate={navigate} /> : null}
            {activeView === "favorites" ? (
              <FavoritesView
                favorites={favoriteItems}
                onAddToCart={addToCart}
                onNavigate={navigate}
                onSelectItem={setSelectedItem}
              />
            ) : null}
            {activeView === "recentlyViewed" ? <RecentlyViewedView onNavigate={navigate} onSelectItem={setSelectedItem} /> : null}
            {activeView === "omakase" ? <OmakaseExperienceView onNavigate={navigate} /> : null}
            {activeView === "omakasePackageReview" ? <OmakasePackageReviewView onNavigate={navigate} /> : null}
            {activeView === "loyalty" ? (
              <LoyaltyView
                loyaltyPoints={loyaltyPoints}
                rewards={rewards}
                onNavigate={navigate}
                onRedeem={redeemReward}
              />
            ) : null}
            {activeView === "memberPass" ? (
              <MemberPassRewardsView
                loyaltyPoints={loyaltyPoints}
                rewards={rewards}
                onNavigate={navigate}
                onRedeem={redeemReward}
              />
            ) : null}
            {activeView === "about" || activeView === "aboutStory" ? <AboutStoryView onNavigate={navigate} onSelectItem={setSelectedItem} /> : null}
            {activeView === "chefsTeam" ? <ChefsTeamView onNavigate={navigate} onSelectItem={setSelectedItem} /> : null}
            {activeView === "sourcing" ? <SourcingIngredientsView onNavigate={navigate} onSelectItem={setSelectedItem} /> : null}
            {activeView === "atmosphere" ? <AtmosphereGalleryView onNavigate={navigate} onSelectItem={setSelectedItem} /> : null}
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
            onCheckout={() => {
              setShowCart(false);
              setShowCheckout(true);
            }}
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
  cartCount: number;
  deliveryFee: number;
  groupedCart: { item: SushiMenuItem; qty: number }[];
  items: SushiMenuItem[];
  favorites: string[];
  serviceFee: number;
  subtotal: number;
  tax: number;
  total: number;
  onQueryChange: (query: string) => void;
  onCategoryChange: (category: FilterCategory) => void;
  onAddToCart: (item: SushiMenuItem) => void;
  onDecreaseCartItem: (id: string) => void;
  onIncreaseCartItem: (item: SushiMenuItem) => void;
  onRemoveCartItem: (id: string) => void;
  onSelectItem: (item: SushiMenuItem) => void;
  onShowCart: () => void;
  onToggleFavorite: (id: string) => void;
}

/** Renders the searchable ordering menu with category filters and favorite controls. */
function MenuView({
  query,
  activeCategory,
  cartCount,
  deliveryFee,
  groupedCart,
  items,
  favorites,
  serviceFee,
  subtotal,
  tax,
  total,
  onQueryChange,
  onCategoryChange,
  onAddToCart,
  onDecreaseCartItem,
  onIncreaseCartItem,
  onRemoveCartItem,
  onSelectItem,
  onShowCart,
  onToggleFavorite,
}: MenuViewProps) {
  const isSearchMode = query.trim().length > 0;
  const isCategoryDetail = !isSearchMode && activeCategory !== "All";
  const mobileItems = items.length ? items : menuItems;
  const overviewItems = getMenuOverviewItems();

  return (
    <div className="space-y-6">
      <section className="md:hidden">
        {isSearchMode ? (
          <MobileSearchFilterMenu
            query={query}
            results={mobileItems.slice(0, 5)}
            onAddToCart={onAddToCart}
            onClearQuery={() => onQueryChange("")}
            onQueryChange={onQueryChange}
            onSelectItem={onSelectItem}
          />
        ) : isCategoryDetail ? (
          <MobileCategoryMenu
            activeCategory={activeCategory}
            items={mobileItems.slice(0, 5)}
            onAddToCart={onAddToCart}
            onCategoryChange={onCategoryChange}
            onSelectItem={onSelectItem}
          />
        ) : (
          <MobileMenuOverview
            cartCount={cartCount}
            items={overviewItems}
            query={query}
            onAddToCart={onAddToCart}
            onCategoryChange={onCategoryChange}
            onQueryChange={onQueryChange}
            onSelectItem={onSelectItem}
            onShowCart={onShowCart}
          />
        )}
      </section>

      <section className="hidden md:block">
        <DesktopMenuDashboard
          activeCategory={activeCategory}
          deliveryFee={deliveryFee}
          favorites={favorites}
          groupedCart={groupedCart}
          items={items}
          query={query}
          serviceFee={serviceFee}
          subtotal={subtotal}
          tax={tax}
          total={total}
          onAddToCart={onAddToCart}
          onCategoryChange={onCategoryChange}
          onDecreaseCartItem={onDecreaseCartItem}
          onIncreaseCartItem={onIncreaseCartItem}
          onQueryChange={onQueryChange}
          onRemoveCartItem={onRemoveCartItem}
          onSelectItem={onSelectItem}
          onShowCart={onShowCart}
          onToggleFavorite={onToggleFavorite}
        />
      </section>
    </div>
  );
}

/** Picks the screenshot menu overview set while falling back to available data. */
function getMenuOverviewItems() {
  return [
    "otoro-nigiri",
    "salmon-nigiri",
    "spicy-tuna-roll",
    "dragon-roll",
    "uni-nigiri",
    "hamachi-nigiri",
    "salmon-sashimi",
    "miso-soup",
  ]
    .map((id) => getItemById(id))
    .filter((item): item is SushiMenuItem => Boolean(item));
}

/** Renders the mobile menu overview with screenshot-matched cart, search, hero, and product grid. */
function MobileMenuOverview({
  cartCount,
  items,
  query,
  onAddToCart,
  onCategoryChange,
  onQueryChange,
  onSelectItem,
  onShowCart,
}: {
  cartCount: number;
  items: SushiMenuItem[];
  query: string;
  onAddToCart: (item: SushiMenuItem) => void;
  onCategoryChange: (category: FilterCategory) => void;
  onQueryChange: (query: string) => void;
  onSelectItem: (item: SushiMenuItem) => void;
  onShowCart: () => void;
}) {
  const heroItem = getItemById("otoro-nigiri") ?? items[0];

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onShowCart}
          className="grid min-h-[58px] min-w-[260px] grid-cols-[42px_1fr_auto] items-center gap-3 rounded-full border border-[var(--sb-border)] bg-black/58 px-5 text-left text-white shadow-[0_18px_42px_rgba(0,0,0,0.42)] backdrop-blur-xl"
        >
          <span className="relative grid h-9 w-9 place-items-center">
            {iconAssets.cart ? <AssetIcon src={iconAssets.cart} size={31} /> : null}
            {cartCount > 0 ? <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[var(--sb-red)] px-1 text-[10px] font-bold">{cartCount}</span> : null}
          </span>
          <span className="text-lg">{cartCount || 0} Items</span>
          <ChevronRight className="h-5 w-5 text-[var(--sb-gold)]" />
        </button>
      </div>
      <MenuSearchRow query={query} onQueryChange={onQueryChange} onSubmit={() => undefined} />
      <MobileMenuCategories activeCategory="Nigiri" onCategoryChange={onCategoryChange} />
      {heroItem ? <MobileMenuFeature item={heroItem} onSelectItem={onSelectItem} /> : null}
      <MenuSectionHeading title="Popular Picks" action="View All" />
      <div className="grid grid-cols-2 gap-3">
        {items.map((item, index) => (
          <MobileMenuTile key={item.id} badge={index === 0 ? "Hot" : index === 1 ? "Popular" : undefined} item={item} onAddToCart={onAddToCart} onSelectItem={onSelectItem} />
        ))}
      </div>
      <p className="text-center text-xs text-[var(--sb-muted)]">Prices do not include tax. Photos for illustration only.</p>
      <MenuMemberBanner />
    </div>
  );
}

/** Renders the screenshot search/filter mobile screen when the user enters a query. */
function MobileSearchFilterMenu({
  query,
  results,
  onAddToCart,
  onClearQuery,
  onQueryChange,
  onSelectItem,
}: {
  query: string;
  results: SushiMenuItem[];
  onAddToCart: (item: SushiMenuItem) => void;
  onClearQuery: () => void;
  onQueryChange: (query: string) => void;
  onSelectItem: (item: SushiMenuItem) => void;
}) {
  return (
    <div className="space-y-6">
      <h1 className="editorial-title text-[34px] leading-none text-white">Search &amp; Filter</h1>
      <form
        className="grid grid-cols-[1fr_76px] gap-4"
        onSubmit={(event) => {
          event.preventDefault();
        }}
      >
        <label className="flex h-[76px] items-center gap-4 rounded-[12px] border border-[var(--sb-red-bright)] bg-black/54 px-5 shadow-[0_0_24px_rgba(239,47,37,0.22)]">
          {iconAssets.search ? <AssetIcon src={iconAssets.search} size={30} /> : null}
          <span className="sr-only">Search menu</span>
          <input value={query} onChange={(event) => onQueryChange(event.target.value)} className="h-full w-full bg-transparent text-lg text-white outline-none" />
          <button type="button" onClick={onClearQuery} aria-label="Clear search" className="grid h-8 w-8 place-items-center rounded-full bg-white/70 text-black">
            <X className="h-5 w-5" />
          </button>
        </label>
        <button type="button" aria-label="Filters" className="grid h-[76px] w-[76px] place-items-center rounded-[12px] border border-[var(--sb-red-bright)] bg-[var(--sb-red)]/35 shadow-[0_0_24px_rgba(239,47,37,0.28)]">
          {iconAssets.settings ? <AssetIcon src={iconAssets.settings} size={34} /> : null}
        </button>
      </form>
      <div>
        <MenuSectionHeading title="Recent Searches" action="Clear All" />
        <div className="app-scrollbar mt-3 flex gap-3 overflow-x-auto">
          {["tuna", "otoro", "dragon roll", "spicy roll", "uni"].map((term) => (
            <button key={term} type="button" onClick={() => onQueryChange(term)} className="flex h-12 shrink-0 items-center gap-3 rounded-full border border-[var(--sb-border)] bg-white/[0.04] px-5 text-sm text-white">
              {term}
              <X className="h-3.5 w-3.5 text-[var(--sb-gold)]" />
            </button>
          ))}
        </div>
      </div>
      <div>
        <h2 className="editorial-title text-[22px] text-[var(--sb-gold)]">Sort By</h2>
        <div className="app-scrollbar mt-3 flex gap-3 overflow-x-auto">
          {["Popular", "Price: Low To High", "Price: High To Low", "Spice Level"].map((label, index) => (
            <button key={label} type="button" className={`h-14 shrink-0 rounded-[14px] border px-6 text-sm uppercase ${index === 0 ? "border-[var(--sb-red-bright)] bg-[var(--sb-red)] text-white shadow-[0_0_22px_var(--sb-red-glow)]" : "border-[var(--sb-border)] bg-white/[0.04] text-white/80"}`}>
              {label}
            </button>
          ))}
        </div>
      </div>
      <section className="rounded-[18px] border border-[var(--sb-border)] bg-black/42 p-4">
        <div className="mb-4 flex items-center justify-between">
          <p className="editorial-title text-lg text-[var(--sb-gold)]">{Math.max(results.length, 1)} Results Found</p>
          <button type="button" className="flex items-center gap-2 text-sm text-[var(--sb-gold)]">More Filters <ChevronRight className="h-4 w-4" /></button>
        </div>
        <div className="space-y-3">
          {results.map((item, index) => (
            <MenuSearchResultRow key={item.id} badge={index === 0 ? "Premium" : item.tag} item={item} onAddToCart={onAddToCart} onSelectItem={onSelectItem} />
          ))}
        </div>
      </section>
    </div>
  );
}

/** Renders a category-specific mobile menu list matching the Nigiri reference. */
function MobileCategoryMenu({
  activeCategory,
  items,
  onAddToCart,
  onCategoryChange,
  onSelectItem,
}: {
  activeCategory: FilterCategory;
  items: SushiMenuItem[];
  onAddToCart: (item: SushiMenuItem) => void;
  onCategoryChange: (category: FilterCategory) => void;
  onSelectItem: (item: SushiMenuItem) => void;
}) {
  const heroItem = items[0] ?? getItemById("otoro-nigiri");
  const label = categoryLabel(activeCategory);

  return (
    <div className="space-y-5">
      <section className="relative min-h-[260px] overflow-hidden rounded-[2px]">
        {heroItem ? <Image src={heroItem.image.publicUrl} alt="" fill sizes="430px" className="object-cover object-[70%_42%] opacity-86" /> : null}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.95)_0%,rgba(0,0,0,0.78)_45%,rgba(0,0,0,0.18)_100%)]" />
        <div className="relative z-10 max-w-[360px] px-1 py-8">
          <p className="text-lg text-[var(--sb-gold)]">Menu <ChevronRight className="inline h-4 w-4 text-white/62" /> <span className="text-[var(--sb-red-bright)]">{label}</span></p>
          <h1 className="editorial-title mt-6 text-[62px] leading-none text-white">{label}</h1>
          <p className="mt-5 text-xl leading-8 text-[var(--sb-gold)]">Hand-pressed perfection. The purest form of sushi, crafted with balance and precision.</p>
        </div>
      </section>
      <MobileMenuCategories activeCategory={activeCategory} onCategoryChange={onCategoryChange} />
      <div className="gold-divider" />
      <div className="space-y-3">
        {items.map((item, index) => (
          <MenuSearchResultRow key={item.id} badge={index === 0 ? "Hot" : index === 1 ? "Popular" : item.tag} item={item} compact onAddToCart={onAddToCart} onSelectItem={onSelectItem} />
        ))}
      </div>
      <button type="button" className="grid w-full grid-cols-[54px_1fr_auto] items-center gap-4 rounded-[18px] border border-[var(--sb-border)] bg-black/42 p-4 text-left">
        {iconAssets.flower ? <AssetIcon src={iconAssets.flower} size={44} /> : null}
        <span><span className="editorial-title block text-xl text-[var(--sb-gold)]">{label} Experience</span><span className="mt-1 block text-sm text-[var(--sb-muted)]">Savor each piece as it was meant to be.</span></span>
        <ChevronRight className="h-5 w-5 text-[var(--sb-gold)]" />
      </button>
    </div>
  );
}

/** Shared menu search row with the screenshot border and filter button. */
function MenuSearchRow({ query, onQueryChange, onSubmit }: { query: string; onQueryChange: (query: string) => void; onSubmit: () => void }) {
  return (
    <form
      className="grid grid-cols-[1fr_58px] gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <label className="flex h-[58px] items-center gap-3 rounded-[14px] border border-[var(--sb-border)] bg-black/58 px-4 backdrop-blur-xl">
        {iconAssets.search ? <AssetIcon src={iconAssets.search} size={24} /> : null}
        <span className="sr-only">Search menu</span>
        <input value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="Search sushi, rolls, or dishes..." className="h-full w-full bg-transparent text-[15px] text-white outline-none placeholder:text-[var(--sb-muted)]" />
      </label>
      <button type="button" aria-label="Filter menu" className="grid h-[58px] w-[58px] place-items-center rounded-[14px] border border-[var(--sb-border)] bg-black/58">
        {iconAssets.settings ? <AssetIcon src={iconAssets.settings} size={28} /> : null}
      </button>
    </form>
  );
}

/** Renders category pills in the exact mobile screenshot rhythm. */
function MobileMenuCategories({ activeCategory, onCategoryChange }: { activeCategory: FilterCategory; onCategoryChange: (category: FilterCategory) => void }) {
  const categories: FilterCategory[] = ["Nigiri", "Rolls", "Sashimi", "Chef Specials"];

  return (
    <div className="app-scrollbar -mx-1 flex gap-3 overflow-x-auto px-1">
      {categories.map((category) => {
        const active = activeCategory === category || (activeCategory === "All" && category === "Nigiri");
        return (
          <button
            key={category}
            type="button"
            onClick={() => onCategoryChange(category)}
            className={`h-[58px] shrink-0 rounded-[18px] border px-7 text-sm uppercase tracking-[0.08em] transition ${
              active ? "border-[var(--sb-red-bright)] bg-[var(--sb-red)] text-white shadow-[0_0_24px_var(--sb-red-glow)]" : "border-[var(--sb-border)] bg-black/36 text-white"
            }`}
          >
            {category}
          </button>
        );
      })}
      <button type="button" className="h-[58px] shrink-0 rounded-[18px] border border-[var(--sb-border)] bg-black/36 px-7 text-sm uppercase tracking-[0.08em] text-white">Sake</button>
    </div>
  );
}

/** Displays one large mobile menu promotion card. */
function MobileMenuFeature({ item, onSelectItem }: { item: SushiMenuItem; onSelectItem: (item: SushiMenuItem) => void }) {
  return (
    <button type="button" onClick={() => onSelectItem(item)} className="relative block min-h-[184px] w-full overflow-hidden rounded-[16px] border border-[var(--sb-border)] text-left">
      <Image src={item.image.publicUrl} alt="" fill sizes="430px" className="object-cover object-[70%_50%]" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.92)_0%,rgba(0,0,0,0.64)_45%,rgba(0,0,0,0.1)_100%)]" />
      <span className="absolute right-5 top-6 rounded-full bg-[var(--sb-red)] px-4 py-1.5 text-xs uppercase text-white">Hot</span>
      <div className="relative z-10 max-w-[255px] p-5">
        <p className="editorial-title text-lg text-[var(--sb-gold)]">Chef&apos;s Special</p>
        <h2 className="editorial-title mt-3 text-[34px] text-white">{item.name}</h2>
        <p className="mt-2 text-sm text-[var(--sb-gold)]">{item.description}</p>
        <p className="mt-4 text-2xl text-[var(--sb-gold)]">{formatCurrency(item.price)}</p>
      </div>
    </button>
  );
}

/** Displays the gold section heading and optional action from the mobile menu references. */
function MenuSectionHeading({ action, title }: { action?: string; title: string }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="editorial-title text-[22px] tracking-[0.06em] text-[var(--sb-gold)]">{title}</h2>
      {action ? <button type="button" className="flex items-center gap-1 text-sm text-[var(--sb-red-bright)]">{action}<ChevronRight className="h-4 w-4" /></button> : null}
    </div>
  );
}

/** Renders a two-column menu tile from the mobile overview screen. */
function MobileMenuTile({ badge, item, onAddToCart, onSelectItem }: { badge?: string; item: SushiMenuItem; onAddToCart: (item: SushiMenuItem) => void; onSelectItem: (item: SushiMenuItem) => void }) {
  return (
    <article className="relative grid min-h-[136px] grid-cols-[44%_1fr] overflow-hidden rounded-[12px] border border-[var(--sb-border)] bg-black/54">
      <button type="button" onClick={() => onSelectItem(item)} className="relative block">
        <Image src={item.image.publicUrl} alt="" fill sizes="190px" className="object-cover" />
        {badge ? <span className="absolute left-0 top-0 rounded-br-[10px] bg-[var(--sb-red)] px-2 py-1 text-[10px] uppercase text-white">{badge}</span> : null}
      </button>
      <div className="flex min-w-0 flex-col justify-center px-3 py-2">
        <button type="button" onClick={() => onSelectItem(item)} className="text-left">
          <h3 className="line-clamp-1 text-base font-semibold text-white">{item.name}</h3>
          <p className="mt-1 line-clamp-2 text-xs leading-5 text-[var(--sb-muted)]">{item.description}</p>
          <p className="mt-2 text-base text-[var(--sb-gold)]">{formatCurrency(item.price)}</p>
        </button>
        <button type="button" onClick={() => onAddToCart(item)} aria-label={`Add ${item.name}`} className="absolute bottom-3 right-3 grid h-9 w-9 place-items-center rounded-full border border-[var(--sb-border-strong)] bg-black/50 text-[var(--sb-gold)]">
          <Plus className="h-5 w-5" />
        </button>
      </div>
    </article>
  );
}

/** Renders a wide search result row shared by search and category mobile views. */
function MenuSearchResultRow({ badge, compact = false, item, onAddToCart, onSelectItem }: { badge?: string; compact?: boolean; item: SushiMenuItem; onAddToCart: (item: SushiMenuItem) => void; onSelectItem: (item: SushiMenuItem) => void }) {
  return (
    <article className={`relative grid overflow-hidden rounded-[16px] border border-[var(--sb-border)] bg-black/46 ${compact ? "grid-cols-[42%_1fr] min-h-[136px]" : "grid-cols-[34%_1fr] min-h-[118px]"}`}>
      <button type="button" onClick={() => onSelectItem(item)} className="relative block">
        <Image src={item.image.publicUrl} alt="" fill sizes="220px" className="object-cover" />
        {badge ? <span className="absolute left-3 top-3 rounded-full bg-[var(--sb-red)] px-3 py-1 text-[10px] uppercase text-white">{badge}</span> : null}
      </button>
      <div className="grid grid-cols-[1fr_auto] items-center gap-3 px-5 py-3">
        <button type="button" onClick={() => onSelectItem(item)} className="min-w-0 text-left">
          <h3 className="editorial-title text-[22px] text-white">{item.name}</h3>
          <p className="mt-1 line-clamp-1 text-[15px] text-white/78">{item.description}</p>
          {!compact ? <p className="mt-2 line-clamp-2 text-sm leading-5 text-[var(--sb-muted)]">{item.chefNote}</p> : null}
          <p className="mt-2 text-xl text-[var(--sb-gold)]">{formatCurrency(item.price)}</p>
        </button>
        <button type="button" onClick={() => onAddToCart(item)} aria-label={`Add ${item.name}`} className="grid h-12 w-12 place-items-center rounded-full border border-[var(--sb-border-strong)] bg-black/42 text-[var(--sb-gold)]">
          <Plus className="h-6 w-6" />
        </button>
      </div>
    </article>
  );
}

/** Reuses the loyalty summary banner shown at the bottom of mobile menu screens. */
function MenuMemberBanner() {
  const item = getItemById("ikura-gunkan") ?? menuItems[0];

  return (
    <section className="relative overflow-hidden rounded-[18px] border border-[var(--sb-border)] bg-black/54 p-4">
      {item ? <Image src={item.image.publicUrl} alt="" width={122} height={86} className="absolute bottom-0 right-0 h-24 w-36 object-cover" /> : null}
      <div className="relative z-10 grid grid-cols-[58px_1fr] gap-4 pr-24">
        <span className="grid h-14 w-14 place-items-center rounded-full border border-[var(--sb-border-strong)]">{iconAssets.flower ? <AssetIcon src={iconAssets.flower} size={42} /> : null}</span>
        <span>
          <span className="editorial-title text-lg text-white">Bliss Member <span className="rounded-full bg-[var(--sb-gold)] px-2 py-0.5 text-[11px] font-bold uppercase text-black">Gold</span></span>
          <span className="mt-1 block text-sm text-white/72">{appContent.member.points.toLocaleString()} pts <span className="text-[var(--sb-gold)]">•</span> {appContent.member.pointsToNextTier} pts to {appContent.member.nextTier}</span>
          <progress className="mt-2 h-2 w-full" value={appContent.member.points} max={appContent.member.maxTierPoints} />
        </span>
      </div>
    </section>
  );
}

/** Renders the wide desktop menu screen with the persistent cart column from the reference. */
function DesktopMenuDashboard({
  activeCategory,
  deliveryFee,
  favorites,
  groupedCart,
  items,
  query,
  serviceFee,
  subtotal,
  tax,
  total,
  onAddToCart,
  onCategoryChange,
  onDecreaseCartItem,
  onIncreaseCartItem,
  onQueryChange,
  onRemoveCartItem,
  onSelectItem,
  onShowCart,
  onToggleFavorite,
}: {
  activeCategory: FilterCategory;
  deliveryFee: number;
  favorites: string[];
  groupedCart: { item: SushiMenuItem; qty: number }[];
  items: SushiMenuItem[];
  query: string;
  serviceFee: number;
  subtotal: number;
  tax: number;
  total: number;
  onAddToCart: (item: SushiMenuItem) => void;
  onCategoryChange: (category: FilterCategory) => void;
  onDecreaseCartItem: (id: string) => void;
  onIncreaseCartItem: (item: SushiMenuItem) => void;
  onQueryChange: (query: string) => void;
  onRemoveCartItem: (id: string) => void;
  onSelectItem: (item: SushiMenuItem) => void;
  onShowCart: () => void;
  onToggleFavorite: (id: string) => void;
}) {
  const featured = getMenuOverviewItems().slice(0, 4);
  const allItems = items.length ? items : menuItems;

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_390px]">
      <div className="space-y-5">
        <section className="relative min-h-[250px] overflow-hidden rounded-[18px] border border-[var(--sb-border)] bg-black/54 p-8">
          <Image src={heroAsset.publicUrl} alt="" fill priority sizes="1000px" className="object-cover object-[70%_45%]" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.96)_0%,rgba(0,0,0,0.72)_40%,rgba(0,0,0,0.1)_72%,rgba(0,0,0,0.74)_100%)]" />
          <div className="relative z-10 max-w-2xl">
            <p className="text-sm uppercase tracking-[0.18em] text-[var(--sb-gold)]">Explore Our Menu</p>
            <h1 className="editorial-title mt-3 text-[54px] leading-[0.96] text-white">
              Exceptional
              <span className="block text-[var(--sb-red-bright)]">Japanese <span className="text-white">Cuisine</span></span>
            </h1>
            <p className="mt-3 text-base text-[var(--sb-gold)]">Sourced daily. Crafted by masters. Served with passion.</p>
            <div className="mt-5 grid max-w-[770px] grid-cols-[1fr_120px_140px_140px] gap-3">
              <label className="flex h-12 items-center gap-3 rounded-[10px] border border-[var(--sb-border)] bg-black/54 px-4">
                <Search className="h-4 w-4 text-[var(--sb-gold)]" />
                <span className="sr-only">Search menu</span>
                <input value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="Search menu items..." className="h-full w-full bg-transparent text-sm text-white outline-none placeholder:text-[var(--sb-muted)]" />
              </label>
              {["Dietary", "Spicy Level", "Sort By"].map((label) => (
                <button key={label} type="button" className="rounded-[10px] border border-[var(--sb-border)] bg-black/54 px-4 text-xs uppercase tracking-[0.12em] text-white/82">{label}</button>
              ))}
            </div>
          </div>
        </section>
        <div className="app-scrollbar flex gap-3 overflow-x-auto">
          {["Recommended", "Nigiri", "Rolls", "Sashimi", "Chef Specials", "Vegetarian", "Drinks"].map((category, index) => (
            <button
              key={category}
              type="button"
              onClick={() => onCategoryChange(category === "Recommended" ? "All" : (category as FilterCategory))}
              className={`h-11 shrink-0 rounded-[10px] border px-5 text-xs uppercase tracking-[0.12em] ${
                (index === 0 && activeCategory === "All") || activeCategory === category ? "border-[var(--sb-gold)] bg-[var(--sb-gold)] text-black" : "border-[var(--sb-border)] bg-black/42 text-white"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
        <section className="rounded-[14px] border border-[var(--sb-border)] bg-black/46 p-4">
          <MenuSectionHeading title="Chef's Specials" action="View Full Menu" />
          <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {featured.map((item, index) => (
              <MenuCard key={item.id} item={item} isFavorite={favorites.includes(item.id)} onAddToCart={onAddToCart} onSelectItem={onSelectItem} onToggleFavorite={onToggleFavorite} />
            ))}
          </div>
        </section>
        <section className="rounded-[14px] border border-[var(--sb-border)] bg-black/46 p-4">
          <h2 className="mb-4 text-sm uppercase tracking-[0.16em] text-white">All Menu Items</h2>
          <div className="grid gap-3 md:grid-cols-3">
            {allItems.slice(0, 9).map((item) => (
              <DesktopMenuCompactRow key={item.id} item={item} onAddToCart={onAddToCart} onSelectItem={onSelectItem} />
            ))}
          </div>
        </section>
      </div>
      <DesktopMenuCart
        deliveryFee={deliveryFee}
        groupedCart={groupedCart}
        serviceFee={serviceFee}
        subtotal={subtotal}
        tax={tax}
        total={total}
        onCheckout={onShowCart}
        onDecrease={onDecreaseCartItem}
        onIncrease={onIncreaseCartItem}
        onRemove={onRemoveCartItem}
      />
    </div>
  );
}

/** Renders a compact desktop list item for the all-menu grid. */
function DesktopMenuCompactRow({ item, onAddToCart, onSelectItem }: { item: SushiMenuItem; onAddToCart: (item: SushiMenuItem) => void; onSelectItem: (item: SushiMenuItem) => void }) {
  return (
    <article className="grid min-h-[82px] grid-cols-[92px_1fr_auto] items-center gap-3 rounded-[10px] border border-[var(--sb-border)] bg-black/36 p-2">
      <button type="button" onClick={() => onSelectItem(item)} className="relative h-16 overflow-hidden rounded-[8px]">
        <Image src={item.image.publicUrl} alt="" fill sizes="92px" className="object-cover" />
      </button>
      <button type="button" onClick={() => onSelectItem(item)} className="min-w-0 text-left">
        <h3 className="truncate text-base text-white">{item.name}</h3>
        <p className="truncate text-xs text-[var(--sb-muted)]">{item.description}</p>
        <p className="text-sm text-[var(--sb-gold)]">{formatCurrency(item.price)}</p>
      </button>
      <button type="button" onClick={() => onAddToCart(item)} aria-label={`Add ${item.name}`} className="grid h-9 w-9 place-items-center rounded-full border border-[var(--sb-border)] text-[var(--sb-gold)]">
        <Plus className="h-4 w-4" />
      </button>
    </article>
  );
}

/** Renders the persistent desktop cart sidebar shown on the menu overview reference. */
function DesktopMenuCart({ deliveryFee, groupedCart, serviceFee, subtotal, tax, total, onCheckout, onDecrease, onIncrease, onRemove }: { deliveryFee: number; groupedCart: { item: SushiMenuItem; qty: number }[]; serviceFee: number; subtotal: number; tax: number; total: number; onCheckout: () => void; onDecrease: (id: string) => void; onIncrease: (item: SushiMenuItem) => void; onRemove: (id: string) => void }) {
  const itemCount = groupedCart.reduce((sum, row) => sum + row.qty, 0);

  return (
    <aside className="sticky top-28 h-max rounded-[18px] border border-[var(--sb-border)] bg-black/62 p-5 shadow-[0_24px_90px_rgba(0,0,0,0.48)] backdrop-blur-2xl">
      <div className="flex items-center justify-between">
        <h2 className="editorial-title text-xl text-white">Your Cart</h2>
        <span className="text-xs uppercase text-[var(--sb-gold)]">{itemCount} Items</span>
      </div>
      <div className="mt-5 space-y-4">
        {groupedCart.length === 0 ? (
          <p className="rounded-[12px] border border-[var(--sb-border)] bg-black/36 p-4 text-sm text-[var(--sb-muted)]">Your order is waiting for a chef selection.</p>
        ) : (
          groupedCart.map(({ item, qty }) => (
            <div key={item.id} className="grid grid-cols-[78px_1fr_auto] gap-3 border-b border-[var(--sb-border)] pb-4 last:border-b-0">
              <div className="relative h-[58px] overflow-hidden rounded-[8px]"><Image src={item.image.publicUrl} alt="" fill sizes="78px" className="object-cover" /></div>
              <div className="min-w-0">
                <p className="truncate text-sm text-white">{item.name}</p>
                <p className="truncate text-xs text-[var(--sb-muted)]">{item.description}</p>
                <p className="mt-1 text-sm text-[var(--sb-gold)]">{formatCurrency(item.price)}</p>
                <div className="mt-2 flex w-[102px] items-center justify-between rounded-full border border-[var(--sb-border)] bg-black/40 px-2 py-1">
                  <button type="button" onClick={() => onDecrease(item.id)} aria-label={`Decrease ${item.name}`} className="text-[var(--sb-gold)]">−</button>
                  <span className="text-xs text-white">{qty}</span>
                  <button type="button" onClick={() => onIncrease(item)} aria-label={`Increase ${item.name}`} className="text-[var(--sb-gold)]">+</button>
                </div>
              </div>
              <div className="flex flex-col items-end justify-between">
                <button type="button" onClick={() => onRemove(item.id)} aria-label={`Remove ${item.name}`} className="grid h-6 w-6 place-items-center rounded-full border border-white/20 text-white/70">
                  <X className="h-3 w-3" />
                </button>
                <p className="text-sm text-white">{formatCurrency(item.price * qty)}</p>
              </div>
            </div>
          ))
        )}
      </div>
      <label className="mt-4 flex h-12 items-center gap-3 rounded-[10px] border border-[var(--sb-border)] bg-black/42 px-3">
        {iconAssets.gift ? <AssetIcon src={iconAssets.gift} size={20} /> : null}
        <span className="sr-only">Order note</span>
        <input placeholder="Add a note (optional)" className="h-full w-full bg-transparent text-sm text-white outline-none placeholder:text-[var(--sb-muted)]" />
      </label>
      <div className="mt-5 space-y-2 text-sm text-[var(--sb-muted)]">
        <SummaryLine label="Subtotal" value={formatCurrency(subtotal)} />
        <SummaryLine label="Delivery Fee" value={formatCurrency(deliveryFee)} />
        <SummaryLine label="Service Fee" value={formatCurrency(serviceFee)} />
        <SummaryLine label="Tax & Fees" value={formatCurrency(tax)} />
        <div className="gold-divider my-4" />
        <SummaryLine label="Total" value={formatCurrency(total)} strong />
      </div>
      <p className="mt-4 text-xs text-[var(--sb-muted)]">You&apos;ll earn <span className="text-[var(--sb-gold)]">{Math.round(total)} Bliss Points</span> on this order</p>
      <Button className="red-glow-button mt-5 h-14 w-full rounded-[10px] uppercase tracking-[0.16em]" onClick={onCheckout}>View Cart &amp; Checkout <ChevronRight className="ml-3 h-4 w-4" /></Button>
      <div className="mt-5 rounded-[12px] border border-[var(--sb-border)] bg-black/34 p-4">
        <div className="flex items-center justify-between text-xs uppercase tracking-[0.12em] text-[var(--sb-gold)]">
          <span>Est. Delivery</span>
          <span>30-45 Min</span>
        </div>
        <p className="mt-2 text-xs text-[var(--sb-muted)]">{appContent.location.street}, {appContent.location.city}</p>
      </div>
    </aside>
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
  onNavigate: (view: AppView) => void;
  onSave: () => void;
  onProfileChange: (profile: GuestProfile | ((profile: GuestProfile) => GuestProfile)) => void;
}

/** Renders the complete reservation booking flow and live summary. */
function ReservationsView({ form, reservations, profile, onFormChange, onNavigate, onSave, onProfileChange }: ReservationsViewProps) {
  const slots = getReservationSlots(form.date, form.guests, reservations);
  const experiences = getReservationExperiences();
  const selectedSlot = slots.find((slot) => slot.time === form.time);
  const selectedExperience = getReservationExperienceTitle(form.seating);
  const featuredOmakaseCourse =
    masterChefsOmakaseExperience.courses.find((course) => course.chefId === "ren-mori") ??
    masterChefsOmakaseExperience.courses[0];
  const summaryImage = assetUrl(featuredOmakaseCourse?.specialty.image, heroAsset.publicUrl);

  return (
    <>
      <MobileReservationsFlow
        experiences={experiences}
        form={form}
        reservations={reservations}
        selectedExperience={selectedExperience}
        selectedSlotLabel={selectedSlot?.label ?? form.time}
        slots={slots}
        summaryImage={summaryImage}
        onFormChange={onFormChange}
        onNavigate={onNavigate}
        onSave={onSave}
      />
      <div className="hidden space-y-5 md:block">
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
    </>
  );
}

/** Renders the mobile reservation dashboard and booking steps from the phone references. */
function MobileReservationsFlow({
  experiences,
  form,
  reservations,
  selectedExperience,
  selectedSlotLabel,
  slots,
  summaryImage,
  onFormChange,
  onNavigate,
  onSave,
}: {
  experiences: ReturnType<typeof getReservationExperiences>;
  form: ReservationFormState;
  reservations: Reservation[];
  selectedExperience: string;
  selectedSlotLabel: string;
  slots: ReturnType<typeof getReservationSlots>;
  summaryImage: string;
  onFormChange: (patch: Partial<ReservationFormState>) => void;
  onNavigate: (view: AppView) => void;
  onSave: () => void;
}) {
  const upcomingReservations = reservations.length > 0 ? reservations : [];
  const previewExperience = experiences[0];
  const fallbackReservations = [
    { day: "Saturday", date: "May 25, 2024", time: "8:00 PM", guests: "4 Guests", place: "Sushi Bliss Midtown", image: assetUrl(ambienceAssets[0], heroAsset.publicUrl) },
    { day: "Sunday", date: "May 26, 2024", time: "6:30 PM", guests: "2 Guests", place: "Sushi Bliss Uptown", image: assetUrl(ambienceAssets[1], heroAsset.publicUrl) },
    { day: "Friday", date: "May 31, 2024", time: "7:30 PM", guests: "6 Guests", place: "Sushi Bliss Downtown", image: assetUrl(ambienceAssets[2], heroAsset.publicUrl) },
  ];

  return (
    <div className="space-y-7 md:hidden">
      <section className="relative -mx-4 min-h-[290px] overflow-hidden px-4 pb-6 pt-16">
        <Image src={assetUrl(ambienceAssets[2], heroAsset.publicUrl)} alt="" fill sizes="430px" className="object-cover opacity-50" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.42),rgba(0,0,0,0.95))]" />
        <div className="relative z-10">
          <h1 className="editorial-title text-[58px] leading-none text-white">Reservations</h1>
          <p className="mt-4 text-xl text-[var(--sb-gold)]">Thoughtfully prepared. Unforgettable moments.</p>
        </div>
      </section>
      <section>
        <h2 className="editorial-title text-2xl text-[var(--sb-gold)]">Upcoming Reservation</h2>
        <div className="mt-4 grid overflow-hidden rounded-[18px] border border-[var(--sb-border)] bg-black/48 sm:grid-cols-[42%_1fr]">
          <div className="relative min-h-[220px]">
            <Image src={assetUrl(previewExperience?.image, heroAsset.publicUrl)} alt="" fill sizes="220px" className="object-cover" />
          </div>
          <div className="space-y-4 p-5">
            <p className="editorial-title text-xl text-[var(--sb-gold)]">{appContent.reservation.weekday}</p>
            <p className="text-3xl text-white">{appContent.reservation.month} {appContent.reservation.day}, 2024</p>
            <ReservationFact icon={iconAssets.clock} value={appContent.reservation.time} />
            <ReservationFact icon={iconAssets.group} value={`${appContent.reservation.guests} Guests`} />
            <ReservationFact icon={iconAssets.mapPin} value={`${appContent.location.label}\n${appContent.location.street}, ${appContent.location.city}`} />
            <button type="button" onClick={() => onNavigate("reservationDetails")} className="flex w-full items-center justify-between pt-3 text-left text-[var(--sb-red-bright)]">
              View Reservation
              <ChevronRight className="h-5 w-5 text-[var(--sb-gold)]" />
            </button>
          </div>
        </div>
      </section>
      <Button className="red-glow-button h-16 w-full rounded-[16px] text-base uppercase tracking-[0.18em]">
        {iconAssets.reservations ? <AssetIcon src={iconAssets.reservations} size={28} className="mr-3" /> : null}
        Reserve a Table
      </Button>
      <section className="grid grid-cols-2 border-b border-[var(--sb-border)]">
        <button type="button" className="border-b-2 border-[var(--sb-red-bright)] pb-4 text-sm uppercase tracking-[0.14em] text-[var(--sb-red-bright)]">Upcoming</button>
        <button type="button" className="pb-4 text-sm uppercase tracking-[0.14em] text-white/62">Past</button>
      </section>
      <section className="space-y-3">
        {upcomingReservations.map((reservation) => (
            <ReservationHistoryRow
              key={reservation.id}
              date={formatReservationDateTime(reservation.datetime)}
              guests={`${reservation.guests} Guests`}
              image={summaryImage}
              place={appContent.location.label}
              time={new Date(reservation.datetime).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
              onClick={() => onNavigate("reservationDetails")}
            />
        ))}
        {upcomingReservations.length === 0
          ? fallbackReservations.map((reservation) => (
              <ReservationHistoryRow key={reservation.date} date={reservation.date} guests={reservation.guests} image={reservation.image} place={reservation.place} time={reservation.time} onClick={() => onNavigate("reservationDetails")} />
            ))
          : null}
      </section>
      <section className="space-y-5">
        <ReservationStepHeader activeStep={1} eyebrow="Reservation" title="Date & Time" copy="Select your preferred date and time." />
        <div className="rounded-[18px] border border-[var(--sb-border)] bg-black/46 p-4">
          <div className="flex items-center justify-between">
            <ReservationFact icon={iconAssets.group} value={`${form.guests} Guests`} label="Party Size" />
            <div className="flex items-center gap-3 rounded-[14px] border border-[var(--sb-border)] bg-black/40 p-2">
              <button type="button" onClick={() => onFormChange({ guests: Math.max(1, form.guests - 1) })} className="grid h-10 w-10 place-items-center rounded-full border border-[var(--sb-border)] text-[var(--sb-gold)]"><Minus className="h-4 w-4" /></button>
              <span className="min-w-6 text-center text-xl">{form.guests}</span>
              <button type="button" onClick={() => onFormChange({ guests: Math.min(8, form.guests + 1) })} className="grid h-10 w-10 place-items-center rounded-full border border-[var(--sb-border)] text-[var(--sb-gold)]"><Plus className="h-4 w-4" /></button>
            </div>
          </div>
        </div>
        <ReservationFactCard icon={iconAssets.calendar} label="Date" value={formatReservationDateForSummary(form.date)} />
        <h3 className="editorial-title text-2xl text-[var(--sb-gold)]">Available Times</h3>
        <div className="grid grid-cols-3 gap-3">
          {slots.slice(0, 12).map((slot) => (
            <button
              key={slot.time}
              type="button"
              disabled={slot.disabled}
              onClick={() => onFormChange({ time: slot.time })}
              className={`h-16 rounded-[12px] border text-lg disabled:opacity-40 ${form.time === slot.time ? "border-[var(--sb-red-bright)] bg-[var(--sb-red)]/62 text-white shadow-[0_0_22px_var(--sb-red-glow)]" : "border-[var(--sb-border)] bg-black/40 text-white"}`}
            >
              {slot.label}
            </button>
          ))}
        </div>
      </section>
      <section className="space-y-5">
        <ReservationStepHeader activeStep={2} eyebrow="New Reservation" title="Choose Your Experience" copy="Select the dining experience that best suits your occasion." />
        <div className="space-y-3">
          {experiences.slice(0, 4).map((experience) => {
            const seating = getSeatingForExperience(experience.id);
            const active = form.seating === seating;
            return (
              <button key={experience.id} type="button" onClick={() => onFormChange({ seating })} className={`grid min-h-[132px] grid-cols-[37%_1fr_44px] items-center gap-4 rounded-[16px] border bg-black/46 p-3 text-left ${active ? "border-[var(--sb-red-bright)] shadow-[0_0_24px_rgba(239,47,37,0.24)]" : "border-[var(--sb-border)]"}`}>
                <span className="relative h-full min-h-[108px] overflow-hidden rounded-[10px]"><Image src={experience.image.publicUrl} alt="" fill sizes="160px" className="object-cover" /></span>
                <span><span className="editorial-title block text-xl text-white">{experience.title}</span><span className="mt-2 block text-sm leading-5 text-[var(--sb-muted)]">{experience.description}</span></span>
                <span className={`grid h-9 w-9 place-items-center rounded-full border ${active ? "border-[var(--sb-red-bright)] bg-[var(--sb-red)] text-white" : "border-[var(--sb-border)]"}`}>{active ? <Check className="h-5 w-5" /> : null}</span>
              </button>
            );
          })}
        </div>
        <select value={form.occasion} onChange={(event) => onFormChange({ occasion: event.target.value as ReservationFormState["occasion"] })} className="h-16 w-full rounded-[14px] border border-[var(--sb-border)] bg-black/46 px-4 text-white">
          {occasionOptions.map((occasion) => <option key={occasion}>{occasion}</option>)}
        </select>
        <textarea value={form.notes} onChange={(event) => onFormChange({ notes: event.target.value })} placeholder="Add a note or special request..." className="min-h-20 w-full rounded-[14px] border border-[var(--sb-border)] bg-black/46 px-4 py-3 text-white outline-none placeholder:text-[var(--sb-muted)]" />
      </section>
      <section className="space-y-5">
        <ReservationStepHeader activeStep={3} eyebrow="Reservation" title="Confirmation" copy="Review your details and confirm your reservation." />
        <div className="rounded-[18px] border border-[var(--sb-border)] bg-black/50 p-5">
          <h3 className="editorial-title text-2xl text-[var(--sb-gold)]">Reservation Summary</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_220px]">
            <div className="divide-y divide-[var(--sb-border)]">
              <ReservationSummaryRow icon={iconAssets.calendar} label="Date" value={formatReservationDateForSummary(form.date)} />
              <ReservationSummaryRow icon={iconAssets.clock} label="Time" value={selectedSlotLabel} />
              <ReservationSummaryRow icon={iconAssets.group} label="Guests" value={`${form.guests} Guests`} />
              <ReservationSummaryRow icon={iconAssets.mapPin} label="Location" value={`${appContent.location.label}, ${appContent.location.street}`} />
              <ReservationSummaryRow icon={iconAssets.dining} label="Table" value={selectedExperience} />
              <ReservationSummaryRow icon={iconAssets.star} label="Occasion" value={form.occasion} />
            </div>
            <div className="relative min-h-[190px] overflow-hidden rounded-[14px] border border-[var(--sb-border)]"><Image src={summaryImage} alt="" fill sizes="220px" className="object-cover" /></div>
          </div>
        </div>
        <Button className="red-glow-button h-16 w-full rounded-[16px] text-base uppercase tracking-[0.18em]" onClick={onSave}>Confirm Reservation</Button>
      </section>
    </div>
  );
}

/** Displays one compact reservation fact with optional label and packaged icon. */
function ReservationFact({ icon, label, value }: { icon?: string; label?: string; value: string }) {
  return (
    <div className="grid grid-cols-[34px_1fr] items-center gap-3">
      <span className="grid h-9 w-9 place-items-center rounded-full border border-[var(--sb-border)] bg-black/36">{icon ? <AssetIcon src={icon} size={22} /> : null}</span>
      <span><span className="block text-xs uppercase tracking-[0.16em] text-[var(--sb-gold)]">{label}</span><span className="block whitespace-pre-line text-white">{value}</span></span>
    </div>
  );
}

/** Displays a full-width reservation field card. */
function ReservationFactCard({ icon, label, value }: { icon?: string; label: string; value: string }) {
  return (
    <div className="rounded-[18px] border border-[var(--sb-border)] bg-black/46 p-4">
      <ReservationFact icon={icon} label={label} value={value} />
    </div>
  );
}

/** Renders one reservation history row for the mobile list. */
function ReservationHistoryRow({ date, guests, image, place, time, onClick }: { date: string; guests: string; image: string; place: string; time: string; onClick: () => void }) {
  return (
    <article className="grid min-h-[118px] grid-cols-[30%_1fr_auto] items-center gap-4 rounded-[16px] border border-[var(--sb-border)] bg-black/46 p-3">
      <div className="relative h-full min-h-[92px] overflow-hidden rounded-[10px]"><Image src={image} alt="" fill sizes="130px" className="object-cover" /></div>
      <div>
        <p className="editorial-title text-lg text-[var(--sb-gold)]">{date}</p>
        <p className="mt-1 text-lg text-white">{time}</p>
        <p className="text-sm text-[var(--sb-muted)]">{guests} • {place}</p>
      </div>
      <button type="button" onClick={onClick} className="rounded-[10px] border border-[var(--sb-border)] px-4 py-2 text-[var(--sb-gold)]">View</button>
    </article>
  );
}

/** Displays the three-step reservation progress header used in mobile booking screens. */
function ReservationStepHeader({ activeStep, copy, eyebrow, title }: { activeStep: number; copy: string; eyebrow: string; title: string }) {
  const steps = ["Date & Time", "Experience", "Confirm"];

  return (
    <div>
      <p className="editorial-title text-xl text-[var(--sb-gold)]">{eyebrow}</p>
      <h2 className="editorial-title mt-2 text-[50px] leading-none text-white">{title}</h2>
      <p className="mt-3 text-xl text-[var(--sb-gold)]">{copy}</p>
      <div className="mt-6 grid grid-cols-3 gap-3">
        {steps.map((step, index) => {
          const active = activeStep === index + 1;
          return (
            <div key={step} className="text-center">
              <span className={`mx-auto grid h-12 w-12 place-items-center rounded-full border text-lg ${active ? "border-[var(--sb-red-bright)] bg-[var(--sb-red)]/35 text-white shadow-[0_0_22px_var(--sb-red-glow)]" : "border-[var(--sb-border)] bg-black/42 text-[var(--sb-muted)]"}`}>{index + 1}</span>
              <span className={`mt-3 block text-sm ${active ? "text-[var(--sb-red-bright)]" : "text-[var(--sb-muted)]"}`}>{step}</span>
            </div>
          );
        })}
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
    <>
      <MobileOrdersView latestOrder={latestOrder} orderHistory={pastOrders} onNavigate={onNavigate} onReorder={onReorder} />
      <div className="hidden space-y-5 md:block">
        <PageHero
          eyebrow="Your orders, delivered with care."
          title="Orders"
          copy="Track your current orders and view your delicious history."
          image={heroAsset.publicUrl}
        />
        {!latestOrder ? (
          <EmptyState title="No orders yet" copy="Your confirmed orders and receipts will appear here." actionLabel="Order now" onAction={() => onNavigate("orderOnline")} />
        ) : (
          <ActiveOrderPanel order={latestOrder} onReorder={onReorder} onViewTracking={() => onNavigate("orderTracking")} />
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
    </>
  );
}

/** Renders the phone-first orders dashboard from the mobile order references. */
function MobileOrdersView({
  latestOrder,
  orderHistory,
  onNavigate,
  onReorder,
}: {
  latestOrder: OrderHistoryEntry | null;
  orderHistory: OrderHistoryEntry[];
  onNavigate: (view: AppView) => void;
  onReorder: (items: SushiMenuItem[]) => void;
}) {
  return (
    <section className="space-y-7 md:hidden">
      <div className="pt-10 text-center">
        <h1 className="editorial-title text-[42px] leading-none text-white">
          My <span className="text-[var(--sb-gold)]">Orders</span>
        </h1>
        <p className="mt-4 text-base text-[var(--sb-muted)]">Track your orders and view order history.</p>
      </div>
      <div className="mx-auto grid h-[78px] max-w-[300px] grid-cols-2 rounded-full border border-[var(--sb-border)] bg-black/56 p-1 backdrop-blur-xl">
        <button type="button" className="rounded-full border border-[var(--sb-red-bright)] bg-[var(--sb-red)]/22 text-lg uppercase tracking-[0.06em] text-[var(--sb-red-bright)] shadow-[0_0_22px_var(--sb-red-glow)]">
          Active
        </button>
        <button type="button" className="rounded-full text-lg uppercase tracking-[0.06em] text-white/74">
          Past
        </button>
      </div>
      <div>
        <h2 className="editorial-title text-2xl uppercase tracking-[0.04em] text-[var(--sb-gold)]">Active Order</h2>
        {latestOrder ? (
          <MobileActiveOrderCard order={latestOrder} onReorder={onReorder} onViewTracking={() => onNavigate("orderTracking")} />
        ) : (
          <EmptyState title="No active order" copy="Start a new order and live tracking will appear here." actionLabel="Order now" onAction={() => onNavigate("orderOnline")} />
        )}
      </div>
      {orderHistory.length > 0 ? (
        <div className="space-y-3">
          <h2 className="editorial-title text-2xl uppercase tracking-[0.04em] text-[var(--sb-gold)]">Past</h2>
          {orderHistory.slice(0, 3).map((order) => (
            <PastOrderRow key={order.id} order={order} onReorder={onReorder} />
          ))}
        </div>
      ) : null}
    </section>
  );
}

/** Shows the active mobile order card with product previews, totals, ETA, and tracking. */
function MobileActiveOrderCard({ order, onReorder, onViewTracking }: { order: OrderHistoryEntry; onReorder: (items: SushiMenuItem[]) => void; onViewTracking: () => void }) {
  const visibleItems = order.items.slice(0, 3);
  const hiddenItemCount = Math.max(order.items.length - visibleItems.length, 0);

  return (
    <article className="mt-4 rounded-[28px] border border-[var(--sb-border-strong)] bg-black/58 p-4 shadow-[0_24px_64px_rgba(0,0,0,0.48)] backdrop-blur-xl">
      <div className="grid grid-cols-[72px_1fr_auto] items-center gap-3">
        <span className="grid h-16 w-16 place-items-center rounded-full border border-[var(--sb-border)] bg-black/45">
          {iconAssets.orders ? <AssetIcon src={iconAssets.orders} size={34} /> : null}
        </span>
        <span>
          <span className="editorial-title block text-xl text-white">Order {order.confirmationCode}</span>
          <span className="mt-1 block text-sm text-[var(--sb-muted)]">{new Date(order.placedAt).toLocaleDateString()} / {formatClockTime(order.placedAt)}</span>
        </span>
        <span className="rounded-full border border-[var(--sb-border-strong)] bg-black/52 px-4 py-2 text-xs uppercase tracking-[0.14em] text-[var(--sb-gold)]">
          {order.type === "Delivery" ? "On The Way" : "Preparing"}
        </span>
      </div>
      <div className="gold-divider my-5" />
      <div className="grid grid-cols-[1fr_1fr_1fr_54px] gap-3">
        {visibleItems.map((item) => (
          <MobileOrderPreview key={`${order.id}-${item.id}`} item={item} />
        ))}
        <div className="grid min-h-[148px] place-items-center rounded-[18px] border border-[var(--sb-border)] bg-white/[0.04] text-center text-sm text-[var(--sb-muted)]">
          <span>
            <span className="block text-xl text-white">+{hiddenItemCount}</span>
            item
          </span>
        </div>
      </div>
      <div className="gold-divider my-5" />
      <div className="grid grid-cols-2 gap-4">
        <MobileOrderMetric icon={iconAssets.loyalty} label="Total" value={formatCurrency(order.total)} />
        <MobileOrderMetric icon={iconAssets.clock} label="Estimated ETA" value={formatClockTime(order.fulfillmentTime)} subcopy="Today" />
      </div>
      <div className="gold-divider my-5" />
      <MobileOrderTimeline orderType={order.type} />
      <Button variant="outline" className="mt-7 h-16 w-full rounded-full border-[var(--sb-border-strong)] bg-black/20 text-lg uppercase tracking-[0.12em] text-[var(--sb-gold)]" onClick={onViewTracking}>
        View Details
        <ChevronRight className="ml-3 h-5 w-5" />
      </Button>
      <Button className="red-glow-button mt-3 h-14 w-full rounded-full uppercase tracking-[0.12em]" onClick={() => onReorder(order.items)}>
        Order Again
      </Button>
    </article>
  );
}

/** Displays a single image preview inside the active mobile order card. */
function MobileOrderPreview({ item }: { item: SushiMenuItem }) {
  return (
    <div className="min-w-0 text-center">
      <div className="relative aspect-square overflow-hidden rounded-[14px] border border-[var(--sb-border)] bg-black/40">
        <Image src={item.image.publicUrl} alt="" fill sizes="120px" className="object-cover" />
      </div>
      <p className="mt-3 truncate text-sm text-white">{item.name}</p>
      <p className="mt-1 text-sm text-[var(--sb-gold)]">{formatCurrency(item.price)}</p>
    </div>
  );
}

/** Renders one total or ETA metric in the mobile active-order card. */
function MobileOrderMetric({ icon, label, subcopy, value }: { icon?: string; label: string; subcopy?: string; value: string }) {
  return (
    <div className="grid grid-cols-[54px_1fr] gap-3">
      <span className="grid h-12 w-12 place-items-center rounded-full border border-[var(--sb-border)] bg-black/36">
        {icon ? <AssetIcon src={icon} size={27} /> : null}
      </span>
      <span>
        <span className="block text-xs uppercase tracking-[0.18em] text-[var(--sb-muted)]">{label}</span>
        <span className="mt-1 block text-2xl text-white">{value}</span>
        {subcopy ? <span className="block text-sm text-[var(--sb-muted)]">{subcopy}</span> : null}
      </span>
    </div>
  );
}

/** Draws the four-step mobile tracking rail. */
function MobileOrderTimeline({ orderType }: { orderType: FulfillmentType }) {
  const stages = [
    { label: "Order Placed", time: "6:42 PM", icon: iconAssets.check, active: true },
    { label: "Preparing", time: "", icon: iconAssets.chefHat, active: true },
    { label: orderType === "Delivery" ? "On the Way" : "Ready Soon", time: "", icon: iconAssets.delivery, active: false },
    { label: "Delivered", time: "", icon: iconAssets.orders, active: false },
  ];

  return (
    <div className="grid grid-cols-4 gap-1">
      {stages.map((stage, index) => (
        <div key={stage.label} className="relative text-center">
          {index > 0 ? <span className={`absolute right-1/2 top-6 h-px w-full ${stage.active ? "bg-[var(--sb-red-bright)]" : "bg-white/14"}`} /> : null}
          <span className={`relative z-10 mx-auto grid h-12 w-12 place-items-center rounded-full border bg-black/72 ${stage.active ? "border-[var(--sb-red-bright)] shadow-[0_0_18px_var(--sb-red-glow)]" : "border-white/14"}`}>
            {stage.icon ? <AssetIcon src={stage.icon} size={26} /> : null}
          </span>
          <span className={`mt-3 block text-sm ${stage.active ? "text-[var(--sb-red-bright)]" : "text-[var(--sb-muted)]"}`}>{stage.label}</span>
          {stage.time ? <span className="mt-1 block text-xs text-[var(--sb-muted)]">{stage.time}</span> : null}
        </div>
      ))}
    </div>
  );
}

/** Displays the screenshot-style active order card with timeline and actions. */
function ActiveOrderPanel({ order, onReorder, onViewTracking }: { order: OrderHistoryEntry; onReorder: (items: SushiMenuItem[]) => void; onViewTracking: () => void }) {
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
          <Button variant="outline" className="mt-4 h-11 w-full rounded-xl border-[var(--sb-border)] bg-transparent text-[var(--sb-gold)]" onClick={onViewTracking}>
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
function LoyaltyView({ loyaltyPoints, rewards, onNavigate, onRedeem }: { loyaltyPoints: number; rewards: Reward[]; onNavigate: (view: AppView) => void; onRedeem: (reward: Reward) => void }) {
  const progressValue = Math.min(loyaltyPoints, appContent.member.maxTierPoints);
  const featuredRewards = rewards.slice(0, 4);

  return (
    <>
      <MobileLoyaltyView featuredRewards={featuredRewards} loyaltyPoints={loyaltyPoints} progressValue={progressValue} onNavigate={onNavigate} onRedeem={onRedeem} />
      <div className="hidden space-y-5 md:block">
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
        <MemberPassCard onNavigate={onNavigate} />
        <div className="luxury-panel p-5">
          <div className="flex items-center justify-between gap-4">
            <h2 className="editorial-title text-xl text-white">Redeem Your Points</h2>
            <button type="button" onClick={() => onNavigate("memberPass")} className="text-xs uppercase tracking-[0.16em] text-[var(--sb-red-bright)]">View all rewards</button>
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
          onAction={() => onNavigate("referral")}
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
          onAction={() => onNavigate("offers")}
          title="Chef's Tasting Rewards"
        />
      </section>

      <section className="luxury-panel p-5">
        <div className="flex items-center justify-between gap-4">
          <h2 className="editorial-title text-xl text-white">Recent Rewards Activity</h2>
          <button type="button" onClick={() => onNavigate("memberPass")} className="text-xs uppercase tracking-[0.16em] text-[var(--sb-red-bright)]">View all activity</button>
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
    </>
  );
}

/** Renders the screenshot-aligned mobile loyalty dashboard. */
function MobileLoyaltyView({
  featuredRewards,
  loyaltyPoints,
  progressValue,
  onNavigate,
  onRedeem,
}: {
  featuredRewards: Reward[];
  loyaltyPoints: number;
  progressValue: number;
  onNavigate: (view: AppView) => void;
  onRedeem: (reward: Reward) => void;
}) {
  const memberImage = getItemById("ikura-gunkan") ?? getItemById("salmon-nigiri") ?? menuItems[0];

  return (
    <section className="space-y-5 md:hidden">
      <button type="button" aria-label="Back to profile" onClick={() => onNavigate("profile")} className="grid h-14 w-14 place-items-center rounded-full border border-[var(--sb-border)] bg-black/52 text-[var(--sb-gold)]">
        <ChevronRight className="h-5 w-5 rotate-180" />
      </button>
      <div>
        <h1 className="editorial-title text-[44px] leading-none text-white">Loyalty Rewards</h1>
        <p className="mt-3 text-xl text-[var(--sb-gold)]">Welcome back, {appContent.member.name}.</p>
      </div>
      <section className="relative min-h-[176px] overflow-hidden rounded-[18px] border border-[var(--sb-border-strong)] bg-black/62 p-5">
        <div className="sb-wave-pattern absolute inset-y-0 left-0 w-72 opacity-20" />
        {memberImage ? (
          <div className="absolute bottom-0 right-0 h-40 w-44">
            <Image src={memberImage.image.publicUrl} alt="" fill sizes="176px" className="object-cover object-left opacity-92" />
          </div>
        ) : null}
        <div className="relative z-10 grid grid-cols-[82px_1fr] gap-4">
          <span className="grid h-20 w-20 place-items-center rounded-full border border-[var(--sb-gold)] bg-black/54 shadow-[0_0_28px_rgba(202,164,93,0.34)]">
            {iconAssets.flower ? <AssetIcon src={iconAssets.flower} size={58} /> : null}
          </span>
          <span className="min-w-0 pr-16">
            <span className="flex flex-wrap items-center gap-2">
              <span className="editorial-title text-lg text-white">Bliss Member</span>
              <span className="rounded-full bg-[var(--sb-gold)] px-3 py-1 text-[10px] font-bold uppercase text-black">{appContent.member.tier} Tier</span>
            </span>
            <span className="mt-3 block text-5xl leading-none text-white">{loyaltyPoints.toLocaleString()} <span className="text-2xl">pts</span></span>
            <span className="mt-3 block text-xl text-[var(--sb-gold)]">{appContent.member.pointsToNextTier.toLocaleString()} pts <span className="text-[var(--sb-muted)]">to {appContent.member.nextTier}</span></span>
            <progress className="mt-4 h-2 w-full max-w-[240px]" value={progressValue} max={appContent.member.maxTierPoints} />
          </span>
        </div>
        <button type="button" className="absolute bottom-5 right-5 z-10 flex items-center gap-2 text-sm text-[var(--sb-gold)]">
          View Tiers
          <ChevronRight className="h-4 w-4" />
        </button>
      </section>
      <div className="grid grid-cols-4 gap-3">
        {[
          { icon: iconAssets.gift, title: "Available Rewards", copy: "Browse & Redeem", target: "memberPass" as AppView },
          { icon: iconAssets.crown, title: "Benefits", copy: "Exclusive Member Perks", target: "giftExperience" as AppView },
          { icon: iconAssets.clock, title: "Activity", copy: "Track Your Points", target: "recentlyViewed" as AppView },
          { icon: iconAssets.qr, title: "Member Pass", copy: "Show Your Digital Pass", target: "memberPass" as AppView },
        ].map((action) => (
          <button key={action.title} type="button" onClick={() => onNavigate(action.target)} className="min-h-[128px] rounded-[16px] border border-[var(--sb-border)] bg-black/44 p-3 text-center">
            {action.icon ? <AssetIcon src={action.icon} size={36} className="mx-auto" /> : null}
            <span className="mt-3 block text-sm uppercase leading-5 text-white">{action.title}</span>
            <span className="mt-2 block text-xs leading-5 text-[var(--sb-muted)]">{action.copy}</span>
          </button>
        ))}
      </div>
      <section className="rounded-[18px] border border-[var(--sb-border)] bg-black/48 p-4">
        <MenuSectionHeading title="Redeemable Rewards" action="View All" />
        <div className="mt-4 grid grid-cols-2 gap-3">
          {featuredRewards.map((reward) => (
            <RewardCard key={reward.id} reward={reward} onRedeem={onRedeem} />
          ))}
        </div>
      </section>
      <section className="rounded-[18px] border border-[var(--sb-border)] bg-black/48 p-4">
        <MenuSectionHeading title="Recent Activity" action="View All" />
        <div className="mt-4 divide-y divide-[var(--sb-border)] rounded-[14px] border border-[var(--sb-border)] bg-black/28">
          {[
            ["Earned Points", "Sushi Bliss Deluxe", "+850 pts"],
            ["Reward Redeemed", "Matcha Tiramisu", "-700 pts"],
          ].map(([title, copy, points]) => (
            <div key={title} className="grid grid-cols-[52px_1fr_auto] items-center gap-3 p-3">
              <span className="grid h-11 w-11 place-items-center rounded-full border border-[var(--sb-border)] bg-black/40">
                {title.includes("Earned") ? <Star className="h-5 w-5 text-[var(--sb-gold)]" /> : iconAssets.gift ? <AssetIcon src={iconAssets.gift} size={24} /> : null}
              </span>
              <span>
                <span className="block text-base text-white">{title}</span>
                <span className="text-sm text-[var(--sb-muted)]">{copy}</span>
              </span>
              <span className={points.startsWith("+") ? "text-[var(--sb-gold)]" : "text-[var(--sb-red-bright)]"}>{points}</span>
            </div>
          ))}
        </div>
      </section>
    </section>
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
function MemberPassCard({ onNavigate }: { onNavigate: (view: AppView) => void }) {
  return (
    <button type="button" onClick={() => onNavigate("memberPass")} className="luxury-panel block w-full p-5 text-left transition hover:border-[var(--sb-gold)]">
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
    </button>
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
function LoyaltyInfoCard({ action, copy, image, onAction, title }: { action: string; copy: string; image: string; onAction?: () => void; title: string }) {
  return (
    <section className="luxury-panel relative min-h-[168px] overflow-hidden p-5">
      <Image src={image} alt="" fill sizes="360px" className="object-cover opacity-38" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/88 via-black/52 to-transparent" />
      <div className="relative z-10 max-w-[230px]">
        <h2 className="editorial-title text-xl text-white">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--sb-muted)]">{copy}</p>
        <button type="button" onClick={onAction} className="mt-4 rounded-xl border border-[var(--sb-border)] px-4 py-2 text-xs uppercase tracking-[0.16em] text-[var(--sb-gold)]">{action}</button>
      </div>
    </section>
  );
}

/** Renders contact details and validates private event inquiries. */
function ContactView({ onNavigate, showNotice }: { onNavigate: (view: AppView) => void; showNotice: (message: string, tone?: Notice["tone"]) => void }) {
  const contactHero = getAssetById("elegant-table-setting-with-candlelight-and-berries") ?? getAssetById("sushi-bliss-ambience-detail") ?? ambienceAssets[0];
  const { hours, location } = appContent;
  const socialLinks = [
    { label: "Instagram", icon: iconAssets.instagram },
    { label: "Facebook", icon: iconAssets.facebook },
    { label: "X", icon: iconAssets.x },
  ];

  return (
    <>
      <MobileContactView location={location} hours={hours} socialLinks={socialLinks} onNavigate={onNavigate} showNotice={showNotice} />
      <div className="hidden space-y-5 md:block">
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
        <FAQPanel onNavigate={onNavigate} />
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
    </>
  );
}

/** Renders the phone-first contact screen from the tidy mobile reference. */
function MobileContactView({
  hours,
  location,
  socialLinks,
  onNavigate,
  showNotice,
}: {
  hours: typeof appContent.hours;
  location: typeof appContent.location;
  socialLinks: Array<{ icon?: string; label: string }>;
  onNavigate: (view: AppView) => void;
  showNotice: (message: string, tone?: Notice["tone"]) => void;
}) {
  const contactHero = getAssetById("elegant-table-setting-with-candlelight-and-berries") ?? getAssetById("sushi-bliss-ambience-detail") ?? ambienceAssets[0];

  return (
    <section className="relative space-y-5 overflow-hidden pb-4 md:hidden">
      <Image src={assetUrl(contactHero, heroAsset.publicUrl)} alt="" fill sizes="100vw" className="-z-10 object-cover opacity-32" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(0,0,0,0.46)_0%,rgba(0,0,0,0.88)_30%,rgba(0,0,0,0.96)_100%)]" />
      <div className="pt-10">
        <h1 className="editorial-title text-[44px] leading-[1.05] text-white">
          Contact
          <span className="block text-[var(--sb-red-bright)]">Sushi Bliss</span>
        </h1>
        <p className="mt-5 max-w-[320px] text-xl leading-8 text-[var(--sb-gold)]">We&apos;re here to make your experience exceptional.</p>
      </div>
      <div className="space-y-2">
        <MobileContactRow icon={iconAssets.mapPin} title="Our Location" lines={[location.street, `${location.city}, ${location.postalLine}, ${location.country}`]} />
        <MobileContactRow icon={iconAssets.phone} title="Call Us" lines={[location.phone]} />
        <MobileContactRow icon={iconAssets.email} title="Email Us" lines={[location.email]} />
        <MobileContactRow icon={iconAssets.clock} title="Hours" lines={[hours.service, hours.lastOrder]} />
        <MobileContactRow icon={iconAssets.share} title="Follow Us" lines={[]} socialLinks={socialLinks} />
      </div>
      <section className="grid grid-cols-2 gap-3">
        <button type="button" onClick={() => onNavigate("reservations")} className="red-glow-button grid min-h-[96px] grid-cols-[46px_1fr] items-center gap-3 rounded-[16px] border border-[var(--sb-red-bright)] px-4 text-left">
          {iconAssets.reservations ? <AssetIcon src={iconAssets.reservations} size={34} /> : null}
          <span>
            <span className="editorial-title block text-base text-white">Reserve A Table</span>
            <span className="mt-1 block text-xs text-white/74">Unforgettable dining awaits</span>
          </span>
        </button>
        <button type="button" onClick={() => onNavigate("orderOnline")} className="grid min-h-[96px] grid-cols-[46px_1fr] items-center gap-3 rounded-[16px] border border-[var(--sb-border-strong)] bg-black/48 px-4 text-left">
          {iconAssets.orders ? <AssetIcon src={iconAssets.orders} size={34} /> : null}
          <span>
            <span className="editorial-title block text-base text-[var(--sb-gold)]">Order Now</span>
            <span className="mt-1 block text-xs text-[var(--sb-muted)]">Sushi delivered to you</span>
          </span>
        </button>
      </section>
      <section className="rounded-[18px] border border-[var(--sb-border)] bg-black/58 p-5 backdrop-blur-xl">
        <h2 className="editorial-title text-xl uppercase tracking-[0.04em] text-[var(--sb-gold)]">Send Us A Message</h2>
        <div className="mt-3 h-px w-16 bg-[linear-gradient(90deg,var(--sb-red-bright),transparent)]" />
        <p className="mt-6 text-base leading-7 text-[var(--sb-muted)]">Have a question or special request? We&apos;ll get back to you as soon as possible.</p>
        <div className="mt-5 grid gap-3">
          <Input placeholder="Your name" aria-label="Your name" className="h-14 rounded-[10px] border-[var(--sb-border)] bg-black/45 text-white" />
          <textarea aria-label="Your message" placeholder="Your message" className="min-h-28 rounded-[10px] border border-[var(--sb-border)] bg-black/45 px-4 py-3 text-sm text-white placeholder:text-[var(--sb-muted)]" />
          <Button className="red-glow-button h-14 rounded-[10px] uppercase tracking-[0.14em]" onClick={() => showNotice("Message sent. We will reply shortly.", "success")}>
            Send Message
          </Button>
        </div>
      </section>
    </section>
  );
}

/** Displays one full-width mobile contact action row. */
function MobileContactRow({ icon, lines, socialLinks, title }: { icon?: string; lines: string[]; socialLinks?: Array<{ icon?: string; label: string }>; title: string }) {
  return (
    <button type="button" className="grid w-full grid-cols-[82px_1fr_28px] items-center rounded-[14px] border border-[var(--sb-border)] bg-black/50 p-3 text-left backdrop-blur-xl">
      <span className="grid h-14 w-14 place-items-center rounded-full border border-[var(--sb-border)] bg-black/38">
        {icon ? <AssetIcon src={icon} size={34} /> : null}
      </span>
      <span className="min-w-0">
        <span className="block text-sm uppercase tracking-[0.12em] text-[var(--sb-gold)]">{title}</span>
        {socialLinks ? (
          <span className="mt-3 flex gap-2">
            {socialLinks.map((link) => (
              <span key={link.label} className="grid h-8 w-8 place-items-center rounded-full border border-[var(--sb-border)] bg-black/42">
                {link.icon ? <AssetIcon src={link.icon} size={20} /> : null}
              </span>
            ))}
          </span>
        ) : (
          lines.map((line) => <span key={line} className="mt-1 block truncate text-base text-white/78">{line}</span>)
        )}
      </span>
      <ChevronRight className="h-5 w-5 text-[var(--sb-gold)]" />
    </button>
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
  const mapAsset = getAssetById("tokyo-city-map-with-sushi-markers") ?? getAssetById("sushi-bliss-tokyo-map-transparent");

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
function FAQPanel({ onNavigate }: { onNavigate: (view: AppView) => void }) {
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
          <button key={question} type="button" onClick={() => onNavigate("help")} className="flex h-11 w-full items-center justify-between rounded-xl border border-[var(--sb-border)] bg-black/30 px-3 text-left text-sm text-[var(--sb-muted)]">
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
  const itemCount = groupedCart.reduce((sum, row) => sum + row.qty, 0);
  const suggestedItem = getItemById("miso-soup") ?? menuItems.find((item) => item.categories.includes("Appetizers"));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[70] flex items-end bg-black/72 backdrop-blur-sm lg:justify-end">
      <motion.aside initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 34, stiffness: 260 }} className="app-scrollbar max-h-[94vh] w-full overflow-y-auto rounded-t-[34px] border border-[var(--sb-border)] bg-[var(--sb-bg)] px-5 pb-8 pt-5 text-white shadow-[0_-24px_90px_rgba(0,0,0,0.75)] lg:h-full lg:max-h-none lg:max-w-[560px] lg:rounded-l-[34px] lg:rounded-tr-none lg:px-7">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="editorial-title text-[42px] leading-none text-white">Your <span className="text-[var(--sb-red-bright)]">Cart</span></h2>
            <p className="mt-2 text-lg text-[var(--sb-gold)]">Review your items and proceed to checkout.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close cart" className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-[var(--sb-border)] text-[var(--sb-gold)]"><X className="h-5 w-5" /></button>
        </div>
        {groupedCart.length === 0 ? (
          <div className="mt-6">
            <EmptyState title="Your cart is empty" copy="Start with a chef favorite or build a pairing-led order." actionLabel="Browse menu" onAction={onNavigateMenu} />
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            <div className="space-y-3">
              {groupedCart.map(({ item, qty }) => (
                <article key={item.id} className="grid min-h-[148px] grid-cols-[132px_1fr] gap-4 rounded-[18px] border border-[var(--sb-border)] bg-black/48 p-4">
                  <div className="relative overflow-hidden rounded-[12px]">
                    <Image src={item.image.publicUrl} alt="" fill sizes="132px" className="object-cover" />
                  </div>
                  <div className="grid grid-cols-[1fr_auto] gap-3">
                    <div className="min-w-0">
                      <h3 className="text-2xl text-white">{item.name}</h3>
                      <p className="mt-1 line-clamp-2 text-sm text-[var(--sb-muted)]">{item.description}</p>
                      <div className="mt-5 flex items-center gap-5">
                        <button type="button" onClick={() => onDecrease(item.id)} aria-label={`Decrease ${item.name}`} className="grid h-11 w-11 place-items-center rounded-full border border-[var(--sb-border)] text-[var(--sb-gold)]"><Minus className="h-5 w-5" /></button>
                        <span className="min-w-5 text-center text-xl">{qty}</span>
                        <button type="button" onClick={() => onIncrease(item)} aria-label={`Increase ${item.name}`} className="grid h-11 w-11 place-items-center rounded-full border border-[var(--sb-border)] text-[var(--sb-gold)]"><Plus className="h-5 w-5" /></button>
                      </div>
                    </div>
                    <div className="flex flex-col items-end justify-between">
                      <p className="text-xl text-[var(--sb-gold)]">{formatCurrency(item.price * qty)}</p>
                      <button type="button" onClick={() => onRemove(item.id)} aria-label={`Remove ${item.name}`} className="text-[var(--sb-red-bright)]">
                        <X className="h-6 w-6" />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            <button type="button" className="grid h-16 w-full grid-cols-[40px_1fr_auto] items-center gap-4 rounded-[14px] border border-[var(--sb-border)] bg-black/42 px-5 text-left">
              {iconAssets.menuLight ? <AssetIcon src={iconAssets.menuLight} size={26} /> : null}
              <span className="text-lg text-white/80">Add a note for your order</span>
              <ChevronRight className="h-5 w-5 text-[var(--sb-gold)]" />
            </button>
            <div className="grid gap-3 rounded-[14px] border border-[var(--sb-border)] bg-black/42 p-4 sm:grid-cols-[1fr_auto]">
              <label className="flex h-12 items-center gap-3 rounded-xl border border-white/10 bg-black/30 px-3">
                {iconAssets.gift ? <AssetIcon src={iconAssets.gift} size={24} /> : null}
                <span className="sr-only">Promo code</span>
                <Input value={promoCode} onChange={(event) => onPromoChange(event.target.value)} placeholder="Add a promo code" className="h-full border-none bg-transparent px-0 text-white placeholder:text-[var(--sb-muted)] focus-visible:ring-0 focus-visible:ring-offset-0" />
              </label>
              <Button variant="outline" className="h-12 rounded-xl border-[var(--sb-border)] bg-transparent text-[var(--sb-gold)]" onClick={onApplyPromo}>Apply</Button>
            </div>
            {appliedPromo ? <p className="text-sm text-[var(--sb-gold)]">Applied {appliedPromo.toUpperCase()}</p> : null}
            <div className="grid grid-cols-2 gap-3">
              <SegmentedControl options={["Delivery", "Pickup"]} value={fulfillment} onChange={(value) => onFulfillmentChange(value as FulfillmentType)} />
              <div className="rounded-2xl border border-[var(--sb-border)] bg-white/[0.03] p-3">
                <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--sb-gold)]">Tip</p>
                <div className="mt-2 grid grid-cols-4 gap-1">
                  {[0, 10, 15, 20].map((tipOption) => (
                    <button key={tipOption} type="button" onClick={() => onTipChange(tipOption)} className={`rounded-lg border px-2 py-2 text-xs ${tipPercent === tipOption ? "border-[var(--sb-red-bright)] bg-[var(--sb-red)]/24 text-white" : "border-[var(--sb-border)] text-[var(--sb-muted)]"}`}>
                      {tipOption === 0 ? "0" : `${tipOption}`}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="rounded-[18px] border border-[var(--sb-border)] bg-black/46 p-5 text-lg text-[var(--sb-muted)]">
              <SummaryLine label="Subtotal" value={formatCurrency(subtotal)} />
              <SummaryLine label="Items" value={`${itemCount}`} />
              <SummaryLine label="Service Fee" value={formatCurrency(serviceFee)} />
              <SummaryLine label="Delivery Fee" value={formatCurrency(deliveryFee)} />
              {promoDiscount > 0 ? <SummaryLine label="Promo" value={`- ${formatCurrency(promoDiscount)}`} /> : null}
              {tip > 0 ? <SummaryLine label="Tip" value={formatCurrency(tip)} /> : null}
              <SummaryLine label="Tax" value={formatCurrency(tax)} />
              <div className="gold-divider my-4" />
              <SummaryLine label="Cart Total" value={formatCurrency(grandTotal)} strong />
              <SummaryLine label="Total" value={formatCurrency(total)} strong />
            </div>
            {suggestedItem ? (
              <section className="grid min-h-[140px] grid-cols-[38%_1fr] overflow-hidden rounded-[18px] border border-[var(--sb-border)] bg-black/46">
                <div className="relative"><Image src={suggestedItem.image.publicUrl} alt="" fill sizes="180px" className="object-cover" /></div>
                <div className="flex flex-col justify-center p-4">
                  <p className="editorial-title text-sm text-[var(--sb-gold)]">Complete Your Meal</p>
                  <h3 className="mt-1 text-2xl text-white">Add {suggestedItem.name}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-[var(--sb-muted)]">{suggestedItem.description}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xl text-[var(--sb-gold)]">{formatCurrency(suggestedItem.price)}</span>
                    <Button variant="outline" className="h-10 rounded-full border-[var(--sb-border)] bg-black/20 px-6 text-[var(--sb-gold)]" onClick={() => onIncrease(suggestedItem)}>Add</Button>
                  </div>
                </div>
              </section>
            ) : null}
            <Button className="red-glow-button h-16 w-full rounded-[18px] py-4 text-base uppercase tracking-[0.18em]" onClick={onCheckout}>Proceed to Checkout</Button>
          </div>
        )}
      </motion.aside>
    </motion.div>
  );
}

/** Renders the multi-section checkout modal with fulfillment and payment fields. */
function CheckoutModal({ groupedCart, profile, fulfillment, selectedPayment, tipPercent, subtotal, promoDiscount, tax, tip, deliveryFee, serviceFee, total, onClose, onFulfillmentChange, onProfileChange, onPaymentChange, onTipChange, onPlaceOrder }: { groupedCart: { item: SushiMenuItem; qty: number }[]; profile: GuestProfile; fulfillment: FulfillmentType; selectedPayment: string; tipPercent: number; subtotal: number; promoDiscount: number; tax: number; tip: number; deliveryFee: number; serviceFee: number; total: number; onClose: () => void; onFulfillmentChange: (value: FulfillmentType) => void; onProfileChange: (profile: GuestProfile) => void; onPaymentChange: (value: string) => void; onTipChange: (value: number) => void; onPlaceOrder: () => void }) {
  const itemCount = groupedCart.reduce((sum, row) => sum + row.qty, 0);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[90] flex items-end bg-black/75 backdrop-blur-sm lg:items-center lg:justify-center">
      <motion.section initial={{ y: 36, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 36, opacity: 0 }} className="app-scrollbar max-h-[94vh] w-full overflow-y-auto rounded-t-[34px] border border-[var(--sb-border)] bg-[var(--sb-bg)] px-5 pb-8 pt-5 text-white shadow-[0_-30px_90px_rgba(0,0,0,0.8)] lg:max-w-6xl lg:rounded-[34px] lg:p-7">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Image src={brand.assets.icon.publicUrl} alt="" width={48} height={48} className="h-12 w-12 rounded-full" />
            <span className="editorial-title text-[17px] leading-[0.95] tracking-[0.32em] text-white">Sushi<br />Bliss</span>
          </div>
          <button type="button" onClick={onClose} aria-label="Close checkout" className="grid h-12 w-12 place-items-center rounded-full border border-[var(--sb-border)] text-[var(--sb-gold)]"><X className="h-5 w-5" /></button>
        </div>
        <CheckoutProgress activeStep={4} />
        <div className="mt-7">
          <h2 className="editorial-title text-[42px] leading-none text-white">Review Your Order</h2>
          <p className="mt-2 text-xl text-[var(--sb-gold)]">Almost there. Please review your order details.</p>
        </div>
        <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_380px]">
          <div className="space-y-5">
            <section className="rounded-[18px] border border-[var(--sb-border)] bg-black/44 p-5">
              <h3 className="editorial-title text-xl text-[var(--sb-gold)]">Delivery / Pickup</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {(["Delivery", "Pickup"] as FulfillmentType[]).map((option) => (
                  <CheckoutChoiceCard
                    key={option}
                    active={fulfillment === option}
                    copy={option === "Delivery" ? "We'll bring your sushi straight to your door." : "Pick up your order from Sushi Bliss Downtown."}
                    icon={option === "Delivery" ? iconAssets.delivery : iconAssets.bag}
                    title={option}
                    onClick={() => onFulfillmentChange(option)}
                  />
                ))}
              </div>
            </section>
            <section className="rounded-[18px] border border-[var(--sb-border)] bg-black/44 p-5">
              <h3 className="editorial-title text-xl text-[var(--sb-gold)]">Delivery Address</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <Input value={profile.name} onChange={(event) => onProfileChange({ ...profile, name: event.target.value })} placeholder="Name" className="h-14 rounded-[14px] border-[var(--sb-border)] bg-black/30 text-white" />
                <Input value={profile.phone} onChange={(event) => onProfileChange({ ...profile, phone: event.target.value })} placeholder="Phone" className="h-14 rounded-[14px] border-[var(--sb-border)] bg-black/30 text-white" />
                <Input value={profile.deliveryAddress} onChange={(event) => onProfileChange({ ...profile, deliveryAddress: event.target.value, address: profile.address || event.target.value })} placeholder="Delivery address" className="h-14 rounded-[14px] border-[var(--sb-border)] bg-black/30 text-white sm:col-span-2" />
                <textarea placeholder="Delivery instructions" className="min-h-24 rounded-[14px] border border-[var(--sb-border)] bg-black/30 px-3 py-3 text-sm text-white outline-none placeholder:text-[var(--sb-muted)] sm:col-span-2" />
              </div>
            </section>
            <section className="rounded-[18px] border border-[var(--sb-border)] bg-black/44 p-5">
              <h3 className="editorial-title text-xl text-[var(--sb-gold)]">Payment Method</h3>
              <div className="mt-4 space-y-3">
                {["Visa **** 4242", "Apple Pay", "PayPal"].map((method) => (
                  <CheckoutPaymentRow key={method} active={selectedPayment === method} method={method} onClick={() => onPaymentChange(method)} />
                ))}
              </div>
            </section>
            <section className="rounded-[18px] border border-[var(--sb-border)] bg-black/44 p-5">
              <h3 className="editorial-title text-xl text-[var(--sb-gold)]">Tip</h3>
              <div className="mt-4 grid grid-cols-4 gap-2">
                {[0, 10, 15, 20].map((tipOption) => (
                  <button key={tipOption} type="button" onClick={() => onTipChange(tipOption)} className={`h-11 rounded-xl border px-3 text-sm ${tipPercent === tipOption ? "border-[var(--sb-red-bright)] bg-[var(--sb-red)]/24 text-white" : "border-[var(--sb-border)] text-[var(--sb-muted)]"}`}>
                    {tipOption === 0 ? "None" : `${tipOption}%`}
                  </button>
                ))}
              </div>
            </section>
          </div>
          <aside className="h-max rounded-[18px] border border-[var(--sb-border)] bg-black/54 p-5 xl:sticky xl:top-8">
            <div className="flex items-center justify-between">
              <p className="editorial-title text-xl text-[var(--sb-gold)]">Order Summary</p>
              <span className="text-sm text-[var(--sb-muted)]">{itemCount} items</span>
            </div>
            <CheckoutInfoRow icon={iconAssets.mapPin} label="Delivery Address" value={`${profile.name}\n${profile.deliveryAddress || appContent.member.deliveryAddress}`} />
            <CheckoutInfoRow icon={iconAssets.clock} label="Scheduled Time" value={`Today • ${fulfillment === "Delivery" ? "ASAP (45-60 min)" : "ASAP (20-25 min)"}`} />
            <CheckoutInfoRow icon={iconAssets.creditCard} label="Payment Method" value={selectedPayment} />
            <div className="mt-4 divide-y divide-[var(--sb-border)] rounded-[14px] border border-[var(--sb-border)] bg-black/36">
              {groupedCart.map(({ item, qty }) => (
                <div key={item.id} className="grid grid-cols-[72px_42px_1fr_auto] items-center gap-3 p-3">
                  <div className="relative h-16 overflow-hidden rounded-[10px]"><Image src={item.image.publicUrl} alt="" fill sizes="72px" className="object-cover" /></div>
                  <span className="grid h-9 w-9 place-items-center rounded-full border border-[var(--sb-border)] text-[var(--sb-gold)]">{qty}</span>
                  <span><span className="block text-sm text-white">{item.name}</span><span className="text-xs text-[var(--sb-muted)]">{item.description}</span></span>
                  <span className="text-[var(--sb-gold)]">{formatCurrency(item.price * qty)}</span>
                </div>
              ))}
            </div>
            <TotalsPanel subtotal={subtotal} promoDiscount={promoDiscount} tax={tax} tip={tip} grandTotal={subtotal + tax + tip - promoDiscount} deliveryFee={deliveryFee} serviceFee={serviceFee} total={total} />
            <div className="mt-4 rounded-[14px] border border-[var(--sb-border)] bg-black/34 p-4 text-sm text-[var(--sb-muted)]">
              You&apos;ll earn <span className="text-[var(--sb-gold)]">{Math.round(total * 10)} pts</span> with this order.
            </div>
            <Button className="red-glow-button mt-5 h-16 w-full rounded-[16px] py-4 text-base uppercase tracking-[0.18em]" onClick={onPlaceOrder}>Place Order • {formatCurrency(total)}</Button>
            <p className="mt-4 text-center text-sm text-[var(--sb-muted)]">Secure checkout • Your information is always protected.</p>
          </aside>
        </div>
      </motion.section>
    </motion.div>
  );
}

/** Renders the four-dot checkout progress rail used across the screenshot flow. */
function CheckoutProgress({ activeStep }: { activeStep: number }) {
  const steps = ["Cart", "Delivery", "Payment", "Review"];

  return (
    <div className="mt-7 grid grid-cols-4 gap-2">
      {steps.map((label, index) => {
        const step = index + 1;
        const active = step === activeStep;
        return (
          <div key={label} className="relative text-center">
            {index > 0 ? <span className="absolute right-1/2 top-6 h-px w-full bg-[var(--sb-border)]" /> : null}
            <span className={`relative z-10 mx-auto grid h-12 w-12 place-items-center rounded-full border text-lg ${active ? "border-[var(--sb-red-bright)] bg-[var(--sb-red)]/28 text-white shadow-[0_0_24px_var(--sb-red-glow)]" : "border-[var(--sb-border)] bg-black/45 text-[var(--sb-gold)]"}`}>{step}</span>
            <span className={`mt-3 block text-sm ${active ? "text-[var(--sb-red-bright)]" : "text-[var(--sb-muted)]"}`}>{label}</span>
          </div>
        );
      })}
    </div>
  );
}

/** Displays a checkout fulfillment option with icon, copy, and radio indicator. */
function CheckoutChoiceCard({ active, copy, icon, title, onClick }: { active: boolean; copy: string; icon?: string; title: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={`grid min-h-[150px] grid-cols-[88px_1fr_38px] items-center gap-5 rounded-[18px] border p-5 text-left ${active ? "border-[var(--sb-red-bright)] bg-[var(--sb-red)]/12 shadow-[0_0_24px_rgba(239,47,37,0.18)]" : "border-[var(--sb-border)] bg-white/[0.03]"}`}>
      <span className="grid h-20 w-20 place-items-center rounded-full border border-[var(--sb-border)] bg-black/35">{icon ? <AssetIcon src={icon} size={46} /> : null}</span>
      <span><span className="editorial-title block text-2xl text-white">{title}</span><span className="mt-2 block text-lg leading-7 text-[var(--sb-muted)]">{copy}</span></span>
      <span className={`grid h-8 w-8 place-items-center rounded-full border ${active ? "border-[var(--sb-red-bright)]" : "border-[var(--sb-border)]"}`}><span className={`h-4 w-4 rounded-full ${active ? "bg-[var(--sb-red-bright)]" : "bg-transparent"}`} /></span>
    </button>
  );
}

/** Renders one payment method row with screenshot-style radio state. */
function CheckoutPaymentRow({ active, method, onClick }: { active: boolean; method: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={`grid min-h-[84px] grid-cols-[82px_1fr_34px] items-center gap-4 rounded-[14px] border px-4 text-left ${active ? "border-[var(--sb-red-bright)] bg-[var(--sb-red)]/10" : "border-[var(--sb-border)] bg-white/[0.03]"}`}>
      <span className="grid h-14 w-20 place-items-center rounded-[10px] border border-white/10 bg-black/42">
        <CreditCard className="h-7 w-7 text-[var(--sb-gold)]" />
      </span>
      <span><span className="block text-xl text-white">{method}</span><span className="text-sm text-[var(--sb-muted)]">{method.includes("Visa") ? "Expires 12/26" : "Secure saved method"}</span></span>
      <span className={`grid h-8 w-8 place-items-center rounded-full border ${active ? "border-[var(--sb-red-bright)]" : "border-[var(--sb-border)]"}`}><span className={`h-4 w-4 rounded-full ${active ? "bg-[var(--sb-red-bright)]" : "bg-transparent"}`} /></span>
    </button>
  );
}

/** Displays a compact checkout review row with an icon and multi-line value. */
function CheckoutInfoRow({ icon, label, value }: { icon?: string; label: string; value: string }) {
  return (
    <div className="mt-3 grid grid-cols-[38px_1fr_auto] gap-3 rounded-[14px] border border-[var(--sb-border)] bg-black/36 p-3">
      <span className="grid h-9 w-9 place-items-center rounded-full border border-[var(--sb-border)]">{icon ? <AssetIcon src={icon} size={22} /> : null}</span>
      <span><span className="block text-xs uppercase tracking-[0.16em] text-[var(--sb-gold)]">{label}</span><span className="mt-1 block whitespace-pre-line text-sm text-white/82">{value}</span></span>
      <ChevronRight className="mt-2 h-4 w-4 text-[var(--sb-gold)]" />
    </div>
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
