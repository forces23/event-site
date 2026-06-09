import type { Metadata } from "next";
import { Great_Vibes, Playfair_Display, Montserrat } from "next/font/google";
import { Toaster } from "sonner";
import { EVENT } from "@/config/config";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const greatVibes = Great_Vibes({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-script",
  display: "swap",
});

export const metadata: Metadata = {
  title: `${EVENT.name} — ${EVENT.fullTitle}`,
  description: `Te invitamos a celebrar ${EVENT.fullTitle} de ${EVENT.name} el ${new Date(EVENT.date).toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" })}.`,
  openGraph: {
    title: `${EVENT.name} — ${EVENT.fullTitle}`,
    description: `¡Celebra el día especial de ${EVENT.name} con nosotros!`,
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { primaryColorHsl, accentColorHsl } = EVENT.theme;

  return (
    <html
      lang="es"
      className={`${montserrat.variable} ${playfair.variable} ${greatVibes.variable}`}
    >
      <head>
        {/* Inject theme CSS variables from config */}
        <style>{`
          :root {
            --primary: ${primaryColorHsl};
            --secondary: ${accentColorHsl};
            --accent: ${accentColorHsl};
            --gold: ${accentColorHsl};
            --mint: ${primaryColorHsl};
            --ring: ${primaryColorHsl};
          }
        `}</style>
      </head>
      <body className="font-sans min-h-screen">
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
