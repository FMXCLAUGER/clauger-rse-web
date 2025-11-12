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
    <ResponsiveContainer width="100%" height={300}>
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
          strokeWidth={2.5}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #E5E7EB",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          }}
          labelStyle={{ color: "#333333", fontWeight: 600 }}
          itemStyle={{ color: "#666666" }}
          formatter={(value: number) => `${value.toFixed(1)}%`}
        />
        <Legend wrapperStyle={{ paddingTop: "20px" }} />
      </PieChart>
    </ResponsiveContainer>
  )
}
