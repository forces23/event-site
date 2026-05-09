"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import MusicPlayer from "@/components/MusicPlayer";
import { EVENT } from "@/config/alexa";

const EnvelopeIntro = dynamic(() => import("@/components/EnvelopeIntro"), { ssr: false });

export default function HomeClient() {
  const [tapSignal, setTapSignal] = useState(false);

  return (
    <>
      <EnvelopeIntro
        eventDate={EVENT.date}
        onOpen={() => setTapSignal(true)}
      />
      <MusicPlayer src={EVENT.music} tapSignal={tapSignal} />
    </>
  );
}
