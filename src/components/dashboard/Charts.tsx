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
  PieChart,
  Pie,
  Cell
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export function GrowthChart({ data }: { data: any[] }) {
  // We expect data to be an array of { year, count }
  return (
    <Card className="col-span-1 lg:col-span-2 bg-white/80 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 backdrop-blur-xl shadow-lg dark:shadow-2xl transition-all duration-300">
      <CardHeader className="pb-2">
        <CardTitle className="text-slate-800 dark:text-slate-100 font-bold text-sm tracking-tight">Research Growth</CardTitle>
        <CardDescription className="text-xs text-slate-500 dark:text-slate-400">Publications output since 2000</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[240px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--chart-growth-fill)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="var(--chart-growth-fill)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--chart-grid)" />
              <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--chart-text)' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'var(--chart-text)' }} />
              <Tooltip
                contentStyle={{ backgroundColor: 'var(--tooltip-bg)', borderRadius: '8px', border: '1px solid var(--tooltip-border)', color: 'var(--tooltip-text)', fontSize: '11px' }}
                itemStyle={{ color: 'var(--chart-growth-stroke)' }}
              />
              <Area type="monotone" dataKey="count" stroke="var(--chart-growth-stroke)" strokeWidth={2.5} fillOpacity={1} fill="url(#colorCount)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function TopicsChart({ data }: { data: any[] }) {
  // data: { name, value }
  const COLORS = [
    "var(--chart-topics-fill)",
    "#3b82f6", // Blue
    "#8b5cf6", // Purple
    "#ec4899", // Pink
    "#f59e0b", // Amber
    "#10b981", // Emerald
    "#6366f1"  // Indigo
  ];

  return (
    <Card className="col-span-1 bg-white/80 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 backdrop-blur-xl shadow-lg dark:shadow-2xl transition-all duration-300 flex flex-col justify-between">
      <CardHeader className="pb-2">
        <CardTitle className="text-slate-800 dark:text-slate-100 font-bold text-sm tracking-tight">Research Strengths</CardTitle>
        <CardDescription className="text-xs text-slate-500 dark:text-slate-400">Primary areas of study</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-center pb-4 pt-0">
        <div className="h-[150px] w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                contentStyle={{ backgroundColor: 'var(--tooltip-bg)', borderRadius: '8px', border: '1px solid var(--tooltip-border)', color: 'var(--tooltip-text)', fontSize: '10px' }}
              />
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={65}
                paddingAngle={3}
                dataKey="value"
              >
                {data.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {/* Compact custom legend for high-density space layout */}
        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 mt-2 w-full text-[10px] text-slate-600 dark:text-slate-400 font-medium">
          {data.slice(0, 6).map((entry: any, index: number) => (
            <div key={entry.name} className="flex items-center gap-1.5 min-w-0">
              <span className="size-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
              <span className="truncate" title={entry.name}>{entry.name}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
