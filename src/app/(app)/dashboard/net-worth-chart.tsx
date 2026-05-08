"use client";

import { useState, useMemo } from "react";
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

const RANGES = [
  { id: "1y", label: "1Y", months: 12 },
  { id: "5y", label: "5Y", months: 60 },
  { id: "all", label: "All", months: null as number | null },
] as const;

type RangeId = (typeof RANGES)[number]["id"];

const DAY_MS = 86_400_000;

export function NetWorthChart({
  snapshots,
  milestones,
}: {
  snapshots: SnapshotPoint[];
  milestones: MilestonePoint[];
}) {
  const [rangeId, setRangeId] = useState<RangeId>("1y");

  const data = useMemo(() => {
    const range = RANGES.find((r) => r.id === rangeId)!;
    const cutoffMs =
      range.months == null
        ? Number.POSITIVE_INFINITY
        : Date.now() + range.months * 30.44 * DAY_MS;

    const map = new Map<
      string,
      { actual: number | null; target: number | null }
    >();
    for (const s of snapshots) {
      map.set(s.date, { actual: s.netWorthCents, target: null });
    }
    for (const m of milestones) {
      if (Date.parse(m.date + "T00:00:00Z") > cutoffMs) continue;
      const existing = map.get(m.date) ?? { actual: null, target: null };
      map.set(m.date, { ...existing, target: m.targetCents });
    }

    return Array.from(map.entries())
      .map(([date, v]) => ({ date, ...v }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [snapshots, milestones, rangeId]);

  // For shorter ranges show "MMM YY" so May/June read distinctly; longer ranges
  // show year-month or just year.
  const tickFormatter = useMemo(() => {
    const range = RANGES.find((r) => r.id === rangeId)!;
    if (range.months != null && range.months <= 12) {
      return (d: string) => {
        const dt = new Date(d + "T00:00:00Z");
        return dt.toLocaleDateString("en-US", {
          month: "short",
          year: "2-digit",
          timeZone: "UTC",
        });
      };
    }
    return (d: string) =>
      typeof d === "string" ? d.slice(0, 7) : String(d);
  }, [rangeId]);

  if (data.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 p-8 text-center text-sm text-zinc-500">
        No data yet. Take a snapshot or add accounts to start tracking.
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-end gap-1 mb-2">
        {RANGES.map((r) => (
          <button
            key={r.id}
            onClick={() => setRangeId(r.id)}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
              rangeId === r.id
                ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                : "border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-900"
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>
      <div className="h-80 w-full">
        <ResponsiveContainer>
          <ComposedChart
            data={data}
            margin={{ top: 10, right: 16, bottom: 0, left: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              className="stroke-zinc-200 dark:stroke-zinc-800"
            />
            <XAxis
              dataKey="date"
              tickFormatter={tickFormatter}
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
              domain={["auto", "auto"]}
            />
            <Tooltip
              formatter={(v) =>
                typeof v === "number" ? fmtFull(v) : String(v ?? "")
              }
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
    </div>
  );
}
