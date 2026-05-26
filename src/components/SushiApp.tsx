'use client';
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { DishDetailSheet } from "./sushi/DishDetailSheet";
import { MenuItemCard } from "./sushi/MenuItemCard";
import { OmakasePanel } from "./sushi/OmakasePanel";
import type { LucideIcon } from "lucide-react";
import {
  Search,
  ShoppingCart,
  Calendar,
  Gift,
  User,
  CreditCard,
  Smartphone,
  Facebook,
  Instagram,
  Twitter,
  MapPin,
  Store,
  X,
  Sparkles,
  Flame,
  Leaf,
  Star,
  Compass,
  Crown,
  ChefHat,
  ArrowRight,
} from "lucide-react";
import {
  filterCategories,
  heroImagesData,
  menuCategories,
  sushiMenuData,
  type FilterCategory,
  type MenuCategory,
  type SushiMenuItem,
} from "../data/menu";
import { calculateCartTotals, DEFAULT_TAX_RATE, groupCartItems } from "../lib/cart-utils";
import { defaultHighlightCategories, filterMenuItems, getHighlightDrops } from "../lib/menu-utils";
import { buildOmakaseSet, type OmakaseMood } from "../lib/omakase-utils";

const categoryFilters = filterCategories;
const categoryIcons: Record<FilterCategory, LucideIcon> = {
  All: Sparkles,
  Signature: Sparkles,
  Classic: Compass,
  Vegan: Leaf,
  Hot: Flame,
  Popular: Star,
  Premium: Crown,
  Chef: ChefHat,
};
const categoryPillIcons: Partial<Record<MenuCategory, LucideIcon>> = {
  Premium: Crown,
  Chef: ChefHat,
};
const categoryPillClasses: Partial<Record<MenuCategory, string>> = {
  Premium: "border-amber-400/70 bg-amber-400/10 text-amber-50",
  Chef: "border-emerald-300/70 bg-emerald-300/10 text-emerald-50",
};
const highlightCategories: MenuCategory[] = defaultHighlightCategories;
const trackerStages = ["Received", "Preparing", "Ready", "On the way"] as const;
const sushiMenu = sushiMenuData;
const heroImages = heroImagesData;
const rewardItem: SushiMenuItem = {
  id: 1001,
  name: "Free Chef's Choice Roll",
  price: 0,
  tag: "Reward",
  rating: 5,
  image: sushiMenu[9]?.image ?? sushiMenu[0].image,
  categories: ["Chef"],
  description: "Chef-selected roll, on the house.",
  ingredients: ["Chef's cut", "Seasoned rice", "House garnish"],
  chefNote: "A rotating thank-you bite for returning guests.",
  pairing: "Chef's choice",
  texture: "Surprise finish",
};

interface Reservation {
  id: number;
  datetime: string;
  guests: number;
}

interface GuestProfile {
  name: string;
  email: string;
  phone: string;
  address: string;
  dietary: string;
  marketingOptIn: boolean;
  deliveryAddress: string;
}

interface OrderHistoryEntry {
  id: number;
  items: SushiMenuItem[];
  total: number;
  method: string;
  type: "Pickup" | "Delivery";
  ts: number;
}

type NoticeTone = "success" | "error" | "info";

interface AppNotice {
  id: number;
  message: string;
  tone: NoticeTone;
}

