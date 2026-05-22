import type { jsPDF } from "jspdf";
import type {
  CalculationResult,
  CashflowYear,
  EnvironmentResult,
  SankeyData,
} from "@/app/types/calculation";
import { BRAND } from "@/app/lib/constants";
import { getNodeMeta, pruneSankeyData } from "@/app/lib/sankey-utils";

export type PdfDoc = jsPDF;

export function hexRgb(hex: string): [number, number, number] {
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
const SLATE: [number, number, number] = [100, 116, 139];
const LIGHT_BG: [number, number, number] = [248, 250, 252];

export interface ChartBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

function formatEuro(value: number, compact = false): string {
  if (compact && Math.abs(value) >= 1000) {
    return `${(value / 1000).toFixed(0)}k €`;
  }
  return `${Math.round(value).toLocaleString("de-DE")} €`;
}

function formatKwh(value: number): string {
  if (value >= 1000) return `${(value / 1000).toFixed(1)} MWh/a`;
  return `${Math.round(value).toLocaleString("de-DE")} kWh/a`;
}

/** Kartenrahmen mit Titel für Diagramme */
export function drawChartFrame(
  doc: PdfDoc,
  box: ChartBox,
  title: string,
  subtitle?: string,
): void {
  doc.setFillColor(...LIGHT_BG);
  doc.setDrawColor(...CYAN);
  doc.setLineWidth(0.2);
  doc.roundedRect(box.x, box.y, box.width, box.height, 2, 2, "FD");

  doc.setFontSize(9);
  doc.setTextColor(...NAVY);
  doc.setFont("helvetica", "bold");
  doc.text(title, box.x + 4, box.y + 7);

  if (subtitle) {
    doc.setFontSize(7);
    doc.setTextColor(...SLATE);
    doc.setFont("helvetica", "normal");
    doc.text(subtitle, box.x + 4, box.y + 12);
  }
}

/** Kumulierter Cashflow (Fläche + Null-Linie) */
export function drawCashflowChart(
  doc: PdfDoc,
  box: ChartBox,
  data: CashflowYear[],
): void {
  const pad = { left: 14, right: 6, top: 18, bottom: 14 };
  const plotX = box.x + pad.left;
  const plotY = box.y + pad.top;
  const plotW = box.width - pad.left - pad.right;
  const plotH = box.height - pad.top - pad.bottom;

  const points = data.filter((d) => d.year > 0);
  if (points.length === 0) return;

  const values = points.map((p) => p.cumulative);
  const minV = Math.min(0, ...values);
  const maxV = Math.max(0, ...values);
  const range = maxV - minV || 1;

  const toX = (year: number) =>
    plotX + ((year - 1) / Math.max(points.length - 1, 1)) * plotW;
  const toY = (v: number) => plotY + plotH - ((v - minV) / range) * plotH;
  const zeroY = toY(0);

  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.15);
  for (let i = 0; i <= 4; i++) {
    const gy = plotY + (plotH / 4) * i;
    doc.line(plotX, gy, plotX + plotW, gy);
  }

  doc.setDrawColor(...NAVY);
  doc.setLineDashPattern([2, 2], 0);
  doc.line(plotX, zeroY, plotX + plotW, zeroY);
  doc.setLineDashPattern([], 0);

  const areaPoints: [number, number][] = points.map((p) => [
    toX(p.year),
    toY(p.cumulative),
  ]);
  areaPoints.push([toX(points[points.length - 1].year), zeroY]);
  areaPoints.push([toX(points[0].year), zeroY]);

  doc.setFillColor(200, 235, 245);
  if (areaPoints.length >= 3) {
    for (let i = 0; i < areaPoints.length - 1; i++) {
      doc.triangle(
        areaPoints[i][0],
        areaPoints[i][1],
        areaPoints[i + 1][0],
        areaPoints[i + 1][1],
        areaPoints[i][0],
        zeroY,
        "F",
      );
      doc.triangle(
        areaPoints[i + 1][0],
        areaPoints[i + 1][1],
        areaPoints[i + 1][0],
        zeroY,
        areaPoints[i][0],
        zeroY,
        "F",
      );
    }
  }

  doc.setDrawColor(...CYAN);
  doc.setLineWidth(0.6);
  for (let i = 0; i < points.length - 1; i++) {
    doc.line(
      toX(points[i].year),
      toY(points[i].cumulative),
      toX(points[i + 1].year),
      toY(points[i + 1].cumulative),
    );
  }

  const payback = points.find((p) => p.cumulative >= 0);
  if (payback) {
    const px = toX(payback.year);
    doc.setDrawColor(...GREEN);
    doc.setLineWidth(0.35);
    doc.line(px, plotY, px, plotY + plotH);
    doc.setFontSize(6);
    doc.setTextColor(...GREEN);
    doc.setFont("helvetica", "bold");
    doc.text(`Break-even J.${payback.year}`, px + 1.5, plotY + 4);
  }

  doc.setFontSize(6);
  doc.setTextColor(...SLATE);
  doc.setFont("helvetica", "normal");
  doc.text(formatEuro(maxV, true), plotX - 2, plotY + 2, { align: "right" });
  doc.text(formatEuro(minV, true), plotX - 2, plotY + plotH, {
    align: "right",
  });
  doc.text("0 €", plotX - 2, zeroY + 1, { align: "right" });

  const tickYears = [1, 5, 10, 15, 20].filter((y) =>
    points.some((p) => p.year === y),
  );
  tickYears.forEach((year) => {
    doc.text(String(year), toX(year), plotY + plotH + 5, { align: "center" });
  });
  doc.text("Jahr", plotX + plotW / 2, plotY + plotH + 9, { align: "center" });
}

