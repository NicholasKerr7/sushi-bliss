import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { getAppContent, getAssetsByFolder, getFeaturedAssets } from "../../data/selectors";
import { getSushiIconAssets } from "../../data/icon-assets";
import type { Reward } from "../../data/types";
import { AssetIcon } from "../icons/AssetIcon";
import type { AppView } from "../layout/types";
import { Button } from "../ui/button";

interface MemberPassRewardsViewProps {
  loyaltyPoints: number;
  rewards: Reward[];
  onNavigate: (view: AppView) => void;
  onRedeem: (reward: Reward) => void;
}

interface RewardDisplayItem {
  copy: string;
  id: string;
  image: string;
  points: number;
  title: string;
  value: string;
  reward?: Reward;
}

const appContent = getAppContent();
const featuredAssets = getFeaturedAssets();
const iconAssets = getSushiIconAssets();
const ambienceAssets = getAssetsByFolder("ambience");
const chefCounterImage =
  ambienceAssets.find((asset) => asset.experienceId === "chef-counter")?.publicUrl ??
  featuredAssets.ambience[0]?.publicUrl ??
  featuredAssets.heroSushi.publicUrl;

/** Renders the dedicated member pass and rewards screen from the tablet/desktop references. */
export function MemberPassRewardsView({ loyaltyPoints, rewards, onNavigate, onRedeem }: MemberPassRewardsViewProps) {
  const progressValue = Math.min(loyaltyPoints, appContent.member.maxTierPoints);
  const rewardItems = buildMemberRewardItems(rewards);

  return (
    <section className="mx-auto w-full max-w-[1540px] space-y-5 pt-4 md:pt-2">
      <button type="button" onClick={() => onNavigate("loyalty")} className="inline-flex items-center gap-3 text-sm uppercase tracking-[0.14em] text-[var(--sb-gold)]">
        <ChevronRight className="h-5 w-5 rotate-180" />
        Back To Loyalty
      </button>

      <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="min-w-0 space-y-5">
          <section className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <MemberPassHeroCard />
            <div className="hidden xl:block">
              <CurrentTierCard loyaltyPoints={loyaltyPoints} progressValue={progressValue} onNavigate={onNavigate} />
            </div>
          </section>

          <MemberMetricsPanel loyaltyPoints={loyaltyPoints} progressValue={progressValue} rewardCount={rewards.length} onNavigate={onNavigate} />
          <MemberBenefitsStrip />
          <RewardCatalog rewards={rewardItems} onNavigate={onNavigate} onRedeem={onRedeem} />
          <div className="xl:hidden">
            <RewardActivityPanel limit={3} showFooter={false} viewAllLabel="View all activity" />
          </div>
          <MoreWithBlissPanel onNavigate={onNavigate} />
        </div>

        <aside className="hidden min-w-0 space-y-5 xl:block">
          <MemberEducationPanel />
          <HowToRedeemPanel />
          <RewardActivityPanel />
        </aside>
      </div>
    </section>
  );
}

/** Normalizes reward data and appends the screenshot's chef-counter premium reward. */
function buildMemberRewardItems(rewards: Reward[]): RewardDisplayItem[] {
  const normalizedRewards = rewards.map((reward) => ({
    copy: reward.description,
    id: reward.id,
    image: reward.image.publicUrl,
    points: reward.points,
    title: reward.title,
    value: reward.value,
    reward,
  }));

  return [
    ...normalizedRewards,
    {
      copy: "An intimate omakase experience at the chef's counter.",
      id: "chef-counter-premium",
      image: chefCounterImage,
      points: 5000,
      title: "Chef's Counter Premium",
      value: "Exclusive",
    },
  ];
}

