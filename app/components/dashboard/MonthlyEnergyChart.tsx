"use client";

import { CHART_COLORS } from "@/app/lib/constants";
import type { MonthlyEnergyPoint } from "@/app/lib/monthly-energy";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface MonthlyEnergyChartProps {
  data: MonthlyEnergyPoint[];
}

export function MonthlyEnergyChart({ data }: MonthlyEnergyChartProps) {
  const chartData = data.map((d) => ({
    month: d.month,
    pv: d.pvGenerationKwh,
    netz: d.gridImportKwh,
    waerme: d.heatDemandKwh,
    wpStrom: d.heatPumpElectricityKwh,
  }));

  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={CHART_COLORS.primary}
            opacity={0.08}
          />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11, fill: CHART_COLORS.tick }}
          />
          <YAxis
            tick={{ fontSize: 11, fill: CHART_COLORS.tick }}
            tickFormatter={(v) =>
              Number(v) >= 1000 ? `${(Number(v) / 1000).toFixed(1)}k` : String(v)
            }
          />
          <Tooltip
            formatter={(value, name) => [
              `${Number(value ?? 0).toLocaleString("de-DE")} kWh`,
              String(name),
            ]}
            contentStyle={{
              borderRadius: 8,
              border: `1px solid ${CHART_COLORS.cyan}30`,
              fontSize: 12,
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
            formatter={(value) => {
              const labels: Record<string, string> = {
                pv: "PV-Erzeugung",
                netz: "Netzbezug",
                waerme: "Wärmebedarf",
                wpStrom: "Wärmepumpen-Strom",
              };
              return labels[value] ?? value;
            }}
          />
          <Bar dataKey="pv" fill={CHART_COLORS.green} radius={[2, 2, 0, 0]} />
          <Bar dataKey="netz" fill={`${CHART_COLORS.primary}88`} radius={[2, 2, 0, 0]} />
          <Bar dataKey="waerme" fill="#F59E0B" radius={[2, 2, 0, 0]} />
          <Bar dataKey="wpStrom" fill={CHART_COLORS.cyan} radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <p className="mt-2 text-center text-xs text-[#0F172A]/50 dark:text-white/50">
        Monatliche Verteilung · Hamburg-Saisonprofil (Sommer-PV, Winter-Wärme)
      </p>
    </div>
  );
}
