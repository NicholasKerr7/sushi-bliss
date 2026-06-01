import Image from "next/image";
import { ChevronRight, CreditCard, Home, Pencil, Plus, Trash2 } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { getAppContent, getAssetsByFolder, getFeaturedAssets } from "../../data/selectors";
import { getSushiIconAssets } from "../../data/icon-assets";
import { formatReservationDateTime, type Reservation } from "../../lib/reservation-utils";
import { AssetIcon } from "../icons/AssetIcon";
import type { AppView } from "../layout/types";
import type { GuestProfile } from "../profile/types";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

interface ProfileUtilityProps {
  profile: GuestProfile;
  reservations?: Reservation[];
  onNavigate: (view: AppView) => void;
  onProfileChange: (profile: GuestProfile) => void;
  showNotice: (message: string, tone?: "success" | "error" | "info") => void;
}

interface AddressRecord {
  id: string;
  label: string;
  value: string;
  tag?: string;
  icon?: string;
}

interface PaymentRecord {
  id: string;
  label: string;
  detail: string;
  tag?: string;
  icon?: string;
}

const appContent = getAppContent();
const featuredAssets = getFeaturedAssets();
const ambienceAssets = getAssetsByFolder("ambience");
const iconAssets = getSushiIconAssets();

/** Resolves a quiet page background for account utility screens. */
function getUtilityBackground(): string {
  return ambienceAssets[0]?.publicUrl ?? featuredAssets.heroSushi.publicUrl;
}

/** Provides the shared mobile-first shell used by account utility screenshot pages. */
function UtilityScreenFrame({
  action,
  children,
  copy,
  onBack,
  title,
}: {
  action?: ReactNode;
  children: ReactNode;
  copy: string;
  onBack: () => void;
  title: string;
}) {
  const [lead, ...accentWords] = title.split(" ");

  return (
    <section className="relative -mx-4 min-h-[calc(100vh-80px)] overflow-hidden px-4 pb-6 pt-20 sm:-mx-6 sm:px-6 md:mx-0 md:min-h-0 md:rounded-[28px] md:px-0 md:pt-2">
      <Image src={getUtilityBackground()} alt="" fill sizes="100vw" className="-z-10 object-cover opacity-20 md:hidden" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-black/40 via-black/84 to-black md:hidden" />
      <button
        type="button"
        aria-label="Go back"
        onClick={onBack}
        className="grid h-12 w-12 place-items-center rounded-full border border-[var(--sb-border)] bg-black/52 text-[var(--sb-gold)] backdrop-blur-xl transition hover:border-[var(--sb-gold)]"
      >
        <ChevronRight className="h-5 w-5 rotate-180" />
      </button>
      <header className="luxury-panel mt-6 flex flex-col gap-4 p-5 md:mt-0 md:p-7 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="editorial-title text-[42px] leading-none text-white md:text-[60px]">
            {lead} <span className="text-[var(--sb-red-bright)]">{accentWords.join(" ")}</span>
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--sb-gold)]">{copy}</p>
        </div>
        {action}
      </header>
      <div className="mt-5 space-y-4">{children}</div>
    </section>
  );
}

/** Returns the user's saved address records from profile and shared demo data. */
function getAddressRecords(profile: GuestProfile): AddressRecord[] {
  return [
    {
      id: "home",
      label: "Home",
      value: profile.deliveryAddress || appContent.member.deliveryAddress,
      tag: "Default",
      icon: iconAssets.home,
    },
    {
      id: "work",
      label: "Work",
      value: "32-1 Shibuya, Tokyo, 150-0002, Japan",
      icon: iconAssets.orders,
    },
    {
      id: "parents",
      label: "Parent's Home",
      value: "45 Sakura Avenue, Tokyo, 100-0041, Japan",
      icon: iconAssets.group,
    },
    {
      id: "vacation",
      label: "Vacation Home",
      value: "8-9 Kamakura Beach, Kanagawa, 248-0016, Japan",
      icon: iconAssets.star,
    },
    {
      id: "office",
      label: "Office",
      value: "25-3 Marunouchi, Tokyo, 100-0005, Japan",
      icon: iconAssets.dining,
    },
  ];
}

