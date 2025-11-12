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
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" className="dark:stroke-gray-700" />
        <XAxis
          dataKey="year"
          tick={{ fill: "#666666", fontSize: 12 }}
          className="dark:text-gray-400"
        />
        <YAxis
          label={{ value: "Tonnes CO2e", angle: -90, position: "insideLeft", fill: "#666666" }}
          tick={{ fill: "#666666", fontSize: 12 }}
          className="dark:text-gray-400"
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
        <Legend
          wrapperStyle={{ paddingTop: "20px" }}
          iconType="line"
        />
        <Line
          type="monotone"
          dataKey="scope1"
          stroke="#EF4444"
          strokeWidth={2.5}
          name="Scope 1"
          dot={{ fill: "#EF4444", r: 4 }}
          activeDot={{ r: 7, fill: "#EF4444", stroke: "#FFFFFF", strokeWidth: 2 }}
        />
        <Line
          type="monotone"
          dataKey="scope2"
          stroke="#F8B500"
          strokeWidth={2.5}
          name="Scope 2"
          dot={{ fill: "#F8B500", r: 4 }}
          activeDot={{ r: 7, fill: "#F8B500", stroke: "#FFFFFF", strokeWidth: 2 }}
        />
        <Line
          type="monotone"
          dataKey="scope3"
          stroke="#10B981"
          strokeWidth={2.5}
          name="Scope 3"
          dot={{ fill: "#10B981", r: 4 }}
          activeDot={{ r: 7, fill: "#10B981", stroke: "#FFFFFF", strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
