"use client";

import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

const MUTE_KEY = "quince_music_muted";

export default function MusicPlayer({ src, tapSignal }: { src: string; tapSignal?: boolean }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isMuted, setIsMuted]       = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  // Autoplay on mount — skipped if user previously muted
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.loop   = true;
    audio.volume = 0.4;

    const savedMuted = localStorage.getItem(MUTE_KEY) === "true";

    if (savedMuted) {
      // Respect user's preference — don't start automatically
      setIsMuted(true);
      return;
    }

    audio.muted = false;
    audio
      .play()
      .then(() => { setHasStarted(true); setIsMuted(false); })
      .catch(() => {
        audio.muted = true;
        audio
          .play()
          .then(() => { setHasStarted(true); setIsMuted(true); })
          .catch(() => { /* fully blocked — wait for tap */ });
      });
  }, []);

  // Envelope tap — guaranteed user gesture, fixes iOS Safari; respects saved preference
  useEffect(() => {
    if (!tapSignal) return;
    const audio = audioRef.current;
    if (!audio) return;

    const savedMuted = localStorage.getItem(MUTE_KEY) === "true";

    if (!hasStarted) {
      audio.muted = savedMuted;
      audio
        .play()
        .then(() => { setHasStarted(true); setIsMuted(savedMuted); })
        .catch(() => { /* still blocked */ });
    } else if (!savedMuted) {
      audio.muted = false;
      setIsMuted(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tapSignal]);

  const handleToggle = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!hasStarted) {
      audio.muted = false;
      try {
        await audio.play();
        setHasStarted(true);
        setIsMuted(false);
        localStorage.setItem(MUTE_KEY, "false");
      } catch { /* still blocked */ }
      return;
    }

    const next = !isMuted;
    audio.muted = next;
    setIsMuted(next);
    localStorage.setItem(MUTE_KEY, String(next));
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
