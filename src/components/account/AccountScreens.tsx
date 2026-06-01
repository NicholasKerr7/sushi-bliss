import Image from "next/image";
import { Check, ChevronRight, Download, Globe2, KeyRound, LogOut, Pencil, ShieldCheck, Smartphone } from "lucide-react";
import { useState, type ReactNode } from "react";
import { getAppContent } from "../../data/selectors";
import { getSushiIconAssets } from "../../data/icon-assets";
import { AssetIcon } from "../icons/AssetIcon";
import type { AppView } from "../layout/types";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import type { GuestProfile } from "../profile/types";

interface AccountScreenProps {
  loyaltyPoints: number;
  profile: GuestProfile;
  profileImage: string;
  onNavigate: (view: AppView) => void;
  onProfileChange: (profile: GuestProfile) => void;
  showNotice: (message: string, tone?: "success" | "error" | "info") => void;
}

interface AccountSettingRow {
  icon?: string;
  title: string;
  copy: string;
  value?: string;
  tone?: "default" | "danger";
  target?: AppView;
}

const appContent = getAppContent();
const iconAssets = getSushiIconAssets();

/** Renders the screenshot-style personal information editor with live profile persistence. */
export function PersonalInformationView({ profile, profileImage, onNavigate, onProfileChange, showNotice }: AccountScreenProps) {
  return (
    <AccountScreenFrame
      title="Personal Information"
      copy="Manage your personal details and preferences."
      onBack={() => onNavigate("accountSettings")}
    >
      <section className="mx-auto max-w-5xl">
        <div className="flex justify-center">
          <div className="relative h-48 w-48 sm:h-56 sm:w-56">
            <Image src={profileImage} alt={`${profile.name} profile`} fill sizes="224px" className="rounded-full border border-[var(--sb-gold)] object-cover shadow-[0_0_36px_rgba(202,164,93,0.24)]" />
            <button
              type="button"
              aria-label="Change profile photo"
              className="absolute bottom-2 right-2 grid h-16 w-16 place-items-center rounded-full border border-[var(--sb-border-strong)] bg-black/70 text-[var(--sb-gold)] backdrop-blur-xl transition hover:border-[var(--sb-gold)]"
            >
              <Pencil className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="mt-8 grid gap-3 lg:grid-cols-2">
          <EditableProfileRow icon={iconAssets.profile} label="Full Name" value={profile.name} onChange={(value) => onProfileChange({ ...profile, name: value })} />
          <EditableProfileRow icon={iconAssets.email} label="Email Address" value={profile.email} onChange={(value) => onProfileChange({ ...profile, email: value })} />
          <EditableProfileRow icon={iconAssets.phone} label="Phone Number" value={profile.phone} onChange={(value) => onProfileChange({ ...profile, phone: value })} />
          <ReadonlyProfileRow icon={iconAssets.calendar} label="Birthday" value="May 24, 1980" />
          <EditableProfileRow
            icon={iconAssets.mapPin}
            label="Preferred Location"
            value={profile.address || appContent.member.address}
            onChange={(value) => onProfileChange({ ...profile, address: value, deliveryAddress: profile.deliveryAddress || value })}
          />
          <ReadonlyProfileRow icon={iconAssets.loyalty} label="Member Since" value="March 2023" />
        </div>

        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          <Button
            className="red-glow-button h-16 rounded-[18px] text-base uppercase tracking-[0.18em]"
            onClick={() => showNotice("Personal information saved.", "success")}
          >
            Save Changes
          </Button>
          <Button
            variant="outline"
            className="h-16 rounded-[18px] border-[var(--sb-border-strong)] bg-black/35 text-base uppercase tracking-[0.18em] text-[var(--sb-gold)]"
            onClick={() => onNavigate("accountSettings")}
          >
            Cancel
          </Button>
        </div>
      </section>
    </AccountScreenFrame>
  );
}

