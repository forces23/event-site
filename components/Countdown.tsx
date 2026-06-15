"use client";

import { useEffect, useState } from "react";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function getTimeLeft(targetDate: string): TimeLeft {
  const diff = Math.max(0, new Date(targetDate).getTime() - Date.now());
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / 1000 / 60) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

export default function Countdown({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(getTimeLeft(targetDate));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const id = setInterval(() => setTimeLeft(getTimeLeft(targetDate)), 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  const units = [
    { label: "Days", value: timeLeft.days },
    { label: "Hours", value: timeLeft.hours },
    { label: "Minutes", value: timeLeft.minutes },
    { label: "Seconds", value: timeLeft.seconds },
  ];

  if (!mounted) {
    return (
      <div className="flex gap-3 md:gap-6 justify-center">
        {["Days", "Hours", "Minutes", "Seconds"].map((label) => (
          <div key={label} className="text-center">
            <div className="text-4xl md:text-6xl font-display font-bold text-primary w-16 md:w-24 tabular-nums">
              --
            </div>
            <div className="text-xs md:text-sm text-muted-foreground tracking-widest uppercase mt-1">
              {label}
            </div>
          </div>
        ))}
      </div>
    );
  }

  const allZero = Object.values(timeLeft).every((v) => v === 0);

  if (allZero) {
    return (
      <p className="text-xl md:text-2xl font-display text-primary text-center">
        🎉 The celebration is here!
      </p>
    );
  }

  return (
    <div className="flex gap-3 md:gap-6 justify-center">
      {units.map(({ label, value }) => (
        <div key={label} className="text-center">
          <div className="text-4xl md:text-6xl font-display font-bold text-primary tabular-nums w-16 md:w-24">
            {String(value).padStart(2, "0")}
          </div>
          <div className="text-xs md:text-sm text-muted-foreground tracking-widest uppercase mt-1">
            {label}
          </div>
        </div>
      ))}
    </div>
  );
}
