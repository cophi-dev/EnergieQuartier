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
    const valueLines = doc.splitTextToSize(item.value, tileW - 6) as string[];
    doc.text(valueLines.slice(0, 2), tx + 3, y + 13);

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

    const tags: string[] = [];
    if (s.isCurrent) tags.push("Ihr Konzept");
    if (s.isRecommended) tags.push("Empfohlen");
    const nameLine = tags.length ? `${s.name} (${tags.join(", ")})` : s.name;
    const nameWrapped = doc.splitTextToSize(
      nameLine,
      colWidths[0] - 3,
    ) as string[];
    const rowH = Math.max(9, 4 + nameWrapped.length * 3.6);

    doc.setFillColor(...bg);
    doc.rect(x, cy, width, rowH, "F");

    const cells = [
      nameWrapped,
      [formatEuro(s.investNet, true)],
      [formatEuro(s.savings, true)],
      [`${s.payback.toFixed(1)} J.`],
      [`${s.co2.toFixed(1)} t`],
      [`${s.autarky} %`],
    ];

    doc.setFontSize(6.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...NAVY);
    let cx = x + 2;
    cells.forEach((cell, i) => {
      if (i === 0) {
        doc.text(cell as string[], cx + 1, cy + 5);
      } else {
        doc.text((cell as string[])[0], cx + 1, cy + 5);
      }
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

  steps.forEach((step, i) => {
    const desc = doc.splitTextToSize(step.description, width - 12) as string[];
    const blockH = Math.max(12, 7 + desc.length * 3.6);

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
    doc.text(desc, x + 10, cy + 8);

    cy += blockH + 2;
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
  const heroH = 58;
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, pageWidth, heroH, "F");
  doc.setFillColor(...CYAN);
  doc.rect(0, heroH, pageWidth, 1.2, "F");
  doc.setFillColor(...GREEN);
  doc.rect(0, heroH + 1.2, pageWidth, 0.6, "F");

  doc.setTextColor(...CYAN);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(BRAND.tagline.toUpperCase(), margin, 14);

  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  const titleLines = doc.splitTextToSize(
    projectLabel,
    pageWidth - margin * 2,
  ) as string[];
  doc.text(titleLines.slice(0, 2), margin, 26);

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(220, 240, 245);
  doc.text("Energie-Konzeptstudie", margin, 38);

  doc.setFontSize(9);
  doc.text(`${address} · ${dateStr}`, margin, 46);

  doc.setTextColor(...GREEN);
  doc.setFont("helvetica", "bold");
  const techLines = doc.splitTextToSize(
    techSummary,
    pageWidth - margin * 2,
  ) as string[];
  doc.text(techLines.slice(0, 2), margin, 53);

  return heroH + 6;
}

/** Kompakte Projekt-Fakten als Kacheln (Titelseite) */
export function drawProjectSnapshotTiles(
  doc: PdfDoc,
  x: number,
  y: number,
  width: number,
  facts: { label: string; value: string }[],
): number {
  const cols = 2;
  const gap = 3;
  const tileW = (width - gap) / cols;
  const tileH = 16;
  const rows = Math.ceil(facts.length / cols);

  facts.forEach((fact, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const tx = x + col * (tileW + gap);
    const ty = y + row * (tileH + gap);

    doc.setFillColor(...LIGHT_BG);
    doc.setDrawColor(...CYAN);
    doc.setLineWidth(0.2);
    doc.roundedRect(tx, ty, tileW, tileH, 1.5, 1.5, "FD");

    doc.setFontSize(6);
    doc.setTextColor(...CYAN);
    doc.setFont("helvetica", "bold");
    doc.text(fact.label.toUpperCase(), tx + 3, ty + 5);

    doc.setFontSize(8);
    doc.setTextColor(...NAVY);
    doc.setFont("helvetica", "normal");
    const valueLines = doc.splitTextToSize(fact.value, tileW - 6) as string[];
    doc.text(valueLines.slice(0, 2), tx + 3, ty + 10);
  });

  return y + rows * (tileH + gap) + 2;
}

export interface PdfScenarioCard {
  name: string;
  techLabel: string;
  isCurrent: boolean;
  isRecommended: boolean;
  investNet: number;
  savings: number;
  payback: number;
  co2: number;
  autarky: number;
}

/** KPI-Streifen mit hellen Kacheln (wie Dashboard) */
export function drawLightKpiStrip(
  doc: PdfDoc,
  x: number,
  y: number,
  width: number,
  result: CalculationResult,
  targetPaybackYears: number,
): number {
  const kpis = [
    {
      label: "Amortisation",
      value: `${result.economics.paybackYears.toFixed(1)} J.`,
      hint: `Ziel ${targetPaybackYears} J.`,
      accent: CYAN,
      tint: [236, 254, 255] as [number, number, number],
    },
    {
      label: "CO₂-Einsparung",
      value: `${(result.environment.co2SavingsKg / 1000).toFixed(1)} t/a`,
      hint: `vorher ${(result.environment.co2BaselineKg / 1000).toFixed(1)} t/a`,
      accent: GREEN,
      tint: [240, 253, 244] as [number, number, number],
    },
    {
      label: "NPV (20 J.)",
      value: formatEuro(result.economics.npvEur),
      hint: `${formatEuro(result.economics.annualSavingsEur)}/a`,
      accent: NAVY,
      tint: LIGHT_BG,
    },
    {
      label: "Autarkie",
      value: `${result.annual.autarkyPercent} %`,
      hint: `${result.annual.selfConsumptionKwh.toLocaleString("de-DE")} kWh`,
      accent: CYAN,
      tint: [236, 254, 255] as [number, number, number],
    },
  ];

  const gap = 2.5;
  const tileW = (width - gap * 3) / 4;
  const tileH = 22;

  kpis.forEach((kpi, i) => {
    const tx = x + i * (tileW + gap);
    doc.setFillColor(...kpi.tint);
    doc.setDrawColor(...kpi.accent);
    doc.setLineWidth(0.25);
    doc.roundedRect(tx, y, tileW, tileH, 1.5, 1.5, "FD");

    doc.setFontSize(6);
    doc.setTextColor(...SLATE);
    doc.setFont("helvetica", "bold");
    doc.text(kpi.label.toUpperCase(), tx + 2.5, y + 5);

    doc.setFontSize(11);
    doc.setTextColor(...NAVY);
    doc.setFont("helvetica", "bold");
    doc.text(kpi.value, tx + 2.5, y + 12.5);

    doc.setFontSize(5.5);
    doc.setTextColor(...SLATE);
    doc.setFont("helvetica", "normal");
    doc.text(kpi.hint, tx + 2.5, y + 17.5);
  });

  return y + tileH + 4;
}

/** Technologie-Dimensionierung als Chip-Zeile */
export function drawSizingChips(
  doc: PdfDoc,
  x: number,
  y: number,
  width: number,
  items: { label: string; value: string }[],
): number {
  if (items.length === 0) return y;

  doc.setFontSize(7);
  doc.setTextColor(...CYAN);
  doc.setFont("helvetica", "bold");
  doc.text("IHR TECHNOLOGIE-MIX", x, y);
  y += 5;

  const chipH = 11;
  let cx = x;
  let rowY = y;

  items.forEach((item, i) => {
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    const chipText = `${item.value} · ${item.label}`;
    const chipW = Math.min(
      doc.getTextWidth(chipText) + 6,
      width - (cx - x),
    );

    if (cx + chipW > x + width && i > 0) {
      cx = x;
      rowY += chipH + 2;
    }

    doc.setFillColor(...LIGHT_BG);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.15);
    doc.roundedRect(cx, rowY, chipW, chipH, 1, 1, "FD");
    doc.setTextColor(...NAVY);
    doc.text(chipText, cx + 3, rowY + 7);
    cx += chipW + 2;
  });

  return rowY + chipH + 4;
}

/** Tagline-Box (Executive Summary) */
export function drawTaglineBox(
  doc: PdfDoc,
  x: number,
  y: number,
  width: number,
  tagline: string,
): number {
  const padding = 4;
  const wrapped = doc.splitTextToSize(tagline, width - padding * 2) as string[];
  const boxH = 6 + wrapped.length * 4.2;

  doc.setFillColor(236, 254, 255);
  doc.setDrawColor(...CYAN);
  doc.setLineWidth(0.2);
  doc.roundedRect(x, y, width, boxH, 2, 2, "FD");

  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  doc.setFont("helvetica", "normal");
  doc.text(wrapped, x + padding, y + 5);

  return y + boxH + 4;
}

/** Kosten: Hero-Einsparung + Amortisation */
export function drawSavingsHeroBlock(
  doc: PdfDoc,
  x: number,
  y: number,
  width: number,
  result: CalculationResult,
): number {
  const boxH = 22;
  doc.setFillColor(240, 253, 244);
  doc.setDrawColor(...GREEN);
  doc.setLineWidth(0.2);
  doc.roundedRect(x, y, width, boxH, 2, 2, "FD");

  doc.setFontSize(7);
  doc.setTextColor(...GREEN);
  doc.setFont("helvetica", "bold");
  doc.text("JÄHRLICHE EINSPARUNG", x + 4, y + 7);

  doc.setFontSize(16);
  doc.setTextColor(21, 128, 61);
  doc.setFont("helvetica", "bold");
  doc.text(
    `${result.economics.annualSavingsEur.toLocaleString("de-DE")} €/a`,
    x + 4,
    y + 16,
  );

  doc.setFontSize(8);
  doc.setTextColor(...SLATE);
  doc.setFont("helvetica", "normal");
  doc.text(
    `Amortisation in ${result.economics.paybackYears.toFixed(1)} Jahren`,
    x + width - 4,
    y + 16,
    { align: "right" },
  );

  return y + boxH + 5;
}

/** CO₂: Vorher/Nachher mit Fortschrittsbalken */
export function drawCo2ReductionVisual(
  doc: PdfDoc,
  x: number,
  y: number,
  width: number,
  env: EnvironmentResult,
  analogy: string,
): number {
  const before = env.co2BaselineKg / 1000;
  const after = env.co2AfterKg / 1000;
  const saved = env.co2SavingsKg / 1000;
  const reductionPct =
    before > 0 ? Math.round((saved / before) * 100) : 0;
  const afterPct = before > 0 ? (after / before) * 100 : 0;

  doc.setFontSize(7);
  doc.setTextColor(...SLATE);
  doc.setFont("helvetica", "bold");
  doc.text("VORHER", x, y + 4);
  doc.text("NACHHER", x + width, y + 4, { align: "right" });

  doc.setFontSize(14);
  doc.setTextColor(...SLATE);
  doc.text(`${before.toFixed(1)} t/a`, x, y + 12);
  doc.setTextColor(...GREEN);
  doc.text(`${after.toFixed(1)} t/a`, x + width, y + 12, { align: "right" });

  doc.setFontSize(9);
  doc.setTextColor(...GREEN);
  doc.text(`−${reductionPct} %`, x + width / 2, y + 8, { align: "center" });

  const barY = y + 16;
  const barH = 7;
  doc.setFillColor(148, 163, 184);
  doc.roundedRect(x, barY, width, barH, 2, 2, "F");
  doc.setFillColor(...GREEN);
  doc.roundedRect(
    x,
    barY,
    width * (Math.max(afterPct, 8) / 100),
    barH,
    2,
    2,
    "F",
  );

  doc.setFontSize(6.5);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.text(
    `${saved.toFixed(1)} t CO₂ weniger / Jahr`,
    x + width / 2,
    barY + 4.8,
    { align: "center" },
  );

  doc.setFontSize(8);
  doc.setTextColor(...SLATE);
  doc.setFont("helvetica", "normal");
  const analogyWrapped = doc.splitTextToSize(analogy, width) as string[];
  doc.text(analogyWrapped.slice(0, 2), x, barY + barH + 5);

  return barY + barH + (analogyWrapped.length > 1 ? 14 : 10);
}

/** Szenario-Vergleich als drei Karten nebeneinander */
export function drawScenarioComparisonCards(
  doc: PdfDoc,
  x: number,
  y: number,
  width: number,
  scenarios: PdfScenarioCard[],
): number {
  const gap = 3;
  const cardW = (width - gap * (scenarios.length - 1)) / scenarios.length;
  const cardH = 62;
  let maxY = y;

  scenarios.forEach((s, i) => {
    const cx = x + i * (cardW + gap);
    const accent = s.isCurrent ? CYAN : [226, 232, 240] as [number, number, number];
    const fill: [number, number, number] = s.isCurrent
      ? [236, 254, 255]
      : [255, 255, 255];

    doc.setFillColor(...fill);
    doc.setDrawColor(...accent);
    doc.setLineWidth(s.isCurrent ? 0.4 : 0.2);
    doc.roundedRect(cx, y, cardW, cardH, 2, 2, "FD");

    let cy = y + 4;
    doc.setFontSize(5.5);
    doc.setFont("helvetica", "bold");
    if (s.isCurrent) {
      doc.setTextColor(...CYAN);
      doc.text("✓ IHR KONZEPT", cx + 2.5, cy);
      cy += 3.5;
    }
    if (s.isRecommended) {
      doc.setTextColor(...GREEN);
      doc.text("★ EMPFOHLEN", cx + 2.5, cy);
      cy += 3.5;
    }

    doc.setFontSize(8);
    doc.setTextColor(...NAVY);
    doc.setFont("helvetica", "bold");
    const nameLines = doc.splitTextToSize(s.name, cardW - 5) as string[];
    doc.text(nameLines.slice(0, 2), cx + 2.5, cy + 3);
    cy += nameLines.length > 1 ? 8 : 5;

    doc.setFontSize(6);
    doc.setTextColor(...SLATE);
    doc.setFont("helvetica", "normal");
    doc.text(s.techLabel.slice(0, 28), cx + 2.5, cy + 2);
    cy += 5;

    const heroH = 14;
    const heroFill: [number, number, number] = s.isCurrent
      ? [240, 253, 244]
      : LIGHT_BG;
    doc.setFillColor(...heroFill);
    doc.roundedRect(cx + 2, cy, cardW - 4, heroH, 1.5, 1.5, "F");
    doc.setFontSize(5);
    doc.setTextColor(...SLATE);
    doc.text("Einsparung / Jahr", cx + 4, cy + 4);
    doc.setFontSize(10);
    doc.setTextColor(...(s.isCurrent ? GREEN : NAVY));
    doc.setFont("helvetica", "bold");
    doc.text(formatEuro(s.savings), cx + 4, cy + 11);
    cy += heroH + 3;

    const stats = [
      ["Invest.", formatEuro(s.investNet, true)],
      ["Amort.", `${s.payback.toFixed(1)} J.`],
      ["CO₂", `${s.co2.toFixed(1)} t/a`],
      ["Autarkie", `${s.autarky} %`],
    ];
    stats.forEach(([label, val]) => {
      doc.setFontSize(6);
      doc.setTextColor(...SLATE);
      doc.setFont("helvetica", "normal");
      doc.text(label, cx + 2.5, cy + 3);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...NAVY);
      doc.text(val, cx + cardW - 2.5, cy + 3, { align: "right" });
      cy += 4.5;
    });

    maxY = Math.max(maxY, y + cardH);
  });

  return maxY + 4;
}

export { NAVY, CYAN, GREEN, SLATE, formatEuro, formatKwh };
