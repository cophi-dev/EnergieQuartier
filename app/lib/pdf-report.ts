import type { jsPDF } from "jspdf";
import type { CalculationResult } from "@/app/types/calculation";
import type { ProjectData } from "@/app/types/project";
import { BRAND } from "@/app/lib/constants";
import { buildCustomerInsights } from "@/app/lib/customer-insights";
import {
  buildScenarioComparison,
  formatScenarioTechLabels,
} from "@/app/lib/scenarios";
import {
  CYAN,
  drawCalloutBox,
  drawCashflowChart,
  drawChartFrame,
  drawCo2Chart,
  drawCostComparisonChart,
  drawCoverHero,
  drawEconomicsTiles,
  drawEnergyFlowBars,
  drawInvestmentWaterfall,
  drawMetricHighlights,
  drawNumberedSteps,
  drawScenarioComparisonTable,
  GREEN,
  NAVY,
  SLATE,
  type ChartBox,
} from "@/app/lib/pdf-charts";

const MARGIN = 18;
const PAGE_WIDTH = 210;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const FOOTER_Y = 287;

type PdfDoc = jsPDF;

const BUILDING_LABELS: Record<ProjectData["buildingType"], string> = {
  einfamilienhaus: "Einfamilienhaus",
  mehrfamilienhaus: "Mehrfamilienhaus",
  gewerbe: "Gewerbegebäude",
  öffentlich: "Öffentliches Gebäude",
};

function addPageHeader(doc: PdfDoc, projectName: string): void {
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, PAGE_WIDTH, 14, "F");
  doc.setFillColor(...CYAN);
  doc.rect(0, 14, PAGE_WIDTH, 0.8, "F");
  doc.setTextColor(...CYAN);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text(BRAND.name, MARGIN, 9);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "normal");
  doc.text(projectName.slice(0, 48), PAGE_WIDTH - MARGIN, 9, { align: "right" });
}

function addPageFooter(doc: PdfDoc): void {
  const dateStr = new Date().toLocaleDateString("de-DE");
  doc.setFontSize(7);
  doc.setTextColor(...CYAN);
  doc.text(
    `${BRAND.name} · Energie-Konzeptstudie · ${dateStr} · Seite ${doc.getNumberOfPages()}`,
    PAGE_WIDTH / 2,
    FOOTER_Y,
    { align: "center" },
  );
}

function newPage(doc: PdfDoc, projectName: string): number {
  doc.addPage();
  addPageHeader(doc, projectName);
  addPageFooter(doc);
  return 22;
}

function ensureSpace(
  doc: PdfDoc,
  y: number,
  needed: number,
  projectName: string,
): number {
  if (y + needed > FOOTER_Y - 8) {
    return newPage(doc, projectName);
  }
  return y;
}

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

function addKpiBox(doc: PdfDoc, y: number, result: CalculationResult): number {
  const boxH = 24;
  doc.setFillColor(...NAVY);
  doc.roundedRect(MARGIN, y, CONTENT_WIDTH, boxH, 2, 2, "F");
  doc.setDrawColor(...CYAN);
  doc.setLineWidth(0.4);
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
    doc.text(kpi.value, x, y + 17, { align: "center" });
  });

  return y + boxH + 8;
}

function drawChartSection(
  doc: PdfDoc,
  y: number,
  title: string,
  subtitle: string,
  height: number,
  draw: (box: ChartBox) => void,
): number {
  const box: ChartBox = {
    x: MARGIN,
    y,
    width: CONTENT_WIDTH,
    height,
  };
  drawChartFrame(doc, box, title, subtitle);
  draw(box);
  return y + height + 6;
}

/** Szenario-Zeilen für PDF-Tabelle */
export function mapScenariosForPdf(
  scenarios: ReturnType<typeof buildScenarioComparison>,
) {
  return scenarios.map((s) => ({
    name: s.name,
    isCurrent: s.isCurrent,
    isRecommended: s.isRecommended,
    investNet: s.result.investment.net,
    savings: s.result.economics.annualSavingsEur,
    payback: s.result.economics.paybackYears,
    co2: s.result.environment.co2SavingsKg / 1000,
    autarky: s.result.annual.autarkyPercent,
  }));
}