/** Balkendiagramm Investition vs. Einsparung */
export function drawCostComparisonChart(
  doc: PdfDoc,
  box: ChartBox,
  result: CalculationResult,
): void {
  const pad = { left: 16, right: 8, top: 22, bottom: 22 };
  const plotX = box.x + pad.left;
  const plotY = box.y + pad.top;
  const plotW = box.width - pad.left - pad.right;
  const plotH = box.height - pad.top - pad.bottom;

  const lastCum =
    result.cashflowYears[result.cashflowYears.length - 1]?.cumulative ?? 0;
  const savings20 = Math.max(0, lastCum + result.investment.net);
  const invest = result.investment.net;
  const maxV = Math.max(invest, savings20, 1);

  const barW = plotW * 0.28;
  const gap = plotW * 0.18;
  const x1 = plotX + plotW * 0.2;
  const x2 = x1 + barW + gap;

  const drawBar = (
    x: number,
    value: number,
    color: [number, number, number],
    label: string,
  ) => {
    const h = (value / maxV) * plotH;
    const y = plotY + plotH - h;
    doc.setFillColor(...color);
    doc.roundedRect(x, y, barW, h, 1, 1, "F");
    doc.setFontSize(7);
    doc.setTextColor(...NAVY);
    doc.setFont("helvetica", "bold");
    doc.text(formatEuro(value), x + barW / 2, y - 2, { align: "center" });
    doc.setFontSize(7);
    doc.setTextColor(...SLATE);
    doc.setFont("helvetica", "normal");
    doc.text(label, x + barW / 2, plotY + plotH + 6, { align: "center" });
  };

  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.15);
  for (let i = 0; i <= 3; i++) {
    const gy = plotY + (plotH / 3) * i;
    doc.line(plotX, gy, plotX + plotW, gy);
  }

  drawBar(x1, invest, NAVY, "Investition (netto)");
  drawBar(x2, savings20, GREEN, "Einsparung (20 J.)");

  doc.setFontSize(6);
  doc.setTextColor(...SLATE);
  doc.text(formatEuro(maxV, true), plotX - 2, plotY + 2, { align: "right" });
  doc.text("0 €", plotX - 2, plotY + plotH, { align: "right" });

  const legendY = box.y + box.height - 6;
  const legends: { label: string; color: [number, number, number] }[] = [
    { label: "Investition", color: NAVY },
    { label: "Einsparung", color: GREEN },
  ];
  let lx = box.x + 4;
  legends.forEach((leg) => {
    doc.setFillColor(...leg.color);
    doc.rect(lx, legendY - 2.5, 3, 3, "F");
    doc.setFontSize(6);
    doc.setTextColor(...SLATE);
    doc.text(leg.label, lx + 5, legendY);
    lx += 32;
  });
}

