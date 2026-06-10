import { useState } from "react";
import { useMediaQuery } from "../useMediaQuery";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, RadarChart as RcRadarChart,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar as RcRadar,
} from "recharts";

function Svg({ size = 20, color = "currentColor", children }: { size?: number; color?: string; children: React.ReactNode }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      {children}
    </svg>
  );
}

function IcRun({ size = 20, color = "currentColor" }: { size?: number; color?: string }) {
  return <Svg size={size} color={color}><circle cx="12" cy="5" r="1"/><path d="m9 20 3-7 4 4"/><path d="m6 15 3-7 6-2"/><path d="m2 22 4-2"/><path d="m22 22-4-2"/></Svg>;
}
function IcTactic({ size = 20, color = "currentColor" }: { size?: number; color?: string }) {
  return <Svg size={size} color={color}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></Svg>;
}
function IcCmd({ size = 20, color = "currentColor" }: { size?: number; color?: string }) {
  return <Svg size={size} color={color}><path d="M8 21h8"/><path d="M12 17v4"/><path d="M7 4h10l1 7H6L7 4z"/><path d="M6 11c0 3.31 2.69 6 6 6s6-2.69 6-6"/></Svg>;
}
function IcInstr({ size = 20, color = "currentColor" }: { size?: number; color?: string }) {
  return <Svg size={size} color={color}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></Svg>;
}
function IcPeople({ size = 16 }: { size?: number }) {
  return <Svg size={size}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></Svg>;
}
function IcCity({ size = 16 }: { size?: number }) {
  return <Svg size={size}><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></Svg>;
}
function IcGroup({ size = 16 }: { size?: number }) {
  return <Svg size={size}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></Svg>;
}

function Delta({ value, up }: { value: string; up: boolean }) {
  return (
    <span style={{ display: "flex", alignItems: "center", gap: 2, color: up ? "#10B981" : "#EF4444", fontSize: 13, fontWeight: 600, whiteSpace: "nowrap" }}>
      {value}
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        {up ? <polyline points="18 15 12 9 6 15"/> : <polyline points="6 9 12 15 18 9"/>}
      </svg>
    </span>
  );
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ color: string; value: number }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#1F2937", borderRadius: 10, padding: "8px 12px", boxShadow: "0 6px 20px rgba(0,0,0,.3)", pointerEvents: "none", minWidth: 120, border: "1px solid rgba(255,255,255,.08)" }}>
      <div style={{ fontSize: 11, color: "#9CA3AF", marginBottom: 6, fontWeight: 600 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: i < payload.length - 1 ? 4 : 0 }}>
          <span style={{ width: 10, height: 3, borderRadius: 2, background: p.color, display: "inline-block", flexShrink: 0 }}/>
          <span style={{ fontSize: 12, fontWeight: 800, color: "#fff" }}>{Number(p.value).toFixed(2)}</span>
        </div>
      ))}
    </div>
  );
}

interface ChartSeries { color: string; data: number[]; }

