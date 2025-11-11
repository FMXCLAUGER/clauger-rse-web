"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

interface WasteChartProps {
  data: { recycled: number; incinerated: number; landfill: number }
}

const COLORS = {
  recycled: "#10B981",
  incinerated: "#F59E0B",
  landfill: "#EF4444",
}

const LABELS = {
  recycled: "Recyclé",
  incinerated: "Incinéré",
  landfill: "Enfouissement",
}

export function WasteChart({ data }: WasteChartProps) {
  const chartData = [
    { name: LABELS.recycled, value: data.recycled, color: COLORS.recycled },
    { name: LABELS.incinerated, value: data.incinerated, color: COLORS.incinerated },
    { name: LABELS.landfill, value: data.landfill, color: COLORS.landfill },
  ]

  return (
    <ResponsiveContainer width="100%" height={350}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
          outerRadius={120}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: "var(--background)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
          }}
          formatter={(value: number) => `${value.toFixed(1)}%`}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}
