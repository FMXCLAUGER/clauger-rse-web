"use client"

import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

interface TrainingChartProps {
  data: Array<{ year: number; hours: number; employees: number }>
}

export function TrainingChart({ data }: TrainingChartProps) {
  // Calculer les heures moyennes par employé
  const chartData = data.map((item) => ({
    ...item,
    avgHours: (item.hours / item.employees).toFixed(1),
  }))

  return (
    <ResponsiveContainer width="100%" height={350}>
      <ComposedChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
        <XAxis
          dataKey="year"
          className="text-gray-600 dark:text-gray-400"
          tick={{ fill: "currentColor" }}
        />
        <YAxis
          yAxisId="left"
          label={{ value: "Heures totales", angle: -90, position: "insideLeft" }}
          className="text-gray-600 dark:text-gray-400"
          tick={{ fill: "currentColor" }}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          label={{ value: "Heures/employé", angle: 90, position: "insideRight" }}
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
        <Bar
          yAxisId="left"
          dataKey="hours"
          fill="#3B82F6"
          name="Heures totales"
          radius={[8, 8, 0, 0]}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="avgHours"
          stroke="#10B981"
          strokeWidth={2}
          name="Heures/employé"
          dot={{ fill: "#10B981", r: 4 }}
          activeDot={{ r: 6 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  )
}