let _rcId = 0;
function AreaChartRC({ series, labels, yMax = 1, yMin = 0, height = 230 }: {
  series: ChartSeries[]; labels: string[]; yMax?: number; yMin?: number; height?: number | string;
}) {
  const [id] = useState(() => ++_rcId);
  const data = labels.map((label, i) => {
    const pt: Record<string, number | string> = { label };
    series.forEach((s, si) => { pt[`s${si}`] = s.data[i]; });
    return pt;
  });
  return (
    <ResponsiveContainer width="100%" height={typeof height === "string" ? 300 : height}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -18, bottom: 0 }}>
        <defs>
          {series.map((s, si) => (
            <linearGradient key={si} id={`rcg${id}s${si}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={s.color} stopOpacity={0.28}/>
              <stop offset="90%" stopColor={s.color} stopOpacity={0}/>
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false}/>
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false}/>
        <YAxis domain={[yMin, yMax]} tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} tickCount={5}/>
        <Tooltip content={<CustomTooltip/>} cursor={{ stroke: "#E5E7EB", strokeWidth: 1, strokeDasharray: "4 3" }}/>
        {series.map((s, si) => (
          <Area key={si} type="monotone" dataKey={`s${si}`}
            stroke={s.color} strokeWidth={2.5}
            fill={`url(#rcg${id}s${si})`}
            dot={false}
            activeDot={{ r: 5, fill: s.color, stroke: "#fff", strokeWidth: 2.5 }}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}

function RadarChartRC({ data }: { data: { label: string; value: number; color: string; max: number }[] }) {
  const chartData = data.map(d => ({ subject: d.label, value: d.value, fullMark: d.max }));
  return (
    <ResponsiveContainer width="100%" height={300}>
      <RcRadarChart data={chartData} cx="50%" cy="50%" outerRadius="68%">
        <PolarGrid stroke="#E5E7EB" strokeWidth={1}/>
        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fill: "#6B7280", fontWeight: 600 }}/>
        <PolarRadiusAxis domain={[0, 5]} tick={false} axisLine={false} tickCount={6}/>
        <RcRadar dataKey="value" stroke="#375DFB" fill="#375DFB" fillOpacity={0.18} strokeWidth={2.5}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          dot={{ r: 5, fill: "#375DFB", stroke: "#fff", strokeWidth: 2.5, fillOpacity: 1 } as any}
        />
      </RcRadarChart>
    </ResponsiveContainer>
  );
}

/* ═══════════════════════════════════════
   BODY MEASUREMENTS CONSTANTS
═══════════════════════════════════════ */
const BODY_PATH = "M170.341 222.972V222.907C169.899 222.08 169.443 221.064 168.957 220.004C168.175 218.135 167.252 216.327 166.197 214.598C164.306 211.695 161.488 209.307 159.003 207.174C158.614 206.885 158.286 206.523 158.037 206.107C157.789 205.691 157.624 205.23 157.554 204.75C156.714 200.091 156.192 194.59 155.634 188.784C155.178 184.067 154.714 179.198 154.026 174.023C153.387 169.673 152.27 165.406 150.693 161.302C149.15 156.875 147.687 152.695 147.607 146.788C147.607 144.48 147.477 137.462 147.455 134.24C147.455 129.755 147.028 127.97 146.252 123.224C145.528 118.87 144.195 109.327 144.18 109.225C144.021 107.97 143.934 106.409 143.84 104.755C143.637 101.025 143.405 96.8082 142.174 93.8038C140.478 89.5421 137.615 85.8468 133.915 83.1431C129.568 80.0298 123.598 78.5131 120.447 77.8817C119.531 77.6945 118.647 77.3743 117.824 76.9311C113.187 74.4274 106.515 72.0833 102.523 70.6827L100.777 70.0804C100.541 69.9857 100.34 69.8209 100.2 69.6082C100.06 69.3954 99.9883 69.1449 99.9947 68.8902V59.1948C104.638 55.6976 107.72 50.5094 108.572 44.7532C109.601 38.3459 110.035 31.857 109.869 25.3696C109.869 9.8467 98.1835 0.412508 86.4325 0.00611175C86.3482 -0.00200331 86.2633 -0.00200331 86.179 0.00611175H84.6213C84.5394 -0.00203725 84.4569 -0.00203725 84.375 0.00611175C72.6312 0.376222 60.9382 9.83944 60.9382 25.4059C60.9793 31.8637 61.4172 38.313 62.2495 44.7169C62.6286 47.5847 63.5834 50.3458 65.0564 52.834C66.5293 55.3222 68.49 57.4859 70.8201 59.1948V68.8975C70.823 69.1505 70.7499 69.3985 70.6104 69.6094C70.4709 69.8204 70.2713 69.9844 70.0376 70.0804L68.2844 70.6972C64.2998 72.0979 57.6274 74.4419 52.9835 76.9456C52.1607 77.3899 51.277 77.7103 50.3609 77.8963C47.2167 78.5276 41.276 80.0734 36.8929 83.1576C33.2173 85.8441 30.3684 89.5101 28.6701 93.7384C27.4385 96.7429 27.2212 100.959 26.9966 104.689C26.9096 106.344 26.8227 107.904 26.6633 109.181C26.6633 109.261 25.3013 118.797 24.5913 123.159C23.8161 127.905 23.4176 129.69 23.3814 134.175C23.3814 137.397 23.2655 144.415 23.2365 146.722C23.1568 152.666 21.6934 156.846 20.143 161.236C18.57 165.342 17.4524 169.608 16.8104 173.958C16.1294 179.132 15.6585 184.002 15.2093 188.719C14.6515 194.525 14.1226 200.04 13.2822 204.685C13.2148 205.165 13.0518 205.627 12.8029 206.044C12.5541 206.46 12.2243 206.822 11.8333 207.108C9.34834 209.242 6.53012 211.659 4.64648 214.532C3.5888 216.262 2.66366 218.069 1.879 219.939C1.3936 221.006 0.937166 222.022 0.502481 222.842V222.907V222.965C0.147488 223.8 -0.330658 224.939 0.328614 225.97C0.604042 226.319 0.960622 226.595 1.36724 226.775C1.77386 226.955 2.21817 227.032 2.66143 227H2.75561C3.55189 226.965 4.33128 226.758 5.04117 226.395C5.75107 226.032 6.37493 225.521 6.87063 224.895L6.34175 226.347C5.53034 228.524 4.0669 232.472 3.28446 234.576C3.00916 235.302 2.82081 235.839 2.77734 235.941V235.999V236.064C2.46373 237.113 2.57028 238.242 3.07438 239.214C3.25319 239.537 3.49454 239.822 3.78435 240.051C4.07417 240.281 4.40664 240.45 4.7624 240.549C5.0627 240.629 5.37184 240.67 5.6825 240.672C6.1549 240.669 6.62106 240.564 7.04967 240.365C7.47827 240.166 7.8594 239.877 8.16744 239.519C8.10948 239.809 8.06601 240.026 8.05152 240.172C7.77622 243.074 9.20343 243.974 10.4423 244.236C10.7089 244.293 10.9809 244.322 11.2537 244.323C11.9859 244.328 12.6996 244.092 13.2838 243.649C13.868 243.207 14.2903 242.584 14.4849 241.877C14.4849 241.79 14.5646 241.623 14.6298 241.384C14.8352 241.975 15.22 242.488 15.7305 242.849C16.241 243.211 16.8516 243.404 17.477 243.401C18.2741 243.367 19.0379 243.071 19.6497 242.558C20.2614 242.045 20.687 241.344 20.8602 240.564C20.9617 240.208 21.0631 239.838 21.1645 239.46C21.3806 239.923 21.7203 240.318 22.1461 240.599C22.5718 240.881 23.067 241.04 23.577 241.057H23.7799C24.6173 241.027 25.414 240.688 26.0171 240.105C26.6202 239.523 26.987 238.737 27.0472 237.9C27.1632 237.029 29.0106 226.536 29.88 223.11C30.2603 221.547 30.5314 219.958 30.6914 218.357C30.836 216.711 30.8819 215.059 30.829 213.408C30.7566 211.862 30.6117 208.647 31.0101 206.876C31.8868 202.899 33.908 198.066 35.9728 192.943C39.1315 185.228 42.7177 176.484 43.1089 168.893C43.1089 168.537 43.1089 168.167 43.1668 167.724C43.6096 157.927 44.9482 148.191 47.1659 138.638C48.1216 134.65 48.7587 130.593 49.0713 126.504C49.1486 126.79 49.1828 127.086 49.1727 127.382C49.1727 130.931 50.6724 137.027 51.991 142.412C52.8531 145.91 53.6645 149.212 53.7442 150.612C53.947 154.081 54.0485 158.82 54.1499 163.406C54.2078 165.896 54.2586 168.247 54.3238 170.395C54.5991 179.205 52.7444 190.41 51.6359 197.101C51.4258 198.4 51.2375 199.503 51.1143 200.359C49.4843 211.209 47.5861 227.798 49.8827 246.616C51.7736 270.259 55.4105 283.104 57.5766 290.34C58.4533 293.243 59.0836 295.354 59.1705 296.871C59.3235 298.64 59.3016 300.419 59.1053 302.183C58.9894 302.909 58.8228 303.918 58.6271 305.086C57.9027 309.68 56.7218 316.618 56.6566 319.52C56.4392 329.506 58.0041 337.968 59.8153 346.081C60.5398 349.478 61.3584 352.99 62.0756 357.01C62.1843 357.584 62.4886 358.701 62.9595 360.392C64.4084 365.741 68.3424 379.95 66.437 383.782C64.7496 387.057 62.6721 390.115 60.25 392.889C58.0041 395.611 56.2291 397.752 56.3233 400.604C56.403 403.253 59.6704 404.348 69.7623 405.132C71.0229 405.226 72.2835 405.256 73.5006 405.277C74.7178 405.299 75.8769 405.328 76.8912 405.422H77.1954C78.2749 405.524 79.4993 405.64 80.6077 405.64C81.5636 405.682 82.5183 405.536 83.4187 405.212H83.4766C84.2148 404.957 84.8842 404.535 85.4327 403.978C85.9921 404.551 86.6766 404.986 87.4323 405.248L87.5409 405.292C88.4365 405.615 89.3864 405.76 90.3374 405.72C91.4242 405.72 92.634 405.604 93.6918 405.509L94.0322 405.473C95.0465 405.379 96.2057 405.357 97.4228 405.328C98.6399 405.299 99.8933 405.277 101.154 405.183C111.253 404.399 114.52 403.303 114.6 400.655C114.687 397.802 112.919 395.662 110.673 392.94C108.251 390.166 106.174 387.108 104.486 383.833C102.574 380.001 106.493 365.792 107.964 360.443C108.428 358.752 108.739 357.635 108.841 357.061C109.565 353.041 110.347 349.528 111.108 346.132C112.919 338.019 114.484 329.557 114.267 319.571C114.202 316.668 113.05 309.731 112.289 305.137C112.093 303.961 111.927 302.96 111.818 302.234C111.619 300.47 111.594 298.691 111.746 296.922C111.84 295.391 112.47 293.293 113.34 290.391C115.513 283.133 119.135 270.31 121.041 246.667C123.337 227.849 121.439 211.259 119.809 200.41C119.679 199.554 119.498 198.451 119.287 197.152C118.179 190.461 116.324 179.256 116.592 170.446C116.665 168.269 116.716 165.946 116.766 163.457C116.875 158.871 116.976 154.132 117.179 150.663C117.259 149.211 118.092 145.837 118.969 142.23C120.273 136.867 121.751 130.793 121.751 127.433C121.739 127.143 121.769 126.852 121.838 126.569C122.158 130.653 122.8 134.706 123.757 138.689C125.968 148.243 127.306 157.978 127.757 167.775C127.757 168.203 127.793 168.588 127.815 168.943C128.199 176.534 131.785 185.279 134.951 192.993C137.052 198.117 139.029 202.95 139.913 206.927C140.312 208.712 140.167 211.927 140.094 213.458C140.034 215.109 140.08 216.763 140.232 218.408C140.392 220.009 140.663 221.597 141.043 223.161C141.913 226.579 143.76 237.08 143.876 237.951C143.935 238.787 144.3 239.573 144.902 240.156C145.504 240.738 146.3 241.078 147.136 241.108H147.339C147.85 241.092 148.345 240.934 148.771 240.652C149.198 240.37 149.537 239.975 149.752 239.511C149.853 239.889 149.954 240.237 150.056 240.614C150.229 241.395 150.655 242.096 151.266 242.609C151.878 243.122 152.642 243.418 153.439 243.452C153.631 243.453 153.823 243.436 154.012 243.401C154.531 243.302 155.015 243.069 155.415 242.724C155.816 242.378 156.119 241.934 156.294 241.434C156.359 241.674 156.41 241.841 156.439 241.928C156.631 242.636 157.053 243.261 157.637 243.703C158.222 244.146 158.937 244.382 159.67 244.373C159.94 244.373 160.21 244.344 160.474 244.286C161.72 244.025 163.147 243.103 162.865 240.222C162.865 240.077 162.828 239.86 162.756 239.569C163.064 239.928 163.445 240.217 163.873 240.416C164.302 240.615 164.768 240.72 165.241 240.723C165.549 240.721 165.856 240.68 166.154 240.6C166.511 240.501 166.845 240.333 167.136 240.103C167.427 239.874 167.669 239.589 167.849 239.264C168.346 238.291 168.452 237.164 168.146 236.115V236.05V235.992C168.11 235.89 167.921 235.375 167.639 234.627C166.864 232.523 165.4 228.568 164.582 226.398L164.053 224.946C164.549 225.57 165.174 226.081 165.883 226.444C166.593 226.807 167.372 227.014 168.168 227.051H168.262C168.705 227.083 169.15 227.005 169.556 226.826C169.963 226.646 170.319 226.37 170.595 226.02C171.261 224.99 170.776 223.843 170.428 223.016L170.341 222.972Z";

const DOT_COLORS: Record<string, string> = {
  "Шея": "#10B981", "Грудная клетка": "#06B6D4", "Бицепс": "#A78BFA",
  "Талия": "#F59E0B", "Таз": "#EF4444", "Бедро": "#F97316",
  "Голень": "#9CA3AF", "Лодыжка": "#375DFB",
};
const DOT_CY: Record<string, number> = {
  "Шея": 75, "Грудная клетка": 135, "Бицепс": 175, "Талия": 210,
  "Таз": 258, "Бедро": 308, "Голень": 360, "Лодыжка": 396,
};
const DOT_CX: Record<string, number> = {
  "Шея": 85, "Грудная клетка": 60, "Бицепс": 42, "Талия": 85,
  "Таз": 85, "Бедро": 68, "Голень": 70, "Лодыжка": 72,
};
const MEASURE_KEYS = ["Шея", "Грудная клетка", "Бицепс", "Талия", "Таз", "Бедро", "Голень", "Лодыжка"] as const;
type MeasureKey = typeof MEASURE_KEYS[number];

const HIST_SERIES_COLORS = {
  "Вес": "#375DFB",
  "Талия": "#F59E0B",
  "Грудная клетка": "#06B6D4",
} as const;

function TrendBadge({ delta }: { delta: number }) {
  if (delta === 0) return (
    <span style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 600, background: "#F3F4F6", borderRadius: 6, padding: "2px 5px" }}>—</span>
  );
  const up = delta > 0;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 2, fontSize: 11, fontWeight: 700, color: up ? "#10B981" : "#EF4444", background: up ? "#ECFDF5" : "#FEF2F2", borderRadius: 6, padding: "2px 5px" }}>
      {up ? `+${delta}` : delta}
      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        {up ? <polyline points="18 15 12 9 6 15"/> : <polyline points="6 9 12 15 18 9"/>}
      </svg>
    </span>
  );
}

