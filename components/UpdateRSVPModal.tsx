"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import { toast } from "sonner";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { RsvpDocument } from "@/types";

const updateSchema = z
  .object({
    name: z.string().min(1, "El nombre es obligatorio"),
    email: z.string().email("Correo inválido").or(z.literal("")).optional(),
    phone: z.string().optional(),
    relationship: z.string().min(1, "Obligatorio"),
    status: z.enum(["attending", "declined"]),
    total_adults: z.number().min(1).max(20),
    total_kids: z.number().min(0).max(20),
    msg: z.string().max(300).optional(),
    is_public: z.boolean(),
  })
  .superRefine((d, ctx) => {
    if (!d.email && !d.phone?.trim()) {
      ctx.addIssue({ code: "custom", path: ["email"], message: "Se requiere correo o teléfono" });
    }
  });

type UpdateForm = z.infer<typeof updateSchema>;

interface UpdateRSVPModalProps {
  open: boolean;
  onClose: () => void;
  eventName: string;
}

export default function UpdateRSVPModal({ open, onClose, eventName }: UpdateRSVPModalProps) {
  const [lookupValue, setLookupValue] = useState("");
  const [lookupError, setLookupError] = useState("");
  const [looking, setLooking] = useState(false);
  const [foundRsvp, setFoundRsvp] = useState<RsvpDocument | null>(null);
  const [updating, setUpdating] = useState(false);
  const [done, setDone] = useState(false);

  const { register, handleSubmit, watch, setValue, formState: { errors }, reset } =
    useForm<UpdateForm>({ resolver: zodResolver(updateSchema) });

  const status = watch("status");
  const totalAdults = watch("total_adults") ?? 1;
  const totalKids = watch("total_kids") ?? 0;
  const msgValue = watch("msg") ?? "";

  const handleClose = () => {
    setLookupValue("");
    setLookupError("");
    setFoundRsvp(null);
    setDone(false);
    reset();
    onClose();
  };

  const handleLookup = async () => {
    if (!lookupValue.trim()) {
      setLookupError("Ingresa tu correo o teléfono.");
      return;
    }
    setLooking(true);
    setLookupError("");
    try {
      const { data } = await axios.post<{ rsvp: RsvpDocument }>("/api/rsvp/lookup", {
        identifier: lookupValue.trim(),
      });
      const r = data.rsvp;
      setFoundRsvp(r);
      reset({
        name: r.guest.name,
        email: r.guest.email ?? "",
        phone: r.guest.phone ?? "",
        relationship: r.guest.relationship,
        status: r.rsvp.status,
        total_adults: r.party.total_adults || 1,
        total_kids: r.party.total_kids || 0,
        msg: r.message.msg ?? "",
        is_public: r.message.is_public,
      });
    } catch (err: unknown) {
      const msg =
        axios.isAxiosError(err) && err.response?.data?.error
          ? err.response.data.error
          : "No encontrado. Verifica tu correo o teléfono.";
      setLookupError(msg);
    } finally {
      setLooking(false);
    }
  };

  const onSubmit = async (data: UpdateForm) => {
    if (!foundRsvp) return;
    setUpdating(true);
    try {
      await axios.patch(`/api/rsvp/${foundRsvp._id}`, data);
      setDone(true);
      toast.success("¡Tu confirmación ha sido actualizada!");
      setTimeout(handleClose, 2000);
    } catch (err: unknown) {
      const msg =
        axios.isAxiosError(err) && err.response?.data?.error
          ? err.response.data.error
          : "La actualización falló. Inténtalo de nuevo.";
      toast.error(msg);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="max-w-md w-full">
        {done ? (
          <div className="text-center py-6 space-y-3">
            <div className="text-5xl">✅</div>
            <h2 className="font-display text-xl font-semibold">¡Confirmación Actualizada!</h2>
            <p className="text-muted-foreground text-sm">Cerrando en un momento...</p>
          </div>
        ) : !foundRsvp ? (
          /* Lookup step */
          <div className="space-y-4">
            <DialogHeader>
              <DialogTitle className="font-display text-xl">Actualiza tu Confirmación</DialogTitle>
              <DialogDescription>
                Ingresa el correo o teléfono que usaste al confirmar.
              </DialogDescription>
            </DialogHeader>
            <Input
              placeholder="Correo o teléfono"
              value={lookupValue}
              onChange={(e) => setLookupValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLookup()}
            />
            {lookupError && (
              <p className="text-destructive text-sm">{lookupError}</p>
            )}
            <Button className="w-full" onClick={handleLookup} disabled={looking}>
              {looking ? "Buscando..." : "Buscar mi confirmación →"}
            </Button>
          </div>
        ) : (
          /* Edit step */
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            <DialogHeader>
              <DialogTitle className="font-display text-xl">Edita tu Confirmación</DialogTitle>
            </DialogHeader>

            <div>
              <Label>Nombre Completo</Label>
              <Input className="mt-1" {...register("name")} />
              {errors.name && <p className="text-destructive text-xs mt-1">{errors.name.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Correo</Label>
                <Input type="email" className="mt-1" {...register("email")} />
              </div>
              <div>
                <Label>Teléfono</Label>
                <Input type="tel" className="mt-1" {...register("phone")} />
              </div>
            </div>
            {errors.email && <p className="text-destructive text-xs -mt-2">{errors.email.message}</p>}

            <div>
              <Label>Parentesco</Label>
              <select
                className="mt-1 flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                {...register("relationship")}
              >
                <option value="family">Familia</option>
                <option value="friend">Amigo/a</option>
                <option value="coworker">Compañero/a de trabajo</option>
                <option value="other">Otro</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setValue("status", "attending")}
                className={`p-4 rounded-xl border-2 text-center text-sm font-medium transition-all ${
                  status === "attending" ? "border-primary bg-primary/10" : "border-border"
                }`}
              >
                🎉 Asistiré
              </button>
              <button
                type="button"
                onClick={() => setValue("status", "declined")}
                className={`p-4 rounded-xl border-2 text-center text-sm font-medium transition-all ${
                  status === "declined" ? "border-destructive/50 bg-destructive/5" : "border-border"
                }`}
              >
                💌 No podré
              </button>
            </div>

            {status === "attending" && (
              <div className="space-y-3 p-4 bg-muted rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Adultos</span>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => setValue("total_adults", Math.max(1, totalAdults - 1))}
                      className="w-7 h-7 rounded-full border flex items-center justify-center">
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center font-semibold">{totalAdults}</span>
                    <button type="button" onClick={() => setValue("total_adults", totalAdults + 1)}
                      className="w-7 h-7 rounded-full border flex items-center justify-center">
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Niños</span>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => setValue("total_kids", Math.max(0, totalKids - 1))}
                      className="w-7 h-7 rounded-full border flex items-center justify-center">
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center font-semibold">{totalKids}</span>
                    <button type="button" onClick={() => setValue("total_kids", totalKids + 1)}
                      className="w-7 h-7 rounded-full border flex items-center justify-center">
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div>
              <Label>Mensaje para {eventName}</Label>
              <Textarea className="mt-1" maxLength={300} {...register("msg")} />
              <p className="text-xs text-muted-foreground text-right mt-1">{msgValue.length}/300</p>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">¿Hacer público el mensaje?</span>
              <Switch checked={watch("is_public")} onCheckedChange={(v) => setValue("is_public", v)} />
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={updating}>
              {updating ? "Actualizando..." : "Actualizar Confirmación"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
