"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"

interface AgeDistributionChartProps {
  data: Array<{ range: string; count: number }>
}

const COLORS = ["#0088CC", "#F8B500", "#10B981", "#F59E0B", "#EF4444"]

export function AgeDistributionChart({ data }: AgeDistributionChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid stroke="#E5E7EB" className="dark:stroke-gray-700" strokeDasharray="3 3" />
        <XAxis
          dataKey="range"
          tick={{ fill: "#666666", fontSize: 12 }}
        />
        <YAxis
          label={{ value: "Nombre", angle: -90, position: "insideLeft", fill: "#666666" }}
          tick={{ fill: "#666666", fontSize: 12 }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #E5E7EB",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          }}
          labelStyle={{ color: "#333333", fontWeight: 600 }}
          itemStyle={{ color: "#666666" }}
        />
        <Bar dataKey="count" name="Effectifs" radius={[8, 8, 0, 0]} strokeWidth={2.5}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