export interface Entry {
  date: string;
  weight: number;
  values: Record<MeasureKey, number>;
}

const INIT_ENTRIES: Entry[] = [
  { date: "12.01.2024", weight: 92.0, values: { "Шея": 34, "Грудная клетка": 98, "Бицепс": 36, "Талия": 74, "Таз": 78, "Бедро": 64, "Голень": 38, "Лодыжка": 21 } },
  { date: "01.02.2024", weight: 90.5, values: { "Шея": 34, "Грудная клетка": 96, "Бицепс": 35, "Талия": 72, "Таз": 76, "Бедро": 63, "Голень": 37, "Лодыжка": 20 } },
  { date: "01.03.2024", weight: 88.0, values: { "Шея": 33, "Грудная клетка": 93, "Бицепс": 34, "Талия": 70, "Таз": 73, "Бедро": 62, "Голень": 36, "Лодыжка": 20 } },
  { date: "01.04.2024", weight: 85.2, values: { "Шея": 33, "Грудная клетка": 90, "Бицепс": 33, "Талия": 66, "Таз": 70, "Бедро": 60, "Голень": 35, "Лодыжка": 19 } },
];

/* ─── Input helper ─── */
function MeasureInput({ label, value, unit, color, onChange }: {
  label: string; value: string; unit: string; color: string; onChange: (v: string) => void;
}) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 11, fontWeight: 600, color, marginBottom: 4 }}>{label}</label>
      <div style={{ position: "relative" }}>
        <input
          type="number"
          value={value}
          onChange={e => onChange(e.target.value)}
          style={{ width: "100%", padding: "9px 28px 9px 10px", border: `1.5px solid ${color}33`, borderRadius: 8, fontSize: 14, fontWeight: 600, color: "#111", outline: "none", boxSizing: "border-box", background: `${color}08`, transition: "border .15s" }}
          onFocus={e => (e.target.style.borderColor = color)}
          onBlur={e => (e.target.style.borderColor = `${color}33`)}
        />
        <span style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", fontSize: 11, color: "#9CA3AF" }}>{unit}</span>
      </div>
    </div>
  );
}

