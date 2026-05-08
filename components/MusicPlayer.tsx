"use client";

import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

export default function MusicPlayer({ src }: { src: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.loop = true;
    audio.volume = 0.4;
    audio.muted = false;

    // Try unmuted autoplay first
    audio
      .play()
      .then(() => {
        setHasStarted(true);
        setIsMuted(false);
      })
      .catch(() => {
        // Browser blocked unmuted autoplay — fall back to muted
        audio.muted = true;
        audio
          .play()
          .then(() => {
            setHasStarted(true);
            setIsMuted(true);
          })
          .catch(() => {
            // Autoplay blocked entirely — user must tap the button
          });
      });
  }, []);

  const handleToggle = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!hasStarted) {
      audio.muted = false;
      try {
        await audio.play();
        setHasStarted(true);
        setIsMuted(false);
      } catch {
        // Still blocked
      }
      return;
    }

    const next = !isMuted;
    audio.muted = next;
    setIsMuted(next);
  };

  return (
    <>
      <audio ref={audioRef} src={src} preload="auto" />
      <button
        onClick={handleToggle}
        className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm shadow-lg border border-primary/20 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
        aria-label={isMuted || !hasStarted ? "Unmute music" : "Mute music"}
        title={isMuted || !hasStarted ? "Unmute music" : "Mute music"}
      >
        {isMuted || !hasStarted ? (
          <VolumeX className="w-5 h-5 text-primary" />
        ) : (
          <Volume2 className="w-5 h-5 text-primary" />
        )}
      </button>
    </>
  );
}
