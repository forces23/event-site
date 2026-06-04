import { EVENT } from "@/config/config";
import HomeClient  from "@/components/HomeClient";
import Hero        from "@/components/Hero";
import SectionTabs from "@/components/SectionTabs";
import Footer      from "@/components/Footer";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; gallery?: string }>;
}) {
  const params           = await searchParams;
  const initialTab       = params.tab     === "gallery" ? "gallery" : "details";
  const initialGalleryTab = params.gallery === "party"   ? "party"   : "alexa";

  return (
    <main>
      <HomeClient />
      <Hero event={EVENT} />
      <SectionTabs
        event={EVENT}
        initialTab={initialTab}
        initialGalleryTab={initialGalleryTab}
      />
      <Footer name={EVENT.name} />
    </main>
  );
}
