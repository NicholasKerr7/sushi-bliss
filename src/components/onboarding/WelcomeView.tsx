"use client";

import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { getSushiIconAssets } from "../../data/icon-assets";
import { getBrand, getFeaturedAssets } from "../../data/selectors";
import type { AppView } from "../layout/types";
import { Button } from "../ui/button";
import { AssetIcon } from "../icons/AssetIcon";

interface WelcomeViewProps {
  onNavigate: (view: AppView) => void;
}

const brand = getBrand();
const featuredAssets = getFeaturedAssets();
const icons = getSushiIconAssets();

/** Renders the mobile-first welcome state from the first screenshot reference. */
export function WelcomeView({ onNavigate }: WelcomeViewProps) {
  return (
    <section className="relative min-h-[100svh] overflow-hidden bg-black px-5 pb-7 pt-8 text-center text-white sm:px-8 xl:grid xl:grid-cols-[minmax(0,0.95fr)_minmax(430px,0.65fr)] xl:items-center xl:gap-8 xl:px-16 xl:py-10 xl:text-left">
      <Image
        src={featuredAssets.heroSushi.publicUrl}
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-[56%_30%] opacity-82 xl:object-[50%_50%]"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.42)_0%,rgba(0,0,0,0.28)_30%,rgba(0,0,0,0.92)_64%,rgba(0,0,0,0.98)_100%)] xl:bg-[linear-gradient(90deg,rgba(0,0,0,0.42)_0%,rgba(0,0,0,0.74)_48%,rgba(0,0,0,0.97)_100%)]" />
      <div className="sb-wave-pattern absolute bottom-[28%] left-0 h-44 w-64 opacity-20 xl:bottom-10 xl:left-10" />
      <div className="sb-wave-pattern absolute bottom-20 right-0 h-36 w-56 rotate-180 opacity-18 xl:bottom-auto xl:right-10 xl:top-24" />

      <div className="relative z-10 mx-auto flex min-h-[calc(100svh-3.75rem)] max-w-[430px] flex-col justify-end xl:ml-auto xl:mr-0 xl:min-h-[620px] xl:max-w-[720px] xl:justify-center">
        <div className="mb-auto mt-4 flex flex-col items-center xl:mb-8 xl:mt-0 xl:items-start">
          <AssetIcon src={brand.assets.floralEmblem.publicUrl} alt={brand.name} size={78} className="drop-shadow-[0_0_30px_rgba(202,164,93,0.24)] xl:h-24 xl:w-24" />
          <p className="editorial-title mt-3 text-[28px] uppercase leading-[1.16] tracking-[0.32em] text-white sm:text-[38px] xl:text-[48px]">
            Sushi
            <span className="block">Bliss</span>
          </p>
        </div>

        <div className="space-y-5 xl:max-w-[560px]">
          <div>
            <h1 className="editorial-title text-[62px] uppercase leading-[0.86] text-white sm:text-[86px] xl:text-[96px]">
              Sushi
              <span className="block text-[var(--sb-red-bright)]">Bliss</span>
            </h1>
            <div className="mx-auto mt-5 flex max-w-[170px] items-center justify-center gap-3 xl:mx-0">
              <span className="h-px flex-1 bg-[var(--sb-gold)]" />
              {icons.flower ? <AssetIcon src={icons.flower} size={28} /> : null}
              <span className="h-px flex-1 bg-[var(--sb-gold)]" />
            </div>
            <p className="mx-auto mt-5 max-w-[340px] text-[22px] leading-[1.38] text-[var(--sb-gold)] sm:max-w-[480px] sm:text-[28px] xl:mx-0">
              Timeless Japanese artistry. Authentic. Refined. Unforgettable.
            </p>
          </div>

          <div className="space-y-4">
            <Button
              className="red-glow-button h-[64px] w-full rounded-[18px] border border-[var(--sb-red-bright)] text-[16px] uppercase tracking-[0.16em] sm:h-[76px] sm:text-[20px]"
              onClick={() => onNavigate("menu")}
            >
              {icons.flower ? <AssetIcon src={icons.flower} size={28} className="mr-4 sm:mr-5 sm:h-8 sm:w-8" /> : null}
              Explore Menu
              <ChevronRight className="ml-auto h-6 w-6 text-[var(--sb-gold)]" />
            </Button>
            <Button
              variant="outline"
              className="h-[62px] w-full rounded-[16px] border-[var(--sb-border-strong)] bg-black/34 text-[16px] uppercase tracking-[0.22em] text-[var(--sb-gold)] backdrop-blur-xl sm:h-[74px] sm:text-[20px]"
              onClick={() => onNavigate("profile")}
            >
              {icons.profile ? <AssetIcon src={icons.profile} size={28} className="mr-4 sm:mr-5 sm:h-[33px] sm:w-[33px]" /> : null}
              Sign In
              <ChevronRight className="ml-auto h-6 w-6" />
            </Button>
            <button
              type="button"
              className="mx-auto flex h-12 items-center justify-center gap-4 px-4 text-[15px] uppercase tracking-[0.18em] text-[var(--sb-gold)] transition hover:text-white focus:outline-none focus:ring-2 focus:ring-[var(--sb-gold)] sm:text-[18px] xl:mx-0"
              onClick={() => onNavigate("home")}
            >
              Continue As Guest
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
