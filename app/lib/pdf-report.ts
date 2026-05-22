import type { jsPDF } from "jspdf";
import type { CalculationResult } from "@/app/types/calculation";
import type { ProjectData } from "@/app/types/project";
import { BRAND } from "@/app/lib/constants";

const MARGIN = 20;
const PAGE_WIDTH = 210;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

/** RGB aus Hex (#0F172A → [15, 23, 42]) */
function hexRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

const NAVY = hexRgb(BRAND.colors.primary);
const CYAN = hexRgb(BRAND.colors.cyan);
const GREEN = hexRgb(BRAND.colors.green);

type PdfDoc = jsPDF;

function addSectionTitle(doc: PdfDoc, y: number, title: string): number {
  doc.setFontSize(12);
  doc.setTextColor(...NAVY);
  doc.setFont("helvetica", "bold");
  doc.text(title, MARGIN, y);
  doc.setDrawColor(...CYAN);
  doc.setLineWidth(0.5);
  doc.line(MARGIN, y + 2, PAGE_WIDTH - MARGIN, y + 2);
  return y + 10;
}

function addBodyText(
  doc: PdfDoc,
  y: number,
  lines: string[],
  lineHeight = 5,
): number {
  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85);
  doc.setFont("helvetica", "normal");
  let cursor = y;
  for (const line of lines) {
    const wrapped = doc.splitTextToSize(line, CONTENT_WIDTH) as string[];
    doc.text(wrapped, MARGIN, cursor);
    cursor += wrapped.length * lineHeight;
  }
  return cursor + 4;
}

function ensureSpace(doc: PdfDoc, y: number, needed: number): number {
  if (y + needed > 275) {
    doc.addPage();
    addPageFooter(doc);
    return MARGIN + 10;
  }
  return y;
}

function addPageFooter(doc: PdfDoc): void {
  const dateStr = new Date().toLocaleDateString("de-DE");
  doc.setFontSize(7);
  doc.setTextColor(...CYAN);
  doc.text(
    `${BRAND.name} · ${dateStr} · Seite ${doc.getNumberOfPages()}`,
    PAGE_WIDTH / 2,
    287,
    { align: "center" },
  );
}

function addKpiBox(doc: PdfDoc, y: number, result: CalculationResult): number {
  const boxH = 22;
  doc.setFillColor(...NAVY);
  doc.roundedRect(MARGIN, y, CONTENT_WIDTH, boxH, 2, 2, "F");
  doc.setDrawColor(...CYAN);
  doc.setLineWidth(0.3);
  doc.line(MARGIN, y, MARGIN + CONTENT_WIDTH, y);

  const kpis = [
    { label: "Amortisation", value: `${result.economics.paybackYears} J.` },
    {
      label: "CO₂-Einsparung",
      value: `${(result.environment.co2SavingsKg / 1000).toFixed(1)} t/a`,
    },
    {
      label: "NPV (20 J.)",
      value: `${result.economics.npvEur.toLocaleString("de-DE")} €`,
    },
    { label: "Autarkie", value: `${result.annual.autarkyPercent} %` },
  ];

  const colW = CONTENT_WIDTH / 4;
  kpis.forEach((kpi, i) => {
    const x = MARGIN + colW * i + colW / 2;
    doc.setFontSize(7);
    doc.setTextColor(200, 220, 230);
    doc.setFont("helvetica", "normal");
    doc.text(kpi.label, x, y + 8, { align: "center" });
    doc.setFontSize(11);
    doc.setTextColor(...(i % 2 === 0 ? CYAN : GREEN));
    doc.setFont("helvetica", "bold");
    doc.text(kpi.value, x, y + 16, { align: "center" });
  });

  return y + boxH + 8;
}

