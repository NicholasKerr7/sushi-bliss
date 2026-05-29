import Image from "next/image";
import { ChefHat, Sparkles, Wand2 } from "lucide-react";
import { Button } from "../ui/button";
import { omakaseMoods, type OmakaseMood, type OmakaseSet } from "../../lib/omakase-utils";

interface OmakasePanelProps {
  activeMood: OmakaseMood;
  set: OmakaseSet;
  onMoodChange: (mood: OmakaseMood) => void;
  onAddSet: () => void;
}

/** Highlights a chef-curated bundle so ordering feels guided, premium, and unique to Sushi Bliss. */
export function OmakasePanel({ activeMood, set, onMoodChange, onAddSet }: OmakasePanelProps) {
  return (
    <section className="mt-10 px-4 sm:px-6 md:px-8">
      <div className="luxury-panel relative overflow-hidden p-5 text-white sm:p-6">
        <div className="pointer-events-none absolute inset-0 sb-wave-pattern opacity-10" />
        <div className="relative grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--sb-border)] bg-black/35 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--sb-gold)]">
              <Wand2 className="h-4 w-4" />
              Omakase Mode
            </div>
            <h2 className="editorial-title mt-4 text-4xl leading-tight text-white sm:text-5xl">
              The Art Of Omakase.
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--sb-muted)]">
              Choose a mood and Sushi Bliss assembles a balanced set with texture, temperature, and pairing in mind.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {omakaseMoods.map((mood) => (
                <button
                  key={mood}
                  type="button"
                  onClick={() => onMoodChange(mood)}
                  className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                    activeMood === mood
                      ? "border-[var(--sb-red-bright)] bg-[var(--sb-red)]/24 text-white"
                      : "border-[var(--sb-border)] bg-white/[0.03] text-[var(--sb-muted)] hover:border-[var(--sb-gold)] hover:text-white"
                  }`}
                >
                  {mood}
                </button>
              ))}
            </div>
            <div className="mt-6 rounded-2xl border border-[var(--sb-border)] bg-black/35 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-[var(--sb-gold)]">Chef read</p>
              <p className="mt-2 text-sm leading-6 text-[var(--sb-muted)]">{set.description}</p>
              <div className="mt-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-[var(--sb-muted)]">Set total</p>
                  <p className="text-2xl font-semibold text-[var(--sb-gold)]">${set.total.toFixed(2)}</p>
                </div>
                <Button
                  className="red-glow-button rounded-2xl px-4 py-3 font-semibold"
                  onClick={onAddSet}
                >
                  <ChefHat className="mr-2 h-4 w-4" />
                  Add Set
                </Button>
              </div>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {set.items.map((item) => (
              <article key={item.id} className="overflow-hidden rounded-2xl border border-[var(--sb-border)] bg-white/[0.03]">
                <div className="relative h-36 bg-black/30">
                  <Image
                    src={item.image.publicUrl}
                    alt={item.name}
                    fill
                    sizes="(min-width: 1024px) 280px, (min-width: 640px) 45vw, 100vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full border border-[var(--sb-border)] bg-black/45 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--sb-gold)] backdrop-blur-xl">
                    <Sparkles className="h-3 w-3" />
                    {item.tag}
                  </span>
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-semibold leading-tight">{item.name}</h3>
                    <span className="text-sm font-semibold text-[var(--sb-gold)]">${item.price.toFixed(2)}</span>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-[var(--sb-muted)]">{item.texture}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
