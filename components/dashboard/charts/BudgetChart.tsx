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

const COLORS = ["#10B981", "#3B82F6", "#8B5CF6"]

export function BudgetChart({ data }: BudgetChartProps) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart
        data={data}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        layout="vertical"
      >
        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
        <XAxis
          type="number"
          className="text-gray-600 dark:text-gray-400"
          tick={{ fill: "currentColor" }}
          tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M€`}
        />
        <YAxis
          dataKey="pillar"
          type="category"
          className="text-gray-600 dark:text-gray-400"
          tick={{ fill: "currentColor" }}
          width={120}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "var(--background)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
          }}
          labelStyle={{ color: "var(--foreground)" }}
          formatter={(value: number) => formatCurrency(value)}
        />
        <Bar dataKey="amount" name="Budget" radius={[0, 8, 8, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
