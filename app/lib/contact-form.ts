import { z } from "zod";

export const contactFormSchema = z.object({
  name: z.string().min(2, "Bitte Namen angeben"),
  email: z.string().email("Gültige E-Mail erforderlich"),
  organization: z.string().max(120).optional(),
  phone: z.string().max(30).optional(),
  message: z
    .string()
    .min(20, "Nachricht mindestens 20 Zeichen")
    .max(2000),
  includeProject: z.boolean(),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;

export interface ContactInquiry extends ContactFormValues {
  id: string;
  projectName?: string;
  projectId?: string;
  createdAt: string;
}

const STORAGE_KEY = "energie-quartier-contact-inquiries";

export function saveContactInquiry(
  values: ContactFormValues,
  project?: { id: string; name: string },
): ContactInquiry {
  const inquiry: ContactInquiry = {
    ...values,
    id: typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `inq-${Date.now()}`,
    projectId: values.includeProject ? project?.id : undefined,
    projectName: values.includeProject ? project?.name : undefined,
    createdAt: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    const existing = loadContactInquiries();
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([inquiry, ...existing].slice(0, 20)),
    );
  }

  return inquiry;
}

export function loadContactInquiries(): ContactInquiry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ContactInquiry[];
  } catch {
    return [];
  }
}

export function buildContactMailto(
  values: ContactFormValues,
  project?: { id: string; name: string },
  recipientEmail?: string | null,
): string {
  const subject = encodeURIComponent(
    `EnergieQuartier Anfrage${project?.name ? `: ${project.name}` : ""}`,
  );
  const body = encodeURIComponent(
    [
      `Name: ${values.name}`,
      `E-Mail: ${values.email}`,
      values.organization ? `Organisation: ${values.organization}` : "",
      values.phone ? `Telefon: ${values.phone}` : "",
      values.includeProject && project?.name
        ? `Projekt: ${project.name}`
        : "",
      "",
      values.message,
    ]
      .filter(Boolean)
      .join("\n"),
  );
  const to = recipientEmail ? encodeURIComponent(recipientEmail) : "";
  return to
    ? `mailto:${to}?subject=${subject}&body=${body}`
    : `mailto:?subject=${subject}&body=${body}`;
}