/** Erzeugt den Konzeptstudien-PDF-Report und startet den Download */
export async function downloadPdfReport(
  project: ProjectData,
  result: CalculationResult,
): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const dateStr = new Date().toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  // Kopfzeile
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, PAGE_WIDTH, 32, "F");
  doc.setFillColor(...CYAN);
  doc.rect(0, 32, PAGE_WIDTH, 1.2, "F");
  doc.setFillColor(...GREEN);
  doc.rect(0, 33.2, PAGE_WIDTH, 0.6, "F");

  doc.setTextColor(...CYAN);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text(BRAND.name, MARGIN, 15);
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "normal");
  doc.text(BRAND.slogan, MARGIN, 22);
  doc.setTextColor(...GREEN);
  doc.setFontSize(8);
  doc.text("Hamburger Energiewerke · Konzeptstudie", MARGIN, 28);
  doc.setTextColor(255, 255, 255);
  doc.text(`Erstellt am ${dateStr}`, PAGE_WIDTH - MARGIN, 28, { align: "right" });

  let y = 44;

  y = addKpiBox(doc, y, result);

  y = addSectionTitle(doc, y, "1. Zusammenfassung");
  y = addBodyText(doc, y, [
    `Projekt: ${project.name}`,
    `Objekt: ${project.address}, ${project.postalCode} Hamburg`,
    `Gebäudetyp: ${project.buildingType} · ${project.livingArea} m² Wohnfläche · Baujahr ${project.yearBuilt}`,
    `Sanierungsstand: ${project.renovationStatus}`,
    `Stromverbrauch: ${project.electricityKwh.toLocaleString("de-DE")} kWh/a`,
    `Wärmeverbrauch: ${project.heatKwh.toLocaleString("de-DE")} kWh/a`,
  ]);

  y = ensureSpace(doc, y, 40);
  y = addSectionTitle(doc, y, "2. Technologie-Konzept");
  const techLines = result.technologyDetails.map(
    (t) => `• ${t.name}: ${t.headline}`,
  );
  if (techLines.length === 0) {
    techLines.push("• Keine Technologie ausgewählt");
  }
  y = addBodyText(doc, y, techLines);

  y = ensureSpace(doc, y, 50);
  y = addSectionTitle(doc, y, "3. Wirtschaftlichkeit");
  y = addBodyText(doc, y, [
    `Investition brutto: ${result.investment.gross.toLocaleString("de-DE")} €`,
    `Förderung (BAFA/KfW, vereinfacht): ${result.investment.subsidies.toLocaleString("de-DE")} €`,
    `Investition netto: ${result.investment.net.toLocaleString("de-DE")} €`,
    `Baseline Energiekosten: ${result.economics.baselineCostEur.toLocaleString("de-DE")} €/a`,
    `Jährliche Einsparung: ${result.economics.annualSavingsEur.toLocaleString("de-DE")} €/a`,
    `Amortisation: ${result.economics.paybackYears} Jahre (Ziel: ${project.targetPaybackYears} J.)`,
    `NPV (20 J., 4 %): ${result.economics.npvEur.toLocaleString("de-DE")} €`,
    `ROI (20 J.): ${result.economics.roiPercent} %`,
    `Budget Kunde: ${project.budget.toLocaleString("de-DE")} €`,
  ]);

  y = ensureSpace(doc, y, 35);
  y = addSectionTitle(doc, y, "4. CO₂-Bilanz");
  y = addBodyText(doc, y, [
    `Ausgangslage: ${(result.environment.co2BaselineKg / 1000).toFixed(2)} t CO₂/a`,
    `Nach Maßnahmen: ${(result.environment.co2AfterKg / 1000).toFixed(2)} t CO₂/a`,
    `Einsparung: ${(result.environment.co2SavingsKg / 1000).toFixed(2)} t CO₂/a`,
    `Autarkiegrad: ${result.annual.autarkyPercent} %`,
    `PV-Eigenverbrauch: ${result.annual.selfConsumptionKwh.toLocaleString("de-DE")} kWh/a`,
  ]);

  if (project.notes.trim()) {
    y = ensureSpace(doc, y, 25);
    y = addSectionTitle(doc, y, "Anmerkungen");
    y = addBodyText(doc, y, [project.notes]);
  }

  y = ensureSpace(doc, y, 40);
  y = addSectionTitle(doc, y, "5. Hinweis / Disclaimer");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  const disclaimer = [
    `Diese Konzeptstudie wurde mit ${BRAND.name} erstellt und dient als vereinfachte`,
    "Entscheidungsgrundlage im Vertriebsgespräch. Die Berechnungen basieren auf",
    "typisierten Annahmen (Erträge Hamburg, BAFA-Fördersätze 2026, Energiepreise",
    "Strom/Gas/Einspeisung) und ersetzen keine detaillierte Fachplanung, Lastgang-",
    "analyse oder verbindliche Förderzusage. Für die Ausführungsplanung sind",
    "Hausbesuche, hydraulische Abstimmung und behördliche Prüfungen erforderlich.",
    BRAND.pdf.footerNote,
  ];
  const discWrapped = doc.splitTextToSize(
    disclaimer.join(" "),
    CONTENT_WIDTH,
  ) as string[];
  doc.text(discWrapped, MARGIN, y);

  addPageFooter(doc);

  const safeName = project.name
    .replace(/[^a-zA-Z0-9äöüÄÖÜß\-_ ]/g, "")
    .trim()
    .slice(0, 40) || "Konzeptstudie";
  doc.save(`DezentralKonzeptPilot_${safeName}_${dateStr.replace(/\./g, "-")}.pdf`);
}
