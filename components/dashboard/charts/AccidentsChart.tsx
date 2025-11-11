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

interface AccidentsChartProps {
  data: Array<{ year: number; count: number; frequency: number }>
}

export function AccidentsChart({ data }: AccidentsChartProps) {
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
          yAxisId="left"
          label={{ value: "Nombre", angle: -90, position: "insideLeft" }}
          className="text-gray-600 dark:text-gray-400"
          tick={{ fill: "currentColor" }}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          label={{ value: "Taux de fréquence", angle: 90, position: "insideRight" }}
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
          yAxisId="left"
          type="monotone"
          dataKey="count"
          stroke="#EF4444"
          strokeWidth={2}
          name="Nombre d'accidents"
          dot={{ fill: "#EF4444", r: 4 }}
          activeDot={{ r: 6 }}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="frequency"
          stroke="#F59E0B"
          strokeWidth={2}
          name="Taux de fréquence"
          dot={{ fill: "#F59E0B", r: 4 }}
          activeDot={{ r: 6 }}
          strokeDasharray="5 5"
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
