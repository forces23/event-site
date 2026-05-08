"use client";

import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Trash2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { RsvpDocument } from "@/types";

interface MessagesWallProps {
  rsvps: RsvpDocument[];
  isAdmin: boolean;
  onDelete: (id: string) => void;
}

export default function MessagesWall({ rsvps, isAdmin, onDelete }: MessagesWallProps) {
  const [deleting, setDeleting] = useState<string | null>(null);

  const messages = rsvps.filter((r) => r.message.msg && r.message.is_public);

  const handleDelete = async (id: string) => {
    if (!confirm("Clear this message? This cannot be undone.")) return;
    setDeleting(id);
    try {
      await axios.delete(`/api/dashboard/messages/${id}`);
      onDelete(id);
      toast.success("Message cleared.");
    } catch {
      toast.error("Failed to delete message.");
    } finally {
      setDeleting(null);
    }
  };

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-muted-foreground">
        <MessageSquare className="w-10 h-10 opacity-20" />
        <p className="text-sm">No public messages yet.</p>
      </div>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {messages.map((r) => (
        <div
          key={r._id}
          className="relative p-5 rounded-2xl border border-border bg-background hover:shadow-md transition-shadow"
        >
          <div className="flex items-start gap-3">
            <div className="text-2xl">💌</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">{r.message.msg}</p>
              <p className="text-xs text-muted-foreground mt-2">— {r.guest.name}</p>
            </div>
          </div>
          {isAdmin && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 text-destructive hover:text-destructive hover:bg-destructive/10 h-7 w-7"
              onClick={() => handleDelete(r._id)}
              disabled={deleting === r._id}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}
