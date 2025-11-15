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
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <defs>
          <linearGradient id="colorMen" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#0088CC" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#0088CC" stopOpacity={0.1} />
          </linearGradient>
          <linearGradient id="colorWomen" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#F8B500" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#F8B500" stopOpacity={0.1} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="#E5E7EB" className="dark:stroke-gray-700" strokeDasharray="3 3" />
        <XAxis
          dataKey="year"
          tick={{ fill: "#666666", fontSize: 12 }}
        />
        <YAxis
          label={{ value: "Effectifs", angle: -90, position: "insideLeft", fill: "#666666" }}
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
        <Area
          type="monotone"
          dataKey="men"
          stackId="1"
          stroke="#0088CC"
          strokeWidth={2.5}
          fill="url(#colorMen)"
          name="Hommes"
        />
        <Area
          type="monotone"
          dataKey="women"
          stackId="1"
          stroke="#F8B500"
          strokeWidth={2.5}
          fill="url(#colorWomen)"
          name="Femmes"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