/** Shows the mobile saved-addresses screen with editable address rows. */
export function SavedAddressesView({ profile, onNavigate }: ProfileUtilityProps) {
  return (
    <UtilityScreenFrame
      title="Saved Addresses"
      copy="Manage your delivery addresses."
      onBack={() => onNavigate("profile")}
      action={
        <Button className="red-glow-button h-12 rounded-[14px] uppercase tracking-[0.14em]" onClick={() => onNavigate("addAddress")}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Address
        </Button>
      }
    >
      <section className="grid gap-3 lg:grid-cols-2">
        {getAddressRecords(profile).map((address) => (
          <AddressCard key={address.id} address={address} onEdit={() => onNavigate("addAddress")} />
        ))}
      </section>
    </UtilityScreenFrame>
  );
}

/** Displays one saved address row with edit affordance and icon asset. */
function AddressCard({ address, onEdit }: { address: AddressRecord; onEdit: () => void }) {
  return (
    <article className="grid grid-cols-[64px_1fr_auto] items-center gap-4 rounded-[18px] border border-[var(--sb-border)] bg-black/52 p-4 backdrop-blur-xl">
      <span className="grid h-14 w-14 place-items-center rounded-full border border-[var(--sb-border)] bg-black/44">
        {address.icon ? <AssetIcon src={address.icon} size={30} /> : <Home className="h-6 w-6" />}
      </span>
      <span>
        <span className="flex items-center gap-2 text-lg text-white">
          {address.label}
          {address.tag ? <span className="rounded-full bg-[var(--sb-red)] px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-white">{address.tag}</span> : null}
        </span>
        <span className="mt-1 block text-sm leading-6 text-[var(--sb-muted)]">{address.value}</span>
      </span>
      <button type="button" aria-label={`Edit ${address.label}`} onClick={onEdit} className="grid h-10 w-10 place-items-center rounded-full border border-[var(--sb-border)] text-[var(--sb-gold)]">
        <Pencil className="h-4 w-4" />
      </button>
    </article>
  );
}

/** Renders the add-address form from the mobile screenshot and saves into profile state. */
export function AddAddressView({ profile, onNavigate, onProfileChange, showNotice }: ProfileUtilityProps) {
  const [label, setLabel] = useState("Home");
  const [fullName, setFullName] = useState(profile.name);
  const [phone, setPhone] = useState(profile.phone);
  const [street, setStreet] = useState(profile.deliveryAddress || appContent.member.deliveryAddress);
  const [city, setCity] = useState(appContent.location.city);
  const [postalCode, setPostalCode] = useState("100-0001");
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [isDefault, setIsDefault] = useState(true);

  /** Validates and stores the composed delivery address in the guest profile. */
  const saveAddress = () => {
    if (!fullName.trim() || !phone.trim() || !street.trim()) {
      showNotice("Add a name, phone number, and street address.", "error");
      return;
    }
    const formattedAddress = `${street.trim()}, ${city.trim()}, ${postalCode.trim()}, Japan`;
    onProfileChange({ ...profile, name: fullName.trim(), phone: phone.trim(), deliveryAddress: formattedAddress });
    showNotice(`${label} address saved.`, "success");
    onNavigate("savedAddresses");
  };

  return (
    <UtilityScreenFrame title="Add Address" copy="Add a new address for seamless delivery." onBack={() => onNavigate("savedAddresses")}>
      <section className="luxury-panel p-5">
        <div className="grid gap-4 md:grid-cols-2">
          <UtilityField label="Label">
            <select value={label} onChange={(event) => setLabel(event.target.value)} className="h-[52px] w-full rounded-[12px] border border-[var(--sb-border)] bg-black/42 px-4 text-white">
              {["Home", "Work", "Parents", "Vacation"].map((option) => <option key={option}>{option}</option>)}
            </select>
          </UtilityField>
          <UtilityField label="Full Name">
            <Input value={fullName} onChange={(event) => setFullName(event.target.value)} className="h-[52px] rounded-[12px] border-[var(--sb-border)] bg-black/42 text-white" />
          </UtilityField>
          <UtilityField label="Phone Number">
            <Input value={phone} onChange={(event) => setPhone(event.target.value)} className="h-[52px] rounded-[12px] border-[var(--sb-border)] bg-black/42 text-white" />
          </UtilityField>
          <UtilityField label="Street Address">
            <Input value={street} onChange={(event) => setStreet(event.target.value)} className="h-[52px] rounded-[12px] border-[var(--sb-border)] bg-black/42 text-white" />
          </UtilityField>
          <UtilityField label="City">
            <Input value={city} onChange={(event) => setCity(event.target.value)} className="h-[52px] rounded-[12px] border-[var(--sb-border)] bg-black/42 text-white" />
          </UtilityField>
          <UtilityField label="Postal Code">
            <Input value={postalCode} onChange={(event) => setPostalCode(event.target.value)} className="h-[52px] rounded-[12px] border-[var(--sb-border)] bg-black/42 text-white" />
          </UtilityField>
          <UtilityField label="Delivery Notes (Optional)">
            <textarea value={deliveryNotes} onChange={(event) => setDeliveryNotes(event.target.value)} className="min-h-24 w-full rounded-[12px] border border-[var(--sb-border)] bg-black/42 px-4 py-3 text-white outline-none placeholder:text-[var(--sb-muted)]" placeholder="Add delivery instructions or notes" />
          </UtilityField>
          <label className="flex items-center justify-between rounded-[14px] border border-[var(--sb-border)] bg-black/42 px-4 py-3 text-white">
            Set as default address
            <input type="checkbox" checked={isDefault} onChange={(event) => setIsDefault(event.target.checked)} className="accent-[var(--sb-red)]" />
          </label>
        </div>
        <Button className="red-glow-button mt-5 h-14 w-full rounded-[14px] uppercase tracking-[0.14em]" onClick={saveAddress}>
          Save Address
        </Button>
      </section>
    </UtilityScreenFrame>
  );
}

