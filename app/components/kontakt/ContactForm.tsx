"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { CheckCircle2, ExternalLink, Mail, Send } from "lucide-react";
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
  type ContactFormValues,
} from "@/app/lib/contact-form";
import { getHewContactUrl } from "@/app/lib/env";
import { useProjectStore } from "@/lib/store";

export function ContactForm() {
  const currentProject = useProjectStore((s) => s.currentProject);
  const [submitted, setSubmitted] = useState(false);
  const hewUrl = getHewContactUrl();
  const hasProject = Boolean(currentProject.name?.trim());

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
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
    );
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <Card className="glass-card border-[#22C55E]/30">
          <CardContent className="py-10 text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-[#22C55E]" />
            <h2 className="mt-4 text-xl font-semibold text-[#0F172A] dark:text-white">
              Vielen Dank für Ihre Anfrage!
            </h2>
            <p className="mt-2 text-sm text-[#0F172A]/65 dark:text-white/65">
              Ihre Nachricht wurde lokal gespeichert. Für eine direkte
              Kontaktaufnahme können Sie auch die Hamburger Energiewerke
              erreichen.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <ButtonLink
                href={hewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#0F172A] text-white hover:bg-[#06B6D4] hover:text-[#0F172A]"
              >
                Zu HEW Kontakt
                <ExternalLink className="ml-2 h-4 w-4" />
              </ButtonLink>
              <ButtonLink href="/dashboard" variant="outline">
                Zum Ergebnis
              </ButtonLink>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-5">
      <Card className="glass-card border-[#0F172A]/8 lg:col-span-3">
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
                Anfrage speichern
              </Button>
              <Button
                type="button"
                variant="outline"
                className="border-[#0F172A]/15"
                onClick={openMailto}
              >
                <Mail className="mr-2 h-4 w-4" />
                Per E-Mail an HEW
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4 lg:col-span-2">
        <Card className="glass-card border-[#06B6D4]/20">
          <CardHeader>
            <CardTitle className="text-base text-[#0F172A] dark:text-white">
              Hamburger Energiewerke
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-[#0F172A]/70 dark:text-white/70">
            <p>
              Für verbindliche Beratung, Anschluss an Nahwärme oder
              Quartierslösungen in Hamburg:
            </p>
            <ButtonLink
              href={hewUrl}
              target="_blank"
              rel="noopener noreferrer"
              variant="outline"
              className="mt-4 w-full border-[#06B6D4] text-[#0F172A] dark:text-[#06B6D4]"
            >
              HEW Kontaktseite
              <ExternalLink className="ml-2 h-4 w-4" />
            </ButtonLink>
          </CardContent>
        </Card>
        <Card className="border-[#0F172A]/8 bg-[#F8FAFC]/80 dark:bg-[#0F172A]/40">
          <CardContent className="py-4 text-xs text-[#0F172A]/55 dark:text-white/55">
            Hinweis: Anfragen werden lokal im Browser gespeichert (Demo-Modus).
            Für produktiven Einsatz kann eine CRM-Anbindung ergänzt werden.
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
