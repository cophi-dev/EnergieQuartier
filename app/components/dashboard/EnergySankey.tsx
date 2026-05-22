"use client";

import { useMemo } from "react";
import {
  ResponsiveContainer,
  Sankey,
  Tooltip,
} from "recharts";
import type { SankeyData } from "@/app/types/calculation";
import {
  computeNodeTotals,
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
    <div className="flex flex-wrap items-center gap-4 border-t border-[#0A4D68]/10 pt-3 mt-2">
      <span className="text-xs font-medium text-[#0A4D68]/50">Energieträger:</span>
      {categories.map(([key, { label, color }]) => (
        <span key={key} className="inline-flex items-center gap-1.5 text-xs text-[#0A4D68]">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: color }}
          />
          {label}
        </span>
      ))}
      <span className="text-xs text-[#0A4D68]/40 ml-auto">
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
    <div className="w-full">
      <div className="h-[420px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <Sankey
            data={sankeyData}
            nodePadding={28}
            nodeWidth={16}
            linkCurvature={0.48}
            margin={{ top: 20, right: 148, bottom: 20, left: 148 }}
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

              const labelX = isSource ? x - 8 : x + width + 8;
              const anchor = isSource ? "end" : "start";

              return (
                <g key={`node-${index}`}>
                  <rect
                    x={x}
                    y={y}
                    width={width}
                    height={height}
                    fill={meta.color}
                    rx={4}
                    opacity={0.92}
                  />
                  <text
                    x={labelX}
                    y={y + height / 2 - 6}
                    textAnchor={anchor}
                    dominantBaseline="middle"
                    className="fill-[#0A4D68] text-[11px] font-semibold dark:fill-white"
                  >
                    {meta.shortLabel}
                  </text>
                  <text
                    x={labelX}
                    y={y + height / 2 + 8}
                    textAnchor={anchor}
                    dominantBaseline="middle"
                    className="fill-[#088395] text-[9px] font-medium"
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
                    <div className="rounded-lg border border-[#088395]/30 bg-white px-3 py-2 text-xs shadow-lg dark:bg-[#0A4D68]">
                      <span
                        className="inline-block rounded px-1.5 py-0.5 text-[10px] font-medium text-white mb-1"
                        style={{ backgroundColor: cat.color }}
                      >
                        {cat.label}
                      </span>
                      <p className="font-semibold text-[#0A4D68] dark:text-white">
                        {item.source.name}
                      </p>
                      <p className="text-[#088395]">↓</p>
                      <p className="font-semibold text-[#0A4D68] dark:text-white">
                        {item.target.name}
                      </p>
                      <p className="mt-1 font-bold text-[#088395]">
                        {formatKwh(item.value ?? 0)}
                      </p>
                    </div>
                  );
                }

                const nodeName = item.name ?? "";
                const meta = getNodeMeta(nodeName);
                return (
                  <div className="rounded-lg border bg-white px-3 py-2 text-xs shadow-md dark:bg-[#0A4D68]">
                    <p className="font-medium text-[#0A4D68] dark:text-white">{nodeName}</p>
                    <p className="text-[#088395]">{meta.category}</p>
                  </div>
                );
              }}
            />
          </Sankey>
        </ResponsiveContainer>
      </div>
      <SankeyLegend />
    </div>
  );
}