/** Returns the payment methods shown across profile and checkout references. */
function getPaymentRecords(): PaymentRecord[] {
  return [
    { id: "visa", label: "Visa **** 4242", detail: "Expires 08/26", tag: "Default", icon: iconAssets.creditCard },
    { id: "mastercard", label: "Mastercard **** 8888", detail: "Expires 11/25", icon: iconAssets.creditCard },
    { id: "apple-pay", label: "Apple Pay", detail: "hiroshi.tanaka@icloud.com", icon: iconAssets.phone },
    { id: "paypal", label: "PayPal", detail: "hiroshi.tanaka@example.com", icon: iconAssets.email },
  ];
}

/** Renders the payment-methods screen with screenshot-style saved method rows. */
export function PaymentMethodsView({ onNavigate }: ProfileUtilityProps) {
  return (
    <UtilityScreenFrame
      title="Payment Methods"
      copy="Manage saved cards and digital wallets."
      onBack={() => onNavigate("profile")}
      action={
        <Button className="red-glow-button h-12 rounded-[14px] uppercase tracking-[0.14em]" onClick={() => onNavigate("addCard")}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Method
        </Button>
      }
    >
      <section className="luxury-panel divide-y divide-[var(--sb-border)] overflow-hidden p-0">
        {getPaymentRecords().map((method) => (
          <button key={method.id} type="button" onClick={() => onNavigate("addCard")} className="grid w-full grid-cols-[62px_1fr_auto] items-center gap-4 p-4 text-left transition hover:bg-white/[0.03]">
            <span className="grid h-12 w-12 place-items-center rounded-full border border-[var(--sb-border)] bg-black/42">
              {method.icon ? <AssetIcon src={method.icon} size={28} /> : <CreditCard className="h-5 w-5" />}
            </span>
            <span>
              <span className="flex items-center gap-2 text-lg text-white">
                {method.label}
                {method.tag ? <span className="rounded-full bg-[var(--sb-red)] px-2 py-0.5 text-[10px] uppercase text-white">{method.tag}</span> : null}
              </span>
              <span className="mt-1 block text-sm text-[var(--sb-muted)]">{method.detail}</span>
            </span>
            <ChevronRight className="h-5 w-5 text-[var(--sb-gold)]" />
          </button>
        ))}
      </section>
      <div className="flex items-center justify-center gap-3 text-sm text-[var(--sb-muted)]">
        {iconAssets.check ? <AssetIcon src={iconAssets.check} size={22} /> : null}
        Your payment information is encrypted and secure.
      </div>
    </UtilityScreenFrame>
  );
}

