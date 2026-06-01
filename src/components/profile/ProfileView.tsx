import Image from "next/image";
import type { ReactNode } from "react";
import { AssetIcon } from "../icons/AssetIcon";
import type { AppView } from "../layout/types";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import type { SushiMenuItem } from "../../data/menu";
import { getSushiIconAssets } from "../../data/icon-assets";
import { getAppContent, getAssetsByFolder, getFeaturedAssets, getItemById, getMenuItems } from "../../data/selectors";
import type { AssetRef } from "../../data/types";
import { formatCurrency } from "../../lib/format-utils";
import type { OrderHistoryEntry } from "../../lib/order-utils";
import { formatReservationDateTime, type Reservation } from "../../lib/reservation-utils";
import type { GuestProfile } from "./types";

interface ProfileViewProps {
  favorites: SushiMenuItem[];
  loyaltyPoints: number;
  orderHistory: OrderHistoryEntry[];
  profile: GuestProfile;
  profileImage: string;
  reservations: Reservation[];
  onNavigate: (view: AppView) => void;
  onProfileChange: (profile: GuestProfile) => void;
  onSelectItem: (item: SushiMenuItem) => void;
}

const ambienceAssets = getAssetsByFolder("ambience");
const appContent = getAppContent();
const featuredAssets = getFeaturedAssets();
const menuItems = getMenuItems();

const iconAssets = getSushiIconAssets();

/** Resolves optional profile assets to a safe public URL. */
function assetUrl(asset: AssetRef | undefined, fallback = featuredAssets.heroSushi.publicUrl): string {
  return asset?.publicUrl ?? fallback;
}

/** Maps profile shortcut labels to the app section they should open. */
function getProfileShortcutTarget(label: string): AppView {
  if (label === "Rewards") return "loyalty";
  if (label === "Support") return "contact";
  if (label === "Reservations") return "reservations";
  if (label === "Settings") return "accountSettings";
  return "profile";
}

