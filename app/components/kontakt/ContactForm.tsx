"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { CheckCircle2, Mail, Send } from "lucide-react";
import { ButtonLink } from "@/app/components/ui/ButtonLink";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  buildContactMailto,
  contactFormSchema,
  saveContactInquiry,
} from "@/app/lib/contact-form";
import { getContactEmail } from "@/app/lib/env";
import { useProjectStore } from "@/lib/store";

export function ContactForm() {
  const currentProject = useProjectStore((s) => s.currentProject);
  const [submitted, setSubmitted] = useState(false);
  const contactEmail = getContactEmail();
  const hasProject = Boolean(currentProject.name?.trim());

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      organization: "",
      phone: "",
      message: "",
      includeProject: hasProject,
    },
  });

  const onSubmit = handleSubmit((values) => {
    saveContactInquiry(values, {
      id: currentProject.id,
      name: currentProject.name,
    });
    setSubmitted(true);
  });

  const openMailto = () => {
    const values = getValues();
    if (!values.name || !values.email || !values.message) return;
    window.location.href = buildContactMailto(
      values,
      hasProject ? currentProject : undefined,
      contactEmail,
    );
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <Card className="glass-card mx-auto max-w-lg border-[#22C55E]/30">
          <CardContent className="py-10 text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-[#22C55E]" />
            <h2 className="mt-4 text-xl font-semibold text-[#0F172A] dark:text-white">
              Vielen Dank für Ihre Anfrage!
            </h2>
            <p className="mt-2 text-sm text-[#0F172A]/65 dark:text-white/65">
              Ihre Nachricht wurde gespeichert. Wir melden uns mit den nächsten
              Schritten zu Ihrem Energiekonzept.
            </p>
            <ButtonLink href="/dashboard" className="mt-6">
              Zum Ergebnis
            </ButtonLink>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <Card className="glass-card mx-auto max-w-2xl border-[#0F172A]/8">
      <CardHeader>
        <CardTitle className="text-[#0F172A] dark:text-white">
          Nachricht senden
        </CardTitle>
        <CardDescription>
          Beschreiben Sie kurz Ihr Vorhaben – wir melden uns für ein
          Beratungsgespräch.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input id="name" {...register("name")} placeholder="Ihr Name" />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-Mail *</Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                placeholder="name@firma.de"
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="organization">Organisation</Label>
              <Input
                id="organization"
                {...register("organization")}
                placeholder="Hausverwaltung, Projektentwicklung …"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefon</Label>
              <Input
                id="phone"
                {...register("phone")}
                placeholder="Optional"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Ihre Nachricht *</Label>
            <textarea
              id="message"
              {...register("message")}
              rows={5}
              placeholder="z. B. MFH in Wilhelmsburg, geplante Wärmepumpen-Umstellung, Fragen zu Förderung …"
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            />
            {errors.message && (
              <p className="text-xs text-destructive">{errors.message.message}</p>
            )}
          </div>
          {hasProject && (
            <label className="flex cursor-pointer items-start gap-2 text-sm">
              <input
                type="checkbox"
                {...register("includeProject")}
                className="mt-1"
              />
              <span className="text-[#0F172A]/75 dark:text-white/75">
                Aktuelles Projekt mitsenden:{" "}
                <strong>{currentProject.name}</strong>
              </span>
            </label>
          )}
          <div className="flex flex-wrap gap-3 pt-2">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#06B6D4] text-[#0F172A] hover:bg-[#22C55E]"
            >
              <Send className="mr-2 h-4 w-4" />
              Anfrage senden
            </Button>
            <Button
              type="button"
              variant="outline"
              className="border-[#0F172A]/15"
              onClick={openMailto}
            >
              <Mail className="mr-2 h-4 w-4" />
              Als E-Mail entwurf
            </Button>
          </div>
          <p className="text-xs text-[#0F172A]/50 dark:text-white/50">
            Anfragen werden lokal im Browser gespeichert. Für produktiven
            Einsatz kann eine CRM-Anbindung ergänzt werden.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
