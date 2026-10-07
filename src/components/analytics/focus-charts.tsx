"use client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { faNumber } from "@/domain/calculations";
import { EmptyState } from "@/components/ui/primitives";

type Weekly = { day: string; date: string; minutes: number }[];
export function WeeklyFocusChart({ data }: { data: Weekly }) {
  return (
    <div className="chart-container" dir="ltr">
      <ResponsiveContainer width="100%" height={260} minWidth={0}>
        <BarChart
          data={data}
          margin={{ top: 15, left: -20, bottom: 0, right: 10 }}
          barSize={30}
        >
          <CartesianGrid
            strokeDasharray="3 5"
            vertical={false}
            stroke="#edf0f5"
          />
          <XAxis
            dataKey="day"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: "#7d879b", fontFamily: "Vazirmatn" }}
            dy={8}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: "#8b95a8" }}
            tickFormatter={(v: number) => faNumber(v)}
          />
          <Tooltip
            cursor={{ fill: "#f4f6fc" }}
            contentStyle={{
              border: "1px solid #e7ebf2",
              borderRadius: 12,
              fontFamily: "Vazirmatn",
              fontSize: 12,
              direction: "rtl",
            }}
            formatter={(value) => [`${faNumber(Number(value))} دقیقه`, "تمرکز"]}
          />
          <Bar dataKey="minutes" radius={[6, 6, 0, 0]}>
            {data.map((item, i) => (
              <Cell
                key={item.date}
                fill={
                  item.minutes === Math.max(...data.map((d) => d.minutes)) &&
                  item.minutes
                    ? "#426bb3"
                    : "#b4c8e9"
                }
                opacity={i % 2 ? 0.85 : 1}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function DistributionChart({
  data,
}: {
  data: { name: string; seconds: number; color: string }[];
}) {
  const total = data.reduce((sum, d) => sum + d.seconds, 0);
  return total ? (
    <div className="donut-wrap">
      <ResponsiveContainer width="100%" height={240} minWidth={0}>
        <PieChart>
          <Pie
            data={data.filter((d) => d.seconds)}
            dataKey="seconds"
            nameKey="name"
            innerRadius={70}
            outerRadius={92}
            paddingAngle={5}
            stroke="none"
            cornerRadius={5}
          >
            {data
              .filter((d) => d.seconds)
              .map((d) => (
                <Cell key={d.name} fill={d.color} />
              ))}
          </Pie>
          <Tooltip
            formatter={(value) => [
              `${faNumber(Math.round(Number(value) / 60))} دقیقه`,
              "تمرکز",
            ]}
            contentStyle={{
              borderRadius: 12,
              border: "1px solid #e7ebf2",
              direction: "rtl",
              fontFamily: "Vazirmatn",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="donut-center">
        <strong>{faNumber(Math.round((total / 3600) * 10) / 10)}</strong>
        <span>ساعت تمرکز</span>
      </div>
    </div>
  ) : (
    <EmptyState
      title="اولین جلسه‌ات را شروع کن"
      description="با ثبت تمرکز، سهم اتاق‌ها اینجا دیده می‌شود."
    />
  );
}
