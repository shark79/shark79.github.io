import { CursorDrivenParticleTypography } from "@/components/ui/cursor-driven-particles-typography";

export function NameBanner() {
  return (
    <div
      id="top"
      className="flex min-h-[24vh] w-full items-center justify-center bg-background px-6 py-8 sm:min-h-[28vh]"
    >
      <div className="aspect-[6/1] max-h-[220px] min-h-[80px] w-full">
        <CursorDrivenParticleTypography
          text="SHASHANK JAMKHANDI"
          className="text-foreground font-heading"
          fontSize={220}
          particleSize={1.4}
          particleDensity={5}
          dispersionStrength={18}
          returnSpeed={0.09}
        />
      </div>
    </div>
  );
}