/** Renders the add-card form and stores the confirmation as a demo-only notice. */
export function AddCardView({ onNavigate, showNotice }: ProfileUtilityProps) {
  const [cardNumber, setCardNumber] = useState("4242 4242 4242 4242");
  const [cardName, setCardName] = useState(appContent.member.name);
  const [expiry, setExpiry] = useState("08/26");
  const [cvv, setCvv] = useState("123");
  const [billingAddress, setBillingAddress] = useState(appContent.member.deliveryAddress);
  const [isDefault, setIsDefault] = useState(true);

  /** Validates the visible card fields before returning to the payment list. */
  const saveCard = () => {
    if (cardNumber.replace(/\s/g, "").length < 12 || !cardName.trim() || !expiry.trim() || !cvv.trim()) {
      showNotice("Complete the card details before saving.", "error");
      return;
    }
    showNotice("Card saved.", "success");
    onNavigate("paymentMethods");
  };

  return (
    <UtilityScreenFrame title="Add Card" copy="Securely add a new payment method." onBack={() => onNavigate("paymentMethods")}>
      <section className="luxury-panel p-5">
        <div className="grid gap-4 md:grid-cols-2">
          <UtilityField label="Card Number">
            <Input value={cardNumber} onChange={(event) => setCardNumber(event.target.value)} className="h-[52px] rounded-[12px] border-[var(--sb-border)] bg-black/42 text-white" />
          </UtilityField>
          <UtilityField label="Name On Card">
            <Input value={cardName} onChange={(event) => setCardName(event.target.value)} className="h-[52px] rounded-[12px] border-[var(--sb-border)] bg-black/42 text-white" />
          </UtilityField>
          <UtilityField label="Expiry Date">
            <Input value={expiry} onChange={(event) => setExpiry(event.target.value)} className="h-[52px] rounded-[12px] border-[var(--sb-border)] bg-black/42 text-white" />
          </UtilityField>
          <UtilityField label="CVV">
            <Input value={cvv} onChange={(event) => setCvv(event.target.value)} className="h-[52px] rounded-[12px] border-[var(--sb-border)] bg-black/42 text-white" />
          </UtilityField>
          <UtilityField label="Billing Address">
            <Input value={billingAddress} onChange={(event) => setBillingAddress(event.target.value)} className="h-[52px] rounded-[12px] border-[var(--sb-border)] bg-black/42 text-white" />
          </UtilityField>
          <label className="flex items-center justify-between rounded-[14px] border border-[var(--sb-border)] bg-black/42 px-4 py-3 text-white">
            Set as default payment method
            <input type="checkbox" checked={isDefault} onChange={(event) => setIsDefault(event.target.checked)} className="accent-[var(--sb-red)]" />
          </label>
        </div>
        <Button className="red-glow-button mt-5 h-14 w-full rounded-[14px] uppercase tracking-[0.14em]" onClick={saveCard}>
          Save Card
        </Button>
      </section>
    </UtilityScreenFrame>
  );
}

/** Renders the dietary-preferences screen with grouped allergies and spice controls. */
export function DietaryPreferencesView({ profile, onNavigate, onProfileChange, showNotice }: ProfileUtilityProps) {
  const [selectedAllergies, setSelectedAllergies] = useState(["Shellfish"]);
  const [preferences, setPreferences] = useState(["No Artificial Additives"]);
  const [spiceLevel, setSpiceLevel] = useState("Mild");

  /** Toggles one choice inside a string list while keeping stable order. */
  const toggleChoice = (value: string, selected: string[], setSelected: (next: string[]) => void) => {
    setSelected(selected.includes(value) ? selected.filter((choice) => choice !== value) : [...selected, value]);
  };

  /** Persists dietary selections to the profile notes field. */
  const savePreferences = () => {
    onProfileChange({
      ...profile,
      dietary: [...selectedAllergies, ...preferences, `${spiceLevel} spice`].join(", "),
    });
    showNotice("Dietary preferences saved.", "success");
    onNavigate("profile");
  };

  return (
    <UtilityScreenFrame title="Dietary Preferences" copy="Tell us about preferences so we can prepare with care." onBack={() => onNavigate("profile")}>
      <section className="luxury-panel space-y-5 p-5">
        <PreferenceGroup title="Allergies & Sensitivities">
          {["Shellfish", "Fish", "Gluten", "Tree Nuts", "Soy", "Sesame", "Dairy", "Eggs"].map((choice) => (
            <ChoicePill key={choice} active={selectedAllergies.includes(choice)} label={choice} onClick={() => toggleChoice(choice, selectedAllergies, setSelectedAllergies)} />
          ))}
        </PreferenceGroup>
        <PreferenceGroup title="Ingredient Preferences">
          {["No Artificial Additives", "Low Sodium", "No MSG", "More Wasabi", "No Raw Fish", "Vegetarian"].map((choice) => (
            <ChoicePill key={choice} active={preferences.includes(choice)} label={choice} onClick={() => toggleChoice(choice, preferences, setPreferences)} />
          ))}
        </PreferenceGroup>
        <PreferenceGroup title="Spice Preference">
          {["Mild", "Medium", "Hot", "Extra Hot"].map((choice) => (
            <ChoicePill key={choice} active={spiceLevel === choice} label={choice} onClick={() => setSpiceLevel(choice)} />
          ))}
        </PreferenceGroup>
        <Button className="red-glow-button h-14 w-full rounded-[14px] uppercase tracking-[0.14em]" onClick={savePreferences}>
          Save Preferences
        </Button>
      </section>
    </UtilityScreenFrame>
  );
}

