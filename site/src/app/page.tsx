import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { NameBanner } from "@/components/sections/name-banner";
import { Hero } from "@/components/sections/hero";
import { Showreel } from "@/components/sections/showreel";
import { About } from "@/components/sections/about";
import { Projects } from "@/components/sections/projects";
import { Experience } from "@/components/sections/experience";
import { Skills } from "@/components/sections/skills";
import { Gallery } from "@/components/sections/gallery";
import { Contact } from "@/components/sections/contact";

export default function Home() {
  return (
    <>
      <Nav />
      <main className="flex-1">
        <NameBanner />
        <Hero />
        <Showreel />
        <About />
        <Projects />
        <Experience />
        <Skills />
        <Gallery />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