/** Erzeugt den Konzeptstudien-PDF-Report und startet den Download */
export async function downloadPdfReport(
  project: ProjectData,
  result: CalculationResult,
  options?: { executiveSummary?: string },
): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const dateStr = new Date().toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const projectLabel = project.name.trim() || "Konzeptstudie";
  const insights = buildCustomerInsights(project, result);
  const scenarios = buildScenarioComparison(project);
  const techSummary = formatScenarioTechLabels(project.technologies);
  const addressLine = `${project.address}, ${project.postalCode} Hamburg`;

  // —— Titelseite ——
  let y = drawCoverHero(
    doc,
    MARGIN,
    PAGE_WIDTH,
    projectLabel,
    addressLine,
    dateStr,
    techSummary,
  );
  y = addKpiBox(doc, y, result);

  const executiveSummary =
    options?.executiveSummary?.trim() ||
    insights.solutionParagraphs.slice(0, 2).join(" ");
  y = addSectionTitle(doc, y, "Executive Summary");
  y = addBodyText(doc, y, [executiveSummary]);

  y = addSectionTitle(doc, y, "Auf einen Blick");
  y = addBodyText(doc, y, [
    `${BUILDING_LABELS[project.buildingType]} · ${project.livingArea} m² · Baujahr ${project.yearBuilt}`,
    `Sanierungsstand: ${project.renovationStatus} · Technologie-Mix: ${techSummary}`,
    `Strombedarf: ${project.electricityKwh.toLocaleString("de-DE")} kWh/a · Wärmebedarf: ${project.heatKwh.toLocaleString("de-DE")} kWh/a`,
    `Budget-Rahmen: ${project.budget.toLocaleString("de-DE")} € · Amortisationsziel: ${project.targetPaybackYears} Jahre`,
  ]);

  addPageFooter(doc);

  // —— Ihre empfohlene Lösung ——
  y = newPage(doc, projectLabel);
  y = addSectionTitle(doc, y, insights.solutionHeadline);
  y = addBodyText(doc, y, insights.solutionParagraphs);
  y = drawCalloutBox(
    doc,
    MARGIN,
    y,
    CONTENT_WIDTH,
    "Was bedeutet das für mich?",
    "Diese Konzeptstudie gibt Ihnen eine verständliche Erstorientierung – ohne Fachjargon. " +
      "Nutzen Sie die Zahlen für Gespräche mit Berater, Verwaltung oder Eigentümergemeinschaft. " +
      "Für die Ausführungsplanung sind Vor-Ort-Termine und Detailplanung erforderlich.",
    GREEN,
  );

  y = ensureSpace(doc, y, 35, projectLabel);
  y = addSectionTitle(doc, y, "Technologie-Konzept im Detail");
  const techLines = result.technologyDetails.map(
    (t) => `• ${t.name}: ${t.headline}`,
  );
  if (techLines.length === 0) {
    techLines.push("• Keine Technologie ausgewählt");
  }
  y = addBodyText(doc, y, techLines);

  if (project.notes.trim()) {
    y = ensureSpace(doc, y, 18, projectLabel);
    doc.setFontSize(9);
    doc.setTextColor(...SLATE);
    doc.setFont("helvetica", "italic");
    const noteWrapped = doc.splitTextToSize(
      `Projektnotiz: ${project.notes}`,
      CONTENT_WIDTH,
    ) as string[];
    doc.text(noteWrapped, MARGIN, y);
    y += noteWrapped.length * 4 + 6;
  }

  // —— Was kostet Sie das? ——
  y = newPage(doc, projectLabel);
  y = addSectionTitle(doc, y, insights.costHeadline);
  y = drawMetricHighlights(doc, MARGIN, y, CONTENT_WIDTH, insights.costHighlights);
  y = addBodyText(doc, y, insights.costParagraphs);

  y = ensureSpace(doc, y, 38, projectLabel);
  y = drawInvestmentWaterfall(doc, MARGIN, y, CONTENT_WIDTH, result);
  y += 2;

  y = ensureSpace(doc, y, 44, projectLabel);
  y = drawEconomicsTiles(
    doc,
    MARGIN,
    y,
    CONTENT_WIDTH,
    result,
    project.targetPaybackYears,
  );

  // —— CO₂ ——
  y = ensureSpace(doc, y, 70, projectLabel);
  y = addSectionTitle(doc, y, insights.co2Headline);
  y = drawMetricHighlights(doc, MARGIN, y, CONTENT_WIDTH, insights.co2Highlights);
  y = addBodyText(doc, y, insights.co2Paragraphs);

  y = ensureSpace(doc, y, 58, projectLabel);
  y = drawChartSection(
    doc,
    y,
    "CO₂-Emissionen im Vergleich",
    "Ausgangslage vs. Szenario nach Maßnahmen",
    52,
    (box) => drawCo2Chart(doc, box, result.environment),
  );

  // —— Szenario-Vergleich ——
  y = newPage(doc, projectLabel);
  y = addSectionTitle(doc, y, "Szenario-Vergleich");
  y = addBodyText(doc, y, [
    "Drei Varianten für Ihr Objekt – vergleichen Sie Investition, Einsparung und Klimawirkung.",
    "Das markierte Szenario entspricht Ihrer aktuellen Konfiguration im Konfigurator.",
  ]);
  y = drawScenarioComparisonTable(
    doc,
    MARGIN,
    y,
    CONTENT_WIDTH,
    mapScenariosForPdf(scenarios),
  );

  // —— Energiefluss & Charts ——
  y = newPage(doc, projectLabel);
  y = addSectionTitle(doc, y, "Energiefluss & Wirtschaftlichkeit");
  y = drawChartSection(
    doc,
    y,
    "Wichtigste Energieflüsse",
    "kWh/a · Strom / Wärme / Kälte (vereinfacht aus Sankey)",
    68,
    (box) => drawEnergyFlowBars(doc, box, result.sankey),
  );

  y = ensureSpace(doc, y, 40, projectLabel);
  y = addBodyText(doc, y, [
    `PV-Erzeugung: ${result.annual.pvGenerationKwh.toLocaleString("de-DE")} kWh/a`,
    `Eigenverbrauch: ${result.annual.selfConsumptionKwh.toLocaleString("de-DE")} kWh/a · Autarkie ${result.annual.autarkyPercent} %`,
    `Netzbezug: ${result.annual.gridImportKwh.toLocaleString("de-DE")} kWh/a · Einspeisung: ${result.annual.gridExportKwh.toLocaleString("de-DE")} kWh/a`,
  ]);

  y = ensureSpace(doc, y, 58, projectLabel);
  y = drawChartSection(
    doc,
    y,
    "Kumulierter Cashflow (20 Jahre)",
    "Break-even bei Überschreitung der Null-Linie",
    54,
    (box) => drawCashflowChart(doc, box, result.cashflowYears),
  );

  y = ensureSpace(doc, y, 54, projectLabel);
  y = drawChartSection(
    doc,
    y,
    "Investition vs. Einsparung",
    "Netto-Investition gegen kumulierte Einsparung über 20 Jahre",
    50,
    (box) => drawCostComparisonChart(doc, box, result),
  );

  // —— Nächste Schritte & Disclaimer ——
  y = newPage(doc, projectLabel);
  y = addSectionTitle(doc, y, "Nächste Schritte");
  y = addBodyText(doc, y, [
    "So geht es nach dieser Erststudie sinnvoll weiter:",
  ]);
  y = drawNumberedSteps(doc, MARGIN, y, CONTENT_WIDTH, insights.nextSteps);

  y = ensureSpace(doc, y, 40, projectLabel);
  y = addSectionTitle(doc, y, "Hinweis / Disclaimer");
  doc.setFontSize(8);
  doc.setTextColor(...SLATE);
  doc.setFont("helvetica", "normal");
  const disclaimer = [
    `Diese Energie-Konzeptstudie wurde mit ${BRAND.name} erstellt und dient als vereinfachte`,
    "Entscheidungsgrundlage – verständlich aufbereitet für Eigentümer, Verwaltungen und",
    "Projektentwickler. Die Berechnungen basieren auf typisierten Annahmen (Erträge Hamburg,",
    "BAFA-Fördersätze 2026, Energiepreise Strom/Gas/Einspeisung) und ersetzen keine",
    "detaillierte Fachplanung, Lastganganalyse oder verbindliche Förderzusage.",
    BRAND.pdf.footerNote,
  ];
  const discWrapped = doc.splitTextToSize(
    disclaimer.join(" "),
    CONTENT_WIDTH,
  ) as string[];
  doc.text(discWrapped, MARGIN, y);

  const safeName = projectLabel
    .replace(/[^a-zA-Z0-9äöüÄÖÜß\-_ ]/g, "")
    .trim()
    .slice(0, 40) || "Konzeptstudie";
  doc.save(`EnergieQuartier_${safeName}_${dateStr.replace(/\./g, "-")}.pdf`);
}
