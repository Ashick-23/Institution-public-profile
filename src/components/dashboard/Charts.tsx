"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from "recharts";

// Ashoka University brand palette — Blue-dominant (70% primary rule), Red as accent
const ACADEMIC_COLORS = [
  "#0d3862", // Ashoka Blue – primary
  "#1a5491", // Blue shade 2
  "#2e6da4", // Blue shade 3
  "#4a90c4", // Blue shade 4
  "#6db3d9", // Blue shade 5
  "#c4122f", // Ashoka Red – accent
  "#8b0e21", // Red shade
];

export function GrowthChart({ data }: { data: any[] }) {
  return (
    <div className="col-span-1 lg:col-span-2">
      <div className="bg-white border border-slate-200 rounded-sm shadow-sm h-full">
        <div className="px-5 pt-5 pb-3 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-800 tracking-tight">Publication Output Trend</h3>
          <p className="text-xs text-slate-500 mt-0.5">Annual scholarly works indexed since 2000</p>
        </div>
        <div className="p-4">
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2e6da4" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#2e6da4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 4" vertical={false} stroke="rgba(30,58,95,0.06)" />
                <XAxis
                  dataKey="year"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                  dy={8}
                  interval={4}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                  width={40}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    borderRadius: '4px',
                    border: '1px solid #e2e8f0',
                    color: '#0f172a',
                    fontSize: '11px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  }}
                  itemStyle={{ color: '#1e3a5f' }}
                  labelStyle={{ fontWeight: 600, color: '#334155' }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#1e3a5f"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorCount)"
                  dot={false}
                  activeDot={{ r: 4, fill: '#1e3a5f' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TopicsBarChart({ data }: { data: any[] }) {
  const top = data.slice(0, 6);
  const total = top.reduce((s: number, d: any) => s + d.value, 0);

  return (
    <div className="col-span-1">
      <div className="bg-white border border-slate-200 rounded-sm shadow-sm h-full flex flex-col">
        <div className="px-5 pt-5 pb-3 border-b border-slate-100 shrink-0">
          <h3 className="text-sm font-semibold text-slate-800 tracking-tight">Discipline Distribution</h3>
          <p className="text-xs text-slate-500 mt-0.5">Top research themes by volume</p>
        </div>
        <div className="p-4 flex-1 flex flex-col justify-center space-y-3.5">
          {top.map((item: any, i: number) => {
            const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
            return (
              <div key={item.name}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-semibold text-slate-700 truncate mr-2" title={item.name}>
                    {item.name}
                  </span>
                  <span className="text-[10px] text-slate-500 tabular-nums shrink-0">
                    {item.value.toLocaleString()} <span className="text-slate-400 font-medium">({pct}%)</span>
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%`, backgroundColor: ACADEMIC_COLORS[i % ACADEMIC_COLORS.length] }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function WorksTypeChart({ data }: { data: { name: string; value: number }[] }) {
  const top = data.slice(0, 6);
  const total = top.reduce((s, d) => s + d.value, 0);

  return (
    <div className="bg-white border border-slate-200 rounded-sm shadow-sm">
      <div className="px-5 pt-5 pb-3 border-b border-slate-100">
        <h3 className="text-sm font-semibold text-slate-800 tracking-tight">Output by Type</h3>
        <p className="text-xs text-slate-500 mt-0.5">Breakdown of scholarly document types</p>
      </div>
      <div className="p-4 space-y-2.5">
        {top.map((item, i) => {
          const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
          return (
            <div key={item.name}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs capitalize text-slate-600 font-medium">{item.name}</span>
                <span className="text-xs text-slate-500 tabular-nums">{item.value.toLocaleString()} <span className="text-slate-400">({pct}%)</span></span>
              </div>
              <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, backgroundColor: ACADEMIC_COLORS[i % ACADEMIC_COLORS.length] }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