/** Top-Energieflüsse aus Sankey als horizontale Balken */
export function drawEnergyFlowBars(
  doc: PdfDoc,
  box: ChartBox,
  sankey: SankeyData,
): void {
  const prepared = pruneSankeyData(sankey);
  const flows = prepared.links
    .map((link) => ({
      source: prepared.nodes[link.source]?.name ?? "?",
      target: prepared.nodes[link.target]?.name ?? "?",
      value: link.value,
    }))
    .filter((f) => f.value > 50)
    .sort((a, b) => b.value - a.value)
    .slice(0, 7);

  if (flows.length === 0) {
    doc.setFontSize(8);
    doc.setTextColor(...SLATE);
    doc.text("Keine Energieflüsse berechnet", box.x + 4, box.y + 20);
    return;
  }

  const maxVal = flows[0].value;
  const rowH = (box.height - 24) / flows.length;
  const barMaxW = box.width - 52;
  const startY = box.y + 16;

  flows.forEach((flow, i) => {
    const y = startY + i * rowH;
    const meta = getNodeMeta(flow.source);
    const barW = (flow.value / maxVal) * barMaxW;

    doc.setFontSize(6);
    doc.setTextColor(...SLATE);
    doc.setFont("helvetica", "normal");
    const label = `${meta.shortLabel} → ${flow.target.slice(0, 14)}`;
    doc.text(label, box.x + 4, y + 3, { maxWidth: 46 });

    doc.setFillColor(...hexRgb(meta.color));
    doc.roundedRect(box.x + 48, y - 1, barW, rowH * 0.55, 0.5, 0.5, "F");

    doc.setFontSize(6);
    doc.setTextColor(...NAVY);
    doc.setFont("helvetica", "bold");
    doc.text(formatKwh(flow.value), box.x + box.width - 4, y + 3, {
      align: "right",
    });
  });
}

/** CO₂-Vergleich vorher/nachher */
export function drawCo2Chart(
  doc: PdfDoc,
  box: ChartBox,
  env: EnvironmentResult,
): void {
  const baseline = env.co2BaselineKg / 1000;
  const after = env.co2AfterKg / 1000;
  const savings = env.co2SavingsKg / 1000;
  const maxT = Math.max(baseline, 0.1);

  const pad = { left: 14, right: 8, top: 18, bottom: 16 };
  const plotX = box.x + pad.left;
  const plotY = box.y + pad.top;
  const plotW = box.width - pad.left - pad.right;
  const plotH = box.height - pad.top - pad.bottom;

  const barW = plotW * 0.22;
  const xRef = plotX + plotW * 0.22;
  const xAfter = plotX + plotW * 0.58;

  const drawCol = (
    x: number,
    tons: number,
    color: [number, number, number],
    label: string,
  ) => {
    const h = (tons / maxT) * plotH;
    const y = plotY + plotH - h;
    doc.setFillColor(...color);
    doc.roundedRect(x, y, barW, h, 1, 1, "F");
    doc.setFontSize(7);
    doc.setTextColor(...NAVY);
    doc.setFont("helvetica", "bold");
    doc.text(`${tons.toFixed(1)} t`, x + barW / 2, y - 2, { align: "center" });
    doc.setFontSize(7);
    doc.setTextColor(...SLATE);
    doc.setFont("helvetica", "normal");
    doc.text(label, x + barW / 2, plotY + plotH + 5, { align: "center" });
  };

  drawCol(xRef, baseline, [100, 116, 139], "Ausgang");
  drawCol(xAfter, after, CYAN, "Nach Maßnahmen");

  doc.setFillColor(...GREEN);
  doc.roundedRect(
    box.x + box.width - 38,
    box.y + 20,
    34,
    22,
    2,
    2,
    "F",
  );
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.text("Einsparung", box.x + box.width - 21, box.y + 28, {
    align: "center",
  });
  doc.setFontSize(9);
  doc.text(`${savings.toFixed(1)} t/a`, box.x + box.width - 21, box.y + 36, {
    align: "center",
  });

  const reduction =
    baseline > 0 ? Math.round((savings / baseline) * 100) : 0;
  doc.setFontSize(6);
  doc.setTextColor(...GREEN);
  doc.text(`−${reduction} %`, box.x + box.width - 21, box.y + 42, {
    align: "center",
  });
}

