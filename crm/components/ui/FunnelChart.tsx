"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
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

type Step = {
  key: string;
  label: string;
  count: number;
  rateFromPrevious: number;
  rateFromStart: number;
  dropOff: number;
};

export default function FunnelChart({
  title,
  steps,
  emptyMessage = "No leads in this period",
}: {
  title: string;
  steps: Step[];
  emptyMessage?: string;
}) {
  const hasData = steps.some((step) => step.count > 0);
  const data = steps.map((step, index) => ({
    ...step,
    rateLabel: index === 0 ? `${step.count}` : `${step.count} · ${step.rateFromPrevious}%`,
  }));

  return (
    <CurvedContainer className="h-full">
      <div className="border-b border-line px-3 py-3 sm:px-5 sm:py-4">
        <h2 className="text-base font-medium text-ink">{title}</h2>
      </div>
      {!hasData ? (
        <p className="px-5 py-12 text-center text-sm text-ink-subtle">{emptyMessage}</p>
      ) : (
        <div className="h-72 px-2 py-4 sm:px-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 4, right: 72, left: 8, bottom: 4 }}>
              <CartesianGrid stroke={LINE} horizontal={false} />
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="label"
                width={112}
                tick={{ fill: INK, fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  border: `1px solid ${LINE}`,
                  borderRadius: 12,
                  fontSize: 12,
                  color: INK,
                }}
                formatter={(value, _name, item) => {
                  const payload = item?.payload as Step | undefined;
                  if (!payload) return [Number(value ?? 0), "Count"];
                  return [
                    `${payload.count} leads · ${payload.rateFromStart}% of created${
                      payload.dropOff > 0 ? ` · ${payload.dropOff} dropped` : ""
                    }`,
                    payload.label,
                  ];
                }}
              />
              <Bar dataKey="count" fill={BRAND} radius={[0, 8, 8, 0]} maxBarSize={28} barSize={28}>
                <LabelList
                  dataKey="rateLabel"
                  position="right"
                  fill={INK_SUBTLE}
                  fontSize={11}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </CurvedContainer>
  );
}