/** Renders reservation history using current reservations plus stable completed demos. */
export function ReservationHistoryView({ reservations = [], onNavigate }: ProfileUtilityProps) {
  const rows = useMemo(() => {
    const savedRows = reservations.map((reservation) => ({
      id: String(reservation.id),
      date: formatReservationDateTime(reservation.datetime),
      details: `${reservation.guests} Guests · ${getSeatingLabel(reservation.seating)}`,
      status: "Upcoming",
      image: featuredAssets.heroSushi.publicUrl,
      target: "reservationDetails" as AppView,
    }));
    return [
      ...savedRows,
      { id: "past-1", date: "May 19, 2024", details: "2 Guests · Chef's Counter", status: "Completed", image: ambienceAssets[1]?.publicUrl ?? featuredAssets.heroSushi.publicUrl, target: "reservationDetails" as AppView },
      { id: "past-2", date: "May 5, 2024", details: "4 Guests · Main Dining Room", status: "Completed", image: ambienceAssets[2]?.publicUrl ?? featuredAssets.heroSushi.publicUrl, target: "reservationDetails" as AppView },
      { id: "past-3", date: "April 21, 2024", details: "2 Guests · Lantern Terrace", status: "Cancelled", image: ambienceAssets[3]?.publicUrl ?? featuredAssets.heroSushi.publicUrl, target: "reservations" as AppView },
    ];
  }, [reservations]);

  return (
    <UtilityScreenFrame title="Reservation History" copy="A curated record of your unforgettable dining moments." onBack={() => onNavigate("profile")}>
      <div className="grid grid-cols-3 gap-2 rounded-full border border-[var(--sb-border)] bg-black/50 p-1">
        {["All", "Upcoming", "Past"].map((tab, index) => (
          <button key={tab} type="button" className={`h-11 rounded-full text-xs uppercase tracking-[0.14em] ${index === 0 ? "red-glow-button text-white" : "text-white/60"}`}>
            {tab}
          </button>
        ))}
      </div>
      <section className="space-y-3">
        {rows.map((row) => (
          <button key={row.id} type="button" onClick={() => onNavigate(row.target)} className="grid w-full grid-cols-[96px_1fr_auto] items-center gap-4 rounded-[18px] border border-[var(--sb-border)] bg-black/52 p-3 text-left backdrop-blur-xl">
            <span className="relative h-24 overflow-hidden rounded-[12px] border border-[var(--sb-border)]">
              <Image src={row.image} alt="" fill sizes="96px" className="object-cover" />
            </span>
            <span>
              <span className="block text-lg text-white">{row.date}</span>
              <span className="mt-1 block text-sm text-[var(--sb-muted)]">{row.details}</span>
            </span>
            <span className={`rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.12em] ${row.status === "Cancelled" ? "border-[rgba(239,47,37,0.5)] text-[var(--sb-red-bright)]" : "border-[var(--sb-border)] text-[var(--sb-gold)]"}`}>
              {row.status}
            </span>
          </button>
        ))}
      </section>
    </UtilityScreenFrame>
  );
}

/** Translates reservation seating values into polished customer labels. */
function getSeatingLabel(seating: Reservation["seating"]): string {
  if (seating === "Counter") return "Chef's Counter";
  if (seating === "Dining Room") return "Main Dining Room";
  return "Lantern Terrace";
}

/** Wraps a labeled account form control without relying on invalid nested labels. */
function UtilityField({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div>
      <p className="mb-2 text-xs uppercase tracking-[0.18em] text-[var(--sb-gold)]">{label}</p>
      {children}
    </div>
  );
}

/** Groups selectable preference chips under a gold section heading. */
function PreferenceGroup({ children, title }: { children: ReactNode; title: string }) {
  return (
    <section>
      <h2 className="text-sm uppercase tracking-[0.18em] text-[var(--sb-gold)]">{title}</h2>
      <div className="mt-3 flex flex-wrap gap-2">{children}</div>
    </section>
  );
}

/** Provides the reusable pill control for dietary choices. */
function ChoicePill({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-sm transition ${
        active ? "border-[var(--sb-red-bright)] bg-[var(--sb-red)]/24 text-white shadow-[0_0_18px_var(--sb-red-glow)]" : "border-[var(--sb-border)] bg-black/36 text-white/70"
      }`}
    >
      {label}
    </button>
  );
}