/** Renders the mobile-first account settings menu and desktop preference dashboard. */
export function AccountSettingsView({ loyaltyPoints, profile, profileImage, onNavigate, showNotice }: AccountScreenProps) {
  const settingsRows: AccountSettingRow[] = [
    { icon: iconAssets.bell, title: "Notifications", copy: "Manage alerts and updates", target: "notifications" },
    { icon: iconAssets.settings, title: "Privacy & Security", copy: "Control your data and privacy", target: "privacySecurity" },
    { icon: iconAssets.creditCard, title: "Password", copy: "Change or update your password", target: "privacySecurity" },
    { icon: iconAssets.creditCard, title: "Payment Preferences", copy: "Manage cards and billing details", target: "paymentMethods" },
    { icon: iconAssets.location, title: "Language", copy: "Select your preferred language", value: "English" },
    { icon: iconAssets.flower, title: "App Appearance", copy: "Choose your preferred theme", value: "Dark" },
    { icon: iconAssets.x, title: "Log Out", copy: "Sign out from your Sushi Bliss account", tone: "danger" },
  ];

  return (
    <AccountScreenFrame title="Account Settings" copy="Manage your preferences and account details" onBack={() => onNavigate("profile")}>
      <div className="grid gap-5 xl:grid-cols-[320px_1fr]">
        <aside className="hidden space-y-3 xl:block">
          <AccountMemberCard loyaltyPoints={loyaltyPoints} profile={profile} profileImage={profileImage} onNavigate={onNavigate} />
          <section className="luxury-panel p-4">
            {[
              ["Account Overview", "profile"],
              ["Personal Information", "personalInformation"],
              ["Dietary Preferences", "dietaryPreferences"],
              ["Privacy & Security", "privacySecurity"],
              ["Notifications", "notifications"],
              ["Payment Methods", "paymentMethods"],
              ["Loyalty & Rewards", "loyalty"],
              ["Order History", "orders"],
            ].map(([label, view]) => (
              <button
                key={label}
                type="button"
                onClick={() => onNavigate(view as AppView)}
                className={`flex w-full items-center justify-between border-b border-[var(--sb-border)] px-3 py-4 text-left text-sm uppercase tracking-[0.12em] transition last:border-b-0 ${
                  view === "accountSettings" ? "text-[var(--sb-red-bright)]" : "text-white/72 hover:text-[var(--sb-gold)]"
                }`}
              >
                {label}
                <ChevronRight className="h-4 w-4" />
              </button>
            ))}
          </section>
        </aside>

        <div className="space-y-5">
          <section className="grid gap-4 lg:grid-cols-2">
            <AccountPreferenceCard title="Dining Preferences" icon={iconAssets.dining}>
              <PreferenceLine icon={iconAssets.group} label="Default Party Size" value="2 Guests" />
              <PreferenceLine icon={iconAssets.mapPin} label="Preferred Location" value="Sushi Bliss Downtown" />
              <PreferenceLine icon={iconAssets.dining} label="Preferred Seating" value="Counter Seating" />
              <PreferenceLine icon={iconAssets.gift} label="Special Occasions" value="Birthdays, Anniversaries" />
            </AccountPreferenceCard>
            <AccountPreferenceCard title="Dietary Preferences" icon={iconAssets.about}>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {["No Preference", "Vegetarian", "Vegan", "Gluten-Free", "Dairy-Free", "Nut Allergy"].map((preference, index) => (
                  <button
                    key={preference}
                    type="button"
                    className={`h-11 rounded-xl border text-sm transition ${
                      index === 0 ? "border-[var(--sb-gold)] bg-[var(--sb-gold)] text-black" : "border-[var(--sb-border)] bg-black/35 text-white/78 hover:text-[var(--sb-gold)]"
                    }`}
                  >
                    {preference}
                  </button>
                ))}
              </div>
              <p className="mt-4 rounded-2xl border border-[var(--sb-border)] bg-black/30 p-4 text-sm leading-6 text-[var(--sb-muted)]">
                We&apos;ll personalize your experience and menu recommendations based on your selections.
              </p>
            </AccountPreferenceCard>
          </section>

          <section className="space-y-3 md:hidden">
            {settingsRows.map((row) => (
              <SettingsActionRow key={row.title} row={row} onNavigate={onNavigate} onNoop={() => showNotice(`${row.title} is saved in this demo.`, "info")} />
            ))}
          </section>

          <section className="hidden grid-cols-2 gap-4 md:grid">
            <NotificationPanel />
            <AccountPreferenceCard title="Saved Cards" icon={iconAssets.creditCard} action="Add Card" onAction={() => onNavigate("addCard")}>
              {["Visa **** 4242", "Mastercard **** 8888", "Amex **** 1005"].map((card, index) => (
                <PreferenceLine key={card} icon={iconAssets.creditCard} label={card} value={index === 0 ? "Default" : `Expires 0${index + 7}/27`} />
              ))}
            </AccountPreferenceCard>
            <AccountPreferenceCard title="Privacy & Settings" icon={iconAssets.settings}>
              <PreferenceLine icon={iconAssets.profile} label="Profile Visibility" value="Private" onClick={() => onNavigate("privacySecurity")} />
              <PreferenceLine icon={iconAssets.settings} label="Data & Privacy" value="Manage" onClick={() => onNavigate("privacySecurity")} />
              <PreferenceLine icon={iconAssets.email} label="Marketing Preferences" value="Enabled" />
              <PreferenceLine icon={iconAssets.check} label="Biometric Login" value="On" />
            </AccountPreferenceCard>
            <AccountPreferenceCard title="Account Management" icon={iconAssets.profile}>
              <PreferenceLine icon={iconAssets.profile} label="Update Personal Information" value="Edit" onClick={() => onNavigate("personalInformation")} />
              <PreferenceLine icon={iconAssets.settings} label="Change Password" value="Manage" onClick={() => onNavigate("privacySecurity")} />
              <PreferenceLine icon={iconAssets.x} label="Log Out" value="Securely" danger />
            </AccountPreferenceCard>
          </section>
        </div>
      </div>
    </AccountScreenFrame>
  );
}

