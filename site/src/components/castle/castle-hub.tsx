"use client";

import { useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { PROFILE, ROOMS, type RoomId } from "@/lib/content";
import { cn } from "@/lib/utils";
import { openPaintingLightbox } from "@/components/ui/painting-lightbox";
import { CastleWorld } from "./castle-world";
import { CastleLoader } from "./castle-loader";
import { sideFor } from "./castle-camera";
import type { CastleScene as CastleSceneT } from "./castle-scene";

const PAINTING_ROOMS = new Set<RoomId>(["about", "experience", "gallery"]);

function goToRoom(id: RoomId) {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.getElementById(id)?.scrollIntoView({ behavior: reduced ? "instant" : "smooth" });
}

/**
 * The full castle experience: the persistent 3D `CastleWorld` behind the
 * page, the hero copy + accessible door rail on top of it, and two small
 * interactive bands (hero openings; the active room's paintings) that
 * forward pointer events into the scene for raycasting.
 */
export function CastleHub() {
  const sceneRef = useRef<CastleSceneT | null>(null);
  const [activeRoomId, setActiveRoomId] = useState<RoomId | null>(null);
  const [hoveredRoom, setHoveredRoom] = useState<RoomId | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number; y: number } | null>(null);
  const [hoveredPainting, setHoveredPainting] = useState<string | null>(null);

  function onHeroMove(e: ReactPointerEvent<HTMLDivElement>) {
    const scene = sceneRef.current;
    if (!scene || e.pointerType !== "mouse") return;
    const id = scene.raycastOpenings(e.clientX, e.clientY);
    setHoveredRoom(id);
    scene.setHoveredOpening(id);
    setTooltip(id ? scene.getScreenPosition(scene.getOpeningAnchor(id)) : null);
  }
  function onHeroLeave() {
    setHoveredRoom(null);
    sceneRef.current?.setHoveredOpening(null);
    setTooltip(null);
  }
  function onHeroDown(e: ReactPointerEvent<HTMLDivElement>) {
    const scene = sceneRef.current;
    if (!scene) return;
    const id = scene.raycastOpenings(e.clientX, e.clientY);
    if (id) goToRoom(id);
  }

  function onPaintingMove(e: ReactPointerEvent<HTMLDivElement>) {
    const scene = sceneRef.current;
    if (!scene || !activeRoomId || e.pointerType !== "mouse") return;
    const file = scene.raycastPaintings(e.clientX, e.clientY, activeRoomId);
    setHoveredPainting(file);
    scene.setHoveredPainting(file);
  }
  function onPaintingDown(e: ReactPointerEvent<HTMLDivElement>) {
    const scene = sceneRef.current;
    if (!scene || !activeRoomId) return;
    const file = scene.raycastPaintings(e.clientX, e.clientY, activeRoomId);
    if (file) openPaintingLightbox(file);
  }

  const paintingBandRoom = activeRoomId && PAINTING_ROOMS.has(activeRoomId) ? activeRoomId : null;
  const side = paintingBandRoom ? sideFor(paintingBandRoom) : "left";

  return (
    <>
      <CastleWorld
        onSceneReady={(scene) => {
          sceneRef.current = scene;
        }}
        onActiveRoomChange={setActiveRoomId}
      />
      <CastleLoader />

      {paintingBandRoom && (
        <div
          className={cn(
            "fixed z-5 inset-x-0 top-0 h-[45svh] pointer-events-auto",
            side === "left" ? "lg:inset-y-0 lg:top-0 lg:right-auto lg:left-0 lg:h-auto lg:w-[45vw]" : "lg:inset-y-0 lg:top-0 lg:left-auto lg:right-0 lg:h-auto lg:w-[45vw]",
            hoveredPainting ? "cursor-pointer" : "cursor-default",
          )}
          onPointerMove={onPaintingMove}
          onPointerLeave={() => {
            setHoveredPainting(null);
            sceneRef.current?.setHoveredPainting(null);
          }}
          onPointerDown={onPaintingDown}
        />
      )}

      <section id="top" className="relative min-h-svh px-6 pt-28 pb-44 sm:px-10 sm:pt-36">
        <div
          className={cn("absolute inset-0", hoveredRoom ? "cursor-pointer" : "cursor-default")}
          onPointerMove={onHeroMove}
          onPointerLeave={onHeroLeave}
          onPointerDown={onHeroDown}
        />

        {/* Mobile-only legibility scrim: the castle sits directly behind this copy at
            small widths, so it needs a soft cream fade behind the text, not just contrast. */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-[5] h-[78%] bg-gradient-to-b from-background/96 via-background/80 to-transparent sm:hidden" />

        <div className="relative z-10 pointer-events-none max-w-3xl">
          <p className="font-mono text-[11px] tracking-[0.18em] text-muted-foreground uppercase">{PROFILE.eyebrow}</p>
          <h1 className="mt-3 font-[family-name:var(--font-heading)] text-[clamp(3rem,12vw,8.5rem)] leading-[0.96] tracking-tight text-foreground">
            {PROFILE.name}
          </h1>
          <p className="mt-5 max-w-md text-[clamp(1.25rem,3vw,1.75rem)] leading-snug text-foreground">
            {PROFILE.tagline[0]}
            <br />
            {taglineWithAccent(PROFILE.tagline[1])}
          </p>
          <p className="mt-4 max-w-md text-base text-muted-foreground">{PROFILE.intro}</p>
          <p className="mt-8 font-mono text-xs tracking-[0.14em] text-muted-foreground uppercase">Pick a door.</p>
        </div>

        {tooltip && hoveredRoom && (
          <div
            className="clay-sm pointer-events-none fixed z-20 -translate-x-1/2 -translate-y-full rounded-full bg-card px-3 py-1 font-mono text-[11px] tracking-[0.1em] text-foreground uppercase"
            style={{ left: tooltip.x, top: tooltip.y - 14 }}
          >
            {ROOMS.find((r) => r.id === hoveredRoom)?.place}
          </div>
        )}

        <nav
          aria-label="Rooms"
          className="pointer-events-auto absolute inset-x-0 bottom-6 z-10 flex snap-x snap-mandatory gap-3 overflow-x-auto px-6 pb-1 sm:px-10"
        >
          {ROOMS.map((room) => (
            <button
              key={room.id}
              type="button"
              onClick={() => goToRoom(room.id)}
              className="clay clay-interactive flex min-h-11 shrink-0 snap-start items-center gap-2 rounded-full bg-card px-4 py-2 text-left"
            >
              <span className="font-mono text-[11px] text-primary tabular-nums">{room.n}</span>
              <span className="text-sm font-medium text-foreground">{room.place}</span>
              <span className="text-xs text-muted-foreground">{room.label}</span>
            </button>
          ))}
        </nav>
      </section>
    </>
  );
}

function taglineWithAccent(line: string) {
  const i = line.indexOf("not");
  if (i < 0) return line;
  return (
    <>
      {line.slice(0, i)}
      <span className="text-primary">not</span>
      {line.slice(i + 3)}
    </>
  );
}
