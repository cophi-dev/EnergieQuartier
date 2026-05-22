"use client";

import { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Lightbulb } from "lucide-react";
import {
  ResponsiveContainer,
  Sankey,
} from "recharts";
import type { AnnualEnergyBalance, SankeyData } from "@/app/types/calculation";
import {
  computeNodeTotals,
  computeSankeyInsights,
  getLinkColor,
  getNodeMeta,
  getSankeyHighlightSet,
  pruneSankeyData,
  SANKEY_CATEGORY_LABELS,
  type SankeyFlowBreakdown,
  type SankeyLinkInsight,
  type SankeyNodeInsight,
} from "@/app/lib/sankey-utils";

interface EnergySankeyProps {
  data: SankeyData;
  annual?: Pick<AnnualEnergyBalance, "autarkyPercent">;
}

function formatKwh(value: number): string {
  if (value >= 1000) return `${(value / 1000).toFixed(1)} MWh/a`;
  return `${Math.round(value).toLocaleString("de-DE")} kWh/a`;
}

function formatPercent(value: number): string {
  return `${value.toFixed(0)} %`;
}

function FlowBreakdownList({
  title,
  rows,
}: {
  title: string;
  rows: SankeyFlowBreakdown[];
}) {
  if (rows.length === 0) return null;

  return (
    <div className="mt-2.5">
      <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-[#0F172A]/45 dark:text-white/45">
        {title}
      </p>
      <div className="space-y-1.5">
        {rows.slice(0, 4).map((row) => (
          <div key={`${title}-${row.name}`}>
            <div className="mb-0.5 flex items-center justify-between gap-2 text-[11px]">
              <span className="truncate font-medium text-[#0F172A] dark:text-white">
                {row.shortLabel}
              </span>
              <span className="shrink-0 tabular-nums text-[#0F172A]/70 dark:text-white/70">
                {formatPercent(row.percent)}
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-[#0F172A]/8 dark:bg-white/10">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${Math.max(row.percent, 4)}%`,
                  backgroundColor: row.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function InsightTip({ tip }: { tip: string }) {
  return (
    <div className="mt-2.5 flex items-start gap-1.5 rounded-md border border-[#06B6D4]/20 bg-[#06B6D4]/8 px-2 py-1.5">
      <Lightbulb className="mt-0.5 h-3 w-3 shrink-0 text-[#06B6D4]" />
      <p className="text-[10px] leading-snug text-[#0F172A]/80 dark:text-white/80">
        {tip}
      </p>
    </div>
  );
}

function SankeyNodeTooltip({ insight }: { insight: SankeyNodeInsight }) {
  return (
    <div className="glass w-[240px] rounded-xl px-3 py-2.5 text-xs shadow-xl ring-1 ring-[#0F172A]/8 dark:ring-white/10">
      <span
        className="mb-1.5 inline-block rounded px-1.5 py-0.5 text-[10px] font-medium text-white"
        style={{ backgroundColor: insight.categoryMeta.color }}
      >
        {insight.categoryMeta.label}
      </span>
      <p className="text-sm font-semibold text-[#0F172A] dark:text-white">
        {insight.name}
      </p>
      <p className="mt-0.5 text-base font-bold tabular-nums text-[#06B6D4]">
        {formatKwh(insight.throughputKwh)}
      </p>

      <FlowBreakdownList title="Zuflüsse" rows={insight.incoming} />
      <FlowBreakdownList title="Abflüsse" rows={insight.outgoing} />

      {insight.tip ? <InsightTip tip={insight.tip} /> : null}
    </div>
  );
}

function SankeyLinkTooltip({ insight }: { insight: SankeyLinkInsight }) {
  return (
    <div className="glass w-[220px] rounded-xl px-3 py-2.5 text-xs shadow-xl ring-1 ring-[#0F172A]/8 dark:ring-white/10">
      <span
        className="mb-1.5 inline-block rounded px-1.5 py-0.5 text-[10px] font-medium text-white"
        style={{ backgroundColor: insight.categoryMeta.color }}
      >
        {insight.categoryMeta.label}
      </span>
      <p className="font-semibold text-[#0F172A] dark:text-white">
        {insight.sourceShortLabel}
        <span className="mx-1 text-[#06B6D4]">→</span>
        {insight.targetShortLabel}
      </p>
      <p className="mt-1 text-base font-bold tabular-nums text-[#22C55E]">
        {formatKwh(insight.value)}
      </p>

      <div className="mt-2 space-y-1 text-[11px] text-[#0F172A]/70 dark:text-white/70">
        <p>
          {formatPercent(insight.percentOfSourceOut)} von{" "}
          <span className="font-medium text-[#0F172A] dark:text-white">
            {insight.sourceShortLabel}
          </span>
        </p>
        <p>
          {formatPercent(insight.percentOfTargetIn)} von{" "}
          <span className="font-medium text-[#0F172A] dark:text-white">
            {insight.targetShortLabel}
          </span>
        </p>
      </div>

      {insight.tip ? <InsightTip tip={insight.tip} /> : null}
    </div>
  );
}

function SankeyLegend() {
  const categories = Object.entries(SANKEY_CATEGORY_LABELS) as [
    keyof typeof SANKEY_CATEGORY_LABELS,
    { label: string; color: string },
  ][];

  return (
    <div className="mt-2 flex flex-wrap items-center gap-4 border-t border-[#0F172A]/10 pt-3 dark:border-white/10">
      <span className="text-xs font-medium text-[#0F172A]/50 dark:text-white/50">
        Energieträger:
      </span>
      {categories.map(([key, { label, color }]) => (
        <span
          key={key}
          className="inline-flex items-center gap-1.5 text-xs text-[#0F172A] dark:text-white/80"
        >
          <span
            className="h-2.5 w-2.5 rounded-full ring-1 ring-black/5"
            style={{ backgroundColor: color }}
          />
          {label}
        </span>
      ))}
      <span className="ml-auto text-xs text-[#0F172A]/40 dark:text-white/40">
        Flussstärke = kWh/a · Hover für Details
      </span>
    </div>
  );
}

export function EnergySankey({ data, annual }: EnergySankeyProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<{ kind: "node" | "link"; index: number } | null>(null);
  const [cursor, setCursor] = useState({ x: 0, y: 0 });

  const prepared = useMemo(() => pruneSankeyData(data), [data]);
  const nodeTotals = useMemo(() => computeNodeTotals(prepared), [prepared]);
  const insights = useMemo(
    () =>
      computeSankeyInsights(prepared, {
        autarkyPercent: annual?.autarkyPercent,
      }),
    [prepared, annual?.autarkyPercent],
  );
  const highlight = useMemo(
    () => getSankeyHighlightSet(prepared, hover),
    [prepared, hover],
  );

  const sankeyData = {
    nodes: prepared.nodes.map((n) => ({ ...n })),
    links: prepared.links.map((l) => ({ ...l })),
  };

  const updateCursor = (clientX: number, clientY: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setCursor({
      x: clientX - rect.left,
      y: clientY - rect.top,
    });
  };

  const clearHover = () => setHover(null);

  const activeInsight =
    hover?.kind === "link"
      ? insights.links.get(hover.index)
      : hover?.kind === "node"
        ? insights.nodes.get(hover.index)
        : undefined;

  const tooltipStyle = useMemo(() => {
    const width = hover?.kind === "link" ? 220 : 240;
    const height = 200;
    const offset = 14;
    let left = cursor.x + offset;
    let top = cursor.y + offset;

    const containerWidth = containerRef.current?.clientWidth ?? 0;
    const containerHeight = containerRef.current?.clientHeight ?? 0;

    if (left + width > containerWidth - 8) {
      left = cursor.x - width - offset;
    }
    if (top + height > containerHeight - 8) {
      top = cursor.y - height - offset;
    }

    return { left: Math.max(8, left), top: Math.max(8, top) };
  }, [cursor.x, cursor.y, hover?.kind]);

  return (
    <motion.div
      className="w-full"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div
        ref={containerRef}
        className="relative h-[420px] w-full"
        onMouseMove={(event) => updateCursor(event.clientX, event.clientY)}
        onMouseLeave={clearHover}
      >
        <ResponsiveContainer width="100%" height="100%">
          <Sankey
            data={sankeyData}
            nodePadding={28}
            nodeWidth={16}
            linkCurvature={0.48}
            margin={{ top: 20, right: 148, bottom: 20, left: 148 }}
            link={(props) => {
              const {
                sourceX,
                targetX,
                sourceY,
                targetY,
                sourceControlX,
                targetControlX,
                linkWidth,
                index,
                payload,
              } = props;
              const sourceName = String(
                (payload as { source?: { name?: string } })?.source?.name ?? "",
              );
              const isHighlighted = !highlight || highlight.linkIndices.has(index);
              const path = `
                M${sourceX},${sourceY + linkWidth / 2}
                C${sourceControlX},${sourceY + linkWidth / 2}
                  ${targetControlX},${targetY + linkWidth / 2}
                  ${targetX},${targetY + linkWidth / 2}
                L${targetX},${targetY - linkWidth / 2}
                C${targetControlX},${targetY - linkWidth / 2}
                  ${sourceControlX},${sourceY - linkWidth / 2}
                  ${sourceX},${sourceY - linkWidth / 2}
                Z
              `;
              return (
                <motion.path
                  key={`link-${index}`}
                  d={path}
                  fill={getLinkColor(sourceName, isHighlighted ? 0.45 : 0.1)}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.15 + index * 0.04, duration: 0.6 }}
                  className="cursor-pointer transition-opacity"
                  onMouseEnter={(event) => {
                    updateCursor(event.clientX, event.clientY);
                    setHover({ kind: "link", index });
                  }}
                />
              );
            }}
            node={(props) => {
              const { x, y, width, height, index, payload } = props;
              const name = String(payload.name ?? "");
              const meta = getNodeMeta(name);
              const total = nodeTotals.get(index) ?? 0;
              const isHighlighted = !highlight || highlight.nodeIndices.has(index);

              const outgoing = prepared.links
                .filter((l) => l.source === index)
                .reduce((s, l) => s + l.value, 0);
              const incoming = prepared.links
                .filter((l) => l.target === index)
                .reduce((s, l) => s + l.value, 0);
              const isSource = outgoing >= incoming;

              const labelX = isSource ? x - 10 : x + width + 10;
              const anchor = isSource ? "end" : "start";

              return (
                <g key={`node-${index}`}>
                  <motion.g
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isHighlighted ? 1 : 0.35 }}
                    transition={{ delay: index * 0.06, duration: 0.5 }}
                  >
                    <rect
                      x={x}
                      y={y}
                      width={width}
                      height={height}
                      fill={meta.color}
                      rx={4}
                      opacity={isHighlighted ? 0.95 : 0.45}
                      filter={isHighlighted ? `drop-shadow(0 0 4px ${meta.color}40)` : undefined}
                      className="cursor-pointer"
                      onMouseEnter={(event) => {
                        updateCursor(event.clientX, event.clientY);
                        setHover({ kind: "node", index });
                      }}
                    />
                  </motion.g>
                  <text
                    x={labelX}
                    y={y + height / 2 - 7}
                    textAnchor={anchor}
                    dominantBaseline="middle"
                    opacity={isHighlighted ? 1 : 0.45}
                    className="pointer-events-none fill-[#0F172A] text-[11px] font-semibold dark:fill-white"
                  >
                    {meta.shortLabel}
                  </text>
                  <text
                    x={labelX}
                    y={y + height / 2 + 9}
                    textAnchor={anchor}
                    dominantBaseline="middle"
                    opacity={isHighlighted ? 1 : 0.45}
                    className="pointer-events-none fill-[#06B6D4] text-[9px] font-medium"
                  >
                    {formatKwh(total / 2)}
                  </text>
                </g>
              );
            }}
          />
        </ResponsiveContainer>

        {activeInsight && hover ? (
          <div
            className="pointer-events-none absolute z-20"
            style={tooltipStyle}
          >
            {hover.kind === "link" ? (
              <SankeyLinkTooltip insight={activeInsight as SankeyLinkInsight} />
            ) : (
              <SankeyNodeTooltip insight={activeInsight as SankeyNodeInsight} />
            )}
          </div>
        ) : null}
      </div>
      <SankeyLegend />
    </motion.div>
  );
}
