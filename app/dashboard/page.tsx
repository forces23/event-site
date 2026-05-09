"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import axios from "axios";
import { toast } from "sonner";
import { LogOut, Download, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import OverviewCards from "@/components/dashboard/OverviewCards";
import RSVPTable from "@/components/dashboard/RSVPTable";
import MessagesWall from "@/components/dashboard/MessagesWall";
import PhotoGallery from "@/components/dashboard/PhotoGallery";
import SettingsPanel from "@/components/dashboard/SettingsPanel";
import { EVENT } from "@/config/alexa";
import type { RsvpDocument, PhotoDocument, DashboardStats } from "@/types";

interface DashboardData {
  stats: DashboardStats;
  rsvps: RsvpDocument[];
}

export default function DashboardPage() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const isAdmin = (session?.user as { role?: string })?.role === "admin";

  const [data, setData] = useState<DashboardData | null>(null);
  const [photos, setPhotos] = useState<PhotoDocument[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [rsvpRes, photoRes] = await Promise.all([
        axios.get<DashboardData>("/api/dashboard/rsvps"),
        axios.get<{ photos: PhotoDocument[] }>("/api/gallery"),
      ]);
      setData(rsvpRes.data);
      setPhotos(photoRes.data.photos);
    } catch {
      toast.error("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/dashboard/login");
  };

  const handleRsvpDelete = (id: string) => {
    setData((prev) => {
      if (!prev) return prev;
      const rsvps = prev.rsvps.filter((r) => r._id !== id);
      const attending = rsvps.filter((r) => r.rsvp.status === "attending");
      const declined = rsvps.filter((r) => r.rsvp.status === "declined");
      return {
        rsvps,
        stats: {
          total_responses: rsvps.length,
          attending: attending.length,
          declined: declined.length,
          total_headcount: attending.reduce((s, r) => s + r.party.total_headcount, 0),
          total_adults: attending.reduce((s, r) => s + r.party.total_adults, 0),
          total_kids: attending.reduce((s, r) => s + r.party.total_kids, 0),
        },
      };
    });
  };

  const handleMessageDelete = (id: string) => {
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        rsvps: prev.rsvps.map((r) =>
          r._id === id
            ? { ...r, message: { ...r.message, msg: "", is_public: false } }
            : r
        ),
      };
    });
  };

  const handlePhotoDelete = (id: string) =>
    setPhotos((prev) => prev.filter((p) => p._id !== id));

  const handleExportCSV = () => {
    window.open("/api/dashboard/export", "_blank");
  };

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="font-display font-semibold text-lg">{EVENT.fullTitle}</h1>
            <p className="text-xs text-muted-foreground capitalize">
              {(session?.user as { role?: string })?.role ?? "user"} dashboard
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => router.push("/")} title="Go home">
              <Home className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={fetchData} title="Refresh">
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
            {isAdmin && (
              <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-2">
                <Download className="w-4 h-4" />
                Export CSV
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="gap-2 text-muted-foreground"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {loading && !data ? (
          <div className="flex items-center justify-center py-24">
            <RefreshCw className="w-8 h-8 animate-spin text-primary opacity-40" />
          </div>
        ) : (
          <Tabs defaultValue="overview">
            <TabsList className="mb-6">
              <TabsTrigger value="overview">📊 Overview</TabsTrigger>
              <TabsTrigger value="rsvps">📋 RSVPs</TabsTrigger>
              <TabsTrigger value="messages">💌 Messages</TabsTrigger>
              <TabsTrigger value="photos">📷 Photos</TabsTrigger>
              {isAdmin && <TabsTrigger value="settings">⚙️ Settings</TabsTrigger>}
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {data && <OverviewCards stats={data.stats} />}
            </TabsContent>

            <TabsContent value="rsvps">
              {data && (
                <RSVPTable
                  rsvps={data.rsvps}
                  isAdmin={isAdmin}
                  onDelete={handleRsvpDelete}
                />
              )}
            </TabsContent>

            <TabsContent value="messages">
              {data && (
                <MessagesWall
                  rsvps={data.rsvps}
                  isAdmin={isAdmin}
                  onDelete={handleMessageDelete}
                />
              )}
            </TabsContent>

            <TabsContent value="photos">
              <PhotoGallery
                photos={photos}
                isAdmin={isAdmin}
                onDelete={handlePhotoDelete}
              />
            </TabsContent>

            {isAdmin && (
              <TabsContent value="settings">
                <SettingsPanel />
              </TabsContent>
            )}
          </Tabs>
        )}
      </div>
    </main>
  );
}