/** Kennzahlen-Kacheln für Wirtschaftlichkeit (2×3) */
export function drawEconomicsTiles(
  doc: PdfDoc,
  x: number,
  y: number,
  width: number,
  result: CalculationResult,
  targetPaybackYears: number,
): number {
  const tiles: {
    label: string;
    value: string;
    accent: [number, number, number];
    ok?: boolean;
  }[] = [
    {
      label: "Investition netto",
      value: formatEuro(result.investment.net),
      accent: NAVY,
    },
    {
      label: "Förderung",
      value: formatEuro(result.investment.subsidies),
      accent: CYAN,
    },
    {
      label: "Jährl. Einsparung",
      value: `${formatEuro(result.economics.annualSavingsEur)}/a`,
      accent: GREEN,
    },
    {
      label: "Amortisation",
      value: `${result.economics.paybackYears} Jahre`,
      accent:
        result.economics.paybackYears <= targetPaybackYears ? GREEN : CYAN,
      ok: result.economics.paybackYears <= targetPaybackYears,
    },
    {
      label: "NPV (20 J., 4 %)",
      value: formatEuro(result.economics.npvEur),
      accent: result.economics.npvEur > 0 ? GREEN : SLATE,
      ok: result.economics.npvEur > 0,
    },
    {
      label: "ROI (20 J.)",
      value: `${result.economics.roiPercent} %`,
      accent: GREEN,
    },
  ];

  const cols = 3;
  const gap = 3;
  const tileW = (width - gap * (cols - 1)) / cols;
  const tileH = 18;
  const rows = 2;

  tiles.forEach((tile, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const tx = x + col * (tileW + gap);
    const ty = y + row * (tileH + gap);

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(...tile.accent);
    doc.setLineWidth(0.35);
    doc.roundedRect(tx, ty, tileW, tileH, 1.5, 1.5, "FD");
    doc.setFillColor(...tile.accent);
    doc.rect(tx, ty, tileW, 1.2, "F");

    doc.setFontSize(6);
    doc.setTextColor(...SLATE);
    doc.setFont("helvetica", "normal");
    doc.text(tile.label, tx + 3, ty + 6);

    doc.setFontSize(9);
    doc.setTextColor(...NAVY);
    doc.setFont("helvetica", "bold");
    const valueLines = doc.splitTextToSize(tile.value, tileW - 6) as string[];
    doc.text(valueLines, tx + 3, ty + 13);

    if (tile.ok) {
      doc.setFontSize(6);
      doc.setTextColor(...GREEN);
      doc.text("✓ Ziel erreicht", tx + tileW - 3, ty + 6, { align: "right" });
    }
  });

  return y + rows * (tileH + gap) + 4;
}

