"use client";

import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { ImageIcon } from "lucide-react";
import { gsap, useGSAP } from "@/lib/gsap";
import Lightbox from "@/components/Lightbox";

interface GalleryProps {
  photos: string[];
  name: string;
}

export default function Gallery({ photos: configPhotos, name }: GalleryProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [photos, setPhotos]             = useState<string[]>(configPhotos);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/her-gallery")
      .then((r) => r.json())
      .then((d: { photos: { url: string }[] }) => {
        if (Array.isArray(d.photos) && d.photos.length > 0) {
          setPhotos(d.photos.map((p) => p.url));
        }
      })
      .catch(() => { /* fail open — use config photos */ });
  }, []);

  useGSAP(
    () => {
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced) return;

      const sel = gsap.utils.selector(sectionRef) as (q: string) => HTMLElement[];

      gsap.from(sel(".gallery-header"), {
        opacity: 0, y: 30, duration: 0.8, ease: "power2.out",
        scrollTrigger: { trigger: sel(".gallery-header")[0], start: "top 82%", once: true },
      });

      gsap.from(sel(".gallery-item"), {
        opacity: 0,
        scale: 0.88,
        duration: 0.55,
        stagger: 0.07,
        ease: "power2.out",
        scrollTrigger: { trigger: sel(".gallery-item")[0], start: "top 85%", once: true },
      });
    },
    { scope: sectionRef, dependencies: [] },
  );

  const isPlaceholder = (src: string) => src.includes("placeholder");
  const clickablePhotos = photos.filter((src) => !isPlaceholder(src));

  const openLightbox = (index: number) => {
    if (isPlaceholder(photos[index])) return;
    // map to index within clickable photos
    const clickableIndex = clickablePhotos.indexOf(photos[index]);
    if (clickableIndex !== -1) setLightboxIndex(clickableIndex);
  };

  return (
    <>
      {lightboxIndex !== null && (
        <Lightbox
          items={clickablePhotos.map((src, i) => ({ src, alt: `${name} photo ${i + 1}` }))}
          startIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}

      <section
        ref={sectionRef}
        id="gallery"
        className="section-padding"
        style={{ background: "linear-gradient(180deg, hsl(153 35% 97%) 0%, #fdfcf8 100%)" }}
      >
        <div className="max-w-4xl mx-auto">
          <div className="gallery-header text-center mb-10">
            <p className="font-script text-4xl md:text-5xl text-primary mb-1">{name}</p>
            <p className="text-muted-foreground text-sm tracking-wider uppercase">Her gallery</p>
            <div className="w-16 h-0.5 mx-auto mt-4 bg-accent/40" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
            {photos.map((src, i) => {
              const placeholder = isPlaceholder(src);
              return (
                <div
                  key={i}
                  className={`gallery-item relative aspect-square rounded-xl overflow-hidden bg-primary/5 ${
                    !placeholder ? "cursor-pointer group" : ""
                  }`}
                  onClick={() => openLightbox(i)}
                >
                  {placeholder ? (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                      <ImageIcon className="w-8 h-8 text-primary/20" />
                      <span className="text-xs text-muted-foreground">Photo coming soon</span>
                    </div>
                  ) : (
                    <>
                      <Image
                        src={src}
                        alt={`${name} photo ${i + 1}`}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 50vw, 33vw"
                        unoptimized
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors duration-300" />
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
