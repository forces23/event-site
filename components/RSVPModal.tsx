"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import { toast } from "sonner";
import { Minus, Plus, Check, X } from "lucide-react";
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
} from "@/components/ui/dialog";

const schema = z
  .object({
    name: z.string().min(1, "Full name is required"),
    email: z.string().email("Invalid email").or(z.literal("")).optional(),
    phone: z.string().optional(),
    relationship: z.string().min(1, "Please select your relationship"),
    status: z.enum(["attending", "declined"]),
    total_adults: z.number().min(1).max(20),
    total_kids: z.number().min(0).max(20),
    msg: z.string().max(300, "Max 300 characters").optional(),
    is_public: z.boolean(),
  })
  .superRefine((d, ctx) => {
    if (!d.email && !d.phone?.trim()) {
      ctx.addIssue({ code: "custom", path: ["email"], message: "Email or phone is required" });
    }
  });

type FormData = z.infer<typeof schema>;

type Step = 1 | 2 | 3 | "done";

interface RSVPModalProps {
  open: boolean;
  onClose: () => void;
  eventName: string;
}

export default function RSVPModal({ open, onClose, eventName }: RSVPModalProps) {
  const [step, setStep] = useState<Step>(1);
  const [countdown, setCountdown] = useState(10);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      status: "attending",
      total_adults: 1,
      total_kids: 0,
      is_public: true,
      msg: "",
    },
  });

  const status = watch("status");
  const totalAdults = watch("total_adults");
  const totalKids = watch("total_kids");
  const msgValue = watch("msg") ?? "";

  // Reset on close
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        reset();
        setStep(1);
        setCountdown(10);
      }, 300);
    }
  }, [open, reset]);

  // Thank you countdown
  useEffect(() => {
    if (step !== "done") return;
    const id = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(id);
          onClose();
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [step, onClose]);

  const goToStep2 = async () => {
    const valid = await trigger(["name", "email", "phone", "relationship"]);
    if (valid) setStep(2);
  };

  const selectStatus = (s: "attending" | "declined") => {
    setValue("status", s);
    if (s === "declined") {
      setStep(3);
    }
  };

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    try {
      await axios.post("/api/rsvp", data);
      setStep("done");
      setCountdown(10);
    } catch (err: unknown) {
      const message =
        axios.isAxiosError(err) && err.response?.data?.error
          ? err.response.data.error
          : "Something went wrong. Please try again.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md w-full">
        {step === "done" ? (
          <ThankYou name={eventName} countdown={countdown} onClose={onClose} />
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            {/* Step indicator */}
            <div className="flex items-center gap-2 mb-6">
              {([1, 2, 3] as const).map((s) => (
                <div
                  key={s}
                  className={`h-1.5 flex-1 rounded-full transition-colors ${
                    (step as number) >= s ? "bg-primary" : "bg-muted"
                  }`}
                />
              ))}
            </div>

            {/* Step 1: Your Info */}
            {step === 1 && (
              <div className="space-y-4">
                <DialogHeader>
                  <DialogTitle className="font-display text-2xl text-primary">
                    Your Info
                  </DialogTitle>
                </DialogHeader>

                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input id="name" placeholder="Maria Garcia" className="mt-1" {...register("name")} />
                  {errors.name && <p className="text-destructive text-xs mt-1">{errors.name.message}</p>}
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="maria@email.com" className="mt-1" {...register("email")} />
                  {errors.email && <p className="text-destructive text-xs mt-1">{errors.email.message}</p>}
                </div>

                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" type="tel" placeholder="+1 (555) 000-0000" className="mt-1" {...register("phone")} />
                  <p className="text-muted-foreground text-xs mt-1">At least email or phone is required</p>
                </div>

                <div>
                  <Label htmlFor="relationship">Relationship</Label>
                  <select
                    id="relationship"
                    className="mt-1 flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    {...register("relationship")}
                  >
                    <option value="">Select...</option>
                    <option value="family">Family</option>
                    <option value="friend">Friend</option>
                    <option value="coworker">Coworker</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.relationship && (
                    <p className="text-destructive text-xs mt-1">{errors.relationship.message}</p>
                  )}
                </div>

                <Button type="button" className="w-full" size="lg" onClick={goToStep2}>
                  Next →
                </Button>
              </div>
            )}

            {/* Step 2: Attending? */}
            {step === 2 && (
              <div className="space-y-6">
                <DialogHeader>
                  <DialogTitle className="font-display text-2xl text-primary">
                    Will you be joining us?
                  </DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => selectStatus("attending")}
                    className={`p-6 rounded-2xl border-2 text-center transition-all ${
                      status === "attending"
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/40"
                    }`}
                  >
                    <div className="text-3xl mb-2">🎉</div>
                    <p className="font-display font-semibold text-sm">Yes, I'd love to!</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => selectStatus("declined")}
                    className={`p-6 rounded-2xl border-2 text-center transition-all ${
                      status === "declined"
                        ? "border-destructive/50 bg-destructive/5"
                        : "border-border hover:border-destructive/30"
                    }`}
                  >
                    <div className="text-3xl mb-2">💌</div>
                    <p className="font-display font-semibold text-sm">Sadly, I can't</p>
                  </button>
                </div>

                {status === "attending" && (
                  <div className="space-y-4">
                    <Stepper
                      label="How many adults?"
                      value={totalAdults}
                      min={1}
                      onChange={(v) => setValue("total_adults", v)}
                    />
                    <Stepper
                      label="How many kids?"
                      value={totalKids}
                      min={0}
                      onChange={(v) => setValue("total_kids", v)}
                    />
                    <p className="text-sm text-muted-foreground text-center">
                      Total guests: <strong>{totalAdults + totalKids}</strong>
                    </p>
                    <Button type="button" className="w-full" size="lg" onClick={() => setStep(3)}>
                      Next →
                    </Button>
                  </div>
                )}

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={() => setStep(1)}
                >
                  ← Back
                </Button>
              </div>
            )}

            {/* Step 3: Message */}
            {step === 3 && (
              <div className="space-y-5">
                <DialogHeader>
                  <DialogTitle className="font-display text-2xl text-primary">
                    Leave a message 💌
                  </DialogTitle>
                </DialogHeader>

                <div>
                  <Label htmlFor="msg">A message for {eventName}</Label>
                  <Textarea
                    id="msg"
                    placeholder={`Write something sweet for ${eventName}...`}
                    className="mt-1 min-h-[100px]"
                    maxLength={300}
                    {...register("msg")}
                  />
                  <p className="text-xs text-muted-foreground mt-1 text-right">
                    {msgValue.length}/300
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Make it public?</p>
                    <p className="text-xs text-muted-foreground">Show on the site</p>
                  </div>
                  <Switch
                    checked={watch("is_public")}
                    onCheckedChange={(v) => setValue("is_public", v)}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={submitting}
                >
                  {submitting ? "Sending..." : "Submit RSVP 🎊"}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={() => setStep(2)}
                >
                  ← Back
                </Button>
              </div>
            )}
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Stepper({
  label,
  value,
  min,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm font-medium flex-1">{label}</span>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          className="w-8 h-8 rounded-full border border-input flex items-center justify-center hover:bg-muted transition-colors"
        >
          <Minus className="w-4 h-4" />
        </button>
        <span className="w-8 text-center font-display text-lg font-semibold">{value}</span>
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          className="w-8 h-8 rounded-full border border-input flex items-center justify-center hover:bg-muted transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function ThankYou({
  name,
  countdown,
  onClose,
}: {
  name: string;
  countdown: number;
  onClose: () => void;
}) {
  return (
    <div className="text-center py-6 space-y-4">
      <div className="text-6xl animate-bounce">🎊</div>
      <h2 className="font-script text-5xl text-primary">Thank You!</h2>
      <p className="font-display text-lg text-foreground/80">
        We can't wait to celebrate with you!
      </p>
      <p className="text-muted-foreground text-sm">
        Returning to the page in {countdown}s...
      </p>
      <Button variant="outline" size="sm" onClick={onClose}>
        Close
      </Button>
    </div>
  );
}