/** Investitions-Wasserfall: brutto → Förderung → netto */
export function drawInvestmentWaterfall(
  doc: PdfDoc,
  x: number,
  y: number,
  width: number,
  result: CalculationResult,
): number {
  const gross = result.investment.gross;
  const sub = result.investment.subsidies;
  const net = result.investment.net;
  const max = gross || 1;

  const barH = 10;
  const labels = [
    { label: "Brutto", value: gross, color: NAVY, width: width * 0.9 },
    {
      label: "Förderung",
      value: sub,
      color: CYAN,
      width: width * (sub / max) * 0.85,
    },
    {
      label: "Netto",
      value: net,
      color: GREEN,
      width: width * (net / max) * 0.9,
    },
  ];

  doc.setFontSize(8);
  doc.setTextColor(...NAVY);
  doc.setFont("helvetica", "bold");
  doc.text("Investitionsübersicht", x, y);
  let cy = y + 6;

  labels.forEach((item) => {
    doc.setFontSize(7);
    doc.setTextColor(...SLATE);
    doc.setFont("helvetica", "normal");
    doc.text(item.label, x, cy + 6);
    doc.setFillColor(...item.color);
    doc.roundedRect(x + 28, cy, item.width, barH, 1, 1, "F");
    doc.setFontSize(7);
    doc.setTextColor(...NAVY);
    doc.setFont("helvetica", "bold");
    doc.text(formatEuro(item.value), x + 28 + item.width + 3, cy + 7);
    cy += barH + 5;
  });

  return cy + 2;
}

/** Hervorgehobene Info-Box (Beratungstext) */
export function drawCalloutBox(
  doc: PdfDoc,
  x: number,
  y: number,
  width: number,
  title: string,
  body: string,
  accent: [number, number, number] = GREEN,
): number {
  const padding = 4;
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  const bodyWrapped = doc.splitTextToSize(body, width - padding * 2) as string[];
  const boxH = 10 + bodyWrapped.length * 4.2;

  doc.setFillColor(236, 253, 245);
  doc.setDrawColor(...accent);
  doc.setLineWidth(0.25);
  doc.roundedRect(x, y, width, boxH, 2, 2, "FD");
  doc.setFillColor(...accent);
  doc.rect(x, y, 2.5, boxH, "F");

  doc.setFontSize(8);
  doc.setTextColor(...NAVY);
  doc.setFont("helvetica", "bold");
  doc.text(title, x + padding + 1, y + 6);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(51, 65, 85);
  doc.text(bodyWrapped, x + padding + 1, y + 11);

  return y + boxH + 5;
}

/** Drei Kennzahlen nebeneinander (Kosten-/CO₂-Highlights) */
export function drawMetricHighlights(
  doc: PdfDoc,
  x: number,
  y: number,
  width: number,
  items: { label: string; value: string; hint?: string }[],
): number {
  const gap = 3;
  const tileW = (width - gap * (items.length - 1)) / items.length;
  const tileH = 22;

  items.forEach((item, i) => {
    const tx = x + i * (tileW + gap);
    doc.setFillColor(...LIGHT_BG);
    doc.setDrawColor(...CYAN);
    doc.setLineWidth(0.2);
    doc.roundedRect(tx, y, tileW, tileH, 1.5, 1.5, "FD");

    doc.setFontSize(6);
    doc.setTextColor(...CYAN);
    doc.setFont("helvetica", "bold");
    doc.text(item.label.toUpperCase(), tx + 3, y + 6);

    doc.setFontSize(10);
    doc.setTextColor(...NAVY);
    doc.setFont("helvetica", "bold");
    doc.text(item.value, tx + 3, y + 13);

    if (item.hint) {
      doc.setFontSize(6);
      doc.setTextColor(...SLATE);
      doc.setFont("helvetica", "normal");
      doc.text(item.hint, tx + 3, y + 18);
    }
  });

  return y + tileH + 5;
}

