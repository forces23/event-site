"use client";

import { useRef } from "react";
import dynamic from "next/dynamic";
import MusicPlayer, { type MusicPlayerHandle } from "@/components/MusicPlayer";
import { EVENT } from "@/config/alexa";

const EnvelopeIntro = dynamic(() => import("@/components/EnvelopeIntro"), { ssr: false });

export default function HomeClient() {
  const musicRef = useRef<MusicPlayerHandle>(null);

  return (
    <>
      <EnvelopeIntro
        eventDate={EVENT.date}
        onOpen={() => musicRef.current?.playWithGesture()}
      />
      <MusicPlayer ref={musicRef} src={EVENT.music} />
    </>
  );
}
