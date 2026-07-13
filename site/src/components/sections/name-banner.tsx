import { CursorDrivenParticleTypography } from "@/components/ui/cursor-driven-particles-typography";

export function NameBanner() {
  return (
    <div
      id="top"
      className="flex min-h-[34vh] w-full flex-col items-center justify-center gap-3 bg-background px-6 pb-8 pt-24 sm:min-h-[28vh] sm:gap-0 sm:pt-8"
    >
      {/* Two lines on narrow screens: each word gets the full viewport
          width to size against, instead of squeezing the full name into a
          tiny illegible font. Single line from sm and up. */}
      <div className="flex w-full flex-col gap-3 sm:hidden">
        <div className="aspect-[7/1] max-h-[90px] min-h-[48px] w-full">
          <CursorDrivenParticleTypography
            text="SHASHANK"
            className="text-foreground font-heading"
            fontSize={220}
            particleSize={2.2}
            particleDensity={5}
            dispersionStrength={18}
            returnSpeed={0.09}
            interactionRadius={60}
          />
        </div>
        <div className="aspect-[7/1] max-h-[90px] min-h-[48px] w-full">
          <CursorDrivenParticleTypography
            text="JAMKHANDI"
            className="text-foreground font-heading"
            fontSize={220}
            particleSize={2.2}
            particleDensity={5}
            dispersionStrength={18}
            returnSpeed={0.09}
            interactionRadius={60}
          />
        </div>
      </div>

      <div className="hidden aspect-[6/1] max-h-[220px] min-h-[80px] w-full sm:block">
        <CursorDrivenParticleTypography
          text="SHASHANK JAMKHANDI"
          className="text-foreground font-heading"
          fontSize={220}
          particleSize={2}
          particleDensity={5}
          dispersionStrength={18}
          returnSpeed={0.09}
          interactionRadius={60}
        />
      </div>
    </div>
  );
}
