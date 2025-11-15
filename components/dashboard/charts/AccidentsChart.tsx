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
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid stroke="#E5E7EB" className="dark:stroke-gray-700" strokeDasharray="3 3" />
        <XAxis
          dataKey="year"
          tick={{ fill: "#666666", fontSize: 12 }}
        />
        <YAxis
          yAxisId="left"
          label={{ value: "Nombre", angle: -90, position: "insideLeft", fill: "#666666" }}
          tick={{ fill: "#666666", fontSize: 12 }}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          label={{ value: "Taux de fréquence", angle: 90, position: "insideRight", fill: "#666666" }}
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
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="count"
          stroke="#EF4444"
          strokeWidth={2.5}
          name="Nombre d'accidents"
          dot={{ fill: "#EF4444", r: 4 }}
          activeDot={{ r: 7, fill: "#EF4444", stroke: "#FFFFFF", strokeWidth: 2 }}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="frequency"
          stroke="#F59E0B"
          strokeWidth={2.5}
          name="Taux de fréquence"
          dot={{ fill: "#F59E0B", r: 4 }}
          activeDot={{ r: 7, fill: "#F59E0B", stroke: "#FFFFFF", strokeWidth: 2 }}
          strokeDasharray="5 5"
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
