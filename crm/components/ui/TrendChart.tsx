"use client";

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import CurvedContainer from "@/crm/components/ui/CurvedContainer";

const INK = "#3f3f50";
const INK_SUBTLE = "#93939f";
const LINE = "#ebebeb";
const BRAND = "#6d28d9";
const BRAND_LIGHT = "#a78bfa";

type Point = {
  bucket: string;
  label: string;
  leads: number;
  quoted: number;
  won: number;
  revenue: number;
  lost: number;
};

function compactPounds(value: number) {
  if (Math.abs(value) >= 1000) {
    return `£${(value / 1000).toFixed(value >= 10_000 ? 0 : 1)}k`;
  }
  return `£${Math.round(value)}`;
}

function pounds(value: number) {
  return `£${value.toLocaleString("en-GB", { maximumFractionDigits: 0 })}`;
}

export default function TrendChart({
  title,
  points,
  emptyMessage = "No activity in this period",
}: {
  title: string;
  points: Point[];
  emptyMessage?: string;
}) {
  const data = points.map((point) => ({
    ...point,
    conversion: point.leads > 0 ? Math.round((point.won / point.leads) * 1000) / 10 : 0,
  }));
  const hasData = data.some(
    (point) => point.leads || point.quoted || point.won || point.revenue || point.lost,
  );

  return (
    <CurvedContainer>
      <div className="border-b border-line px-3 py-3 sm:px-5 sm:py-4">
        <h2 className="text-base font-medium text-ink">{title}</h2>
      </div>
      {!hasData ? (
        <p className="px-5 py-12 text-center text-sm text-ink-subtle">{emptyMessage}</p>
      ) : (
        <div className="h-72 px-2 py-4 sm:px-4">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke={LINE} vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: INK_SUBTLE, fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: LINE }}
                interval="preserveStartEnd"
              />
              <YAxis
                yAxisId="revenue"
                tick={{ fill: INK_SUBTLE, fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={compactPounds}
                width={48}
              />
              <YAxis
                yAxisId="count"
                orientation="right"
                tick={{ fill: INK_SUBTLE, fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                width={36}
                allowDecimals={false}
              />
              <YAxis yAxisId="conversion" domain={[0, 100]} hide />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  const row = payload[0]?.payload as (Point & { conversion: number }) | undefined;
                  if (!row) return null;
                  return (
                    <div className="rounded-xl border border-line bg-surface px-3 py-2 text-xs text-ink shadow-sm">
                      <p className="font-medium">{label}</p>
                      <p className="mt-1 tabular-nums">Revenue {pounds(row.revenue)}</p>
                      <p className="tabular-nums">Leads {row.leads} · Quoted {row.quoted}</p>
                      <p className="tabular-nums">Won {row.won} · Lost {row.lost}</p>
                      <p className="tabular-nums">Conv {row.conversion}%</p>
                    </div>
                  );
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: 12, color: INK }}
                iconType="circle"
                iconSize={8}
              />
              <Bar
                yAxisId="revenue"
                dataKey="revenue"
                name="Revenue"
                fill={BRAND}
                radius={[6, 6, 0, 0]}
                maxBarSize={28}
              />
              <Line
                yAxisId="count"
                type="monotone"
                dataKey="leads"
                name="Leads"
                stroke={BRAND_LIGHT}
                strokeWidth={2}
                dot={false}
              />
              <Line
                yAxisId="conversion"
                type="monotone"
                dataKey="conversion"
                name="Conv %"
                stroke="#059669"
                strokeWidth={2}
                dot={false}
                strokeDasharray="4 4"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
    </CurvedContainer>
  );
}