export default function SushiApp() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<FilterCategory>("All");
  const [cart, setCart] = useState<SushiMenuItem[]>([]);
  const [darkMode, setDarkMode] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [orderType, setOrderType] = useState<"Pickup" | "Delivery">("Pickup");
  const [loyaltyPoints, setLoyaltyPoints] = useState(50);
  const pointsToNextReward = (pts: number) => {
    const mod = pts % 100;
    return mod === 0 ? 100 : 100 - mod;
  };

  const [showReserve, setShowReserve] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showLoyalty, setShowLoyalty] = useState(false);
  const [storageReady, setStorageReady] = useState(false);

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [reservationDT, setReservationDT] = useState("");
  const [reservationGuests, setReservationGuests] = useState(1);
  const [editingResId, setEditingResId] = useState<number | null>(null);
  const [confirmDlg, setConfirmDlg] = useState<{
    open: boolean;
    message: string;
    onYes: null | (() => void);
  }>({ open: false, message: "", onYes: null });
  const askConfirm = (message: string, onYes: () => void) => {
    setConfirmDlg({ open: true, message, onYes });
  };

  const [profile, setProfile] = useState<GuestProfile>({
    name: "",
    email: "",
    phone: "",
    address: "",
    dietary: "",
    marketingOptIn: false,
    deliveryAddress: "",
  });

  const [orderHistory, setOrderHistory] = useState<OrderHistoryEntry[]>([]);
  const [selectedItem, setSelectedItem] = useState<SushiMenuItem | null>(null);
  const [omakaseMood, setOmakaseMood] = useState<OmakaseMood>("Chef's Luxe");

  const [qtyById, setQtyById] = useState<Record<number, number>>({});
  const incQty = (id: number) => setQtyById((q) => ({ ...q, [id]: (q[id] ?? 1) + 1 }));
  const decQty = (id: number) => setQtyById((q) => ({ ...q, [id]: Math.max(1, (q[id] ?? 1) - 1) }));
  const addToCartWithQty = (item: SushiMenuItem, count?: number) => {
    const n = typeof count === "number" ? count : qtyById[item.id] ?? 1;
    if (n <= 0) return;
    setCart((prev) => [...prev, ...Array.from({ length: n }, () => item)]);
    setLoyaltyPoints((p) => p + 5 * n);
  };

  const [justAdded, setJustAdded] = useState<Record<number, boolean>>({});
  const cartButtonRef = useRef<HTMLButtonElement | null>(null);
  const [flyingSushis, setFlyingSushis] = useState<
    { id: number; start: { x: number; y: number }; end: { x: number; y: number }; emoji: string }[]
  >([]);
  const [toasts, setToasts] = useState<{ id: number; item: string; qty: number }[]>([]);
  const [notices, setNotices] = useState<AppNotice[]>([]);
  const [cartPulse, setCartPulse] = useState(false);
  const [cartSheetReady, setCartSheetReady] = useState(true);
  const [activeOrderId, setActiveOrderId] = useState<number | null>(null);
  const [trackerStep, setTrackerStep] = useState(0);
  const [isCompact, setIsCompact] = useState(false);
  const [isTabletUp, setIsTabletUp] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [dropsPaused, setDropsPaused] = useState(false);
  const newDropsRef = useRef<HTMLDivElement | null>(null);
  const newDropsIndexRef = useRef(0);

  /** Queues a short-lived status message for form, checkout, and persistence feedback. */
  const showNotice = useCallback((message: string, tone: NoticeTone = "info") => {
    const id = Date.now();
    setNotices((prev) => [{ id, message, tone }, ...prev].slice(0, 3));
    window.setTimeout(() => {
      setNotices((prev) => prev.filter((notice) => notice.id !== id));
    }, 3600);
  }, []);

  /** Persists local app state and surfaces storage failures without breaking the ordering flow. */
  const persistValue = useCallback((key: string, value: string) => {
    try {
      localStorage.setItem(key, value);
    } catch {
      showNotice("Unable to save the latest session on this device.", "error");
    }
  }, [showNotice]);

  const launchFlyingSushi = (origin: DOMRect | null) => {
    if (!origin || !cartButtonRef.current || prefersReducedMotion) return;
    const cartRect = cartButtonRef.current.getBoundingClientRect();
    const id = Date.now();
    const emojiPool = ["🍣", "🍥", "🥢", "🍱"];
    const start = { x: origin.left + origin.width / 2, y: origin.top + origin.height / 2 };
    const end = { x: cartRect.left + cartRect.width / 2, y: cartRect.top + cartRect.height / 2 };
    setFlyingSushis((prev) => [...prev, { id, start, end, emoji: emojiPool[id % emojiPool.length] }]);
    window.setTimeout(() => {
      setFlyingSushis((prev) => prev.filter((s) => s.id !== id));
    }, 900);
  };

  const pushToast = (itemName: string, qty: number) => {
    const id = Date.now();
    setToasts((prev) => [{ id, item: itemName, qty }, ...prev].slice(0, 3));
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3200);
  };

  const handleAddToCart = (item: SushiMenuItem, origin?: DOMRect | null) => {
    const quantity = qtyById[item.id] ?? 1;
    addToCartWithQty(item, quantity);
    setJustAdded((m) => ({ ...m, [item.id]: true }));
    setTimeout(() => setJustAdded((m) => ({ ...m, [item.id]: false })), 900);
    launchFlyingSushi(origin ?? null);
    pushToast(item.name, quantity);
  };

  useEffect(() => {
    if (!cart.length || prefersReducedMotion) return;
    setCartPulse(true);
    const t = window.setTimeout(() => setCartPulse(false), 800);
    return () => window.clearTimeout(t);
  }, [cart.length, prefersReducedMotion]);

  useEffect(() => {
    if (!showCart) return;
    setCartSheetReady(false);
    const t = window.setTimeout(() => setCartSheetReady(true), 450);
    return () => window.clearTimeout(t);
  }, [showCart]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const attach = (query: string, setter: (matches: boolean) => void) => {
      const mq = window.matchMedia(query);
      const handler = (event: MediaQueryListEvent) => setter(event.matches);
      setter(mq.matches);
      if (mq.addEventListener) {
        mq.addEventListener("change", handler);
        return () => mq.removeEventListener("change", handler);
      }
      mq.addListener(handler);
      return () => mq.removeListener(handler);
    };
    const detachCompact = attach("(max-width: 640px)", setIsCompact);
    const detachTabletUp = attach("(min-width: 768px)", setIsTabletUp);
    const detachMotion = attach("(prefers-reduced-motion: reduce)", setPrefersReducedMotion);
    return () => {
      detachCompact?.();
      detachTabletUp?.();
      detachMotion?.();
    };
  }, []);

  const newDrops = useMemo(() => getHighlightDrops(sushiMenu, highlightCategories), []);
  const [heroIndex, setHeroIndex] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setHeroIndex((i) => (i + 1) % heroImages.length), 5000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!activeOrderId) return;
    setTrackerStep(0);
    const timers = trackerStages.slice(1).map((_, idx) =>
      window.setTimeout(() => setTrackerStep(idx + 1), (idx + 1) * 2000)
    );
    const hideTimer = window.setTimeout(() => setActiveOrderId(null), trackerStages.length * 2200);
    return () => {
      timers.forEach((t) => window.clearTimeout(t));
      window.clearTimeout(hideTimer);
    };
  }, [activeOrderId]);

  useEffect(() => {
    if (prefersReducedMotion || newDrops.length === 0 || dropsPaused || isTabletUp) return;
    const container = newDropsRef.current;
    if (!container) return;
    if (container.scrollWidth <= container.clientWidth + 1) return;
    let raf: number;
    let timeout: number;
    const scrollNext = () => {
      const cards = Array.from(container.querySelectorAll<HTMLElement>("[data-drop-card]"));
      if (!cards.length) return;
      newDropsIndexRef.current = (newDropsIndexRef.current + 1) % cards.length;
      const target = cards[newDropsIndexRef.current];
      target.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      timeout = window.setTimeout(() => {
        raf = window.requestAnimationFrame(scrollNext);
      }, 5000);
    };
    timeout = window.setTimeout(() => {
      raf = window.requestAnimationFrame(scrollNext);
    }, 4000);
    return () => {
      window.clearTimeout(timeout);
      window.cancelAnimationFrame(raf);
    };
  }, [prefersReducedMotion, dropsPaused, newDrops.length, isTabletUp]);

  const filteredMenu = useMemo(
    () => filterMenuItems(sushiMenu, query, activeCategory),
    [query, activeCategory]
  );
  const omakaseSet = useMemo(() => buildOmakaseSet(sushiMenu, omakaseMood), [omakaseMood]);

  /** Adds the current chef-built set as one cohesive tray. */
  const addOmakaseSetToCart = () => {
    if (omakaseSet.items.length === 0) return;
    setCart((prev) => [...prev, ...omakaseSet.items]);
    setLoyaltyPoints((points) => points + 5 * omakaseSet.items.length);
    showNotice(`${omakaseSet.mood} set added to your tray.`, "success");
  };

  const [tipPercent, setTipPercent] = useState<number>(0);
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const { subtotal, promoDiscount, tax, tip, grandTotal } = useMemo(
    () =>
      calculateCartTotals({
        cart,
        appliedPromo,
        tipPercent,
        taxRate: DEFAULT_TAX_RATE,
      }),
    [cart, appliedPromo, tipPercent]
  );

  const groupedCart = useMemo(() => groupCartItems(cart), [cart]);
  const loyaltyProgressSegments = Math.min(10, Math.floor((loyaltyPoints % 100) / 10));
  const incCartItem = (id: number) => {
    setCart((prev) => {
      const found = sushiMenu.find((m) => m.id === id) ?? prev.find((m) => m.id === id);
      return found ? [...prev, found] : prev;
    });
  };
  const decCartItem = (id: number) => {
    let removed = false;
    setCart((prev) => {
      const out: SushiMenuItem[] = [];
      for (const it of prev) {
        if (!removed && it.id === id) { removed = true; continue; }
        out.push(it);
      }
      return out;
    });
  };
  const removeLine = (id: number) => setCart((prev) => prev.filter((it) => it.id !== id));

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const saveProfile = () => {
    const emailOk = profile.email ? /.+@.+\..+/.test(profile.email) : true;
    const phoneOk = profile.phone ? /[0-9+\-() ]{7,}/.test(profile.phone) : true;
    if (!emailOk) {
      showNotice("Please enter a valid email address.", "error");
      return;
    }
    if (!phoneOk) {
      showNotice("Please enter a valid phone number.", "error");
      return;
    }
    showNotice("Profile saved.", "success");
  };

  const handleRedeemReward = () => {
    if (loyaltyPoints < 100) return;
    setLoyaltyPoints((p) => p - 100);
    setCart((prev) => [rewardItem, ...prev]);
    setShowLoyalty(false);
    setShowCart(true);
    showNotice("Reward redeemed. A free roll was added to your cart.", "success");
  };

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("sb_cart");
      const savedRes = localStorage.getItem("sb_reservations");
      const savedDark = localStorage.getItem("sb_dark");
      const savedProf = localStorage.getItem("sb_profile");
      const savedHist = localStorage.getItem("sb_orders");
      const savedPoints = localStorage.getItem("sb_points");
      if (savedCart) setCart(JSON.parse(savedCart));
      if (savedRes) setReservations(JSON.parse(savedRes));
      if (savedDark) setDarkMode(savedDark === "1");
      if (savedProf) setProfile(JSON.parse(savedProf));
      if (savedHist) setOrderHistory(JSON.parse(savedHist));
      if (savedPoints) setLoyaltyPoints(Number(savedPoints));
    } catch {
      showNotice("Saved session could not be restored.", "error");
    } finally {
      setStorageReady(true);
    }
  }, [showNotice]);

  useEffect(() => { if (storageReady) persistValue("sb_cart", JSON.stringify(cart)); }, [cart, persistValue, storageReady]);
  useEffect(() => { if (storageReady) persistValue("sb_reservations", JSON.stringify(reservations)); }, [persistValue, reservations, storageReady]);
  useEffect(() => { if (storageReady) persistValue("sb_dark", darkMode ? "1" : "0"); }, [darkMode, persistValue, storageReady]);
  useEffect(() => { if (storageReady) persistValue("sb_profile", JSON.stringify(profile)); }, [persistValue, profile, storageReady]);
  useEffect(() => { if (storageReady) persistValue("sb_orders", JSON.stringify(orderHistory)); }, [orderHistory, persistValue, storageReady]);
  useEffect(() => { if (storageReady) persistValue("sb_points", String(loyaltyPoints)); }, [loyaltyPoints, persistValue, storageReady]);

  const startEditReservation = (r: Reservation) => {
    setEditingResId(r.id);
    setReservationDT(r.datetime);
    setReservationGuests(r.guests);
    setShowReserve(true);
  };

  const cancelReservation = (id: number) => {
    askConfirm("Cancel this reservation?", () => {
      setReservations((prev) => prev.filter((r) => r.id !== id));
    });
  };

  const saveReservation = () => {
    if (!reservationDT) { showNotice("Please pick a date and time.", "error"); return; }
    if (reservationGuests < 1) { showNotice("Guests must be at least 1.", "error"); return; }
    if (editingResId) {
      setReservations((prev) => prev.map((r) => (r.id === editingResId ? { ...r, datetime: reservationDT, guests: reservationGuests } : r)));
      setEditingResId(null);
      showNotice("Reservation updated.", "success");
    } else {
      const r = { id: Date.now(), datetime: reservationDT, guests: reservationGuests };
      setReservations((prev) => [r, ...prev]);
      showNotice("Reservation saved.", "success");
    }
    setReservationDT("");
    setReservationGuests(1);
    setShowReserve(false);
  };

  const formatDT = (dt: string) => {
    try {
      const d = new Date(dt);
      const date = d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
      const time = d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
      return `${date} • ${time}`;
    } catch { return dt; }
  };

  const handleCheckout = (method: string) => {
    const deliveryAddress = (profile.deliveryAddress || profile.address).trim();
    if (orderType === "Delivery" && !deliveryAddress) {
      showNotice("Please enter your delivery address.", "error"); return;
    }
    const order = { id: Date.now(), items: cart, total: grandTotal, method, type: orderType, ts: Date.now() };
    setOrderHistory((prev) => [order, ...prev]);
    setActiveOrderId(order.id);
    setTrackerStep(0);
    setCart([]);
    setShowPayment(false);
    setTipPercent(0);
    setAppliedPromo(null);
    setPromoCode("");
    showNotice(`Paid with ${method}. Thank you.`, "success");
  };

  const headerActions = [
    { icon: ShoppingCart, label: "Cart", onClick: () => setShowCart(true), badge: cart.length },
    { icon: Calendar, label: "Reserve", onClick: () => setShowReserve(true) },
    { icon: Gift, label: "Loyalty", onClick: () => setShowLoyalty(true) },
    { icon: User, label: "Profile", onClick: () => setShowProfile(true) },
  ];

  return (
    <div className={`${darkMode ? "bg-brand-midnight text-white" : "bg-brand-ink text-white"} relative min-h-screen overflow-x-hidden pb-28 text-white transition-colors sm:pb-0`}>
      <DynamicBackground darkMode={darkMode} />

      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 md:px-8">
          <div className="relative mt-3 rounded-[24px] border border-white/15 bg-white/10 px-3 py-2.5 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.35)] sm:mt-4 sm:rounded-[32px] sm:px-6 sm:py-4">
            <div className="pointer-events-none absolute inset-x-8 -bottom-1 h-[2px] bg-gradient-to-r from-transparent via-rose-400/70 to-transparent blur-sm" />
            <div className="flex flex-nowrap items-center gap-2 md:gap-3">
              <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                <div className="relative">
                  <span className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-red-500 to-rose-400 blur-2xl opacity-70" />
                  <span className="relative grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-tr from-red-500 to-rose-400 text-base font-semibold shadow-glow sm:h-11 sm:w-11 sm:text-lg">
                    🍣
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="hidden font-display text-[11px] uppercase tracking-[0.6em] text-white/60 sm:block">Chef Bar</p>
                  <p className="truncate text-base font-semibold leading-tight sm:text-lg">Sushi Bliss</p>
                </div>
              </div>
              <div className="hidden md:flex flex-1 items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm shadow-innerGlass">
                <Search className="w-4 h-4 text-white/50" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search menu..."
                  className="h-8 border-none bg-transparent text-sm text-white placeholder:text-white/40 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>
              <div className="ml-auto flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleDarkMode}
                  className="relative hidden sm:flex items-center gap-1 rounded-full border border-white/15 bg-white/10 px-1 py-1 text-[11px] font-semibold tracking-wide text-white/70 shadow-innerGlass transition hover:text-white"
                >
                  <span
                    className={`absolute inset-y-1 left-1 w-[calc(50%_-_6px)] rounded-full bg-white/30 transition-transform duration-300 ${darkMode ? "translate-x-full" : "translate-x-0"}`}
                  />
                  <span className={`relative z-10 flex items-center gap-1 px-2 ${darkMode ? "text-white/50" : "text-white"}`}>
                    <span role="img" aria-label="sun">
                      🌞
                    </span>
                    Day
                  </span>
                  <span className={`relative z-10 flex items-center gap-1 px-2 ${darkMode ? "text-white" : "text-white/50"}`}>
                    <span role="img" aria-label="moon">
                      🌙
                    </span>
                    Night
                  </span>
                </button>
                <div className="flex items-center gap-2">
                  {headerActions.map(({ icon: Icon, label, onClick, badge }) => (
                    <button
                      key={label}
                      type="button"
                      onClick={onClick}
                      aria-label={label}
                      ref={label === "Cart" ? cartButtonRef : undefined}
                      className="group relative grid h-10 w-10 place-items-center rounded-2xl border border-white/15 bg-white/5 text-white/80 transition hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-rose-300/70 focus-visible:ring-offset-transparent sm:h-11 sm:w-11"
                    >
                      <div className="absolute inset-0 rounded-2xl border border-white/5 opacity-0 transition group-hover:opacity-100" />
                      <Icon className="w-5 h-5" />
                      {badge ? (
                        <motion.div
                          key={`${label}-${badge}`}
                          initial={{ scale: 0.6, opacity: 0 }}
                          animate={{
                            scale: cartPulse && label === "Cart" ? [1, 1.25, 1] : 1,
                            opacity: 1,
                            boxShadow: cartPulse && label === "Cart" ? "0 0 25px rgba(244,63,94,0.6)" : "0 0 18px rgba(244,63,94,0.45)",
                          }}
                          transition={{ duration: 0.8 }}
                          className="absolute -top-1 -right-1 grid h-5 min-w-[20px] place-items-center rounded-full bg-gradient-to-r from-red-500 to-rose-400 text-[10px] font-bold text-white"
                        >
                          {badge}
                        </motion.div>
                      ) : null}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {flyingSushis.map((sushi) => (
          <motion.div
            key={sushi.id}
            className="pointer-events-none fixed z-[60] text-3xl drop-shadow-[0_10px_30px_rgba(0,0,0,0.45)]"
            initial={{ x: sushi.start.x, y: sushi.start.y, scale: 0.9, opacity: 1 }}
            animate={{ x: sushi.end.x, y: sushi.end.y, scale: 0.2, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.85, ease: "easeInOut" }}
          >
            {sushi.emoji}
          </motion.div>
        ))}
      </AnimatePresence>

      <section id="hero" className="relative pt-20 sm:pt-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 md:px-8">
          <HeroCard
            images={heroImages}
            darkMode={darkMode}
            index={heroIndex}
            onReserve={() => setShowReserve(true)}
            compact={isCompact}
          />
        </div>
      </section>

      <section className="px-4 sm:px-6 md:px-8 mt-6 space-y-6">
        <div className="md:hidden rounded-3xl border border-white/10 bg-white/5 px-4 py-4 backdrop-blur-2xl shadow-innerGlass">
          <p className="text-xs uppercase tracking-[0.4em] text-white/50">Search</p>
          <div className="mt-3 flex gap-2">
            <Input
              placeholder="Find a roll..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-12 rounded-2xl border-white/20 bg-transparent text-base text-white placeholder:text-white/40 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            <Button className="h-12 w-12 rounded-2xl bg-gradient-to-br from-red-500 to-rose-500 p-0">
              <Search className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-white/50">Chef's Menu</p>
              <h2 className="text-2xl font-semibold text-white">Signature Cuts</h2>
            </div>
            <p className="text-sm text-white/60 max-w-lg">
              Filter by mood, market cut, or chef favorite without losing the flow of ordering.
            </p>
          </div>
          <div className="relative mt-4">
            <span className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-brand-ink via-brand-ink/70 to-transparent md:hidden" />
            <span className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-brand-ink via-brand-ink/70 to-transparent md:hidden" />
            <div className="overflow-x-auto pb-2 pl-2 pr-4 md:overflow-visible md:pl-0 md:pr-0">
              <LayoutGroup>
                <div className="flex min-w-max gap-3 pr-4 md:min-w-0 md:flex-wrap md:pr-0">
                  {categoryFilters.map((filter) => {
                    const Icon = categoryIcons[filter];
                    const active = activeCategory === filter;
                    return (
                      <motion.button
                        key={filter}
                        type="button"
                        onClick={() => setActiveCategory(filter)}
                        className={`relative flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                          active ? "border-white/50 text-white" : "border-white/10 text-white/70 hover:text-white"
                        }`}
                      >
                        {active && (
                          <motion.div
                            layoutId="chip-glow"
                            className="absolute inset-0 rounded-full bg-gradient-to-r from-rose-500/40 via-red-500/40 to-orange-400/40 blur"
                          />
                        )}
                        <span className="relative flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {filter}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              </LayoutGroup>
            </div>
          </div>
        </div>
      </section>

      <OmakasePanel
        activeMood={omakaseMood}
        set={omakaseSet}
        onMoodChange={setOmakaseMood}
        onAddSet={addOmakaseSetToCart}
      />

      {newDrops.length > 0 && (
        <section className="px-4 sm:px-6 md:px-8 mt-10 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-white/50">New Drops</p>
              <h2 className="text-2xl font-semibold text-white">Chef-curated arrivals</h2>
            </div>
            <div className="flex items-center gap-4 text-sm text-white/70">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.4em]">
                <span
                  className={`h-2 w-2 rounded-full ${dropsPaused ? "bg-white/30" : "bg-emerald-300 animate-pulse"}`}
                  aria-hidden
                />
                {dropsPaused ? "Paused" : "Auto"}
              </div>
              <a href="#menu" className="inline-flex items-center gap-2 text-white/70 hover:text-white">
                View full menu <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-brand-ink via-brand-ink/70 to-transparent md:hidden" />
            <span className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-brand-ink via-brand-ink/70 to-transparent md:hidden" />
            <div
              className="overflow-x-auto pb-4 pl-2 pr-4 md:overflow-visible md:pb-0 md:pl-0 md:pr-0"
              ref={newDropsRef}
              onMouseEnter={() => setDropsPaused(true)}
              onMouseLeave={() => setDropsPaused(false)}
              onTouchStart={() => setDropsPaused(true)}
              onTouchEnd={() => setDropsPaused(false)}
              onTouchCancel={() => setDropsPaused(false)}
            >
              <div className="flex min-w-full snap-x snap-mandatory gap-4 md:grid md:min-w-0 md:grid-cols-2 md:gap-6 md:snap-none lg:grid-cols-3">
                {newDrops.map((item) => (
                  <motion.article
                    key={`drop-${item.id}`}
                    className="snap-start w-72 shrink-0 rounded-[28px] border border-white/15 bg-white/5 p-4 text-white backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.35)] sm:w-80 md:w-full md:shrink md:snap-none"
                    data-drop-card
                    whileHover={{ y: -6 }}
                    transition={{ duration: 0.4 }}
                  >
                    <div className="relative h-40 overflow-hidden rounded-2xl border border-white/15">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="(min-width: 1024px) 31vw, (min-width: 768px) 48vw, 288px"
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full border border-white/30 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.35em]">
                        New
                      </div>
                    </div>
                    <div className="mt-4 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-xs uppercase tracking-[0.35em] text-white/50">Chef’s lab</p>
                          <h3 className="text-lg font-semibold">{item.name}</h3>
                        </div>
                        <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm font-semibold">
                          ${item.price.toFixed(2)}
                        </span>
                      </div>
                      <p className="text-sm text-white/70">{item.description}</p>
                      <div className="flex flex-wrap gap-2 text-[10px] font-semibold uppercase tracking-[0.35em]">
                        {item.categories
                          .filter((category) => highlightCategories.includes(category))
                          .map((category) => {
                            const Icon = categoryPillIcons[category];
                            const className =
                              categoryPillClasses[category] ?? "border-white/15 bg-white/5 text-white/60";
                            return (
                              <span
                                key={`${item.id}-${category}-drop`}
                                className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 ${className}`}
                              >
                                {Icon && <Icon className="h-3 w-3" />}
                                {category}
                              </span>
                            );
                          })}
                      </div>
                      <Button
                        className="w-full rounded-2xl bg-gradient-to-r from-red-500 via-rose-500 to-orange-400 py-2 text-sm font-semibold shadow-glow"
                        onClick={() => handleAddToCart(item)}
                      >
                        Add to cart
                      </Button>
                    </div>
                  </motion.article>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {toasts.length > 0 && (
        <div className="pointer-events-none fixed bottom-6 right-4 z-50 flex flex-col gap-3">
          <AnimatePresence>
            {toasts.map((toast) => (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.35 }}
                className="pointer-events-auto rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white shadow-[0_15px_35px_rgba(0,0,0,0.35)] backdrop-blur-2xl"
              >
                <p className="text-xs uppercase tracking-[0.4em] text-white/50">Cart Updated</p>
                <div className="mt-1 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold">{toast.item}</p>
                    <p className="text-white/70 text-xs">x{toast.qty} added</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCart(true);
                      setToasts((prev) => prev.filter((t) => t.id !== toast.id));
                    }}
                    className="rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-white/80 hover:text-white"
                  >
                    View Cart →
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {notices.length > 0 && (
        <div className="pointer-events-none fixed right-4 top-24 z-[70] flex w-[min(92vw,360px)] flex-col gap-3 sm:top-28">
          <AnimatePresence>
            {notices.map((notice) => (
              <motion.div
                key={notice.id}
                initial={{ opacity: 0, y: -12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                className={`pointer-events-auto rounded-2xl border px-4 py-3 text-sm shadow-[0_20px_60px_rgba(0,0,0,0.4)] backdrop-blur-2xl ${
                  notice.tone === "error"
                    ? "border-rose-300/35 bg-rose-500/15 text-rose-50"
                    : notice.tone === "success"
                      ? "border-emerald-200/35 bg-emerald-300/15 text-emerald-50"
                      : "border-white/20 bg-white/10 text-white"
                }`}
              >
                {notice.message}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {activeOrderId && (
        <div className="pointer-events-none fixed bottom-6 left-4 z-40 w-[min(90vw,360px)] rounded-2xl border border-white/15 bg-white/10 p-4 text-sm text-white shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
          <p className="text-xs uppercase tracking-[0.4em] text-white/60">Order #{activeOrderId}</p>
          <div className="mt-3 flex justify-between text-[10px] uppercase tracking-[0.3em]">
            {trackerStages.map((stage, index) => (
              <span key={stage} className={index <= trackerStep ? "text-white" : "text-white/40"}>
                {stage}
              </span>
            ))}
          </div>
          <div className="relative mt-3 h-1.5 rounded-full bg-white/10">
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-red-500 via-rose-500 to-orange-400"
              animate={{ width: `${(trackerStep / (trackerStages.length - 1)) * 100}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </div>
        </div>
      )}

      <section id="menu" className="mt-8 grid grid-cols-1 gap-5 px-4 sm:grid-cols-2 sm:px-6 md:px-8 md:gap-6 lg:grid-cols-3">
        {filteredMenu.map((item) => (
          <MenuItemCard
            key={item.id}
            item={item}
            quantity={qtyById[item.id] ?? 1}
            justAdded={!!justAdded[item.id]}
            onAddToCart={handleAddToCart}
            onDecreaseQuantity={decQty}
            onIncreaseQuantity={incQty}
            onViewDetails={setSelectedItem}
          />
        ))}
      </section>

      <AnimatePresence>
        {selectedItem && (
          <DishDetailSheet
            item={selectedItem}
            onClose={() => setSelectedItem(null)}
            onAddToCart={(item, origin) => {
              handleAddToCart(item, origin);
              setSelectedItem(null);
            }}
          />
        )}
      </AnimatePresence>

      <nav
        className="fixed bottom-3 left-4 right-4 z-40 rounded-[28px] border border-white/15 bg-white/10 px-4 pb-[calc(env(safe-area-inset-bottom,0px)_+_0.5rem)] pt-3 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.4)] sm:hidden"
      >
        <div className="flex items-center justify-between text-white/80">
          <button
            onClick={() => setShowCart(true)}
            className="flex flex-col items-center gap-1 text-xs font-semibold uppercase tracking-[0.3em]"
          >
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white/10">
              <ShoppingCart className="h-5 w-5" />
            </span>
            Cart
          </button>
          <button
            onClick={() => setShowReserve(true)}
            className="flex flex-col items-center gap-1 text-xs font-semibold uppercase tracking-[0.3em]"
          >
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white/10">
              <Calendar className="h-5 w-5" />
            </span>
            Book
          </button>
          <button
            onClick={() => setShowLoyalty(true)}
            className="flex flex-col items-center gap-1 text-xs font-semibold uppercase tracking-[0.3em]"
          >
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white/10">
              <Gift className="h-5 w-5" />
            </span>
            Rewards
          </button>
          <button
            onClick={() => setShowProfile(true)}
            className="flex flex-col items-center gap-1 text-xs font-semibold uppercase tracking-[0.3em]"
          >
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white/10">
              <User className="h-5 w-5" />
            </span>
            Profile
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {showCart && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 260, damping: 32 }}
            className="fixed inset-x-0 bottom-0 z-[55] rounded-t-[40px] border border-white/15 bg-brand-midnight/95 text-white shadow-[0_-20px_80px_rgba(0,0,0,0.75)] backdrop-blur-2xl"
          >
            <div className="mx-auto w-full max-w-4xl px-4 py-4 sm:px-6">
              <div className="flex justify-center">
                <span className="h-1.5 w-16 rounded-full bg-white/25" />
              </div>
              <div className="mt-3 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-white/50">Your Tray</p>
                  <h2 className="text-2xl font-semibold">Checkout</h2>
                </div>
                <button
                  onClick={() => setShowCart(false)}
                  aria-label="Close cart"
                  className="rounded-full border border-white/15 bg-white/5 p-2 text-white/80 transition hover:bg-white/10"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="mt-4 max-h-[52vh] overflow-y-auto pr-2">
                {cartSheetReady ? (
                  cart.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/20 bg-white/5 py-12 text-center">
                      <span className="mb-3 text-5xl">🍣</span>
                      <p className="text-lg font-semibold">Your tray is empty</p>
                      <p className="text-sm text-white/60">Start with a chef favorite or build an omakase set.</p>
                      <button
                        type="button"
                        onClick={() => {
                          document.querySelector("#menu")?.scrollIntoView({ behavior: "smooth" });
                          setShowCart(false);
                        }}
                        className="mt-4 rounded-full border border-white/20 bg-white/10 px-5 py-2 text-sm font-semibold uppercase tracking-[0.3em] text-white/80 hover:text-white"
                      >
                        Browse menu
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-3">
                        {groupedCart.map(({ item, qty }) => (
                          <div key={item.id} className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-innerGlass">
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <p className="font-semibold">{item.name}</p>
                                <p className="text-xs text-white/60">${item.price.toFixed(2)} each</p>
                              </div>
                              <div className="text-right text-sm text-white/70">
                                <p>Total</p>
                                <p className="text-lg font-semibold text-white">${(item.price * qty).toFixed(2)}</p>
                              </div>
                            </div>
                            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-dashed border-white/15 pt-3 text-sm">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => decCartItem(item.id)}
                                  className="grid h-9 w-9 place-items-center rounded-full border border-white/20 bg-white/5 text-lg text-white transition hover:bg-white/10 active:scale-95"
                                >
                                  –
                                </button>
                                <span className="min-w-[2ch] text-lg font-semibold">{qty}</span>
                                <button
                                  onClick={() => incCartItem(item.id)}
                                  className="grid h-9 w-9 place-items-center rounded-full border border-white/20 bg-white/5 text-lg text-white transition hover:bg-white/10 active:scale-95"
                                >
                                  +
                                </button>
                              </div>
                              <button
                                onClick={() => removeLine(item.id)}
                                className="text-xs uppercase tracking-[0.3em] text-white/60 hover:text-white"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 grid gap-4">
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                          <label className="text-xs uppercase tracking-[0.4em] text-white/50">Promo</label>
                          <div className="mt-2 flex gap-2">
                            <Input
                              placeholder="WELCOME10"
                              value={promoCode}
                              onChange={(e) => setPromoCode(e.target.value)}
                              className="h-11 rounded-2xl border-white/20 bg-transparent text-white placeholder:text-white/40 focus-visible:ring-0 focus-visible:ring-offset-0"
                            />
                            <Button
                              variant="outline"
                              className="rounded-2xl border-white/30 bg-white/10 text-white hover:bg-white/15"
                              onClick={() => setAppliedPromo(promoCode || null)}
                            >
                              Apply
                            </Button>
                          </div>
                          {appliedPromo && <p className="mt-2 text-xs text-emerald-300">Applied {appliedPromo.toUpperCase()}</p>}
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                          <label className="text-xs uppercase tracking-[0.4em] text-white/50">Tip</label>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {[0, 10, 15, 20].map((p) => (
                              <button
                                key={p}
                                onClick={() => setTipPercent(p)}
                                className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition ${
                                  tipPercent === p ? "border-white/60 bg-white/20" : "border-white/15 bg-white/5 hover:border-white/25"
                                }`}
                              >
                                {p === 0 ? "No tip" : `${p}%`}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </>
                  )
                ) : (
                  <div className="space-y-3">
                    {[0, 1, 2].map((idx) => (
                      <div key={idx} className="animate-pulse rounded-3xl border border-white/10 bg-white/5 p-5">
                        <div className="h-4 w-1/2 rounded bg-white/20" />
                        <div className="mt-3 h-3 w-full rounded bg-white/10" />
                        <div className="mt-3 h-3 w-2/3 rounded bg-white/10" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="mt-4 rounded-3xl border border-white/10 bg-white/5 p-4 shadow-innerGlass">
                <div className="flex flex-wrap items-center gap-2">
                  {[
                    { type: "Pickup", icon: Store },
                    { type: "Delivery", icon: MapPin },
                  ].map(({ type, icon: Icon }) => (
                    <button
                      key={type}
                      onClick={() => setOrderType(type as "Pickup" | "Delivery")}
                      className={`flex flex-1 items-center justify-center gap-2 rounded-2xl border px-3 py-2 text-sm font-semibold transition ${
                        orderType === type ? "border-white/60 bg-white/20" : "border-white/15 bg-white/5 hover:border-white/30"
                      }`}
                    >
                      <Icon className="h-4 w-4" /> {type}
                    </button>
                  ))}
                </div>
                <div className="mt-4 space-y-2 text-sm text-white/70">
                  <div className="flex justify-between"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                  {appliedPromo && promoDiscount > 0 && (
                    <div className="flex justify-between text-emerald-300">
                      <span>Promo</span>
                      <span>- ${promoDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between"><span>Tax</span><span>${tax.toFixed(2)}</span></div>
                  {tipPercent > 0 && (
                    <div className="flex justify-between"><span>Tip</span><span>${tip.toFixed(2)}</span></div>
                  )}
                  <div className="flex justify-between border-t border-white/10 pt-2 text-base font-semibold text-white">
                    <span>Total</span>
                    <span>${grandTotal.toFixed(2)}</span>
                  </div>
                </div>
                <Button
                  className="group relative mt-4 w-full overflow-hidden rounded-2xl border-0 bg-gradient-to-r from-red-500 via-rose-500 to-orange-400 py-3 text-base font-semibold text-white shadow-glow"
                  onClick={() => setShowPayment(true)}
                >
                  <span className="absolute inset-0 bg-white/10 opacity-0 transition group-hover:opacity-100" />
                  <span className="relative">Checkout</span>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {showPayment && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-[90vw] max-w-md rounded-[32px] border border-white/15 bg-brand-midnight/95 p-6 text-white shadow-[0_30px_80px_rgba(0,0,0,0.6)]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-white/50">Payment</p>
                <h2 className="text-2xl font-semibold">Finish Order</h2>
              </div>
              <button onClick={() => setShowPayment(false)} aria-label="Close payment" className="rounded-full border border-white/20 bg-white/5 p-2 text-white/70 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            {orderType === "Delivery" && (
              <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.4em] text-white/50">Delivery address</p>
                <Input
                  placeholder="Street, City"
                  value={profile.deliveryAddress}
                  onChange={(e) => setProfile((prev) => ({
                    ...prev,
                    deliveryAddress: e.target.value,
                    address: prev.address || e.target.value,
                  }))}
                  className="mt-2 h-11 rounded-2xl border-white/20 bg-transparent text-white placeholder:text-white/40 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>
            )}
            <div className="mt-4 flex flex-col gap-3">
              <Button
                className="flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/15 text-white hover:bg-white/20"
                onClick={() => handleCheckout("Credit Card")}
              >
                <CreditCard className="h-4 w-4" /> Pay with Card
              </Button>
              <Button
                className="flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/15 text-white hover:bg-white/20"
                onClick={() => handleCheckout("Apple Pay")}
              >
                <Smartphone className="h-4 w-4" /> Apple Pay
              </Button>
              <Button
                variant="outline"
                className="rounded-2xl border-white/20 bg-white/5 text-white hover:bg-white/10"
                onClick={() => setShowPayment(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {showReserve && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-[92vw] max-w-2xl rounded-[32px] border border-white/15 bg-brand-midnight/95 p-6 text-white shadow-[0_30px_80px_rgba(0,0,0,0.65)]"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-white/50">Reservations</p>
                <h2 className="text-2xl font-semibold">Reserve the Counter</h2>
              </div>
              <button
                onClick={() => {
                  setShowReserve(false);
                  setEditingResId(null);
                }}
                aria-label="Close reservations"
                className="rounded-full border border-white/20 bg-white/5 p-2 text-white/70 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <label className="text-xs uppercase tracking-[0.4em] text-white/50">Date & Time</label>
                <Input
                  type="datetime-local"
                  value={reservationDT}
                  onChange={(e) => setReservationDT(e.target.value)}
                  className="mt-2 h-11 rounded-2xl border-white/20 bg-transparent text-white focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.4em] text-white/50">Guests</label>
                <Input
                  type="number"
                  min={1}
                  value={reservationGuests}
                  onChange={(e) => setReservationGuests(Math.max(1, Number(e.target.value)))}
                  className="mt-2 h-11 rounded-2xl border-white/20 bg-transparent text-white focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>
            </div>
            <Button
              className="group relative mt-4 w-full overflow-hidden rounded-2xl border-0 bg-gradient-to-r from-red-500 via-rose-500 to-orange-400 py-3 text-base font-semibold text-white shadow-glow"
              onClick={saveReservation}
            >
              <span className="absolute inset-0 bg-white/10 opacity-0 transition group-hover:opacity-100" />
              <span className="relative">{editingResId ? "Update Reservation" : "Save Reservation"}</span>
            </Button>
            <div className="mt-4 rounded-2xl border border-dashed border-white/20 bg-white/5 p-4">
              <div className="mb-3 flex items-center gap-2 text-sm uppercase tracking-[0.4em] text-white/60">
                <Calendar className="h-4 w-4" />
                Upcoming tables
              </div>
              {reservations.length === 0 ? (
                <p className="text-sm text-white/60">Your table is waiting in the future. Book the first slot!</p>
              ) : (
                <div className="space-y-3 max-h-56 overflow-y-auto pr-2">
                  {reservations.map((r) => (
                    <div key={r.id} className="rounded-xl border border-white/10 bg-white/5 p-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-semibold">{formatDT(r.datetime)}</span>
                        <span className="text-white/60">{r.guests} guests</span>
                      </div>
                      <div className="mt-3 flex items-center justify-end gap-2 text-xs uppercase tracking-[0.3em]">
                        <button
                          onClick={() => startEditReservation(r)}
                          className="rounded-full border border-white/20 bg-white/5 px-3 py-1 hover:border-white/40"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => cancelReservation(r.id)}
                          className="rounded-full border border-rose-400/60 bg-rose-500/20 px-3 py-1 text-rose-100 hover:bg-rose-500/30"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}

      {showLoyalty && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-[90vw] max-w-md rounded-[32px] border border-white/15 bg-brand-midnight/95 p-6 text-white shadow-[0_30px_80px_rgba(0,0,0,0.6)]"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-white/50">Loyalty</p>
                <h2 className="text-2xl font-semibold">Sushi Bliss Rewards</h2>
              </div>
              <button onClick={() => setShowLoyalty(false)} aria-label="Close loyalty" className="rounded-full border border-white/20 bg-white/5 p-2 text-white/70 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mt-3 text-sm text-white/70">Earn 5 points every time you add an item to your cart.</p>
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-baseline justify-between">
                <p className="text-sm uppercase tracking-[0.4em] text-white/50">Current cycle</p>
                <p className="text-lg font-semibold">{loyaltyPoints} pts</p>
              </div>
              <div
                className="mt-3 grid grid-cols-10 gap-1"
                role="progressbar"
                aria-label="Loyalty reward progress"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={loyaltyPoints % 100}
              >
                {Array.from({ length: 10 }, (_, segment) => segment).map((segment) => (
                  <span
                    key={segment}
                    className={`h-3 rounded-full ${
                      segment < loyaltyProgressSegments
                        ? "bg-gradient-to-r from-emerald-400 via-cyan-400 to-rose-400 shadow-neon"
                        : "bg-white/10"
                    }`}
                  />
                ))}
              </div>
              <p className="mt-2 text-xs uppercase tracking-[0.4em] text-white/60">
                {pointsToNextReward(loyaltyPoints)} pts until next roll
              </p>
            </div>
            <div className="mt-4 rounded-2xl border border-dashed border-white/25 bg-white/5 p-4 text-sm text-white/70">
              <p>Collect 100 points to unlock a chef’s choice roll on the house.</p>
              {loyaltyPoints >= 100 && (
                <Button className="group relative mt-4 w-full overflow-hidden rounded-2xl border-0 bg-gradient-to-r from-emerald-400 via-cyan-400 to-rose-400 py-3 font-semibold text-brand-ink" onClick={handleRedeemReward}>
                  Redeem Free Roll
                </Button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}

      {showProfile && (
        <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="fixed bottom-0 left-0 right-0 z-50 rounded-t-[40px] border border-white/15 bg-brand-midnight/95 p-6 text-white shadow-[0_-20px_80px_rgba(0,0,0,0.7)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-white/50">Profile</p>
              <h2 className="text-2xl font-semibold">Guest Profile</h2>
            </div>
            <button onClick={() => setShowProfile(false)} aria-label="Close profile" className="rounded-full border border-white/15 bg-white/5 p-2 text-white/70 hover:text-white">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="mt-4 max-h-[65vh] overflow-y-auto pr-2">
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { label: "Name", value: profile.name, onChange: (val: string) => setProfile({ ...profile, name: val }), type: "text", placeholder: "Full name" },
                { label: "Email", value: profile.email, onChange: (val: string) => setProfile({ ...profile, email: val }), type: "email", placeholder: "you@example.com" },
                { label: "Phone", value: profile.phone, onChange: (val: string) => setProfile({ ...profile, phone: val }), type: "text", placeholder: "+81 ..." },
                {
                  label: "Address",
                  value: profile.address,
                  onChange: (val: string) => setProfile((prev) => ({
                    ...prev,
                    address: val,
                    deliveryAddress: prev.deliveryAddress || val,
                  })),
                  type: "text",
                  placeholder: "Street, City, Country",
                },
              ].map((field) => (
                <div key={field.label}>
                  <label className="text-xs uppercase tracking-[0.4em] text-white/50">{field.label}</label>
                  <Input
                    type={field.type as "text" | "email"}
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                    placeholder={field.placeholder}
                    className="mt-2 h-11 rounded-2xl border-white/20 bg-transparent text-white placeholder:text-white/40 focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </div>
              ))}
              <div className="sm:col-span-2">
                <label className="text-xs uppercase tracking-[0.4em] text-white/50">Dietary preferences</label>
                <Input
                  value={profile.dietary}
                  onChange={(e) => setProfile({ ...profile, dietary: e.target.value })}
                  placeholder="Vegan, no peanuts..."
                  className="mt-2 h-11 rounded-2xl border-white/20 bg-transparent text-white placeholder:text-white/40 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>
            </div>
            <div className="mt-4 rounded-2xl border border-white/15 bg-white/5 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-white/50">Marketing Opt-in</p>
                  <p className="text-sm text-white/70">Receive deals, drops, and omakase alerts.</p>
                </div>
                <button
                  onClick={() => setProfile({ ...profile, marketingOptIn: !profile.marketingOptIn })}
                  className={`relative flex h-10 w-20 items-center rounded-full border border-white/20 px-1 transition ${
                    profile.marketingOptIn ? "bg-gradient-to-r from-emerald-400 to-cyan-400" : "bg-white/10"
                  }`}
                >
                  <span
                    className={`inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-brand-ink transition ${
                      profile.marketingOptIn ? "translate-x-9" : "translate-x-0"
                    }`}
                  >
                    <Gift className="h-4 w-4" />
                  </span>
                </button>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <Button className="rounded-2xl border-0 bg-gradient-to-r from-red-500 via-rose-500 to-orange-400 px-6 py-3 font-semibold" onClick={saveProfile}>
                Save Profile
              </Button>
            </div>
            <div className="mt-6 rounded-2xl border border-dashed border-white/20 bg-white/5 p-4">
              <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.4em] text-white/60">
                <Calendar className="h-4 w-4" />
                Reservations
              </div>
              {reservations.length === 0 ? (
                <p className="text-sm text-white/60">No reservations yet.</p>
              ) : (
                <div className="space-y-2">
                  {reservations.map((r) => (
                    <div key={r.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3 text-sm">
                      <div>
                        <p className="font-semibold">{formatDT(r.datetime)}</p>
                        <p className="text-white/60">{r.guests} guests</p>
                      </div>
                      <div className="flex gap-2">
                        <button className="rounded-full border border-white/20 px-3 py-1" onClick={() => startEditReservation(r)}>
                          Edit
                        </button>
                        <button className="rounded-full border border-rose-400/60 px-3 py-1 text-rose-200" onClick={() => cancelReservation(r.id)}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="mt-6 rounded-2xl border border-dashed border-white/20 bg-white/5 p-4">
              <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.4em] text-white/60">
                <ShoppingCart className="h-4 w-4" />
                Order history
              </div>
              {orderHistory.length === 0 ? (
                <p className="text-sm text-white/60">No orders yet.</p>
              ) : (
                <div className="space-y-2">
                  {orderHistory.map((o) => (
                    <div key={o.id} className="rounded-xl border border-white/10 bg-white/5 p-3">
                      <details>
                        <summary className="cursor-pointer text-sm">
                          <span className="font-semibold">Order #{o.id}</span> • {o.type} • {new Date(o.ts).toLocaleDateString()}
                          <span className="float-right font-semibold text-white">${o.total.toFixed(2)}</span>
                        </summary>
                        <div className="mt-2 text-sm text-white/70">
                          {o.items.map((it, idx) => (
                            <div key={idx} className="flex items-center justify-between py-1">
                              <span>{it.name}</span>
                              <span>${(it.price ?? 0).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </details>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {confirmDlg.open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-[90vw] max-w-sm rounded-2xl border border-white/15 bg-brand-midnight/95 p-6 text-white shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
            <h2 className="mb-3 text-lg font-semibold">Confirm</h2>
            <p className="mb-4 text-sm text-white/70">{confirmDlg.message}</p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" className="rounded-xl border-white/20 bg-white/5 text-white hover:bg-white/10" onClick={() => setConfirmDlg({ open: false, message: "", onYes: null })}>
                No
              </Button>
              <Button className="rounded-xl border-0 bg-gradient-to-r from-red-500 via-rose-500 to-orange-400 px-5" onClick={() => { const ok = confirmDlg.onYes; setConfirmDlg({ open: false, message: "", onYes: null }); ok && ok(); }}>
                Yes
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      <footer className="mt-12 border-t border-white/10 p-6 text-center text-white/70">
        <div className="mb-3 flex justify-center gap-4">
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"><Facebook className="h-6 w-6 text-white/70" /></a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"><Instagram className="h-6 w-6 text-white/70" /></a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"><Twitter className="h-6 w-6 text-white/70" /></a>
        </div>
        <p className="text-sm">Sushi Bliss Restaurant</p>
        <p className="text-sm text-white/60">123 Ocean Avenue, Tokyo, Japan</p>
        <div className="mt-1 flex items-center justify-center gap-1 text-sm text-white/60">
          <MapPin className="h-4 w-4" />
          <span>Open: Mon–Sun 11 AM – 10 PM</span>
        </div>
        <p className="mt-4 text-xs text-white/40">© 2025 Sushi Bliss — Crafted with ❤️ by Nick</p>
      </footer>
    </div>
  );
}

/** Paints the ambient restaurant backdrop with CSS classes so the app keeps a strict no-inline-styles rule. */
function DynamicBackground({ darkMode }: { darkMode: boolean }) {
  const glyphs = [
    { icon: "🍣", className: "left-[5%] top-[10%]", rotate: 6 },
    { icon: "🥢", className: "left-[30%] top-[28%]", rotate: -6 },
    { icon: "🍥", className: "left-[54%] top-[46%]", rotate: 5 },
    { icon: "🍱", className: "left-[76%] top-[64%]", rotate: -5 },
  ];

  return (
    <div className={`fixed inset-0 -z-10 overflow-hidden ${darkMode ? "app-background-night" : "app-background"}`}>
      <div className="absolute inset-0 ambient-grid opacity-20" />
      <motion.div
        className="absolute -left-32 -top-32 h-[60vw] w-[60vw] rounded-full bg-rose-500/20 blur-3xl"
        animate={{ x: ["-10%", "5%", "-10%"], y: ["-8%", "2%", "-8%"], scale: [1, 1.08, 1] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-40 -right-40 h-[65vw] w-[65vw] rounded-full bg-cyan-300/15 blur-3xl"
        animate={{ x: ["10%", "-4%", "10%"], y: ["6%", "-2%", "6%"], scale: [1.05, 1.12, 1.05] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(255,255,255,0.08),transparent_55%)]"
        animate={{ opacity: [0.4, 0.65, 0.4], rotate: [0, 2, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      {glyphs.map((glyph, index) => (
        <motion.div
          key={glyph.icon}
          className={`pointer-events-none absolute select-none text-5xl text-white opacity-[0.08] sm:text-6xl ${glyph.className}`}
          animate={{ y: ["0%", "12%", "-8%"], rotate: [0, glyph.rotate, 0] }}
          transition={{ duration: 24 + index * 3, repeat: Infinity, ease: "easeInOut", delay: index * 1.5 }}
        >
          {glyph.icon}
        </motion.div>
      ))}
    </div>
  );
}

/** Renders the first-viewport brand moment with food-first imagery and direct ordering actions. */
function HeroCard({
  images,
  darkMode,
  index,
  onReserve,
  compact,
}: {
  images: string[];
  darkMode: boolean;
  index: number;
  onReserve: () => void;
  compact?: boolean;
}) {
  const currentImage = images[index] ?? images[0];
  const heightClass = "min-h-[640px]";
  const heroHighlights = [
    { title: "Signature flight", subtitle: "Chef-curated omakase tonight", icon: Sparkles },
    { title: "Fresh drop", subtitle: "Hokkaido uni arrives daily", icon: Compass },
    { title: "Plant set", subtitle: "Garden-focused maki and nigiri", icon: Leaf },
    { title: "Torch finish", subtitle: "Scallop, eel glaze, and spice", icon: Flame },
  ];
  const visibleHighlights = compact ? heroHighlights.slice(0, 2) : heroHighlights;
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`relative overflow-hidden rounded-[30px] border border-white/15 bg-black/30 ${heightClass} premium-edge sm:rounded-[36px]`}
    >
      <Image
        src={currentImage}
        alt=""
        fill
        priority
        sizes="(min-width: 1024px) 1100px, 100vw"
        className="object-cover"
      />
      <div className={`absolute inset-0 ${darkMode ? "hero-vignette-night" : "hero-vignette"}`} />
      <div className="pointer-events-none absolute inset-0 ambient-grid opacity-20" />
      <motion.div
        className="pointer-events-none absolute -right-20 top-10 h-72 w-72 rounded-full bg-rose-400/25 blur-[110px]"
        animate={{ scale: [1, 1.1, 1], rotate: [0, 8, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="relative flex min-h-[inherit] flex-col justify-between px-5 py-8 sm:px-10 sm:py-12 lg:px-12">
        <div className="max-w-2xl text-white">
          <div className="inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs uppercase tracking-[0.35em] text-white/70">
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-300" />
            </span>
            Now open • 12–10 PM • 20 min avg prep
          </div>
          <h1 className="mt-6 font-display text-5xl font-extrabold leading-none text-white sm:text-6xl lg:text-7xl">
            Sushi Bliss
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-white/85 sm:text-lg">
            Futuristic omakase, market-fresh nigiri, and glass-lit ordering built for nights that feel like an event.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a href="#menu" className="inline-flex">
              <Button className="group relative overflow-hidden rounded-2xl border-0 bg-gradient-to-r from-red-500 via-rose-500 to-orange-400 px-6 py-3 text-base font-semibold shadow-glow hover:opacity-95">
                <span className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 transition group-hover:opacity-100" />
                <span className="relative flex items-center gap-2">
                  Order Now
                  <Sparkles className="w-4 h-4" />
                </span>
              </Button>
            </a>
            <Button
              variant="outline"
              onClick={onReserve}
              className="rounded-2xl border-white/40 bg-white/5 px-6 py-3 text-base text-white hover:bg-white/10"
            >
              <Calendar className="mr-2 h-4 w-4" /> Reserve a Table
            </Button>
          </div>
        </div>
        <div className="mt-8 grid gap-4 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div className="grid gap-3 text-sm text-white/80 sm:grid-cols-2">
            {visibleHighlights.map((card) => (
              <div key={card.title} className="hero-lens flex items-center gap-3 rounded-2xl border border-white/10 px-4 py-3 text-left shadow-innerGlass backdrop-blur-2xl">
                <card.icon className="h-5 w-5 text-white/70" />
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-white/50">{card.subtitle}</p>
                  <p className="text-base font-semibold text-white">{card.title}</p>
                </div>
              </div>
            ))}
          </div>
          {!compact && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="hero-lens rounded-2xl border border-white/20 p-4 text-sm shadow-innerGlass backdrop-blur-2xl"
            >
              <p className="text-xs uppercase tracking-[0.35em] text-white/60">Status: Live</p>
              <p className="text-lg font-semibold text-white mt-1">Tonight's Chef Feed</p>
              <div className="mt-3 space-y-1 text-white/80">
                <div className="flex items-center justify-between">
                  <span>Now open</span>
                  <span className="text-emerald-300">•</span>
                </div>
                <div className="flex items-center justify-between text-white/60 text-xs">
                  <span>Avg prep</span>
                  <span>20 min</span>
                </div>
                <div className="flex items-center justify-between text-white/60 text-xs">
                  <span>Seats</span>
                  <span>12 left</span>
                </div>
              </div>
            </motion.div>
          )}
        </div>
        <a href="#menu" className="mt-8 inline-flex items-center gap-2 text-sm text-white/80 hover:text-white">
          <span className="animate-bounce text-lg">↓</span> Explore Menu
        </a>
      </div>
    </motion.article>
  );
}
