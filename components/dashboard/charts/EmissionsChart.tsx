"use client"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

interface EmissionsChartProps {
  data: Array<{ year: number; scope1: number; scope2: number; scope3: number }>
}

export function EmissionsChart({ data }: EmissionsChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
        <XAxis
          dataKey="year"
          className="text-gray-600 dark:text-gray-400"
          tick={{ fill: "currentColor" }}
        />
        <YAxis
          label={{ value: "Tonnes CO2e", angle: -90, position: "insideLeft" }}
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
        <Line
          type="monotone"
          dataKey="scope1"
          stroke="#EF4444"
          strokeWidth={2}
          name="Scope 1"
          dot={{ fill: "#EF4444", r: 4 }}
          activeDot={{ r: 6 }}
        />
        <Line
          type="monotone"
          dataKey="scope2"
          stroke="#F59E0B"
          strokeWidth={2}
          name="Scope 2"
          dot={{ fill: "#F59E0B", r: 4 }}
          activeDot={{ r: 6 }}
        />
        <Line
          type="monotone"
          dataKey="scope3"
          stroke="#10B981"
          strokeWidth={2}
          name="Scope 3"
          dot={{ fill: "#10B981", r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
