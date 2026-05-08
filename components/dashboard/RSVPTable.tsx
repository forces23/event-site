"use client";

import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { RsvpDocument } from "@/types";

interface RSVPTableProps {
  rsvps: RsvpDocument[];
  isAdmin: boolean;
  onDelete: (id: string) => void;
}

export default function RSVPTable({ rsvps, isAdmin, onDelete }: RSVPTableProps) {
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this RSVP? This cannot be undone.")) return;
    setDeleting(id);
    try {
      await axios.delete(`/api/dashboard/rsvps/${id}`);
      onDelete(id);
      toast.success("RSVP deleted.");
    } catch {
      toast.error("Failed to delete RSVP.");
    } finally {
      setDeleting(null);
    }
  };

  if (rsvps.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No RSVPs yet.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead>Name</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Relationship</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Party</TableHead>
            <TableHead>Submitted</TableHead>
            {isAdmin && <TableHead className="w-12" />}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rsvps.map((r) => (
            <TableRow key={r._id}>
              <TableCell className="font-medium">{r.guest.name}</TableCell>
              <TableCell>
                <div className="text-sm">
                  {r.guest.email && <div className="text-muted-foreground">{r.guest.email}</div>}
                  {r.guest.phone && <div className="text-muted-foreground">{r.guest.phone}</div>}
                </div>
              </TableCell>
              <TableCell className="capitalize">{r.guest.relationship}</TableCell>
              <TableCell>
                <Badge variant={r.rsvp.status === "attending" ? "success" : "destructive"}>
                  {r.rsvp.status === "attending" ? "✅ Attending" : "❌ Declined"}
                </Badge>
              </TableCell>
              <TableCell>
                {r.rsvp.status === "attending" ? (
                  <span className="text-sm">
                    {r.party.total_adults}A + {r.party.total_kids}K = {r.party.total_headcount}
                  </span>
                ) : (
                  <span className="text-muted-foreground text-sm">—</span>
                )}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {new Date(r.rsvp.submitted_at).toLocaleDateString()}
              </TableCell>
              {isAdmin && (
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8"
                    onClick={() => handleDelete(r._id)}
                    disabled={deleting === r._id}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
