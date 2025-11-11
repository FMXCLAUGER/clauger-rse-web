"use client"

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

interface WorkforceChartProps {
  data: Array<{ year: number; total: number; men: number; women: number }>
}

export function WorkforceChart({ data }: WorkforceChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <defs>
          <linearGradient id="colorMen" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1} />
          </linearGradient>
          <linearGradient id="colorWomen" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#EC4899" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#EC4899" stopOpacity={0.1} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
        <XAxis
          dataKey="year"
          className="text-gray-600 dark:text-gray-400"
          tick={{ fill: "currentColor" }}
        />
        <YAxis
          label={{ value: "Effectifs", angle: -90, position: "insideLeft" }}
          className="text-gray-600 dark:text-gray-400"
          tick={{ fill: "currentColor" }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "var(--background)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
          }}
          labelStyle={{ color: "var(--foreground)" }}
        />
        <Legend />
        <Area
          type="monotone"
          dataKey="men"
          stackId="1"
          stroke="#3B82F6"
          fill="url(#colorMen)"
          name="Hommes"
        />
        <Area
          type="monotone"
          dataKey="women"
          stackId="1"
          stroke="#EC4899"
          fill="url(#colorWomen)"
          name="Femmes"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
