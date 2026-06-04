"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

export interface LightboxItem {
  src: string;
  alt: string;
  type?: "image" | "video";
}

interface LightboxProps {
  items: LightboxItem[];
  startIndex: number;
  onClose: () => void;
}

export default function Lightbox({ items, startIndex, onClose }: LightboxProps) {
  const [current, setCurrent] = useState(startIndex);
  const touchStartX = useRef<number | null>(null);

  const prev = () => setCurrent((i) => (i - 1 + items.length) % items.length);
  const next = () => setCurrent((i) => (i + 1) % items.length);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft")       setCurrent((i) => (i - 1 + items.length) % items.length);
      else if (e.key === "ArrowRight") setCurrent((i) => (i + 1) % items.length);
      else if (e.key === "Escape")     onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [items.length, onClose]);

  const item = items[current];

  // The outer backdrop handles all close-on-click.
  // The centering wrapper is pointer-events-none so backdrop clicks pass through it.
  // Only the actual media box and buttons restore pointer-events to block those clicks.
  return (
    <div
      className="fixed inset-0 z-50 bg-black/93"
      onClick={onClose}
      onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => {
        if (touchStartX.current === null) return;
        const diff = touchStartX.current - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) diff > 0 ? next() : prev();
        touchStartX.current = null;
      }}
    >
      {/* Close button */}
      <button
        className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white transition-colors"
        onClick={(e) => { e.stopPropagation(); onClose(); }}
      >
        <X className="w-5 h-5" />
      </button>

      {/* Counter */}
      {items.length > 1 && (
        <div
          className="absolute top-4 left-1/2 -translate-x-1/2 z-20 px-3 py-1 rounded-full bg-black/50 text-white/80 text-sm select-none"
          onClick={(e) => e.stopPropagation()}
        >
          {current + 1} / {items.length}
        </div>
      )}

      {/* Prev arrow */}
      {items.length > 1 && (
        <button
          className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white transition-colors"
          onClick={(e) => { e.stopPropagation(); prev(); }}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {/* Next arrow */}
      {items.length > 1 && (
        <button
          className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white transition-colors"
          onClick={(e) => { e.stopPropagation(); next(); }}
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      {/* Media — centering wrapper is pointer-events-none so clicks on the padding
          area fall through to the backdrop and close the lightbox.
          Only the media box itself restores pointer events. */}
      <div className="absolute inset-0 flex items-center justify-center p-4 md:p-20 pointer-events-none">
        <div
          className="relative w-full max-w-5xl max-h-[88vh] pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {item.type === "video" ? (
            <video
              key={item.src}
              src={item.src}
              className="w-full max-h-[88vh] rounded-lg object-contain"
              controls
              autoPlay
              playsInline
            />
          ) : (
            <div className="relative w-full" style={{ paddingBottom: "75%" }}>
              <Image
                key={item.src}
                src={item.src}
                alt={item.alt}
                fill
                className="object-contain"
                unoptimized
                priority
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
