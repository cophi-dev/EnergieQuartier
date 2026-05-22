"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  Sankey,
  Tooltip,
} from "recharts";
import type { SankeyData } from "@/app/types/calculation";
import {
  computeNodeTotals,
  getLinkColor,
  getNodeMeta,
  pruneSankeyData,
  SANKEY_CATEGORY_LABELS,
  type SankeyCategory,
} from "@/app/lib/sankey-utils";

interface EnergySankeyProps {
  data: SankeyData;
}

function formatKwh(value: number): string {
  if (value >= 1000) return `${(value / 1000).toFixed(1)} MWh/a`;
  return `${Math.round(value).toLocaleString("de-DE")} kWh/a`;
}

function SankeyLegend() {
  const categories = Object.entries(SANKEY_CATEGORY_LABELS) as [
    SankeyCategory,
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

export function EnergySankey({ data }: EnergySankeyProps) {
  const prepared = useMemo(() => pruneSankeyData(data), [data]);
  const nodeTotals = useMemo(() => computeNodeTotals(prepared), [prepared]);

  const sankeyData = {
    nodes: prepared.nodes.map((n) => ({ ...n })),
    links: prepared.links.map((l) => ({ ...l })),
  };

  return (
    <motion.div
      className="w-full"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="h-[420px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <Sankey
            data={sankeyData}
            nodePadding={28}
            nodeWidth={16}
            linkCurvature={0.48}
            margin={{ top: 20, right: 148, bottom: 20, left: 148 }}
            link={(props) => {
              const { sourceX, targetX, sourceY, targetY, sourceControlX, targetControlX, linkWidth, index, payload } = props;
              const sourceName = String(
                (payload as { source?: { name?: string } })?.source?.name ?? "",
              );
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
                  fill={getLinkColor(sourceName, 0.4)}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.15 + index * 0.04, duration: 0.6 }}
                  className="transition-opacity hover:opacity-80"
                />
              );
            }}
            node={(props) => {
              const { x, y, width, height, index, payload } = props;
              const name = String(payload.name ?? "");
              const meta = getNodeMeta(name);
              const total = nodeTotals.get(index) ?? 0;

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
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.06, duration: 0.5 }}
                  >
                    <rect
                      x={x}
                      y={y}
                      width={width}
                      height={height}
                      fill={meta.color}
                      rx={4}
                      opacity={0.95}
                      filter={`drop-shadow(0 0 4px ${meta.color}40)`}
                    />
                  </motion.g>
                  <text
                    x={labelX}
                    y={y + height / 2 - 7}
                    textAnchor={anchor}
                    dominantBaseline="middle"
                    className="fill-[#0F172A] text-[11px] font-semibold dark:fill-white"
                  >
                    {meta.shortLabel}
                  </text>
                  <text
                    x={labelX}
                    y={y + height / 2 + 9}
                    textAnchor={anchor}
                    dominantBaseline="middle"
                    className="fill-[#06B6D4] text-[9px] font-medium"
                  >
                    {formatKwh(total / 2)}
                  </text>
                  <title>{`${name}: ${formatKwh(total)}`}</title>
                </g>
              );
            }}
          >
            <Tooltip
              content={({ payload }) => {
                if (!payload?.[0]) return null;
                const item = payload[0].payload as {
                  source?: { name: string };
                  target?: { name: string };
                  value?: number;
                  name?: string;
                };

                if (item.source && item.target) {
                  const meta = getNodeMeta(item.source.name);
                  const cat = SANKEY_CATEGORY_LABELS[meta.category];
                  return (
                    <div className="glass rounded-lg px-3 py-2 text-xs shadow-lg">
                      <span
                        className="mb-1 inline-block rounded px-1.5 py-0.5 text-[10px] font-medium text-white"
                        style={{ backgroundColor: cat.color }}
                      >
                        {cat.label}
                      </span>
                      <p className="font-semibold text-[#0F172A] dark:text-white">
                        {item.source.name}
                      </p>
                      <p className="text-[#06B6D4]">↓</p>
                      <p className="font-semibold text-[#0F172A] dark:text-white">
                        {item.target.name}
                      </p>
                      <p className="mt-1 font-bold text-[#22C55E]">
                        {formatKwh(item.value ?? 0)}
                      </p>
                    </div>
                  );
                }

                const nodeName = item.name ?? "";
                const meta = getNodeMeta(nodeName);
                return (
                  <div className="glass rounded-lg px-3 py-2 text-xs shadow-md">
                    <p className="font-medium text-[#0F172A] dark:text-white">{nodeName}</p>
                    <p className="text-[#06B6D4]">{meta.category}</p>
                  </div>
                );
              }}
            />
          </Sankey>
        </ResponsiveContainer>
      </div>
      <SankeyLegend />
    </motion.div>
  );
}
