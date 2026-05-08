"use client";

import dynamic from "next/dynamic";

// ssr: false must live in a Client Component — this thin wrapper satisfies that
// constraint while keeping page.tsx as a Server Component.
const EnvelopeIntro = dynamic(
  () => import("@/components/EnvelopeIntro"),
  { ssr: false },
);

export default EnvelopeIntro;