/** Renders the privacy and security controls from the account screenshot. */
export function PrivacySecurityView({ onNavigate }: Pick<AccountScreenProps, "onNavigate">) {
  return (
    <AccountScreenFrame
      title="Privacy & Security"
      copy="Manage your account security and personal preferences."
      onBack={() => onNavigate("accountSettings")}
    >
      <div className="mx-auto max-w-5xl space-y-5">
        <section className="luxury-panel divide-y divide-[var(--sb-border)] overflow-hidden p-0">
          <ToggleSettingRow icon={<ShieldCheck className="h-7 w-7" />} title="Face ID / Biometric Login" copy="Use Face ID to securely access your account." defaultEnabled />
          <DisclosureSettingRow icon={<Check className="h-7 w-7" />} title="Two-Step Verification" copy="Add an extra layer of security to your account." value="On" />
        </section>
        <section className="luxury-panel divide-y divide-[var(--sb-border)] overflow-hidden p-0">
          <ToggleSettingRow icon={iconAssets.email ? <AssetIcon src={iconAssets.email} size={31} /> : <MailFallback />} title="Email Updates" copy="Receive order updates and important notifications." defaultEnabled />
          <ToggleSettingRow icon={iconAssets.contact ? <AssetIcon src={iconAssets.contact} size={31} /> : <MailFallback />} title="Promotional SMS" copy="Receive offers and updates via SMS." />
        </section>

        <section>
          <div className="mb-3 flex items-center gap-4">
            <p className="text-xs uppercase tracking-[0.24em] text-[var(--sb-gold)]">Security & Data</p>
            <span className="h-px flex-1 bg-[var(--sb-border)]" />
          </div>
          <div className="luxury-panel divide-y divide-[var(--sb-border)] overflow-hidden p-0">
            <DisclosureSettingRow icon={<Smartphone className="h-7 w-7" />} title="Saved Devices" copy="Manage devices trusted to access your account." value="3 Devices" />
            <DisclosureSettingRow icon={iconAssets.clock ? <AssetIcon src={iconAssets.clock} size={31} /> : <Smartphone className="h-7 w-7" />} title="Session Management" copy="View and log out of active sessions." />
            <DisclosureSettingRow icon={<Download className="h-7 w-7" />} title="Data Export" copy="Download a copy of your account data." />
          </div>
        </section>

        <button
          type="button"
          className="luxury-panel flex w-full items-center gap-4 p-4 text-left transition hover:border-[var(--sb-gold)]"
        >
          <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl border border-[var(--sb-red-bright)] bg-[var(--sb-red)]/12 text-[var(--sb-red-bright)]">
            <KeyRound className="h-7 w-7" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-xl text-white">Change Password</span>
            <span className="mt-1 block text-sm text-[var(--sb-muted)]">Update your password regularly to keep your account safe.</span>
          </span>
          <ChevronRight className="h-5 w-5 shrink-0 text-[var(--sb-gold)]" />
        </button>

        <div className="flex items-center justify-center gap-3 text-sm text-[var(--sb-muted)]">
          <span className="grid h-10 w-10 place-items-center rounded-full border border-[var(--sb-border)] text-[var(--sb-gold)]">
            <ShieldCheck className="h-5 w-5" />
          </span>
          We use industry-standard security measures to keep your data safe and secure.
        </div>
      </div>
    </AccountScreenFrame>
  );
}

