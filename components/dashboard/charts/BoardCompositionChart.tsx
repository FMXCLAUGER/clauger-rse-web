"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

interface BoardCompositionChartProps {
  data: Array<{ category: string; count: number; percentage: number }>
}

const COLORS = ["#0088CC", "#F8B500", "#10B981", "#F59E0B"]

export function BoardCompositionChart({ data }: BoardCompositionChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
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
          strokeWidth={2.5}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
          formatter={(value: number, name: string, props: any) =>
            `${value} (${props.payload.percentage.toFixed(1)}%)`
          }
        />
        <Legend wrapperStyle={{ paddingTop: "20px" }} />
      </PieChart>
    </ResponsiveContainer>
  )
}
