"use client";

import { CHART_COLORS } from "@/app/lib/constants";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { CashflowYear } from "@/app/types/calculation";

interface CashflowChartProps {
  data: CashflowYear[];
}

export function CashflowChart({ data }: CashflowChartProps) {
  const chartData = data.filter((d) => d.year > 0);

  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="cashGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={CHART_COLORS.cyan} stopOpacity={0.45} />
              <stop offset="100%" stopColor={CHART_COLORS.cyan} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.primary} opacity={0.08} />
          <XAxis
            dataKey="year"
            tick={{ fontSize: 11, fill: CHART_COLORS.tick }}
            label={{ value: "Jahr", position: "insideBottom", offset: -4, fontSize: 11 }}
          />
          <YAxis
            tick={{ fontSize: 11, fill: CHART_COLORS.tick }}
            tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
          />
          <Tooltip
            formatter={(value) => [
              `${Number(value ?? 0).toLocaleString("de-DE")} €`,
              "Kumuliert",
            ]}
            labelFormatter={(y) => `Jahr ${y}`}
            contentStyle={{
              borderRadius: 8,
              border: `1px solid ${CHART_COLORS.cyan}30`,
              fontSize: 12,
            }}
          />
          <ReferenceLine y={0} stroke={CHART_COLORS.primary} strokeDasharray="4 4" />
          <Area
            type="monotone"
            dataKey="cumulative"
            stroke={CHART_COLORS.cyan}
            strokeWidth={2}
            fill="url(#cashGrad)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