/** Provides a consistent account page frame with screenshot-like title spacing. */
function AccountScreenFrame({ children, copy, onBack, title }: { children: ReactNode; copy: string; onBack: () => void; title: string }) {
  const [firstWord, ...restWords] = title.split(" ");
  return (
    <div className="space-y-7 pt-8 md:pt-2">
      <button
        type="button"
        aria-label="Go back"
        onClick={onBack}
        className="grid h-14 w-14 place-items-center rounded-2xl border border-[var(--sb-border)] bg-black/48 text-[var(--sb-gold)] backdrop-blur-xl transition hover:border-[var(--sb-gold)]"
      >
        <ChevronRight className="h-5 w-5 rotate-180" />
      </button>
      <header className="mx-auto max-w-5xl text-center">
        <h1 className="editorial-title text-[44px] leading-none text-white sm:text-[56px]">
          {firstWord} <span className="text-[var(--sb-gold)]">{restWords.join(" ")}</span>
        </h1>
        <div className="mx-auto mt-4 flex max-w-sm items-center gap-4">
          <span className="h-px flex-1 bg-[var(--sb-border)]" />
          {iconAssets.flower ? <AssetIcon src={iconAssets.flower} size={26} /> : null}
          <span className="h-px flex-1 bg-[var(--sb-border)]" />
        </div>
        <p className="mt-5 text-lg text-[var(--sb-muted)]">{copy}</p>
      </header>
      {children}
    </div>
  );
}

/** Keeps editable rows visually close to the screenshot while persisting profile state. */
function EditableProfileRow({ icon, label, value, onChange }: { icon?: string; label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="grid min-h-[104px] grid-cols-[72px_1fr_28px] items-center gap-4 rounded-[18px] border border-[var(--sb-border)] bg-black/42 px-4 backdrop-blur-xl">
      <span className="grid h-14 w-14 place-items-center border-r border-[var(--sb-border)] pr-4 text-[var(--sb-gold)]">
        {icon ? <AssetIcon src={icon} size={34} /> : null}
      </span>
      <span className="min-w-0">
        <span className="block text-xs uppercase tracking-[0.18em] text-[var(--sb-gold)]">{label}</span>
        <Input value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 h-9 border-0 bg-transparent px-0 text-xl text-white shadow-none focus-visible:ring-0" />
      </span>
      <Pencil className="h-5 w-5 text-[var(--sb-gold)]" />
    </label>
  );
}

/** Displays a non-editable profile row for account fields that are static demo data. */
function ReadonlyProfileRow({ icon, label, value }: { icon?: string; label: string; value: string }) {
  return (
    <div className="grid min-h-[104px] grid-cols-[72px_1fr] items-center gap-4 rounded-[18px] border border-[var(--sb-border)] bg-black/42 px-4 backdrop-blur-xl">
      <span className="grid h-14 w-14 place-items-center border-r border-[var(--sb-border)] pr-4 text-[var(--sb-gold)]">
        {icon ? <AssetIcon src={icon} size={34} /> : null}
      </span>
      <span className="min-w-0">
        <span className="block text-xs uppercase tracking-[0.18em] text-[var(--sb-gold)]">{label}</span>
        <span className="mt-2 block text-xl text-white">{value}</span>
      </span>
    </div>
  );
}