/** Renders the profile dashboard shown in the desktop and mobile references. */
export function ProfileView({
  profile,
  favorites,
  reservations,
  orderHistory,
  loyaltyPoints,
  profileImage,
  onProfileChange,
  onNavigate,
  onSelectItem,
}: ProfileViewProps) {
  const nextReservation = reservations[0];
  const progressValue = Math.min(loyaltyPoints, appContent.member.maxTierPoints);
  const preferredItem = favorites[0] ?? getItemById("otoro-nigiri") ?? menuItems[0];

  return (
    <div className="space-y-5">
      <section className="luxury-panel relative overflow-hidden p-5 sm:p-7">
        <Image src={assetUrl(ambienceAssets[0])} alt="" fill sizes="100vw" className="object-cover opacity-18" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/86 via-black/54 to-black/68" />
        <div className="relative z-10 grid gap-6 xl:grid-cols-[300px_1fr_520px]">
          <div className="flex flex-col items-center text-center xl:items-start xl:text-left">
            <div className="relative h-44 w-44 overflow-hidden rounded-full border border-[var(--sb-gold)] shadow-[0_0_42px_rgba(202,164,93,0.25)]">
              <Image src={profileImage} alt={`${profile.name} profile`} fill sizes="176px" className="object-cover" />
            </div>
            <Button variant="outline" className="mt-4 h-10 rounded-full border-[var(--sb-border)] bg-black/40 text-[var(--sb-gold)]" onClick={() => onNavigate("accountSettings")}>
              Account Settings
            </Button>
          </div>

          <div className="self-center">
            <p className="text-sm uppercase tracking-[0.22em] text-[var(--sb-gold)]">Welcome Back</p>
            <h1 className="editorial-title mt-2 text-5xl leading-[0.95] text-white md:text-7xl">
              {profile.name.split(" ")[0]}
              <span className="block text-[var(--sb-red-bright)]">{profile.name.split(" ").slice(1).join(" ") || "Member"}</span>
            </h1>
            <p className="mt-3 text-lg text-white/78">
              Bliss Member <span className="ml-2 rounded-full border border-[var(--sb-border)] px-2 py-0.5 text-xs uppercase text-[var(--sb-gold)]">Premium</span>
            </p>
            <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--sb-muted)]">
              A devoted sushi enthusiast with a taste for excellence and unforgettable experiences.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button className="red-glow-button rounded-xl px-5" onClick={() => onNavigate("reservations")}>
                Reservation History
              </Button>
              <Button variant="outline" className="rounded-xl border-[var(--sb-border)] bg-black/35 px-5 text-[var(--sb-gold)]" onClick={() => onNavigate("accountSettings")}>
                Account Settings
              </Button>
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--sb-border)] bg-black/48 p-5 backdrop-blur-xl">
            <p className="text-xs uppercase tracking-[0.22em] text-[var(--sb-gold)]">Membership Status</p>
            <h2 className="editorial-title mt-3 text-4xl text-white">Premium</h2>
            <p className="mt-2 text-sm text-[var(--sb-muted)]">You&apos;re enjoying exclusive benefits and elevated experiences.</p>
            <div className="mt-5 flex items-center justify-between text-sm text-white/72">
              <span>{loyaltyPoints.toLocaleString()} / {appContent.member.maxTierPoints.toLocaleString()} pts to Next Tier</span>
              <span>{Math.max(0, appContent.member.maxTierPoints - loyaltyPoints).toLocaleString()} left</span>
            </div>
            <progress className="mt-3 h-2 w-full" value={progressValue} max={appContent.member.maxTierPoints} />
            <div className="mt-5 grid grid-cols-2 gap-3 text-center text-xs text-white/68 sm:grid-cols-5">
              {[
                { label: "Reservations", icon: iconAssets.reservations },
                { label: "Upgrades", icon: iconAssets.orders },
                { label: "Rewards", icon: iconAssets.loyalty },
                { label: "Support", icon: iconAssets.headset },
                { label: "Settings", icon: iconAssets.settings },
              ].map((perk) => (
                <button
                  key={perk.label}
                  type="button"
                  onClick={() => onNavigate(getProfileShortcutTarget(perk.label))}
                  className="rounded-xl border border-[var(--sb-border)] bg-white/[0.03] px-2 py-3 transition hover:border-[var(--sb-gold)]"
                >
                  {perk.icon ? <AssetIcon src={perk.icon} size={24} className="mx-auto mb-2" /> : null}
                  {perk.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-4">
        <ProfileDashboardCard title="Saved Addresses" action="Manage">
          <ProfileField label="Home" value={profile.address} onChange={(value) => onProfileChange({ ...profile, address: value, deliveryAddress: profile.deliveryAddress || value })} />
          <ProfileField label="Delivery" value={profile.deliveryAddress} onChange={(value) => onProfileChange({ ...profile, deliveryAddress: value })} />
        </ProfileDashboardCard>
        <ProfileDashboardCard title="Payment Methods" action="Manage">
          <ProfileListRow icon={iconAssets.cart} title="Visa **** 4242" copy="Expires 08/26" />
          <ProfileListRow icon={iconAssets.creditCard} title="Mastercard **** 8888" copy="Expires 11/25" />
        </ProfileDashboardCard>
        <ProfileDashboardCard title="Dining Preferences" action="Manage">
          <ProfileListRow icon={iconAssets.reservations} title="Preferred Seating" copy="Counter Seat" />
          <ProfileListRow icon={iconAssets.about} title="Favorite Chefs" copy="Chef Kenji, Chef Aiko" />
          <ProfileListRow icon={iconAssets.loyalty} title="Service Style" copy="Traditional Omakase" />
        </ProfileDashboardCard>
        <ProfileDashboardCard title="Dietary Preferences" action="Manage">
          <ProfileField label="Dietary Notes" value={profile.dietary} onChange={(value) => onProfileChange({ ...profile, dietary: value })} />
          <ProfileListRow icon={iconAssets.check} title="No Artificial Additives" copy="Saved preference" />
        </ProfileDashboardCard>
      </section>

      <section className="grid gap-5 xl:grid-cols-[0.86fr_1fr]">
        <ProfileDashboardCard title="Recent Activity" action="View All" onAction={() => onNavigate("recentlyViewed")}>
          {orderHistory.map((order) => (
            <ProfileListRow key={order.id} icon={iconAssets.orders} title={`Order ${order.confirmationCode}`} copy={`${new Date(order.placedAt).toLocaleDateString()} · ${formatCurrency(order.total)}`} />
          ))}
          {orderHistory.length === 0 ? <ProfileListRow icon={iconAssets.reservations} title="Reservation Confirmed" copy={`${appContent.reservation.month} ${appContent.reservation.day} · ${appContent.reservation.time} · ${appContent.reservation.table}`} /> : null}
          <ProfileListRow icon={iconAssets.profile} title="Profile Updated" copy="Privacy · Notifications · Security" />
        </ProfileDashboardCard>

        <ProfileDashboardCard title="Upcoming Reservation" action="View Details" onAction={() => onNavigate("reservationDetails")}>
          <div className="grid gap-4 md:grid-cols-[260px_1fr]">
            <button type="button" onClick={() => preferredItem && onSelectItem(preferredItem)} className="relative min-h-40 overflow-hidden rounded-2xl border border-[var(--sb-border)]">
              {preferredItem ? <Image src={preferredItem.image.publicUrl} alt="" fill sizes="260px" className="object-cover" /> : null}
            </button>
            <div className="flex flex-col justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-[var(--sb-gold)]">Saturday</p>
                <p className="editorial-title mt-1 text-5xl text-white">24 <span className="text-lg">May</span></p>
                <p className="mt-3 text-2xl text-white">{nextReservation ? formatReservationDateTime(nextReservation.datetime) : "7:00 PM"}</p>
                <p className="mt-2 text-sm leading-6 text-[var(--sb-muted)]">
                  {nextReservation ? `${nextReservation.seating} · ${nextReservation.guests} Guests` : `${appContent.reservation.table} · ${appContent.reservation.guests} Guests`}
                  <br />
                  {appContent.location.label}, {appContent.location.street}, {appContent.location.city}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" className="rounded-xl border-[var(--sb-border)] bg-black/35 px-5 text-[var(--sb-gold)]" onClick={() => onNavigate("reservationDetails")}>
                  View Details
                </Button>
                <Button className="red-glow-button rounded-xl px-5" onClick={() => onNavigate("reservations")}>
                  Modify Reservation
                </Button>
              </div>
            </div>
          </div>
        </ProfileDashboardCard>
      </section>

      <ProfilePanel title="Favorite Items" empty="Tap hearts in the menu to save favorites." onAction={() => onNavigate("favorites")} action="View All">
        {favorites.map((item) => (
          <button key={item.id} type="button" onClick={() => onSelectItem(item)} className="flex items-center gap-3 rounded-2xl border border-[var(--sb-border)] bg-white/[0.03] p-3 text-left">
            <span className="relative h-16 w-20 shrink-0 overflow-hidden rounded-xl"><Image src={item.image.publicUrl} alt="" fill sizes="80px" className="object-cover" /></span>
            <span><span className="block font-semibold text-white">{item.name}</span><span className="text-sm text-[var(--sb-gold)]">{formatCurrency(item.price)}</span></span>
          </button>
        ))}
      </ProfilePanel>
    </div>
  );
}

/** Renders an editable profile field with dark input styling. */
function ProfileField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="block"><span className="text-xs uppercase tracking-[0.2em] text-[var(--sb-gold)]">{label}</span><Input value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 h-12 rounded-2xl border-[var(--sb-border)] bg-black/30 text-white" /></label>;
}

/** Provides a reusable glass dashboard card for the profile screen. */
function ProfileDashboardCard({ title, action, children, onAction }: { title: string; action: string; children: ReactNode; onAction?: () => void }) {
  return (
    <section className="luxury-panel p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="editorial-title text-lg text-white">{title}</h2>
        <button type="button" onClick={onAction} className="text-xs uppercase tracking-[0.18em] text-[var(--sb-gold)]">{action}</button>
      </div>
      <div className="grid gap-3">{children}</div>
    </section>
  );
}

/** Renders a compact labeled row with one of the packaged icon assets. */
function ProfileListRow({ icon, title, copy }: { icon?: string; title: string; copy: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-[var(--sb-border)] bg-black/30 p-3">
      {icon ? <AssetIcon src={icon} size={28} className="shrink-0" /> : null}
      <span>
        <span className="block text-sm font-semibold text-white">{title}</span>
        <span className="text-xs text-[var(--sb-muted)]">{copy}</span>
      </span>
    </div>
  );
}

/** Wraps secondary profile lists with empty-state handling. */
function ProfilePanel({ title, empty, action, onAction, children }: { title: string; empty: string; action: string; onAction: () => void; children: ReactNode }) {
  const hasChildren = Array.isArray(children) ? children.length > 0 : Boolean(children);
  return (
    <section className="luxury-panel p-5">
      <div className="flex items-center justify-between gap-4">
        <h2 className="editorial-title text-2xl text-white">{title}</h2>
        <button type="button" onClick={onAction} className="text-xs uppercase tracking-[0.18em] text-[var(--sb-gold)]">{action}</button>
      </div>
      <div className="mt-4 grid gap-3">{hasChildren ? children : <p className="text-sm text-[var(--sb-muted)]">{empty}</p>}</div>
    </section>
  );
}
