"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

const MUTE_KEY = "quince_music_muted";

export interface MusicPlayerHandle {
  playWithGesture: () => void;
}

const MusicPlayer = forwardRef<MusicPlayerHandle, { src: string }>(
  function MusicPlayer({ src }, ref) {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isMuted, setIsMuted]       = useState(false);
    const [hasStarted, setHasStarted] = useState(false);

    // Called directly in the tap handler — runs synchronously within the
    // user gesture so iOS Safari allows audio.play()
    useImperativeHandle(ref, () => ({
      playWithGesture() {
        const audio = audioRef.current;
        if (!audio || !audio.paused) return;
        const savedMuted = localStorage.getItem(MUTE_KEY) === "true";
        audio.loop   = true;
        audio.volume = 0.4;
        audio.muted  = savedMuted;
        audio.play()
          .then(() => { setHasStarted(true); setIsMuted(savedMuted); })
          .catch(() => {});
      },
    }));

    // Try autoplay on mount — works on desktop, skipped if user previously muted
    useEffect(() => {
      const audio = audioRef.current;
      if (!audio) return;

      audio.loop   = true;
      audio.volume = 0.4;

      if (localStorage.getItem(MUTE_KEY) === "true") {
        setIsMuted(true);
        return;
      }

      audio.muted = false;
      audio.play()
        .then(() => { setHasStarted(true); setIsMuted(false); })
        .catch(() => {
          audio.muted = true;
          audio.play()
            .then(() => { setHasStarted(true); setIsMuted(true); })
            .catch(() => { /* fully blocked — wait for tap */ });
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
          localStorage.setItem(MUTE_KEY, "false");
        } catch { /* still blocked */ }
        return;
      }

      const next = !isMuted;
      audio.muted = next;
      setIsMuted(next);
      localStorage.setItem(MUTE_KEY, String(next));
    };

    // No track configured (e.g. music: "") — render no player at all.
    if (!src) return null;

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
);

export default MusicPlayer;