/** Shows a compact member card for desktop account settings navigation. */
function AccountMemberCard({ loyaltyPoints, profile, profileImage, onNavigate }: { loyaltyPoints: number; profile: GuestProfile; profileImage: string; onNavigate: (view: AppView) => void }) {
  return (
    <section className="luxury-panel p-5 text-center">
      <Image src={profileImage} alt="" width={88} height={88} className="mx-auto h-[88px] w-[88px] rounded-full border border-[var(--sb-gold)] object-cover" />
      <h2 className="editorial-title mt-3 text-2xl text-white">{profile.name}</h2>
      <p className="text-xs uppercase tracking-[0.18em] text-[var(--sb-gold)]">Bliss Member</p>
      <p className="mt-4 text-3xl text-white">{loyaltyPoints.toLocaleString()} pts</p>
      <Button variant="outline" className="mt-4 h-10 rounded-xl border-[var(--sb-border)] bg-black/30 text-[var(--sb-gold)]" onClick={() => onNavigate("loyalty")}>
        View Benefits
      </Button>
    </section>
  );
}

/** Wraps a desktop/tablet account preference module. */
function AccountPreferenceCard({ action, children, icon, onAction, title }: { action?: string; children: ReactNode; icon?: string; onAction?: () => void; title: string }) {
  return (
    <section className="luxury-panel p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-3 text-lg uppercase tracking-[0.08em] text-white">
          {icon ? <AssetIcon src={icon} size={25} /> : null}
          {title}
        </h2>
        {action ? <button type="button" onClick={onAction} className="text-xs uppercase tracking-[0.16em] text-[var(--sb-gold)]">{action}</button> : null}
      </div>
      {children}
    </section>
  );
}

/** Renders a single preference line with an optional navigation affordance. */
function PreferenceLine({ danger = false, icon, label, onClick, value }: { danger?: boolean; icon?: string; label: string; onClick?: () => void; value: string }) {
  const rowContent = (
    <>
      {icon ? <AssetIcon src={icon} size={24} className="shrink-0" /> : null}
      <span className="flex-1 text-sm">{label}</span>
      <span className={danger ? "text-[var(--sb-red-bright)]" : "text-[var(--sb-gold)]"}>{value}</span>
      {onClick ? <ChevronRight className="h-4 w-4 text-[var(--sb-gold)]" /> : null}
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`flex w-full items-center gap-3 border-b border-[var(--sb-border)] py-3 text-left last:border-b-0 ${danger ? "text-[var(--sb-red-bright)]" : "text-white"}`}
      >
        {rowContent}
      </button>
    );
  }

  return (
    <div className={`flex w-full items-center gap-3 border-b border-[var(--sb-border)] py-3 text-left last:border-b-0 ${danger ? "text-[var(--sb-red-bright)]" : "text-white"}`}>
      {rowContent}
    </div>
  );
}

/** Displays the mobile account-settings rows with screenshots' icon circles. */
function SettingsActionRow({ row, onNavigate, onNoop }: { row: AccountSettingRow; onNavigate: (view: AppView) => void; onNoop: () => void }) {
  const danger = row.tone === "danger";
  return (
    <button
      type="button"
      onClick={() => (row.target ? onNavigate(row.target) : onNoop())}
      className={`grid min-h-[112px] w-full grid-cols-[88px_1fr_auto] items-center gap-4 rounded-[18px] border bg-black/44 px-4 text-left backdrop-blur-xl transition hover:border-[var(--sb-gold)] ${
        danger ? "border-[rgba(239,47,37,0.36)] text-[var(--sb-red-bright)]" : "border-[var(--sb-border)] text-white"
      }`}
    >
      <span className={`grid h-16 w-16 place-items-center rounded-full border bg-black/44 ${danger ? "border-[var(--sb-red-bright)]" : "border-[var(--sb-border-strong)]"}`}>
        {row.icon ? <AssetIcon src={row.icon} size={34} /> : <LogOut className="h-7 w-7" />}
      </span>
      <span>
        <span className="editorial-title block text-xl uppercase tracking-[0.08em]">{row.title}</span>
        <span className="mt-1 block text-sm text-[var(--sb-muted)]">{row.copy}</span>
      </span>
      <span className="flex items-center gap-3 text-[var(--sb-gold)]">
        {row.value ? <span className="rounded-xl border border-[var(--sb-border)] px-3 py-1 text-sm">{row.value}</span> : null}
        <ChevronRight className={`h-5 w-5 ${danger ? "text-[var(--sb-red-bright)]" : ""}`} />
      </span>
    </button>
  );
}

