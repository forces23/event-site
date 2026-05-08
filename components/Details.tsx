"use client";

import { ExternalLink, Shirt, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DetailsProps {
  dresscode: string;
  registry: string;
}

export default function Details({ dresscode, registry }: DetailsProps) {
  return (
    <section id="details" className="section-padding bg-white">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <p className="font-script text-4xl md:text-5xl text-primary mb-1">Details</p>
          <div className="w-16 h-0.5 mx-auto mt-4 bg-accent/40" />
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          {/* Dress Code */}
          <div className="p-6 rounded-2xl border border-border bg-background hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Shirt className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-display text-lg font-semibold mb-2">Dress Code</h3>
            <p className="text-muted-foreground">{dresscode}</p>
            <p className="text-sm text-muted-foreground mt-2">
              Guests are encouraged to wear elegant and semi-formal attire.
            </p>
          </div>

          {/* Gifts */}
          <div className="p-6 rounded-2xl border border-border bg-background hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-4">
              <Gift className="w-6 h-6 text-accent" />
            </div>
            <h3 className="font-display text-lg font-semibold mb-2">Gifts</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Your presence is the best gift of all! But if you'd like to bring something,
              feel free to check the wishlist.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => window.open(registry, "_blank", "noopener,noreferrer")}
            >
              <ExternalLink className="w-4 h-4" />
              View Wishlist
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
