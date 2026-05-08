import { EVENT } from "@/config/alexa";
import EnvelopeIntro from "@/components/EnvelopeIntroClient";
import Hero         from "@/components/Hero";
import SectionTabs  from "@/components/SectionTabs";
import Footer       from "@/components/Footer";
import MusicPlayer  from "@/components/MusicPlayer";

export default function Home() {
  return (
    <main>
      <EnvelopeIntro eventDate={EVENT.date} />
      <MusicPlayer src={EVENT.music} />
      <Hero event={EVENT} />
      <SectionTabs event={EVENT} />
      <Footer name={EVENT.name} />
    </main>
  );
}