/** Renders the scannable member pass card with member identity details. */
function MemberPassHeroCard() {
  return (
    <section className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center xl:block xl:space-y-3">
      <div className="min-w-0">
        <p className="text-sm uppercase tracking-[0.18em] text-[var(--sb-gold)]">
          <span className="xl:hidden">Member Pass</span>
          <span className="hidden xl:inline">Your Member Pass</span>
        </p>
        <h1 className="editorial-title mt-2 text-4xl text-white sm:text-5xl xl:hidden">Bliss Member</h1>
        <p className="mt-2 flex items-center gap-2 text-lg text-[var(--sb-gold)] xl:hidden">
          Gold Tier
          {iconAssets.loyalty ? <AssetIcon src={iconAssets.loyalty} size={24} /> : null}
        </p>
        <p className="mt-3 max-w-md text-sm leading-6 text-[var(--sb-muted)]">
          <span className="xl:hidden">Thank you for being part of Sushi Bliss. Enjoy elevated dining and exclusive rewards crafted just for you.</span>
          <span className="hidden xl:inline">Show this pass in-restaurant to earn points on every visit.</span>
        </p>
      </div>

      <div className="luxury-panel relative min-w-0 overflow-hidden p-5 md:p-6">
        <div className="sb-wave-pattern absolute bottom-0 right-0 h-36 w-80 opacity-28" />
        <div className="relative z-10 grid min-w-0 gap-5 sm:grid-cols-[170px_minmax(0,1fr)] sm:items-center">
          <div className="mx-auto grid aspect-square w-full max-w-[164px] place-items-center rounded-[14px] border border-[var(--sb-border)] bg-black/42 p-3 sm:max-w-none sm:bg-white sm:p-4">
            {iconAssets.qr ? <AssetIcon src={iconAssets.qr} size={138} /> : <span className="font-mono text-4xl font-bold text-black">SB</span>}
          </div>
          <div className="min-w-0">
            <h2 className="editorial-title text-3xl text-white">{appContent.member.name}</h2>
            <p className="mt-1 text-[var(--sb-gold)]">Bliss Member</p>
            <p className="mt-5 text-xs uppercase tracking-[0.18em] text-[var(--sb-muted)]">Member ID</p>
            <p className="mt-1 text-white">SB12567890</p>
            <p className="mt-4 text-xs uppercase tracking-[0.18em] text-[var(--sb-muted)]">Joined</p>
            <p className="mt-1 text-white">Jan 15, 2024</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Renders the member's current tier, points balance, and tier-benefits CTA. */
function CurrentTierCard({ loyaltyPoints, progressValue, onNavigate }: { loyaltyPoints: number; progressValue: number; onNavigate: (view: AppView) => void }) {
  return (
    <section className="luxury-panel p-5 md:p-6">
      <p className="text-sm uppercase tracking-[0.18em] text-[var(--sb-gold)]">Your Current Tier</p>
      <div className="mt-5 flex items-center gap-4">
        <span className="grid h-16 w-16 place-items-center rounded-full border border-[var(--sb-border-strong)] bg-black/44">
          {iconAssets.flower ? <AssetIcon src={iconAssets.flower} size={44} /> : null}
        </span>
        <div>
          <p className="editorial-title text-2xl text-white">Bliss Member</p>
          <p className="text-xl uppercase tracking-[0.12em] text-[var(--sb-gold)]">{appContent.member.tier} Tier</p>
        </div>
      </div>
      <p className="mt-6 text-xs uppercase tracking-[0.18em] text-[var(--sb-muted)]">Points Balance</p>
      <p className="mt-2 text-5xl text-white">{loyaltyPoints.toLocaleString()} <span className="text-2xl uppercase text-[var(--sb-muted)]">pts</span></p>
      <div className="mt-4 flex items-center justify-between text-sm text-[var(--sb-muted)]">
        <span>{appContent.member.pointsToNextTier.toLocaleString()} pts to reach {appContent.member.nextTier}</span>
        <span>{progressValue.toLocaleString()} / {appContent.member.maxTierPoints.toLocaleString()}</span>
      </div>
      <progress className="mt-2 h-2 w-full" value={progressValue} max={appContent.member.maxTierPoints} />
      <Button variant="outline" className="mt-5 h-12 w-full rounded-xl border-[var(--sb-border-strong)] bg-black/35 uppercase tracking-[0.14em] text-[var(--sb-gold)]" onClick={() => onNavigate("loyalty")}>
        View Tier Benefits
      </Button>
    </section>
  );
}

/** Renders the tablet screenshot's points and available-rewards summary band. */
function MemberMetricsPanel({
  loyaltyPoints,
  progressValue,
  rewardCount,
  onNavigate,
}: {
  loyaltyPoints: number;
  progressValue: number;
  rewardCount: number;
  onNavigate: (view: AppView) => void;
}) {
  return (
    <section className="luxury-panel grid gap-5 p-5 md:grid-cols-[1fr_1fr] md:p-6">
      <div className="md:border-r md:border-[var(--sb-border)] md:pr-8">
        <p className="text-sm uppercase tracking-[0.16em] text-[var(--sb-muted)]">Points Balance</p>
        <p className="mt-3 text-5xl text-white">{loyaltyPoints.toLocaleString()} <span className="text-2xl uppercase">pts</span></p>
        <p className="mt-2 text-sm text-[var(--sb-muted)]">{appContent.member.pointsToNextTier.toLocaleString()} pts to reach {appContent.member.nextTier}</p>
        <div className="mt-3 flex items-center gap-4">
          <progress className="h-2 w-full max-w-sm" value={progressValue} max={appContent.member.maxTierPoints} />
          <span className="text-sm text-[var(--sb-muted)]">{progressValue.toLocaleString()} / {appContent.member.maxTierPoints.toLocaleString()}</span>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-[1fr_250px] sm:items-center">
        <div>
          <p className="text-sm uppercase tracking-[0.16em] text-[var(--sb-muted)]">Available Rewards</p>
          <p className="mt-3 text-5xl text-white">{rewardCount}</p>
          <p className="mt-2 text-sm text-[var(--sb-muted)]">You have rewards ready to redeem</p>
        </div>
        <Button variant="outline" className="h-14 rounded-xl border-[var(--sb-border-strong)] bg-black/35 uppercase tracking-[0.14em] text-[var(--sb-gold)]" onClick={() => onNavigate("loyalty")}>
          View All Rewards
          <ChevronRight className="ml-3 h-5 w-5" />
        </Button>
      </div>
    </section>
  );
}

/** Renders icon-led member benefits from the member-pass screenshots. */
function MemberBenefitsStrip() {
  const benefits = [
    { icon: iconAssets.loyalty, title: "Earn 10 Points", copy: "per $1 spent" },
    { icon: iconAssets.gift, title: "Exclusive Member", copy: "Rewards" },
    { icon: iconAssets.calendar, title: "Birthday Reward", copy: "500 bonus points" },
    { icon: iconAssets.reservations, title: "Priority Reservations", copy: "& Waitlist" },
    { icon: iconAssets.bell, title: "Special Access", copy: "to Events" },
    { icon: iconAssets.star, title: "Surprise Perks", copy: "& Offers" },
  ];

  return (
    <section className="luxury-panel p-5 md:p-6">
      <h2 className="text-lg uppercase tracking-[0.12em] text-[var(--sb-gold)]">Your Member Benefits</h2>
      <div className="mt-6 grid grid-cols-2 gap-4 text-center md:grid-cols-3 lg:grid-cols-6">
        {benefits.map((benefit) => (
          <div key={benefit.title} className="rounded-[16px] border border-[var(--sb-border)] bg-black/24 p-4">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-[var(--sb-border)] bg-black/30">
              {benefit.icon ? <AssetIcon src={benefit.icon} size={32} /> : null}
            </span>
            <p className="mt-3 text-sm text-white">{benefit.title}</p>
            <p className="mt-1 text-xs text-[var(--sb-muted)]">{benefit.copy}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/** Renders the reward catalog cards and category tabs from the reference screens. */
function RewardCatalog({ rewards, onNavigate, onRedeem }: { rewards: RewardDisplayItem[]; onNavigate: (view: AppView) => void; onRedeem: (reward: Reward) => void }) {
  return (
    <section className="luxury-panel p-5 md:p-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg uppercase tracking-[0.12em] text-[var(--sb-gold)]">Available Rewards</h2>
        <button type="button" onClick={() => onNavigate("loyalty")} className="hidden text-sm uppercase tracking-[0.12em] text-[var(--sb-red-bright)] md:inline-flex">
          View all rewards
          <ChevronRight className="ml-2 h-4 w-4" />
        </button>
      </div>
      <div className="app-scrollbar mt-5 flex gap-3 overflow-x-auto pb-1">
        {["All Rewards", "Complimentary Items", "Experiences", "Upgrades", "Merchandise"].map((tab, index) => (
          <button
            key={tab}
            type="button"
            className={`h-12 shrink-0 rounded-[12px] border px-6 text-sm uppercase tracking-[0.1em] ${
              index === 0 ? "border-[var(--sb-gold)] bg-[var(--sb-gold)] text-black" : "border-[var(--sb-border)] bg-black/35 text-white/78"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
        {rewards.map((reward) => (
          <button
            key={reward.id}
            type="button"
            onClick={() => (reward.reward ? onRedeem(reward.reward) : onNavigate("reservations"))}
            className="group overflow-hidden rounded-[16px] border border-[var(--sb-border)] bg-black/36 text-left transition hover:border-[var(--sb-gold)]"
          >
            <span className="relative block h-40">
              <Image src={reward.image} alt="" fill sizes="260px" className="object-cover transition group-hover:scale-105" />
              <span className="absolute left-3 top-3 rounded-lg border border-[var(--sb-border-strong)] bg-black/66 px-3 py-1 text-xs uppercase text-[var(--sb-gold)]">{reward.points.toLocaleString()} pts</span>
            </span>
            <span className="block p-4">
              <span className="block text-lg text-white">{reward.title}</span>
              <span className="mt-2 block min-h-[44px] text-sm leading-5 text-[var(--sb-muted)]">{reward.copy}</span>
              <span className="mt-4 block text-lg text-[var(--sb-gold)]">{reward.value}</span>
            </span>
          </button>
        ))}
      </div>
      <Button variant="outline" className="mx-auto mt-5 h-12 w-full max-w-sm rounded-xl border-[var(--sb-border-strong)] bg-black/35 uppercase tracking-[0.14em] text-[var(--sb-gold)]" onClick={() => onNavigate("loyalty")}>
        View All Rewards
      </Button>
    </section>
  );
}

/** Renders the right-column education block for earning and redeeming. */
function MemberEducationPanel() {
  const items = [
    { icon: iconAssets.flower, title: "Earn Points", copy: "Earn 10 points for every $1 spent." },
    { icon: iconAssets.gift, title: "Redeem Rewards", copy: "Use your points for exclusive rewards." },
    { icon: iconAssets.star, title: "Exclusive Access", copy: "Enjoy member-only events and offers." },
  ];

  return (
    <section className="luxury-panel relative overflow-hidden p-5 md:p-6">
      <div className="sb-wave-pattern absolute right-0 top-0 h-44 w-72 opacity-20" />
      <h2 className="text-lg uppercase tracking-[0.12em] text-[var(--sb-gold)]">Earn. Redeem. Indulge.</h2>
      <div className="relative z-10 mt-5 space-y-5">
        {items.map((item) => (
          <div key={item.title} className="grid grid-cols-[48px_1fr] gap-4">
            <span className="grid h-11 w-11 place-items-center rounded-full border border-[var(--sb-border)] bg-black/36">
              {item.icon ? <AssetIcon src={item.icon} size={26} /> : null}
            </span>
            <span>
              <span className="block text-sm uppercase tracking-[0.12em] text-white">{item.title}</span>
              <span className="mt-1 block text-sm leading-5 text-[var(--sb-muted)]">{item.copy}</span>
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

/** Renders the three-step redemption instructions. */
function HowToRedeemPanel() {
  return (
    <section className="luxury-panel p-5 md:p-6">
      <h2 className="text-lg uppercase tracking-[0.12em] text-[var(--sb-gold)]">How To Redeem</h2>
      <div className="mt-5 space-y-4">
        {[
          "Browse available rewards and choose your favorite.",
          "Tap Redeem Reward and confirm your selection.",
          "Present your member pass in-restaurant to enjoy your reward.",
        ].map((step, index) => (
          <div key={step} className="grid grid-cols-[42px_1fr] gap-4">
            <span className="grid h-9 w-9 place-items-center rounded-full border border-[var(--sb-border-strong)] text-[var(--sb-gold)]">{index + 1}</span>
            <p className="text-sm leading-6 text-[var(--sb-muted)]">{step}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/** Renders recent points activity with earned and redeemed states. */
function RewardActivityPanel({
  limit = 4,
  showFooter = true,
  viewAllLabel = "View All",
}: {
  limit?: number;
  showFooter?: boolean;
  viewAllLabel?: string;
}) {
  const activity = [
    { icon: iconAssets.check, title: "Earned Points", copy: "Dinner at Sushi Bliss", points: "+350 PTS", date: "May 18, 2024" },
    { icon: iconAssets.gift, title: "Reward Redeemed", copy: "Spicy Tuna Roll", points: "-1,000 PTS", date: "May 12, 2024" },
    { icon: iconAssets.check, title: "Earned Points", copy: "Lunch at Sushi Bliss", points: "+250 PTS", date: "May 8, 2024" },
    { icon: iconAssets.check, title: "Bonus Points", copy: "Birthday Reward", points: "+500 PTS", date: "May 1, 2024" },
  ];

  return (
    <section className="luxury-panel p-5 md:p-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg uppercase tracking-[0.12em] text-[var(--sb-gold)]">Recent Activity</h2>
        <button type="button" className="text-sm uppercase tracking-[0.12em] text-[var(--sb-red-bright)]">{viewAllLabel}</button>
      </div>
      <div className="mt-4 divide-y divide-[var(--sb-border)]">
        {activity.slice(0, limit).map((item) => (
          <div key={`${item.title}-${item.date}`} className="grid grid-cols-[42px_1fr_auto] items-center gap-3 py-3">
            <span className="grid h-9 w-9 place-items-center rounded-full border border-[var(--sb-border)] bg-black/34">
              {item.icon ? <AssetIcon src={item.icon} size={23} /> : null}
            </span>
            <span>
              <span className="block text-sm text-white">{item.title}</span>
              <span className="text-xs text-[var(--sb-muted)]">{item.copy}</span>
            </span>
            <span className="text-right text-sm">
              <span className={item.points.startsWith("+") ? "block text-[var(--sb-gold)]" : "block text-[var(--sb-red-bright)]"}>{item.points}</span>
              <span className="text-xs text-[var(--sb-muted)]">{item.date}</span>
            </span>
          </div>
        ))}
      </div>
      {showFooter ? (
        <button type="button" className="mt-4 flex w-full items-center justify-end gap-2 text-sm uppercase tracking-[0.12em] text-[var(--sb-red-bright)]">
          View All Activity
          <ChevronRight className="h-4 w-4" />
        </button>
      ) : null}
    </section>
  );
}

/** Renders the bottom upgrade CTA shown in the desktop member pass reference. */
function MoreWithBlissPanel({ onNavigate }: { onNavigate: (view: AppView) => void }) {
  return (
    <section className="luxury-panel grid gap-4 p-5 md:grid-cols-[70px_1fr_auto] md:items-center">
      <span className="grid h-14 w-14 place-items-center rounded-full border border-[var(--sb-border)] bg-black/34">
        {iconAssets.flower ? <AssetIcon src={iconAssets.flower} size={38} /> : null}
      </span>
      <div>
        <h2 className="text-xl text-[var(--sb-gold)]">
          <span className="xl:hidden">Great food. Greater rewards.</span>
          <span className="hidden xl:inline">Get More With Bliss</span>
        </h2>
        <p className="mt-1 text-sm text-[var(--sb-muted)]">
          <span className="xl:hidden">Keep earning points and unlock more exclusive experiences.</span>
          <span className="hidden xl:inline">Move up to Platinum at 4,000 points and unlock even more exclusive rewards and experiences.</span>
        </p>
      </div>
      <Button className="red-glow-button h-12 rounded-xl px-8 uppercase tracking-[0.14em]" onClick={() => onNavigate("loyalty")}>
        Explore Tiers
      </Button>
    </section>
  );
}