/** Szenario-Vergleich als kompakte Tabelle */
export function drawScenarioComparisonTable(
  doc: PdfDoc,
  x: number,
  y: number,
  width: number,
  scenarios: {
    name: string;
    isCurrent: boolean;
    isRecommended: boolean;
    investNet: number;
    savings: number;
    payback: number;
    co2: number;
    autarky: number;
  }[],
): number {
  const colWidths = [
    width * 0.28,
    width * 0.16,
    width * 0.16,
    width * 0.12,
    width * 0.14,
    width * 0.14,
  ];
  const headers = [
    "Szenario",
    "Invest.",
    "Einsparung/a",
    "Amort.",
    "CO₂/a",
    "Autarkie",
  ];
  const rowH = 9;
  let cy = y;

  doc.setFillColor(...NAVY);
  doc.roundedRect(x, cy, width, rowH, 1, 1, "F");
  doc.setFontSize(6.5);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  let hx = x + 2;
  headers.forEach((h, i) => {
    doc.text(h, hx + 1, cy + 6);
    hx += colWidths[i];
  });
  cy += rowH;

  scenarios.forEach((s, rowIdx) => {
    const bg: [number, number, number] =
      rowIdx % 2 === 0 ? LIGHT_BG : [255, 255, 255];
    doc.setFillColor(...bg);
    doc.rect(x, cy, width, rowH, "F");

    const tags: string[] = [];
    if (s.isCurrent) tags.push("Ihr Konzept");
    if (s.isRecommended) tags.push("Empfohlen");
    const nameLine = tags.length ? `${s.name} (${tags.join(", ")})` : s.name;

    const cells = [
      nameLine,
      formatEuro(s.investNet, true),
      formatEuro(s.savings, true),
      `${s.payback.toFixed(1)} J.`,
      `${s.co2.toFixed(1)} t`,
      `${s.autarky} %`,
    ];

    doc.setFontSize(6.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...NAVY);
    let cx = x + 2;
    cells.forEach((cell, i) => {
      const truncated =
        i === 0
          ? (doc.splitTextToSize(cell, colWidths[i] - 2)[0] as string)
          : cell;
      doc.text(truncated, cx + 1, cy + 6);
      cx += colWidths[i];
    });
    cy += rowH;
  });

  doc.setDrawColor(...CYAN);
  doc.setLineWidth(0.2);
  doc.roundedRect(x, y, width, cy - y, 1, 1, "S");

  return cy + 4;
}

/** Nummerierte nächste Schritte */
export function drawNumberedSteps(
  doc: PdfDoc,
  x: number,
  y: number,
  width: number,
  steps: { title: string; description: string }[],
): number {
  let cy = y;
  const stepH = 14;

  steps.forEach((step, i) => {
    doc.setFillColor(...NAVY);
    doc.circle(x + 4, cy + 4, 3.5, "F");
    doc.setFontSize(7);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text(String(i + 1), x + 4, cy + 5.2, { align: "center" });

    doc.setFontSize(8);
    doc.setTextColor(...NAVY);
    doc.setFont("helvetica", "bold");
    doc.text(step.title, x + 10, cy + 4);

    doc.setFontSize(7);
    doc.setTextColor(51, 65, 85);
    doc.setFont("helvetica", "normal");
    const desc = doc.splitTextToSize(step.description, width - 12) as string[];
    doc.text(desc, x + 10, cy + 8);

    cy += stepH + (desc.length > 1 ? (desc.length - 1) * 3 : 0);
  });

  return cy + 2;
}

/** Titelseite – Hero-Bereich */
export function drawCoverHero(
  doc: PdfDoc,
  margin: number,
  pageWidth: number,
  projectLabel: string,
  address: string,
  dateStr: string,
  techSummary: string,
): number {
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, pageWidth, 52, "F");
  doc.setFillColor(...CYAN);
  doc.rect(0, 52, pageWidth, 1.2, "F");
  doc.setFillColor(...GREEN);
  doc.rect(0, 53.2, pageWidth, 0.6, "F");

  doc.setTextColor(...CYAN);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(BRAND.tagline.toUpperCase(), margin, 14);

  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  const titleLines = doc.splitTextToSize(
    projectLabel,
    pageWidth - margin * 2,
  ) as string[];
  doc.text(titleLines, margin, 26);

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(220, 240, 245);
  doc.text("Energie-Konzeptstudie", margin, 38);

  doc.setFontSize(9);
  doc.text(`${address} · ${dateStr}`, margin, 46);
  doc.setTextColor(...GREEN);
  doc.text(techSummary, pageWidth - margin, 46, { align: "right" });

  return 62;
}

export { NAVY, CYAN, GREEN, SLATE, formatEuro, formatKwh };
