"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

interface BoardCompositionChartProps {
  data: Array<{ category: string; count: number; percentage: number }>
}

const COLORS = ["#3B82F6", "#EC4899", "#10B981", "#F59E0B"]

export function BoardCompositionChart({ data }: BoardCompositionChartProps) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ category, percentage }) => `${category}: ${percentage.toFixed(1)}%`}
          outerRadius={120}
          fill="#8884d8"
          dataKey="count"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: "var(--background)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
          }}
          formatter={(value: number, name: string, props: any) =>
            `${value} (${props.payload.percentage.toFixed(1)}%)`
          }
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}
