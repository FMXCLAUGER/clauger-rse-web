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
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid stroke="#E5E7EB" className="dark:stroke-gray-700" strokeDasharray="3 3" />
        <XAxis
          dataKey="year"
          tick={{ fill: "#666666", fontSize: 12 }}
        />
        <YAxis
          yAxisId="left"
          label={{ value: "Heures totales", angle: -90, position: "insideLeft", fill: "#666666" }}
          tick={{ fill: "#666666", fontSize: 12 }}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          label={{ value: "Heures/employé", angle: 90, position: "insideRight", fill: "#666666" }}
          tick={{ fill: "#666666", fontSize: 12 }}
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
        />
        <Legend wrapperStyle={{ paddingTop: "20px" }} />
        <Bar
          yAxisId="left"
          dataKey="hours"
          fill="#0088CC"
          name="Heures totales"
          radius={[8, 8, 0, 0]}
          strokeWidth={2.5}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="avgHours"
          stroke="#10B981"
          strokeWidth={2.5}
          name="Heures/employé"
          dot={{ fill: "#10B981", r: 4 }}
          activeDot={{ r: 7, fill: "#10B981", stroke: "#FFFFFF", strokeWidth: 2 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  )
}
