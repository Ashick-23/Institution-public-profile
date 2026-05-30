"use client";

import {
  ComposedChart,
  Area,
  Line,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function CountsYearChart({ data }: { data: any[] }) {
  // data should have: year, works_count, cited_by_count
  
  if (!data || data.length === 0) return null;

  return (
    <div className="col-span-1 lg:col-span-2">
      <div className="bg-white border border-slate-200 rounded-sm shadow-sm h-full">
        <div className="px-5 pt-5 pb-3 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h3 className="text-sm font-semibold text-slate-800 tracking-tight">Research Output & Impact Velocity</h3>
            <p className="text-xs text-slate-500 mt-0.5">Annual scholarly works and citation trends since 2000</p>
          </div>
          <div className="flex gap-4 text-xs font-medium">
            <div className="flex items-center gap-1.5 text-slate-600">
              <div className="size-2 rounded-full bg-[#2e6da4]"></div>
              Publications
            </div>
            <div className="flex items-center gap-1.5 text-slate-600">
              <div className="w-3 h-0.5 bg-[#f97316]"></div>
              Citations
            </div>
          </div>
        </div>
        <div className="p-4">
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorWorks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2e6da4" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#2e6da4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 4" vertical={false} stroke="rgba(30,58,95,0.06)" />
                <XAxis
                  dataKey="year"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                  dy={10}
                  interval="preserveStartEnd"
                  minTickGap={20}
                />
                
                {/* Left Y-Axis for Works Count */}
                <YAxis
                  yAxisId="left"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  tickFormatter={(val) => new Intl.NumberFormat("en-US", { notation: "compact" }).format(val)}
                  width={50}
                />
                
                {/* Right Y-Axis for Citations Count */}
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#f97316' }}
                  tickFormatter={(val) => new Intl.NumberFormat("en-US", { notation: "compact" }).format(val)}
                  width={50}
                />
                
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    borderRadius: '4px',
                    border: '1px solid #e2e8f0',
                    color: '#0f172a',
                    fontSize: '11px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  }}
                  itemStyle={{ fontWeight: 500 }}
                  labelStyle={{ fontWeight: 600, color: '#334155', marginBottom: '4px' }}
                  formatter={(value: any, name: any) => [
                    Number(value).toLocaleString(), 
                    name === 'works_count' ? 'Publications' : 'Citations'
                  ]}
                />
                
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="works_count"
                  stroke="#1e3a5f"
                  strokeWidth={2}
                  fill="url(#colorWorks)"
                  activeDot={{ r: 5, fill: '#1e3a5f', stroke: '#fff', strokeWidth: 2 }}
                />
                
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="cited_by_count"
                  stroke="#f97316"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 5, fill: '#f97316', stroke: '#fff', strokeWidth: 2 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
