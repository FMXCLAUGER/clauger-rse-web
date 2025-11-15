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
import { formatCurrency } from "@/lib/data/rse-data"

interface BudgetChartProps {
  data: Array<{ pillar: string; amount: number; percentage: number }>
}

const COLORS = ["#10B981", "#0088CC", "#F8B500"]

export function BudgetChart({ data }: BudgetChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        layout="vertical"
      >
        <CartesianGrid stroke="#E5E7EB" className="dark:stroke-gray-700" strokeDasharray="3 3" />
        <XAxis
          type="number"
          tick={{ fill: "#666666", fontSize: 12 }}
          tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M€`}
        />
        <YAxis
          dataKey="pillar"
          type="category"
          tick={{ fill: "#666666", fontSize: 12 }}
          width={120}
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
          formatter={(value: number) => formatCurrency(value)}
        />
        <Bar dataKey="amount" name="Budget" radius={[0, 8, 8, 0]} strokeWidth={2.5}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
