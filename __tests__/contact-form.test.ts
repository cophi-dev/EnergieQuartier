import {
  buildContactMailto,
  contactFormSchema,
  loadContactInquiries,
  saveContactInquiry,
} from "@/app/lib/contact-form";

describe("contact-form", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("validiert Pflichtfelder", () => {
    const result = contactFormSchema.safeParse({
      name: "A",
      email: "invalid",
      message: "kurz",
      includeProject: false,
    });
    expect(result.success).toBe(false);
  });

  it("speichert Anfrage in localStorage", () => {
    const inquiry = saveContactInquiry(
      {
        name: "Max Mustermann",
        email: "max@example.com",
        organization: "HV Nord",
        message: "Wir planen eine Wärmepumpen-Umstellung in Wilhelmsburg.",
        includeProject: true,
      },
      { id: "p1", name: "MFH Demo" },
    );

    expect(inquiry.id).toBeTruthy();
    const stored = loadContactInquiries();
    expect(stored[0]?.name).toBe("Max Mustermann");
    expect(stored[0]?.projectName).toBe("MFH Demo");
  });

  it("erzeugt mailto-Link", () => {
    const url = buildContactMailto({
      name: "Test",
      email: "t@example.com",
      message: "Hallo, ich habe eine Frage zu unserem MFH.",
      includeProject: false,
    });
    expect(url).toMatch(/^mailto:/);
    expect(decodeURIComponent(url)).toContain("Test");
  });
});