/* ─── Edit form ─── */
function MeasurementsEditForm({ entries, onAdd }: { entries: Entry[]; onAdd: (e: Entry) => void }) {
  const latest = entries[entries.length - 1];
  const [weight, setWeight] = useState(String(latest.weight));
  const [vals, setVals] = useState<Record<MeasureKey, string>>(
    MEASURE_KEYS.reduce((acc, k) => ({ ...acc, [k]: String(latest.values[k]) }), {} as Record<MeasureKey, string>)
  );
  const [saved, setSaved] = useState(false);
  const today = new Date().toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" });
  const handleSave = () => {
    const w = parseFloat(weight.replace(",", "."));
    if (isNaN(w) || w <= 0) return;
    const values = MEASURE_KEYS.reduce((acc, k) => {
      acc[k] = parseInt(vals[k]) || latest.values[k];
      return acc;
    }, {} as Record<MeasureKey, number>);
    onAdd({ date: today, weight: w, values });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#111", marginBottom: 2 }}>Новый замер</div>
          <div style={{ fontSize: 12, color: "#9CA3AF" }}>Заполните значения и нажмите «Сохранить» — данные добавятся в историю</div>
        </div>
        <span style={{ fontSize: 12, background: "#EBF1FF", color: "#375DFB", borderRadius: 8, padding: "4px 10px", fontWeight: 600 }}>{today}</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 20 }}>
        <MeasureInput label="Вес" value={weight} unit="кг" color="#375DFB" onChange={setWeight} />
        {MEASURE_KEYS.map(k => (
          <MeasureInput key={k} label={k} value={vals[k]} unit="см" color={DOT_COLORS[k]} onChange={v => setVals(p => ({ ...p, [k]: v }))} />
        ))}
      </div>
      <button
        onClick={handleSave}
        style={{ padding: "11px 28px", background: saved ? "#10B981" : "#375DFB", border: "none", borderRadius: 12, color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", transition: "background .2s", display: "flex", alignItems: "center", gap: 8, marginBottom: 28 }}
        onMouseEnter={e => { if (!saved) e.currentTarget.style.opacity = ".85"; }}
        onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}
      >
        {saved ? (
          <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>Замер сохранён</>
        ) : (
          <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>Сохранить замер</>
        )}
      </button>
      <div style={{ borderTop: "1px solid #F0F0F0", paddingTop: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#374151", marginBottom: 12 }}>История замеров ({entries.length})</div>
        <div style={{ border: "1px solid #F0F0F0", borderRadius: 10, overflow: "hidden" }}>
          <div style={{ display: "flex", background: "#F9FAFB", borderBottom: "1px solid #F0F0F0" }}>
            <div style={{ width: 96, flexShrink: 0, padding: "7px 12px", fontSize: 10, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase" as const }}>Дата</div>
            <div style={{ width: 52, flexShrink: 0, padding: "7px 6px", fontSize: 10, fontWeight: 700, color: "#375DFB", textAlign: "center" as const }}>Вес</div>
            {MEASURE_KEYS.map(k => (
              <div key={k} style={{ flex: 1, minWidth: 0, padding: "7px 4px", fontSize: 10, fontWeight: 700, color: DOT_COLORS[k], textAlign: "center" as const, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }} title={k}>
                {k.length > 4 ? k.slice(0, 4) + "…" : k}
              </div>
            ))}
          </div>
          {[...entries].reverse().map((e, ri) => (
            <div key={e.date + ri} style={{ display: "flex", borderBottom: ri < entries.length - 1 ? "1px solid #F5F5F7" : "none", background: ri === 0 ? "#FAFFFE" : "#fff" }} onMouseEnter={ev => (ev.currentTarget.style.background = "#F8FAFF")} onMouseLeave={ev => (ev.currentTarget.style.background = ri === 0 ? "#FAFFFE" : "#fff")}>
              <div style={{ width: 96, flexShrink: 0, padding: "8px 12px", display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ fontSize: 12, fontWeight: ri === 0 ? 600 : 400, color: ri === 0 ? "#375DFB" : "#374151" }}>{e.date.slice(0, 5)}</span>
                {ri === 0 && <span style={{ fontSize: 9, background: "#EBF1FF", color: "#375DFB", borderRadius: 4, padding: "1px 4px", fontWeight: 600 }}>ТЕК</span>}
              </div>
              <div style={{ width: 52, flexShrink: 0, padding: "8px 6px", textAlign: "center" as const, fontSize: 12, fontWeight: 600, color: "#111", display: "flex", alignItems: "center", justifyContent: "center" }}>{e.weight}</div>
              {MEASURE_KEYS.map(k => (
                <div key={k} style={{ flex: 1, minWidth: 0, padding: "8px 4px", textAlign: "center" as const, fontSize: 12, color: "#374151", display: "flex", alignItems: "center", justifyContent: "center" }}>{e.values[k]}</div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   COMPACT READ-ONLY VIEW
═══════════════════════════════════════ */
function MeasurementsCompact({ entries }: { entries: Entry[] }) {
  const latest = entries[entries.length - 1];
  const prev = entries[entries.length - 2];
  const r1 = (v: number) => Math.round(v * 10) / 10;
  const TOP_STATS = [
    { label: "Вес",    value: `${latest.weight}`,                    unit: "кг", color: "#375DFB", bg: "#EBF1FF", delta: r1(latest.weight - (prev?.weight ?? latest.weight)) },
    { label: "Талия",  value: `${latest.values["Талия"]}`,            unit: "см", color: "#F59E0B", bg: "#FFFBEB", delta: r1(latest.values["Талия"] - (prev?.values["Талия"] ?? latest.values["Талия"])) },
    { label: "Грудь",  value: `${latest.values["Грудная клетка"]}`,   unit: "см", color: "#06B6D4", bg: "#ECFEFF", delta: r1(latest.values["Грудная клетка"] - (prev?.values["Грудная клетка"] ?? latest.values["Грудная клетка"])) },
    { label: "Бицепс", value: `${latest.values["Бицепс"]}`,           unit: "см", color: "#A78BFA", bg: "#F5F3FF", delta: r1(latest.values["Бицепс"] - (prev?.values["Бицепс"] ?? latest.values["Бицепс"])) },
  ];
  const scale = 0.72;
  const W = 171; const H = 406;
  const svgW = Math.round(W * scale);
  const svgH = Math.round(H * scale);
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <span style={{ fontSize: 12, color: "#9CA3AF" }}>Последнее измерение:</span>
        <span style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>{latest.date}</span>
        <span style={{ fontSize: 10, background: "#ECFDF5", color: "#10B981", fontWeight: 600, borderRadius: 6, padding: "2px 7px", border: "1px solid #BBF7D0" }}>Актуально</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 16 }}>
        {TOP_STATS.map(s => (
          <div key={s.label} style={{ background: s.bg, borderRadius: 12, padding: "10px 12px", border: `1px solid ${s.color}22`, textAlign: "center" }}>
            <div style={{ fontSize: 10, color: "#9CA3AF", marginBottom: 3, fontWeight: 600 }}>{s.label}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: s.color, lineHeight: 1.1 }}>{s.value}</div>
            <div style={{ fontSize: 10, color: "#9CA3AF" }}>{s.unit}</div>
            <div style={{ marginTop: 4 }}><TrendBadge delta={s.delta}/></div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 16, alignItems: "center", justifyContent: "center" }}>
        <div style={{ flexShrink: 0 }}>
          <svg viewBox={`0 0 ${W} ${H}`} width={svgW} height={svgH} style={{ display: "block" }}>
            <path fill="#E5E7EB" d={BODY_PATH}/>
            {MEASURE_KEYS.map((k, i) => {
              const rowCy = (i + 0.5) * (H / MEASURE_KEYS.length);
              return <line key={k} x1={DOT_CX[k] + 8} y1={DOT_CY[k]} x2={W - 2} y2={rowCy} stroke={DOT_COLORS[k]} strokeWidth="1.5" strokeOpacity="0.5"/>;
            })}
            {MEASURE_KEYS.map(k => (
              <circle key={k} cx={DOT_CX[k]} cy={DOT_CY[k]} r="5.5" fill={DOT_COLORS[k]} stroke="#fff" strokeWidth="2"/>
            ))}
          </svg>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          {MEASURE_KEYS.map((k, i) => {
            const cur = latest.values[k];
            const prv = prev?.values[k] ?? cur;
            const delta = cur - prv;
            return (
              <div key={k} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: "#fff", border: "1px solid #F0F0F0", borderRadius: 8, marginBottom: i < MEASURE_KEYS.length - 1 ? 2 : 0 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: DOT_COLORS[k], display: "inline-block", flexShrink: 0 }}/>
                <span style={{ flex: 1, fontSize: 13, color: "#374151", fontWeight: 500 }}>{k}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#111" }}>{cur} см</span>
                <TrendBadge delta={delta}/>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   HISTORY CHART — вынесен из BodyMeasures
   Показывается на вкладке "История замеров"
═══════════════════════════════════════ */
function MeasurementsHistoryChart({ entries }: { entries: Entry[] }) {
  const [histChart, setHistChart] = useState<"Вес" | "Талия" | "Грудная клетка">("Вес");
  const HIST_LABELS = entries.slice(-6).map(e => e.date.slice(0, 5));
  const HIST_SERIES_MAP: Record<string, ChartSeries[]> = {
    "Вес": [{ color: "#375DFB", data: entries.slice(-6).map(e => e.weight) }],
    "Талия": [{ color: "#F59E0B", data: entries.slice(-6).map(e => e.values["Талия"]) }],
    "Грудная клетка": [{ color: "#06B6D4", data: entries.slice(-6).map(e => e.values["Грудная клетка"]) }],
  };
  const histSeries = HIST_SERIES_MAP[histChart];
  const histMin = Math.min(...histSeries.flatMap(s => s.data)) - 3;
  const histMax = Math.max(...histSeries.flatMap(s => s.data)) + 3;
  return (
    <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 14, overflow: "hidden" }}>
      <div style={{ padding: "14px 20px 12px", borderBottom: "1px solid #F0F0F0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <span style={{ fontSize: 14, fontWeight: 700, color: "#111" }}>История замеров</span>
          <span style={{ fontSize: 12, color: "#9CA3AF", marginLeft: 8 }}>{entries.length} записей</span>
        </div>
        <div style={{ display: "flex", gap: 5 }}>
          {(["Вес", "Талия", "Грудная клетка"] as const).map(m => (
            <button key={m} onClick={() => setHistChart(m)} style={{ padding: "4px 10px", borderRadius: 16, border: "1px solid", cursor: "pointer", fontSize: 12, fontWeight: histChart === m ? 700 : 400, background: histChart === m ? HIST_SERIES_COLORS[m] : "#fff", borderColor: histChart === m ? HIST_SERIES_COLORS[m] : "#E5E7EB", color: histChart === m ? "#fff" : "#6B7280", transition: "all .15s" }}>{m}</button>
          ))}
        </div>
      </div>
      {(() => {
        const vals = entries.map(e => histChart === "Вес" ? e.weight : e.values[histChart as MeasureKey]);
        const mn = Math.min(...vals), mx = Math.max(...vals);
        const chg = vals[vals.length - 1] - vals[0];
        const unit = histChart === "Вес" ? "кг" : "см";
        return (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", borderBottom: "1px solid #F0F0F0" }}>
            {[
              { l: "Мин", v: `${mn} ${unit}`, c: "#10B981" },
              { l: "Макс", v: `${mx} ${unit}`, c: "#EF4444" },
              { l: "Сейчас", v: `${vals[vals.length - 1]} ${unit}`, c: HIST_SERIES_COLORS[histChart] },
              { l: "Изменение", v: `${chg > 0 ? "+" : ""}${chg.toFixed(1)} ${unit}`, c: chg < 0 ? "#10B981" : chg > 0 ? "#EF4444" : "#9CA3AF" },
            ].map((s, i) => (
              <div key={s.l} style={{ padding: "10px 16px", borderRight: i < 3 ? "1px solid #F0F0F0" : "none", textAlign: "center" }}>
                <div style={{ fontSize: 10, color: "#9CA3AF", marginBottom: 3 }}>{s.l}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: s.c }}>{s.v}</div>
              </div>
            ))}
          </div>
        );
      })()}
      <div style={{ padding: "16px 20px 4px" }}>
        <AreaChartRC series={histSeries} labels={HIST_LABELS} yMax={histMax} yMin={histMin} height={180}/>
      </div>
      <div style={{ margin: "0 20px 16px", border: "1px solid #F0F0F0", borderRadius: 10, overflow: "hidden" }}>
        <div style={{ display: "flex", background: "#F9FAFB", borderBottom: "1px solid #F0F0F0" }}>
          <div style={{ width: 96, flexShrink: 0, padding: "7px 12px", fontSize: 10, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase" as const }}>Дата</div>
          <div style={{ width: 48, flexShrink: 0, padding: "7px 6px", fontSize: 10, fontWeight: 700, color: "#375DFB", textAlign: "center" as const }}>Вес</div>
          {MEASURE_KEYS.map(k => (
            <div key={k} style={{ flex: 1, minWidth: 0, padding: "7px 4px", fontSize: 10, fontWeight: 700, color: DOT_COLORS[k], textAlign: "center" as const, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }} title={k}>
              {k.length > 4 ? k.slice(0, 4) + "…" : k}
            </div>
          ))}
        </div>
        {[...entries].reverse().map((e, ri) => (
          <div key={e.date + ri} style={{ display: "flex", borderBottom: ri < entries.length - 1 ? "1px solid #F5F5F7" : "none", background: ri === 0 ? "#FAFFFE" : "#fff" }} onMouseEnter={ev => (ev.currentTarget.style.background = "#F8FAFF")} onMouseLeave={ev => (ev.currentTarget.style.background = ri === 0 ? "#FAFFFE" : "#fff")}>
            <div style={{ width: 96, flexShrink: 0, padding: "8px 12px", display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ fontSize: 12, fontWeight: ri === 0 ? 600 : 400, color: ri === 0 ? "#375DFB" : "#374151" }}>{e.date.slice(0, 5)}</span>
              {ri === 0 && <span style={{ fontSize: 9, background: "#EBF1FF", color: "#375DFB", borderRadius: 4, padding: "1px 4px", fontWeight: 600, flexShrink: 0 }}>ТЕК</span>}
            </div>
            <div style={{ width: 48, flexShrink: 0, padding: "8px 6px", textAlign: "center" as const, fontSize: 12, fontWeight: 600, color: "#111", display: "flex", alignItems: "center", justifyContent: "center" }}>{e.weight}</div>
            {MEASURE_KEYS.map(k => {
              const nextEntry = entries[entries.length - 1 - ri + 1];
              const nv = nextEntry?.values[k];
              const cv = e.values[k];
              const diff = nv != null ? cv - nv : 0;
              return (
                <div key={k} style={{ flex: 1, minWidth: 0, padding: "8px 4px", textAlign: "center" as const, fontSize: 12, color: "#374151", display: "flex", alignItems: "center", justifyContent: "center", gap: 2 }}>
                  {cv}
                  {diff !== 0 && ri < entries.length - 1 && (
                    <span style={{ fontSize: 9, color: diff < 0 ? "#10B981" : "#EF4444", fontWeight: 700 }}>{diff < 0 ? diff : `+${diff}`}</span>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   FULL BODY MEASURES (read-only — "Смотреть историю")
   Нижний график (история) убран отсюда → в MeasurementsHistoryChart
═══════════════════════════════════════ */
function BodyMeasures({ entries }: { entries: Entry[] }) {
  const latest = entries[entries.length - 1];
  const prev = entries[entries.length - 2];
  const first = entries[0];
  const W = 171; const H = 406;
  const scale = 0.88;
  const svgW = Math.round(W * scale);
  const svgH = Math.round(H * scale);
  const ROW_H = Math.round(svgH / MEASURE_KEYS.length);

  const TOP_STATS = [
    { label: "Вес", value: `${latest.weight} кг`, delta: latest.weight < (prev?.weight ?? latest.weight) ? -1 : latest.weight > (prev?.weight ?? latest.weight) ? 1 : 0, color: "#375DFB", bg: "#EBF1FF", prev: `${prev?.weight ?? "—"} кг` },
    { label: "Талия", value: `${latest.values["Талия"]} см`, delta: latest.values["Талия"] < (prev?.values["Талия"] ?? latest.values["Талия"]) ? -1 : 1, color: "#F59E0B", bg: "#FFFBEB", prev: `${prev?.values["Талия"] ?? "—"} см` },
    { label: "Грудная", value: `${latest.values["Грудная клетка"]} см`, delta: latest.values["Грудная клетка"] < (prev?.values["Грудная клетка"] ?? latest.values["Грудная клетка"]) ? -1 : 1, color: "#06B6D4", bg: "#ECFEFF", prev: `${prev?.values["Грудная клетка"] ?? "—"} см` },
    { label: "Бицепс", value: `${latest.values["Бицепс"]} см`, delta: latest.values["Бицепс"] > (prev?.values["Бицепс"] ?? latest.values["Бицепс"]) ? 1 : -1, color: "#A78BFA", bg: "#F5F3FF", prev: `${prev?.values["Бицепс"] ?? "—"} см` },
  ];

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <span style={{ fontSize: 13, color: "#9CA3AF" }}>Последнее:</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>{latest.date}</span>
        <span style={{ fontSize: 10, background: "#ECFDF5", color: "#10B981", fontWeight: 600, borderRadius: 6, padding: "2px 7px", border: "1px solid #BBF7D0" }}>Актуально</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 20 }}>
        {TOP_STATS.map(s => (
          <div key={s.label} style={{ background: s.bg, borderRadius: 12, padding: "12px 14px", border: `1px solid ${s.color}22` }}>
            <div style={{ fontSize: 11, color: "#9CA3AF", marginBottom: 3 }}>{s.label}</div>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
              <span style={{ fontSize: 20, fontWeight: 800, color: s.color, lineHeight: 1.1 }}>{s.value}</span>
              <TrendBadge delta={s.delta}/>
            </div>
            <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 3 }}>Было: {s.prev}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 14, alignItems: "flex-start", justifyContent: "center" }}>
        <div style={{ width: 190, flexShrink: 0, display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, overflow: "hidden" }}>
            <div style={{ padding: "9px 14px 7px", borderBottom: "1px solid #F0F0F0", background: "#FAFAFA" }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase" as const, letterSpacing: ".4px" }}>Параметры</span>
            </div>
            {([["Возраст", "29 лет"], ["Пол", "♂ Мужской"], ["Рост", "180 см"]] as [string, string][]).map(([l, v], i) => (
              <div key={l} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 14px", borderBottom: i < 2 ? "1px solid #F5F5F7" : "none" }}>
                <span style={{ fontSize: 13, color: "#374151" }}>{l}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#111" }}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, padding: "12px 14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>Цель по весу</span>
              <span style={{ fontSize: 11, color: "#375DFB", fontWeight: 700, background: "#EBF1FF", padding: "2px 7px", borderRadius: 6 }}>−{(latest.weight - 80).toFixed(1)} кг</span>
            </div>
            <div style={{ height: 7, background: "#F0F0F0", borderRadius: 4, overflow: "hidden", marginBottom: 6 }}>
              <div style={{ width: `${Math.max(0, Math.min(100, ((first.weight - latest.weight) / (first.weight - 80)) * 100)).toFixed(0)}%`, height: "100%", background: "linear-gradient(90deg,#375DFB,#60A5FA)", borderRadius: 4, transition: "width .6s ease" }}/>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#9CA3AF" }}>
              <span>Сейчас: <strong style={{ color: "#374151" }}>{latest.weight} кг</strong></span>
              <span>Цель: <strong style={{ color: "#374151" }}>80 кг</strong></span>
            </div>
          </div>
          <div style={{ background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: 12, padding: "10px 14px" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase" as const, letterSpacing: ".4px", marginBottom: 6 }}>Прогресс</div>
            {[["Замеров", String(entries.length)], ["Похудел", `${(first.weight - latest.weight).toFixed(1)} кг`], ["Первый замер", first.date]].map(([l, v]) => (
              <div key={l} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 3 }}>
                <span style={{ color: "#9CA3AF" }}>{l}</span>
                <span style={{ color: "#374151", fontWeight: 600 }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ flexShrink: 0 }}>
          <svg viewBox={`0 0 ${W} ${H}`} width={svgW} height={svgH} style={{ display: "block" }}>
            <path fill="#E5E7EB" d={BODY_PATH}/>
            {MEASURE_KEYS.map((k, i) => {
              const rowCy = (i + 0.5) * (H / MEASURE_KEYS.length);
              return <line key={k} x1={DOT_CX[k] + 8} y1={DOT_CY[k]} x2={W - 2} y2={rowCy} stroke={DOT_COLORS[k]} strokeWidth="1.5" strokeOpacity="0.5"/>;
            })}
            {MEASURE_KEYS.map(k => (
              <circle key={k} cx={DOT_CX[k]} cy={DOT_CY[k]} r="5.5" fill={DOT_COLORS[k]} stroke="#fff" strokeWidth="2"/>
            ))}
          </svg>
        </div>
        <div style={{ width: 280, flexShrink: 0, background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, overflow: "hidden" }}>
          <div style={{ padding: "9px 14px 8px", borderBottom: "1px solid #F0F0F0", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#FAFAFA" }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase" as const, letterSpacing: ".4px" }}>Обхваты тела</span>
            <span style={{ fontSize: 10, color: "#9CA3AF" }}>Текущий · Δ · Пред.</span>
          </div>
          {MEASURE_KEYS.map((k, i) => {
            const cur = latest.values[k];
            const prv = prev?.values[k] ?? cur;
            const delta = cur - prv;
            return (
              <div key={k} style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 14px", height: ROW_H, borderBottom: i < MEASURE_KEYS.length - 1 ? "1px solid #F5F5F7" : "none" }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: DOT_COLORS[k], display: "inline-block", flexShrink: 0 }}/>
                <span style={{ flex: 1, fontSize: 13, color: "#374151", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{k}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#111", minWidth: 40, textAlign: "right" }}>{cur} см</span>
                <TrendBadge delta={delta}/>
                <span style={{ fontSize: 11, color: "#9CA3AF", minWidth: 36, textAlign: "right" }}>{prv}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   EXPORT
   compact=true      → MeasurementsCompact
   editable=true     → MeasurementsEditForm
   showHistory=true  → MeasurementsHistoryChart (график + таблица)
   default           → BodyMeasures (тело + обхваты)
═══════════════════════════════════════ */
export function MeasurementsPanel({ compact = false, editable = false, showHistory = false }: {
  compact?: boolean;
  editable?: boolean;
  showHistory?: boolean;
}) {
  const [entries, setEntries] = useState<Entry[]>(INIT_ENTRIES);
  const onAdd = (e: Entry) => setEntries(p => [...p, e]);
  if (compact) return <MeasurementsCompact entries={entries} />;
  if (editable) return <MeasurementsEditForm entries={entries} onAdd={onAdd} />;
  if (showHistory) return <MeasurementsHistoryChart entries={entries} />;
  return <BodyMeasures entries={entries} />;
}

/* ─── StatPanel ─── */
function StatPanel({ score, delta, up, items, ratings }: {
  score: string; delta: string; up: boolean;
  items: { dot: string; label: string; value: string | number; info?: boolean }[];
  ratings: { icon: React.ReactNode; label: string; value: string | number }[];
}) {
  return (
    <div style={{ width: 290, flexShrink: 0 }}>
      <div style={{ background: "linear-gradient(135deg,#1E3FBF,#375DFB)", borderRadius: 14, padding: "18px 20px", marginBottom: 10 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,.65)", letterSpacing: ".5px", textTransform: "uppercase" as const, marginBottom: 6 }}>Ваша общая оценка</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 10 }}>
          <span style={{ fontSize: 44, fontWeight: 800, color: "#fff", lineHeight: 1 }}>{score}</span>
          <div style={{ marginBottom: 6 }}><Delta value={delta} up={up}/></div>
        </div>
      </div>
      <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #E5E7EB", padding: "14px 16px", marginBottom: 10 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#9CA3AF", letterSpacing: ".4px", textTransform: "uppercase" as const, marginBottom: 12 }}>Критерии</div>
        {items.map((it, i) => {
          const pct = typeof it.value === "number" ? it.value * 100 : parseFloat(String(it.value).replace(",", ".")) * 100;
          return (
            <div key={i} style={{ marginBottom: i < items.length - 1 ? 12 : 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: it.dot, display: "inline-block", flexShrink: 0 }}/>
                  <span style={{ fontSize: 13, color: "#374151" }}>{it.label}</span>
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: it.dot }}>{it.value}</span>
              </div>
              <div style={{ height: 7, borderRadius: 6, background: "#F0F0F0", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${Math.min(pct, 100)}%`, borderRadius: 6, background: `linear-gradient(90deg,${it.dot}99,${it.dot})`, transition: "width .6s cubic-bezier(.4,0,.2,1)" }}/>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #E5E7EB", overflow: "hidden" }}>
        <div style={{ padding: "10px 16px 4px", fontSize: 11, fontWeight: 700, color: "#9CA3AF", letterSpacing: ".4px", textTransform: "uppercase" as const }}>Рейтинги</div>
        {ratings.map((r, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", borderBottom: i < ratings.length - 1 ? "1px solid #F5F5F7" : "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ color: "#9CA3AF" }}>{r.icon}</span>
              <span style={{ fontSize: 14, color: "#374151" }}>{r.label}</span>
            </div>
            <span style={{ fontSize: 15, fontWeight: 700, color: "#111" }}>{r.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DD({ label }: { label: string }) {
  return (
    <button onClick={() => window.alert(`Фильтр "${label}" применен в демо-режиме`)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", background: "#fff", border: "1px solid #E5E7EB", borderRadius: 10, fontSize: 13, fontWeight: 500, color: "#374151", cursor: "pointer", whiteSpace: "nowrap" }}>
      {label}
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
    </button>
  );
}

const MAY_LABELS = ["1 мая", "2 мая", "3 мая", "4 мая", "5 мая", "6 мая", "7 мая", "8 мая", "9 мая"];
const TACT_LABELS = ["31 апр", "1 май", "2 май", "3 май", "4 май", "5 май", "6 май", "7 май", "8 май", "9 май", "10 май"];

const PHYS_SERIES: ChartSeries[] = [
  { color: "#10B981", data: [3.6, 3.5, 3.4, 3.7, 4.1, 4.3, 3.9, 4.1, 4.9] },
  { color: "#375DFB", data: [1.5, 1.8, 2.1, 2.5, 3.0, 2.1, 1.7, 1.9, 1.8] },
  { color: "#F59E0B", data: [0.3, 0.6, 0.9, 1.0, 1.2, 1.2, 0.8, 0.7, 0.8] },
  { color: "#A78BFA", data: [0.1, 0.1, 0.1, 0.2, 0.2, 0.1, 0.1, 0.1, 0.1] },
];
const TACT_SERIES: ChartSeries[] = [
  { color: "#10B981", data: [0.05, 0.20, 0.37, 0.53, 0.62, 0.70, 0.78, 0.80, 0.78, 0.75, 0.74] },
  { color: "#06B6D4", data: [0.27, 0.40, 0.53, 0.68, 0.80, 0.90, 0.93, 0.90, 0.85, 0.80, 0.77] },
  { color: "#F59E0B", data: [0.20, 0.26, 0.32, 0.40, 0.53, 0.65, 0.75, 0.83, 0.88, 0.88, 0.87] },
  { color: "#A78BFA", data: [0.05, 0.12, 0.22, 0.32, 0.44, 0.54, 0.52, 0.45, 0.38, 0.30, 0.37] },
  { color: "#9CA3AF", data: [0.02, 0.10, 0.20, 0.33, 0.45, 0.57, 0.67, 0.75, 0.77, 0.75, 0.74] },
];
const CMD_SERIES: ChartSeries[] = [
  { color: "#10B981", data: [0.10, 0.22, 0.38, 0.54, 0.66, 0.74, 0.78, 0.79, 0.79, 0.77, 0.75] },
  { color: "#06B6D4", data: [0.30, 0.44, 0.60, 0.74, 0.86, 0.94, 0.95, 0.91, 0.86, 0.81, 0.78] },
  { color: "#F59E0B", data: [0.20, 0.27, 0.34, 0.45, 0.58, 0.70, 0.80, 0.86, 0.89, 0.89, 0.87] },
  { color: "#A78BFA", data: [0.04, 0.12, 0.24, 0.36, 0.48, 0.56, 0.53, 0.46, 0.39, 0.33, 0.36] },
  { color: "#9CA3AF", data: [0.02, 0.09, 0.19, 0.31, 0.46, 0.58, 0.68, 0.76, 0.78, 0.77, 0.75] },
];
const INSTR_SERIES: ChartSeries[] = [
  { color: "#10B981", data: [0.12, 0.25, 0.40, 0.56, 0.68, 0.76, 0.79, 0.81, 0.80, 0.78, 0.76] },
  { color: "#06B6D4", data: [0.32, 0.47, 0.62, 0.74, 0.86, 0.94, 0.95, 0.91, 0.86, 0.81, 0.78] },
  { color: "#F59E0B", data: [0.20, 0.27, 0.33, 0.43, 0.57, 0.70, 0.79, 0.85, 0.88, 0.88, 0.87] },
  { color: "#A78BFA", data: [0.02, 0.10, 0.22, 0.33, 0.45, 0.55, 0.52, 0.45, 0.38, 0.31, 0.35] },
  { color: "#9CA3AF", data: [0.03, 0.10, 0.21, 0.33, 0.47, 0.58, 0.68, 0.74, 0.77, 0.76, 0.75] },
];

const RATING_ROWS = [
  { icon: <IcPeople size={16}/>, label: "Общий рейтинг", value: "12 242" },
  { icon: <IcCity size={16}/>, label: "По городу", value: "922" },
  { icon: <IcGroup size={16}/>, label: "В группе КМБ-77-41", value: "2" },
];

;(() => {
  if (typeof document === "undefined") return;
  if (document.querySelector("[data-mp-css]")) return;
  const s = document.createElement("style");
  s.setAttribute("data-mp-css", "1");
  s.textContent = `
    .mp-section-fade { animation: mpFadeIn .2s ease; }
    @keyframes mpFadeIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
    .mp-tab-btn { transition: background .15s, color .15s, border-color .15s; }
    .mp-tab-btn:hover { opacity: .85; }
  `;
  document.head.appendChild(s);
})();

type SectionKey = "all" | "phys" | "tact" | "cmd" | "instr";

const SECTION_META: Record<Exclude<SectionKey, "all">, {
  noteText: string; noteColor: string; noteBg: string; noteBorder: string;
  series: ChartSeries[]; labels: string[]; yMax: number;
  legend: { c: string; l: string }[];
  score: string; delta: string; up: boolean;
  items: { dot: string; label: string; value: string; info?: boolean }[];
}> = {
  phys: {
    noteText: "Низкая физическая подготовка",
    noteColor: "#EF4444", noteBg: "#FEF2F2", noteBorder: "#FECACA",
    series: PHYS_SERIES, labels: MAY_LABELS, yMax: 5,
    legend: [{ c: "#10B981", l: "Бег" }, { c: "#375DFB", l: "Плавание" }, { c: "#F59E0B", l: "Велосипед" }, { c: "#A78BFA", l: "Силовой" }],
    score: "3.58", delta: "0,32", up: true,
    items: [{ dot: "#10B981", label: "Бег", value: "4.22", info: true }, { dot: "#375DFB", label: "Плавание", value: "3.63", info: true }, { dot: "#F59E0B", label: "Велосипед", value: "2.94", info: true }, { dot: "#A78BFA", label: "Силовой", value: "2.73", info: true }],
  },
  tact: {
    noteText: "Оценку ставит инструктор на практических занятиях",
    noteColor: "#375DFB", noteBg: "#EBF1FF", noteBorder: "#BFDBFE",
    series: TACT_SERIES, labels: TACT_LABELS, yMax: 1,
    legend: [{ c: "#10B981", l: "Дисциплина" }, { c: "#06B6D4", l: "Тактическая подготовка" }, { c: "#F59E0B", l: "Действия в группе" }, { c: "#A78BFA", l: "Стойкость" }, { c: "#9CA3AF", l: "Хитрость" }],
    score: "3.5", delta: "0,5", up: true,
    items: [{ dot: "#10B981", label: "Дисциплина", value: "1", info: true }, { dot: "#06B6D4", label: "Тактическая подготовка", value: "1", info: true }, { dot: "#F59E0B", label: "Действия в группе", value: "1", info: true }, { dot: "#A78BFA", label: "Стойкость", value: "0,5", info: true }, { dot: "#9CA3AF", label: "Хитрость", value: "0,5", info: true }],
  },
  cmd: {
    noteText: "Оценку ставит инструктор и л/с на практических занятиях",
    noteColor: "#F59E0B", noteBg: "#FFFBEB", noteBorder: "#FDE68A",
    series: CMD_SERIES, labels: TACT_LABELS, yMax: 1,
    legend: [{ c: "#10B981", l: "Дисциплина в подразделении" }, { c: "#06B6D4", l: "Боевая слаженность" }, { c: "#F59E0B", l: "Планирование операций" }, { c: "#A78BFA", l: "Управление боем" }, { c: "#9CA3AF", l: "Оценка л/с и командиров" }],
    score: "4.24", delta: "0,24", up: true,
    items: [{ dot: "#10B981", label: "Дисциплина в подразделении", value: "0,87", info: true }, { dot: "#06B6D4", label: "Боевая слаженность", value: "1", info: true }, { dot: "#F59E0B", label: "Планирование операций", value: "0,64", info: true }, { dot: "#A78BFA", label: "Управление боем", value: "0,72", info: true }, { dot: "#9CA3AF", label: "Оценка л/с и командиров", value: "1", info: true }],
  },
  instr: {
    noteText: "Оценку ставит инструктор и л/с на практических занятиях",
    noteColor: "#A78BFA", noteBg: "#F5F3FF", noteBorder: "#DDD6FE",
    series: INSTR_SERIES, labels: TACT_LABELS, yMax: 1,
    legend: [{ c: "#10B981", l: "Знание методик обучения" }, { c: "#06B6D4", l: "Подготовка бойцов" }, { c: "#F59E0B", l: "Подготовка командиров" }, { c: "#A78BFA", l: "Выживаемость обученного" }, { c: "#9CA3AF", l: "Интерес к обучению" }],
    score: "4.11", delta: "0,12", up: true,
    items: [{ dot: "#10B981", label: "Знание методик обучения", value: "0,87", info: true }, { dot: "#06B6D4", label: "Подготовка бойцов", value: "1", info: true }, { dot: "#F59E0B", label: "Подготовка командиров", value: "0,64", info: true }, { dot: "#A78BFA", label: "Выживаемость обученного", value: "0,72", info: true }, { dot: "#9CA3AF", label: "Интерес к обучению", value: "1", info: true }],
  },
};

function SectionContent({ sectionKey, isMobile, series, onSeriesChange }: {
  sectionKey: Exclude<SectionKey, "all">; isMobile: boolean;
  series: ChartSeries[];
  onSeriesChange: (s: ChartSeries[]) => void;
}) {
  const m = SECTION_META[sectionKey];
  const [editMode, setEditMode] = useState(false);
  const [draft, setDraft] = useState<number[][]>(() => series.map(s => [...s.data]));
  const [saved, setSaved] = useState(false);

  const chartSeries = editMode
    ? series.map((s, i) => ({ ...s, data: draft[i] ?? s.data }))
    : series;

  const handleSave = () => {
    onSeriesChange(series.map((s, i) => ({ ...s, data: [...(draft[i] ?? s.data)] })));
    setSaved(true);
    setTimeout(() => { setSaved(false); setEditMode(false); }, 900);
  };
  const handleCancel = () => {
    setDraft(series.map(s => [...s.data]));
    setEditMode(false);
  };
  const openEdit = () => {
    setDraft(series.map(s => [...s.data]));
    setSaved(false);
    setEditMode(true);
  };
  const updatePoint = (si: number, di: number, val: string) => {
    const n = parseFloat(val.replace(",", "."));
    if (isNaN(n)) return;
    setDraft(prev => prev.map((row, ri) => ri === si ? row.map((v, vi) => vi === di ? n : v) : [...row]));
  };

  return (
    <div className="mp-section-fade">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, background: m.noteBg, border: `1px solid ${m.noteBorder}`, borderRadius: 8, padding: "6px 14px" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill={m.noteColor} stroke="none"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12" stroke="#fff" strokeWidth="2"/><line x1="12" y1="8" x2="12.01" y2="8" stroke="#fff" strokeWidth="2"/></svg>
          <span style={{ fontSize: 13, color: m.noteColor, fontWeight: 500 }}>{m.noteText}</span>
        </div>
        {!editMode ? (
          <button onClick={openEdit} style={{ display: "flex", alignItems: "center", gap: 7, padding: "7px 16px", background: "#EBF1FF", border: "1px solid #C7D2FE", borderRadius: 10, fontSize: 13, fontWeight: 600, color: "#375DFB", cursor: "pointer", transition: "all .15s" }} onMouseEnter={e => { e.currentTarget.style.background = "#DFE8FF"; e.currentTarget.style.borderColor = "#A5B4FC"; }} onMouseLeave={e => { e.currentTarget.style.background = "#EBF1FF"; e.currentTarget.style.borderColor = "#C7D2FE"; }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4z"/></svg>
            Редактировать данные
          </button>
        ) : (
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={handleCancel} style={{ padding: "7px 14px", background: "#F3F4F6", border: "none", borderRadius: 8, fontSize: 13, color: "#374151", cursor: "pointer", transition: "background .15s" }} onMouseEnter={e => (e.currentTarget.style.background = "#E5E7EB")} onMouseLeave={e => (e.currentTarget.style.background = "#F3F4F6")}>Отмена</button>
            <button onClick={handleSave} style={{ padding: "7px 18px", background: saved ? "#10B981" : "#375DFB", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, color: "#fff", cursor: "pointer", transition: "background .2s", display: "flex", alignItems: "center", gap: 7 }}>
              {saved
                ? <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>Сохранено</>
                : <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>Сохранить</>
              }
            </button>
          </div>
        )}
      </div>
      <div style={{ display: "flex", gap: 24, flexWrap: isMobile ? "wrap" : "nowrap", alignItems: "stretch" }}>
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
            <DD label="Среднее"/>
            <DD label="31.04 – 12.05"/>
            {(sectionKey === "tact" || sectionKey === "cmd" || sectionKey === "instr") && (
              <button onClick={() => window.alert("Ведомость сформирована в демо-режиме")} style={{ padding: "7px 14px", border: "1px solid #E5E7EB", borderRadius: 10, fontSize: 13, color: "#374151", background: "#fff", cursor: "pointer" }}>Ведомость</button>
            )}
            {sectionKey === "phys" && <span style={{ fontSize: 13, color: "#374151" }}>Возраст <strong>29 лет</strong></span>}
          </div>
          <div style={{ flex: 1, minHeight: 220 }}>
            <AreaChartRC series={chartSeries} labels={m.labels} yMax={m.yMax} height="100%"/>
          </div>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 10 }}>
            {m.legend.map(x => (
              <span key={x.l} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#6B7280" }}>
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: x.c, display: "inline-block" }}/>{x.l}
              </span>
            ))}
          </div>
          {editMode && (
            <div style={{ marginTop: 16, border: "1px solid #E5E7EB", borderRadius: 12, overflow: "hidden", animation: "mpFadeIn .2s ease" }}>
              <div style={{ background: "#F9FAFB", borderBottom: "1px solid #F0F0F0", padding: "10px 14px", display: "flex", alignItems: "center", gap: 8 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#375DFB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#374151" }}>Таблица данных</span>
                <span style={{ fontSize: 12, color: "#9CA3AF" }}>— изменения сразу отражаются на графике</span>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                  <thead>
                    <tr>
                      <th style={{ padding: "9px 14px", textAlign: "left" as const, fontSize: 11, fontWeight: 700, color: "#9CA3AF", background: "#FAFAFA", borderBottom: "1px solid #F0F0F0", whiteSpace: "nowrap" as const, minWidth: 72 }}>Дата</th>
                      {m.legend.map((l, i) => (
                        <th key={i} style={{ padding: "9px 8px", textAlign: "center" as const, fontSize: 11, fontWeight: 700, color: l.c, background: "#FAFAFA", borderBottom: "1px solid #F0F0F0", whiteSpace: "nowrap" as const }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                            <span style={{ width: 8, height: 8, borderRadius: "50%", background: l.c, display: "inline-block", flexShrink: 0 }}/>
                            {l.l}
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {m.labels.map((label, di) => (
                      <tr key={di}
                        onMouseEnter={e => (e.currentTarget.style.background = "#F8FAFF")}
                        onMouseLeave={e => (e.currentTarget.style.background = "#fff")}
                        style={{ borderBottom: di < m.labels.length - 1 ? "1px solid #F5F5F7" : "none", background: "#fff", transition: "background .12s" }}
                      >
                        <td style={{ padding: "6px 14px", color: "#374151", fontWeight: 600, fontSize: 12, whiteSpace: "nowrap" as const }}>{label}</td>
                        {m.legend.map((l, si) => (
                          <td key={si} style={{ padding: "4px 6px", textAlign: "center" as const }}>
                            <input
                              type="number"
                              step="0.1"
                              value={draft[si]?.[di] ?? ""}
                              onChange={e => updatePoint(si, di, e.target.value)}
                              style={{ width: 68, padding: "5px 6px", border: `1.5px solid ${l.c}33`, borderRadius: 7, fontSize: 12, fontWeight: 600, color: "#111", textAlign: "center" as const, outline: "none", background: `${l.c}0D`, boxSizing: "border-box" as const, transition: "border .12s" }}
                              onFocus={e => (e.target.style.borderColor = l.c)}
                              onBlur={e => (e.target.style.borderColor = `${l.c}33`)}
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
        <StatPanel score={m.score} delta={m.delta} up={m.up} items={m.items} ratings={RATING_ROWS}/>
      </div>
    </div>
  );
}

const TRAINING_SECTION_TABS: { key: SectionKey; label: string; color: string; bg: string; border: string }[] = [
  { key: "all", label: "Все разделы", color: "#374151", bg: "#F3F4F6", border: "#E5E7EB" },
  { key: "phys", label: "Физическая", color: "#10B981", bg: "#F0FDF4", border: "#BBF7D0" },
  { key: "tact", label: "Тактическая", color: "#375DFB", bg: "#EBF1FF", border: "#BFDBFE" },
  { key: "cmd", label: "Командирская", color: "#F59E0B", bg: "#FFFBEB", border: "#FDE68A" },
  { key: "instr", label: "Инструкторская", color: "#A78BFA", bg: "#F5F3FF", border: "#DDD6FE" },
];

type EditableSectionKey = Exclude<SectionKey, "all">;

export function TrainingPanel({ compact: _compact = false }: { compact?: boolean }) {
  const isMobile = useMediaQuery("(max-width:900px)");
  const [activeSection, setActiveSection] = useState<SectionKey>("all");
  const [seriesData, setSeriesData] = useState<Record<EditableSectionKey, ChartSeries[]>>({
    phys: PHYS_SERIES.map(s => ({ ...s, data: [...s.data] })),
    tact: TACT_SERIES.map(s => ({ ...s, data: [...s.data] })),
    cmd: CMD_SERIES.map(s => ({ ...s, data: [...s.data] })),
    instr: INSTR_SERIES.map(s => ({ ...s, data: [...s.data] })),
  });
  return (
    <div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
        {TRAINING_SECTION_TABS.map(({ key, label, color, bg, border }) => (
          <button key={key} className="mp-tab-btn" onClick={() => setActiveSection(key)}
            style={{ padding: "8px 18px", borderRadius: 8, cursor: "pointer", border: `1.5px solid ${activeSection === key ? color : border}`, background: activeSection === key ? bg : "#fff", color: activeSection === key ? color : "#374151", fontSize: 13, fontWeight: activeSection === key ? 700 : 400, display: "flex", alignItems: "center", gap: 7 }}>
            {key !== "all" && <span style={{ width: 8, height: 8, borderRadius: "50%", background: activeSection === key ? color : border, display: "inline-block", flexShrink: 0 }}/>}
            {label}
          </button>
        ))}
        {activeSection === "all" && <DD label="31.04 – 12.05"/>}
      </div>
      {activeSection === "all" && (
        <div className="mp-section-fade" style={{ display: "flex", gap: 20, flexWrap: isMobile ? "wrap" : "nowrap" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <RadarChartRC data={[
              { label: "Физическая", value: 3.6, color: "#10B981", max: 5 },
              { label: "Тактическая", value: 4.1, color: "#375DFB", max: 5 },
              { label: "Командирская", value: 2.8, color: "#F59E0B", max: 5 },
              { label: "Инструктор.", value: 4.5, color: "#A78BFA", max: 5 },
              { label: "Интеллект.", value: 3.2, color: "#06B6D4", max: 5 },
            ]}/>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center", marginTop: 10 }}>
              {[{ c: "#10B981", l: "Физическая", v: "3.6" }, { c: "#375DFB", l: "Тактическая", v: "4.1" }, { c: "#F59E0B", l: "Командирская", v: "2.8" }, { c: "#A78BFA", l: "Инструктор.", v: "4.5" }, { c: "#06B6D4", l: "Интеллект.", v: "3.2" }].map(d => (
                <span key={d.l} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#6B7280" }}>
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: d.c, display: "inline-block" }}/>{d.l}: <strong style={{ color: "#111" }}>{d.v}</strong>
                </span>
              ))}
            </div>
          </div>
          <div style={{ width: 300, flexShrink: 0 }}>
            <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #E5E7EB", overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid #F0F0F0" }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: "#374151" }}>Индекс Воеводы</span>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Delta value="0,75" up/>
                  <span style={{ fontSize: 36, fontWeight: 800, color: "#111", lineHeight: 1 }}>4,04</span>
                </div>
              </div>
              {[{ icon: <IcPeople size={15}/>, label: "Общий рейтинг", delta: "+12", up: true, val: "991" }, { icon: <IcCity size={15}/>, label: "По городу", delta: "+2", up: true, val: "34" }, { icon: <IcGroup size={15}/>, label: "В группе КМБ-77-41", delta: "-1", up: false, val: "2" }].map((r, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 20px", borderBottom: "1px solid #F5F5F7" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ color: "#C4C9D4" }}>{r.icon}</span><span style={{ fontSize: 13, color: "#374151" }}>{r.label}</span></div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}><Delta value={r.delta} up={r.up}/><span style={{ fontSize: 14, fontWeight: 700, color: "#111" }}>{r.val}</span></div>
                </div>
              ))}
              <div style={{ padding: "12px 20px 4px", fontSize: 14, fontWeight: 700, color: "#374151", borderTop: "1px solid #F0F0F0" }}>Подготовка</div>
              {[
                { icon: <IcRun size={16} color="#10B981"/>, label: "Физическая", delta: "0,32", up: true, val: "3,55" },
                { icon: <IcTactic size={16} color="#375DFB"/>, label: "Тактическая", delta: "0,55", up: false, val: "4,09" },
                { icon: <IcCmd size={16} color="#F59E0B"/>, label: "Командирская", delta: "0,44", up: true, val: "2,75" },
                { icon: <IcInstr size={16} color="#A78BFA"/>, label: "Инструкторская", delta: "0,12", up: false, val: "4,55" },
              ].map((r, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 20px", borderBottom: i < 3 ? "1px solid #F5F5F7" : "none" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>{r.icon}<span style={{ fontSize: 13, color: "#374151" }}>{r.label}</span></div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}><Delta value={r.delta} up={r.up}/><span style={{ fontSize: 15, fontWeight: 700, color: "#111" }}>{r.val}</span></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {activeSection !== "all" && (
        <SectionContent
          key={activeSection}
          sectionKey={activeSection as EditableSectionKey}
          isMobile={isMobile}
          series={seriesData[activeSection as EditableSectionKey]}
          onSeriesChange={(s) => setSeriesData(p => ({ ...p, [activeSection]: s }))}
        />
      )}
    </div>
  );
}