/**
 * Generates /public/qr-upload.png pointing to NEXT_PUBLIC_SITE_URL/upload
 * Run: npm run generate-qr
 */

import QRCode from "qrcode";
import path from "path";

try { process.loadEnvFile(path.resolve(process.cwd(), ".env.local")); } catch {}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
if (!siteUrl) {
  console.error("❌  NEXT_PUBLIC_SITE_URL not set in .env.local");
  process.exit(1);
}

const uploadUrl = `${siteUrl.replace(/\/$/, "")}/upload`;
const outputPath = path.resolve(process.cwd(), "public", "qr-upload.png");

async function generate() {
  await QRCode.toFile(outputPath, uploadUrl, {
    type: "png",
    width: 400,
    margin: 2,
    color: {
      dark: "#2d5c45",   // dark mint
      light: "#ffffff",
    },
    errorCorrectionLevel: "H",
  });
  console.log(`✅ QR code saved to: ${outputPath}`);
  console.log(`   Points to: ${uploadUrl}`);
}

generate().catch((err) => {
  console.error("❌ QR generation failed:", err);
  process.exit(1);
});
