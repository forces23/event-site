"use client";

import { Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface DirectionsModalProps {
  open: boolean;
  onClose: () => void;
  query: string;
  address: string;
}

export default function DirectionsModal({
  open,
  onClose,
  query,
  address,
}: DirectionsModalProps) {
  const googleUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
  const appleUrl = `https://maps.apple.com/?daddr=${encodeURIComponent(address)}`;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm text-center">
        <DialogHeader>
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
            <Navigation className="w-6 h-6 text-primary" />
          </div>
          <DialogTitle className="font-display text-xl">Cómo Llegar</DialogTitle>
          <DialogDescription className="text-sm">
            Elige tu aplicación de mapas
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 pt-2">
          <Button
            size="lg"
            className="w-full gap-2 bg-[#34A853] hover:bg-[#2d9249] text-white"
            onClick={() => {
              window.open(googleUrl, "_blank", "noopener,noreferrer");
              onClose();
            }}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
            </svg>
            Google Maps
          </Button>

          <Button
            size="lg"
            variant="outline"
            className="w-full gap-2 border-foreground/20"
            onClick={() => {
              window.open(appleUrl, "_blank", "noopener,noreferrer");
              onClose();
            }}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
            </svg>
            Apple Maps
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
