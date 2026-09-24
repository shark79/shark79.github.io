import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { CastleHub } from "@/components/castle/castle-hub";
import { About } from "@/components/sections/about";
import { Projects } from "@/components/sections/projects";
import { Experience } from "@/components/sections/experience";
import { Skills } from "@/components/sections/skills";
import { Gallery } from "@/components/sections/gallery";
import { Contact } from "@/components/sections/contact";
import { RoomIndex } from "@/components/ui/room-index";
import { RoomVisitTracker } from "@/components/ui/room-visit-tracker";
import { ToastStack } from "@/components/ui/toast-stack";
import { PaintingLightbox } from "@/components/ui/painting-lightbox";

export default function Home() {
  return (
    <>
      <Nav />
      <RoomIndex />
      <CastleHub />
      <main className="relative">
        <About />
        <Projects />
        <Experience />
        <Skills />
        <Gallery />
        <Contact />
      </main>
      <Footer />
      <RoomVisitTracker />
      <ToastStack />
      <PaintingLightbox />
    </>
  );
}
