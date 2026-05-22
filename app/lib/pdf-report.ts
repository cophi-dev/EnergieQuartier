import type { jsPDF } from "jspdf";
import type { CalculationResult } from "@/app/types/calculation";
import type { ProjectData } from "@/app/types/project";
import { BRAND } from "@/app/lib/constants";

const MARGIN = 20;
const PAGE_WIDTH = 210;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

type PdfDoc = jsPDF;

function addSectionTitle(doc: PdfDoc, y: number, title: string): number {
  doc.setFontSize(12);
  doc.setTextColor(10, 77, 104);
  doc.setFont("helvetica", "bold");
  doc.text(title, MARGIN, y);
  doc.setDrawColor(8, 131, 149);
  doc.setLineWidth(0.4);
  doc.line(MARGIN, y + 2, PAGE_WIDTH - MARGIN, y + 2);
  return y + 10;
}

function addBodyText(
  doc: import("jspdf").jsPDF,
  y: number,
  lines: string[],
  lineHeight = 5,
): number {
  doc.setFontSize(10);
  doc.setTextColor(40, 40, 40);
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
    return MARGIN + 10;
  }
  return y;
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

  let y = MARGIN;

  // Kopfzeile
  doc.setFillColor(10, 77, 104);
  doc.rect(0, 0, PAGE_WIDTH, 28, "F");
  doc.setTextColor(0, 255, 202);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(BRAND.name, MARGIN, 14);
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "normal");
  doc.text(BRAND.slogan, MARGIN, 21);
  doc.text(`Konzeptstudie · ${dateStr}`, PAGE_WIDTH - MARGIN, 21, {
    align: "right",
  });

  y = 38;

  y = addSectionTitle(doc, y, "1. Zusammenfassung");
  y = addBodyText(doc, y, [
    `Projekt: ${project.name}`,
    `Objekt: ${project.address}, ${project.postalCode} Hamburg`,
    `Gebäudetyp: ${project.buildingType} · ${project.livingArea} m² Wohnfläche · Baujahr ${project.yearBuilt}`,
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

  y = ensureSpace(doc, y, 35);
  y = addSectionTitle(doc, y, "5. Hinweis / Disclaimer");
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  const disclaimer = [
    "Diese Konzeptstudie wurde mit EnergieQuartier erstellt und dient als vereinfachte",
    "Entscheidungsgrundlage im Vertriebsgespräch. Die Berechnungen basieren auf",
    "typisierten Annahmen (Erträge Hamburg, BAFA-Fördersätze 2026, Energiepreise",
    "Strom/Gas/Einspeisung) und ersetzen keine detaillierte Fachplanung, Lastgang-",
    "analyse oder verbindliche Förderzusage. Für die Ausführungsplanung sind",
    "Hausbesuche, hydraulische Abstimmung und behördliche Prüfungen erforderlich.",
    "Hamburgische Energiewerke · MVP-Demonstration",
  ];
  const discWrapped = doc.splitTextToSize(
    disclaimer.join(" "),
    CONTENT_WIDTH,
  ) as string[];
  doc.text(discWrapped, MARGIN, y);

  const footerY = 287;
  doc.setFontSize(7);
  doc.setTextColor(8, 131, 149);
  doc.text(
    `${BRAND.name} · Erstellt am ${dateStr} · Seite ${doc.getNumberOfPages()}`,
    PAGE_WIDTH / 2,
    footerY,
    { align: "center" },
  );

  const safeName = project.name
    .replace(/[^a-zA-Z0-9äöüÄÖÜß\-_ ]/g, "")
    .trim()
    .slice(0, 40) || "Konzeptstudie";
  doc.save(`EnergieQuartier_${safeName}_${dateStr.replace(/\./g, "-")}.pdf`);
}
