import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { Hero } from "@/components/sections/hero";
import { Work } from "@/components/sections/work";
import { About } from "@/components/sections/about";
import { Experience } from "@/components/sections/experience";
import { Skills } from "@/components/sections/skills";
import { Gallery } from "@/components/sections/gallery";
import { Contact } from "@/components/sections/contact";
import { PhotoLightbox } from "@/components/ui/photo-lightbox";
import { RevealObserver } from "@/components/ui/reveal-observer";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Work />
        <About />
        <Experience />
        <Skills />
        <Gallery />
        <Contact />
      </main>
      <Footer />
      <PhotoLightbox />
      <RevealObserver />
    </>
  );
}
