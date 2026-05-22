"use client";

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
import type { CalculationResult } from "@/app/types/calculation";

interface CostComparisonChartProps {
  result: CalculationResult;
}

export function CostComparisonChart({ result }: CostComparisonChartProps) {
  const totalSavings20 =
    result.cashflowYears[result.cashflowYears.length - 1]?.cumulative ??
    0;
  const savingsPositive = Math.max(
    0,
    totalSavings20 + result.investment.net,
  );

  const data = [
    {
      name: "Konzept",
      investition: result.investment.net,
      einsparung: Math.round(savingsPositive),
    },
    {
      name: "Referenz",
      investition: 0,
      einsparung: 0,
    },
  ];

  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#0A4D68" opacity={0.1} />
          <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#0A4D68" }} />
          <YAxis
            tick={{ fontSize: 11, fill: "#0A4D68" }}
            tickFormatter={(v) => `${(v / 1000).toFixed(0)}k €`}
          />
          <Tooltip
            formatter={(value) =>
              `${Number(value ?? 0).toLocaleString("de-DE")} €`
            }
            contentStyle={{ borderRadius: 8, fontSize: 12 }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar
            dataKey="investition"
            name="Investition (netto)"
            fill="#0A4D68"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            dataKey="einsparung"
            name="Einsparung (20 J.)"
            fill="#00FFCA"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
