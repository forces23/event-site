import { Card, CardContent } from "@/components/ui/card";
import type { DashboardStats } from "@/types";

interface CardDef {
  label: string;
  emoji: string;
  value: number;
  color: string;
}

export default function OverviewCards({ stats }: { stats: DashboardStats }) {
  const cards: CardDef[] = [
    { label: "Total Responses", emoji: "📊", value: stats.total_responses, color: "bg-primary/10 text-primary" },
    { label: "Attending", emoji: "✅", value: stats.attending, color: "bg-emerald-100 text-emerald-700" },
    { label: "Declined", emoji: "❌", value: stats.declined, color: "bg-red-100 text-red-600" },
    { label: "Total Headcount", emoji: "👥", value: stats.total_headcount, color: "bg-accent/10 text-accent" },
    { label: "Adults", emoji: "🧑", value: stats.total_adults, color: "bg-blue-100 text-blue-700" },
    { label: "Kids", emoji: "🧒", value: stats.total_kids, color: "bg-purple-100 text-purple-700" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {cards.map((c) => (
        <Card key={c.label} className="hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg mb-3 ${c.color}`}>
              {c.emoji}
            </div>
            <p className="text-3xl font-display font-bold">{c.value}</p>
            <p className="text-sm text-muted-foreground mt-0.5">{c.label}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
