"use client";

import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import type { SnapshotPoint, MilestonePoint } from "@/lib/net-worth";

const fmt = (cents: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(cents / 100);

const fmtFull = (cents: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);

export function NetWorthChart({
  snapshots,
  milestones,
}: {
  snapshots: SnapshotPoint[];
  milestones: MilestonePoint[];
}) {
  // Build a unified series sorted by date. Each row keeps actual + target
  // separately; recharts will draw both lines and skip null gaps.
  const map = new Map<string, { actual: number | null; target: number | null }>();

  for (const s of snapshots) {
    map.set(s.date, { actual: s.netWorthCents, target: null });
  }
  for (const m of milestones) {
    const existing = map.get(m.date) ?? { actual: null, target: null };
    map.set(m.date, { ...existing, target: m.targetCents });
  }

  const data = Array.from(map.entries())
    .map(([date, v]) => ({ date, ...v }))
    .sort((a, b) => a.date.localeCompare(b.date));

  if (data.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 p-8 text-center text-sm text-zinc-500">
        No data yet. Take a snapshot or add accounts to start tracking.
      </div>
    );
  }

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer>
        <ComposedChart data={data} margin={{ top: 10, right: 16, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-200 dark:stroke-zinc-800" />
          <XAxis
            dataKey="date"
            tickFormatter={(d) => (typeof d === "string" ? d.slice(0, 7) : d)}
            tick={{ fontSize: 11 }}
            stroke="currentColor"
            className="text-zinc-500"
          />
          <YAxis
            tickFormatter={(v) => fmt(Number(v))}
            tick={{ fontSize: 11 }}
            stroke="currentColor"
            className="text-zinc-500"
            width={60}
          />
          <Tooltip
            formatter={(v) => (typeof v === "number" ? fmtFull(v) : String(v ?? ""))}
            labelFormatter={(label) => `Date: ${label}`}
            contentStyle={{ fontSize: 12, borderRadius: 8 }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Line
            type="monotone"
            dataKey="target"
            name="Milestone target"
            stroke="#a1a1aa"
            strokeDasharray="5 4"
            dot={{ r: 3 }}
            connectNulls
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="actual"
            name="Actual net worth"
            stroke="#10b981"
            strokeWidth={2}
            dot={{ r: 4 }}
            connectNulls
            isAnimationActive={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