/** Renders the desktop/tablet notifications card used on the preferences page. */
function NotificationPanel() {
  const rows = ["Order Confirmations", "Reservation Reminders", "Special Offers & Promotions", "New Menu Items", "Bliss Rewards Updates"];
  return (
    <AccountPreferenceCard title="Notifications" icon={iconAssets.bell}>
      <div className="divide-y divide-[var(--sb-border)]">
        {rows.map((row, index) => (
          <div key={row} className="flex items-center justify-between gap-4 py-3">
            <span>
              <span className="block text-sm text-white">{row}</span>
              <span className="text-xs text-[var(--sb-muted)]">Receive updates from Sushi Bliss</span>
            </span>
            <span className={`relative h-7 w-12 rounded-full ${index === 3 ? "bg-white/18" : "bg-[var(--sb-red)]"}`}>
              <span className={`absolute top-1 h-5 w-5 rounded-full bg-white ${index === 3 ? "left-1" : "right-1"}`} />
            </span>
          </div>
        ))}
      </div>
    </AccountPreferenceCard>
  );
}

/** Provides an accessible switch row that keeps the visual state local to the setting. */
function ToggleSettingRow({ copy, defaultEnabled = false, icon, title }: { copy: string; defaultEnabled?: boolean; icon: ReactNode; title: string }) {
  const [enabled, setEnabled] = useState(defaultEnabled);

  return (
    <div className="grid grid-cols-[76px_1fr_auto] items-center gap-4 p-4 sm:p-6">
      <span className="grid h-16 w-16 place-items-center rounded-2xl border border-[var(--sb-border)] bg-black/40 text-[var(--sb-gold)]">{icon}</span>
      <span>
        <span className="block text-xl text-white">{title}</span>
        <span className="mt-1 block text-sm text-[var(--sb-muted)]">{copy}</span>
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={() => setEnabled((current) => !current)}
        className={`relative h-10 w-20 rounded-full border transition ${
          enabled ? "border-[var(--sb-red-bright)] bg-[var(--sb-red)] shadow-[0_0_18px_var(--sb-red-glow)]" : "border-white/18 bg-white/[0.08]"
        }`}
      >
        <span className={`absolute top-1 h-8 w-8 rounded-full bg-white transition ${enabled ? "right-1" : "left-1"}`} />
      </button>
    </div>
  );
}

/** Displays one privacy action row with a chevron and optional value. */
function DisclosureSettingRow({ copy, icon, title, value }: { copy: string; icon: ReactNode; title: string; value?: string }) {
  return (
    <button type="button" className="grid w-full grid-cols-[76px_1fr_auto] items-center gap-4 p-4 text-left transition hover:bg-white/[0.03] sm:p-6">
      <span className="grid h-16 w-16 place-items-center rounded-2xl border border-[var(--sb-border)] bg-black/40 text-[var(--sb-gold)]">{icon}</span>
      <span>
        <span className="block text-xl text-white">{title}</span>
        <span className="mt-1 block text-sm text-[var(--sb-muted)]">{copy}</span>
      </span>
      <span className="flex items-center gap-3 text-[var(--sb-gold)]">
        {value ? <span>{value}</span> : null}
        <ChevronRight className="h-5 w-5" />
      </span>
    </button>
  );
}

/** Keeps a simple fallback icon for rows when an icon asset is unavailable. */
function MailFallback() {
  return <Globe2 className="h-7 w-7" />;
}
