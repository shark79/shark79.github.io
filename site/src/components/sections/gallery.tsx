import Image from "next/image";

const PHOTOS = [
  "IMG_0148.jpg",
  "IMG_0150.jpg",
  "IMG_0158.jpg",
  "IMG_0161.jpg",
  "IMG_0170.jpg",
  "IMG_0249.jpg",
  "IMG_0369.jpg",
  "IMG_0722.jpg",
  "IMG_1234.jpg",
  "IMG_1369.jpg",
  "IMG_2609.jpg",
  "IMG_3560.jpg",
  "IMG_4732.jpg",
];

export function Gallery() {
  return (
    <section id="gallery" className="border-b border-border py-24">
      <div className="mx-auto mb-12 max-w-5xl px-6 sm:px-10">
        <div className="glass-panel flex items-baseline gap-6 px-6 py-5 sm:px-8">
          <span className="font-mono text-xs text-muted-foreground">05</span>
          <h2 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            Off the clock
          </h2>
        </div>
      </div>

      <div className="scrollbar-none flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-4 sm:px-10">
        {PHOTOS.map((file, i) => (
          <div
            key={file}
            className="relative aspect-[4/5] w-[70vw] flex-none snap-start overflow-hidden rounded-lg border border-border sm:w-[320px]"
          >
            <Image
              src={`/gallery/${file}`}
              alt=""
              fill
              sizes="(max-width: 640px) 70vw, 320px"
              className="object-cover grayscale transition-[transform,filter] duration-500 hover:scale-105 hover:grayscale-0"
              priority={i < 2}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
