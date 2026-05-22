import type { jsPDF } from "jspdf";
import type { CalculationResult } from "@/app/types/calculation";
import type { ProjectData } from "@/app/types/project";
import { BRAND } from "@/app/lib/constants";
import { buildConceptSizingItems } from "@/app/lib/concept-sizing";
import { buildCustomerInsights } from "@/app/lib/customer-insights";
import { pickCo2AnalogySentence } from "@/app/lib/co2-analogies";
import {
  buildScenarioComparison,
  formatScenarioTechLabels,
} from "@/app/lib/scenarios";
import type { ScenarioWithResult } from "@/app/types/scenario";
import {
  CYAN,
  drawCashflowChart,
  drawChartFrame,
  drawCo2ReductionVisual,
  drawCostComparisonChart,
  drawCoverHero,
  drawEnergyFlowBars,
  drawInvestmentWaterfall,
  drawLightKpiStrip,
  drawNumberedSteps,
  drawProjectSnapshotTiles,
  drawSavingsHeroBlock,
  drawScenarioComparisonCards,
  drawSizingChips,
  drawTaglineBox,
  GREEN,
  NAVY,
  SLATE,
  type ChartBox,
  type PdfScenarioCard,
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
  maxLines?: number,
): number {
  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85);
  doc.setFont("helvetica", "normal");
  let cursor = y;
  for (const line of lines) {
    const wrapped = doc.splitTextToSize(line, CONTENT_WIDTH) as string[];
    const clipped =
      maxLines !== undefined ? wrapped.slice(0, maxLines) : wrapped;
    doc.text(clipped, MARGIN, cursor);
    cursor += clipped.length * lineHeight;
    if (maxLines !== undefined && wrapped.length > maxLines) {
      break;
    }
  }
  return cursor + 4;
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

function buildScenarioInsight(scenarios: ScenarioWithResult[]): string {
  const current = scenarios.find((s) => s.isCurrent);
  if (!current) {
    return "Drei Ausbaustufen – von der Minimalvariante bis zum Komplett-Konzept.";
  }

  const baseline = [...scenarios].sort(
    (a, b) => a.result.investment.net - b.result.investment.net,
  )[0];
  if (!baseline || baseline.id === current.id) {
    return "Drei Ausbaustufen – von der Minimalvariante bis zum Komplett-Konzept.";
  }

  const extraSavings =
    current.result.economics.annualSavingsEur -
    baseline.result.economics.annualSavingsEur;

  return `Gegenüber „${baseline.name}" sparen Sie ${extraSavings.toLocaleString("de-DE")} € mehr pro Jahr – bei ${current.result.economics.paybackYears.toFixed(1)} Jahren Amortisation.`;
}

/** Szenario-Karten für PDF */
export function mapScenariosForPdf(
  scenarios: ReturnType<typeof buildScenarioComparison>,
): PdfScenarioCard[] {
  return scenarios.map((s) => ({
    name: s.name,
    techLabel: formatScenarioTechLabels(s.technologies),
    isCurrent: s.isCurrent,
    isRecommended: s.isRecommended,
    investNet: s.result.investment.net,
    savings: s.result.economics.annualSavingsEur,
    payback: s.result.economics.paybackYears,
    co2: s.result.environment.co2SavingsKg / 1000,
    autarky: s.result.annual.autarkyPercent,
  }));
}

export function orderScenariosForPdf(cards: PdfScenarioCard[]): PdfScenarioCard[] {
  const current = cards.find((s) => s.isCurrent);
  const others = cards
    .filter((s) => !s.isCurrent)
    .sort((a, b) => a.investNet - b.investNet);

  if (!current) return others;
  const insertAt = Math.floor(others.length / 2);
  return [...others.slice(0, insertAt), current, ...others.slice(insertAt)];
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
  const scenarioCards = orderScenariosForPdf(mapScenariosForPdf(scenarios));
  const techSummary = formatScenarioTechLabels(project.technologies);
  const addressLine = `${project.address}, ${project.postalCode} Hamburg`;
  const sizingItems = buildConceptSizingItems(project, result);

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
  y = drawLightKpiStrip(doc, MARGIN, y, CONTENT_WIDTH, result, project.targetPaybackYears);

  const executiveSummary =
    options?.executiveSummary?.trim() || insights.solutionTagline;
  y = ensureSpace(doc, y, 22, projectLabel);
  y = addSectionTitle(doc, y, "Executive Summary");
  y = drawTaglineBox(doc, MARGIN, y, CONTENT_WIDTH, executiveSummary);

  y = ensureSpace(doc, y, 40, projectLabel);
  y = addSectionTitle(doc, y, "Auf einen Blick");
  y = drawProjectSnapshotTiles(doc, MARGIN, y, CONTENT_WIDTH, [
    {
      label: "Objekt",
      value: `${BUILDING_LABELS[project.buildingType]} · ${project.livingArea} m² · BJ ${project.yearBuilt}`,
    },
    {
      label: "Verbrauch",
      value: `${project.electricityKwh.toLocaleString("de-DE")} kWh Strom · ${project.heatKwh.toLocaleString("de-DE")} kWh Wärme/a`,
    },
    {
      label: "Investition",
      value: `${result.investment.net.toLocaleString("de-DE")} € netto · Ziel ${project.targetPaybackYears} J. Amortisation`,
    },
    {
      label: "Technologie-Mix",
      value: techSummary,
    },
  ]);

  addPageFooter(doc);

  // —— Ihr Konzept ——
  y = newPage(doc, projectLabel);
  y = addSectionTitle(doc, y, "Ihr Energie-Konzept");
  y = drawTaglineBox(doc, MARGIN, y, CONTENT_WIDTH, insights.solutionTagline);

  if (sizingItems.length > 0) {
    y = ensureSpace(doc, y, 20, projectLabel);
    y = drawSizingChips(
      doc,
      MARGIN,
      y,
      CONTENT_WIDTH,
      sizingItems.map((item) => ({ label: item.label, value: item.value })),
    );
  }

  y = ensureSpace(doc, y, 25, projectLabel);
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

  // —— Kosten & CO₂ ——
  y = newPage(doc, projectLabel);
  y = addSectionTitle(doc, y, insights.costHeadline);
  y = drawSavingsHeroBlock(doc, MARGIN, y, CONTENT_WIDTH, result);
  y = drawInvestmentWaterfall(doc, MARGIN, y, CONTENT_WIDTH, result);
  y += 4;

  y = ensureSpace(doc, y, 45, projectLabel);
  y = addSectionTitle(doc, y, insights.co2Headline);
  y = drawCo2ReductionVisual(
    doc,
    MARGIN,
    y,
    CONTENT_WIDTH,
    result.environment,
    pickCo2AnalogySentence(result.environment.co2SavingsKg),
  );

  // —— Szenario-Vergleich ——
  y = ensureSpace(doc, y, 72, projectLabel);
  y = addSectionTitle(doc, y, "Szenario-Vergleich");
  y = addBodyText(doc, y, [buildScenarioInsight(scenarios)], 5, 3);
  y = drawScenarioComparisonCards(doc, MARGIN, y, CONTENT_WIDTH, scenarioCards);

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
  y = ensureSpace(doc, y, insights.nextSteps.length * 18 + 10, projectLabel);
  y = drawNumberedSteps(doc, MARGIN, y, CONTENT_WIDTH, insights.nextSteps);

  y = ensureSpace(doc, y, 35, projectLabel);
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
