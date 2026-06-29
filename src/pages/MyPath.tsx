import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMediaQuery } from "../useMediaQuery";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, RadarChart as RcRadarChart,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar as RcRadar,
} from "recharts";
import { MeasurementsPanel } from "../components/IndexCharts";
import { BadgeBox, BADGE_TOOLTIPS, ElitaBadge, ExtraBadge, IVDisplay } from "../components/PeopleSection";
import { VoevodaSocialLinks } from "../components/Footer";
import { Profile } from "./Profile";

/* ─── SVG wrapper ─── */
function Svg({ size = 20, color = "currentColor", children }: { size?: number; color?: string; children: React.ReactNode }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      {children}
    </svg>
  );
}

function IcRun({ size = 20, color = "currentColor" }: { size?: number; color?: string }) { return <Svg size={size} color={color}><circle cx="12" cy="5" r="1"/><path d="m9 20 3-7 4 4"/><path d="m6 15 3-7 6-2"/><path d="m2 22 4-2"/><path d="m22 22-4-2"/></Svg>; }
function IcTactic({ size = 20, color = "currentColor" }: { size?: number; color?: string }) { return <Svg size={size} color={color}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></Svg>; }
function IcCmd({ size = 20, color = "currentColor" }: { size?: number; color?: string }) { return <Svg size={size} color={color}><path d="M8 21h8"/><path d="M12 17v4"/><path d="M7 4h10l1 7H6L7 4z"/><path d="M6 11c0 3.31 2.69 6 6 6s6-2.69 6-6"/></Svg>; }
function IcInstr({ size = 20, color = "currentColor" }: { size?: number; color?: string }) { return <Svg size={size} color={color}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></Svg>; }
function IcAward({ size = 20 }: { size?: number }) { return <Svg size={size}><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></Svg>; }
function IcDiploma({ size = 20 }: { size?: number }) { return <Svg size={size}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></Svg>; }
function IcPeople({ size = 16 }: { size?: number }) { return <Svg size={size}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></Svg>; }
function IcCity({ size = 16 }: { size?: number }) { return <Svg size={size}><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></Svg>; }
function IcGroup({ size = 16 }: { size?: number }) { return <Svg size={size}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></Svg>; }
function IcArrow({ dir }: { dir: "left" | "right" }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      {dir === "left" ? <polyline points="15 18 9 12 15 6"/> : <polyline points="9 18 15 12 9 6"/>}
    </svg>
  );
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

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#1F2937", borderRadius: 10, padding: "8px 12px", boxShadow: "0 6px 20px rgba(0,0,0,.3)", pointerEvents: "none", minWidth: 120, border: "1px solid rgba(255,255,255,.08)" }}>
      <div style={{ fontSize: 11, color: "#9CA3AF", marginBottom: 6, fontWeight: 600 }}>{label}</div>
      {payload.map((p: any, i: number) => (
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
function AreaChartRC({ series, labels, yMax = 1, height = 230 }: { series: ChartSeries[]; labels: string[]; yMax?: number; height?: number | string }) {
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
        <YAxis domain={[0, yMax]} tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} tickCount={5}/>
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
    <ResponsiveContainer width="100%" height={340}>
      <RcRadarChart
        data={chartData}
        cx="50%"
        cy="49%"
        outerRadius="84%"
        margin={{ top: 24, right: 42, bottom: 24, left: 42 }}
      >
        <PolarGrid stroke="#E5E7EB" strokeWidth={1}/>
        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fill: "#6B7280", fontWeight: 600 }}/>
        <PolarRadiusAxis domain={[0, 5]} tick={false} axisLine={false} tickCount={6}/>
        <RcRadar dataKey="value" stroke="#375DFB" fill="#375DFB" fillOpacity={0.18} strokeWidth={2.5}
          dot={{ r: 5, fill: "#375DFB", stroke: "#fff", strokeWidth: 2.5, fillOpacity: 1 } as any}
        />
      </RcRadarChart>
    </ResponsiveContainer>
  );
}

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
          const pct = typeof it.value === "number" ? (it.value / 1) * 100 : parseFloat(String(it.value)) * 100;
          return (
            <div key={i} style={{ marginBottom: i < items.length - 1 ? 12 : 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: it.dot, display: "inline-block", flexShrink: 0 }}/>
                  <span style={{ fontSize: 13, color: "#374151" }}>{it.label}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: it.dot }}>{it.value}</span>
                  {it.info && (
                    <div style={{ width: 16, height: 16, borderRadius: "50%", background: "#F3F4F6", border: "1px solid #E5E7EB", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                    </div>
                  )}
                </div>
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
          <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 16px", borderBottom: i < ratings.length - 1 ? "1px solid #F5F5F7" : "none" }}>
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

function DonutChart({ segments }: { segments: { label: string; pct: number; color: string }[] }) {
  const R = 80; const CX = 100; const CY = 100; const SW = 24; const CIRC = 2 * Math.PI * R;
  let offset = 0;
  const arcs = segments.map(s => {
    const dash = s.pct * CIRC; const space = CIRC - dash; const rotation = offset * 360 - 90;
    offset += s.pct;
    return { ...s, dash, space, rotation };
  });
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
      <svg viewBox="0 0 200 200" style={{ width: 200, height: 200, flexShrink: 0 }}>
        {arcs.map((a, i) => (
          <circle key={i} cx={CX} cy={CY} r={R} fill="none" stroke={a.color} strokeWidth={SW}
            strokeDasharray={`${a.dash} ${a.space}`}
            style={{ transformOrigin: `${CX}px ${CY}px`, transform: `rotate(${a.rotation}deg)` }}/>
        ))}
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%" }}>
        {segments.map(s => (
          <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: s.color, flexShrink: 0 }}/>
            <span style={{ flex: 1, fontSize: 14, color: "#374151" }}>{s.label}</span>
            <span style={{ fontSize: 16, fontWeight: 700, color: "#111" }}>{Math.round(s.pct * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TooltipBadge({ src, active, tooltip, elita, onClick }: { src: string; active: boolean; tooltip?: { title: string; desc: string; course: string }; elita?: boolean; onClick?: () => void }) {
  const label = tooltip?.title ?? BADGE_TOOLTIPS[0];
  return (
    <div style={{ flexShrink: 0, opacity: active ? 1 : 0.5 }} onClick={onClick} onKeyDown={e => { if ((e.key === "Enter" || e.key === " ") && onClick) onClick(); }} role={onClick ? "button" : undefined} tabIndex={onClick ? 0 : undefined} aria-label={label}>
      <BadgeBox
        src={src}
        size={72}
        tooltip={label}
        topRight={elita ? <ElitaBadge small /> : undefined}
      />
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

/* ─── DATA ─── */
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
  { icon: <IcPeople size={16}/>, label: "Общий рейтинг",     value: "12 242" },
  { icon: <IcCity size={16}/>,   label: "По городу",          value: "922" },
  { icon: <IcGroup size={16}/>,  label: "В группе КМБ-77-41", value: "2" },
];

const COMPETITIONS = [
  { id: 1, name: "Тактическое ориентирование", status: "past", place: "2 место", location: "г. Санкт-Петербург", date: "5 марта, 2024", img: "/sorev1.png" },
  { id: 6, name: "Полоса препятствий «Рубеж»", status: "past", place: "1 место", location: "г. Москва, полигон Алабино", date: "18 апреля, 2024", img: "/sorev2.png" },
  { id: 7, name: "Командный марш-бросок", status: "past", place: "3 место", location: "г. Краснодар", date: "27 апреля, 2024", img: "/sorev1.png" },
  { id: 2, name: "Марш-бросок на 10 км", status: "upcoming", place: "Регистрация открыта", location: "г. Москва", date: "14 мая, 2024", img: "/sorev2.png" },
  { id: 3, name: "Линия обороны", status: "upcoming", place: "Командный зачёт", location: "г. Краснодар", date: "16 мая, 2024", img: "/sorev1.png" },
  { id: 4, name: "Стрельба из АК-74", status: "upcoming", place: "Регистрация открыта", location: "г. Москва", date: "20 мая, 2024", img: "/sorev2.png" },
  { id: 5, name: "Военный триатлон", status: "upcoming", place: "Личный и командный зачёт", location: "г. Казань", date: "1 июня, 2024", img: "/sorev1.png" },
];

const SPORT_ACH = [
  { id: 1, name: "КМС по жиму лёжа",          info: "2018 год, Москва, спорт-комплекс Динамо",                                     img: "/dost1.png" },
  { id: 2, name: "2-й юношеский по шахматам", info: "12.05.2024 XXII турниро Чемпионата России по Федерация шахматного спорта РФ", img: "/dost2.png" },
];
const OTHER_ACH = [
  { id: 1, name: "КМС по жиму лёжа",          info: "2018 год, Москва, спорт-комплекс Динамо",                                     img: "/dost3.png" },
  { id: 2, name: "2-й юношеский по шахматам", info: "12.05.2024 XXII турниро Чемпионата России по Федерация шахматного спорта РФ", img: "/dost4.png" },
];

const DIPLOMAS = [
  { id: 1, img: "/dip1.png", title: "Успешное прохождение курса «Разведывательно-штурмовая подготовка»", desc: "Ведомственный знак отличия Министерства обороны Российской Федерации, учреждённый", date: "16 мая, 2024", badges: ["/2.png", "/dipmini2.png"] },
  { id: 2, img: "/dip2.png", title: "Успешное прохождение курса «Разведывательно-штурмовая подготовка»", desc: "Ведомственный знак отличия Министерства обороны Российской Федерации, учреждённый", date: "16 мая, 2024", badges: ["/2.png", "/dipmini2.png"] },
  { id: 3, img: "/dip1.png", title: "Успешное прохождение курса «Разведывательно-штурмовая подготовка»", desc: "Ведомственный знак отличия Министерства обороны Российской Федерации, учреждённый", date: "16 мая, 2024", badges: ["/2.png", "/dipmini2.png"] },
];

const DEFAULT_TOOLTIP = { title: "За заслуги перед группой", desc: "Краткое описание в самом тылу противника в районе сирийской Пальмиры", course: "КМБ V4" };
const POGONS = Array.from({ length: 11 }, (_, i) => ({ src: "/pogon1.png", active: i === 0, achievementId: i + 1 }));
const SHEVRONS = [
  { src: "/1.png", active: true, achievementId: 12 }, { src: "/2.png", active: true, achievementId: 13 },
  { src: "/3.png", active: false, achievementId: 14 }, { src: "/1.png", active: false, achievementId: 15 },
  { src: "/2.png", active: false, achievementId: 16 }, { src: "/3.png", active: false, achievementId: 17 }, { src: "/1.png", active: false, achievementId: 18 },
];
const BERETS = [
  { src: "/1.png", active: false, elita: false, achievementId: 19 }, { src: "/2.png", active: true, elita: true, achievementId: 20 },
  { src: "/3.png", active: false, elita: false, achievementId: 21 }, { src: "/1.png", active: false, elita: false, achievementId: 22 },
];
const ZNAKI = Array.from({ length: 10 }, (_, i) => ({ src: "/3.png", active: i < 4, achievementId: 23 + i }));
const OTHER_ZNAKI = Array.from({ length: 20 }, (_, i) => ({ src: "/3.png", active: i === 8, achievementId: 33 + (i % 11) }));

(() => {
  if (document.querySelector("[data-mp-css]")) return;
  const s = document.createElement("style");
  s.setAttribute("data-mp-css", "1");
  s.textContent = `
    .mp-section-fade { animation: mpFadeIn .2s ease; }
    @keyframes mpFadeIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
    .mp-tab-btn { transition: background .15s, color .15s, border-color .15s; }
    .mp-tab-btn:hover { opacity: .85; }
    .mp-dip-nav-btn { transition: background .15s, opacity .15s; }
    .mp-dip-nav-btn:hover { background: rgba(255,255,255,.2) !important; }
    .mp-competition-scroll { scrollbar-width:thin; scrollbar-color:#375DFB #EEF3FF; }
    .mp-competition-scroll::-webkit-scrollbar { width:8px; }
    .mp-competition-scroll::-webkit-scrollbar-track { background:#EEF3FF; border-radius:999px; margin:8px 0; }
    .mp-competition-scroll::-webkit-scrollbar-thumb { background:linear-gradient(180deg,#2F52F0,#7B9FFF); border:2px solid #EEF3FF; border-radius:999px; }
    .mp-competition-scroll::-webkit-scrollbar-thumb:hover { background:linear-gradient(180deg,#1F46E5,#5678FF); }
    .mp-competition-row:hover { background:#F7F9FF; }
    .mp-dip-badge { filter:grayscale(35%); transition:filter .25s ease, transform .25s cubic-bezier(.34,1.4,.64,1), box-shadow .25s ease, border-color .25s ease; }
    .mp-dip-badge:hover { filter:grayscale(0%); transform:translateY(-5px) scale(1.14) rotate(-3deg); box-shadow:0 10px 22px rgba(55,93,251,.28); border-color:#C7D2FE !important; z-index:1; }
    .mp-dip-card:hover .mp-dip-badge { filter:grayscale(0%); }
    .mp-dip-open { transition:transform .2s ease, box-shadow .2s ease, background .2s ease, color .2s ease, border-color .2s ease; }
    .mp-dip-open svg { transition:transform .2s ease; }
    .mp-dip-open:hover { background:#375DFB !important; color:#fff !important; border-color:#375DFB !important; box-shadow:0 10px 24px rgba(55,93,251,.3) !important; transform:translateY(-2px); }
    .mp-dip-open:hover svg { transform:translateX(3px); }
    .mp-dip-open:active { transform:translateY(0) scale(.98); }
  `;
  document.head.appendChild(s);
})();

type SectionKey = "all" | "phys" | "tact" | "cmd" | "instr";
type SectionView = "chart" | "edit" | "history";
type EditableSectionKey = Exclude<SectionKey, "all">;

const UPOR_LABELS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
const UPOR_LEGEND = [
  { c: "#10B981", l: "Физическая" },
  { c: "#06B6D4", l: "Тактическая" },
  { c: "#F59E0B", l: "Командирская" },
  { c: "#A78BFA", l: "Инструкторская" },
];
const UPOR_SERIES_INIT: ChartSeries[] = [
  { color: "#10B981", data: [3.0, 4.0, 2.5, 3.5, 2.0, 5.0, 1.5] },
  { color: "#06B6D4", data: [1.5, 2.0, 3.0, 1.0, 2.5, 1.5, 2.0] },
  { color: "#F59E0B", data: [1.0, 1.5, 1.0, 2.0, 1.0, 2.0, 0.5] },
  { color: "#A78BFA", data: [0.5, 0.5, 1.0, 0.5, 1.0, 1.0, 0.5] },
];

const SECTION_META: Record<Exclude<SectionKey, "all">, {
  title: string; icon: React.ReactNode; noteText: string; noteColor: string; noteBg: string; noteBorder: string;
  series: ChartSeries[]; labels: string[]; yMax: number;
  legend: { c: string; l: string }[];
  score: string; delta: string; up: boolean;
  items: { dot: string; label: string; value: string; info?: boolean }[];
}> = {
  phys: {
    title: "Физическая подготовка — Тест Купера",
    icon: <IcRun size={18} color="#10B981"/>,
    noteText: "Низкая физическая подготовка",
    noteColor: "#EF4444", noteBg: "#FEF2F2", noteBorder: "#FECACA",
    series: PHYS_SERIES, labels: MAY_LABELS, yMax: 5,
    legend: [{ c: "#10B981", l: "Бег" }, { c: "#375DFB", l: "Плавание" }, { c: "#F59E0B", l: "Велосипед" }, { c: "#A78BFA", l: "Силовой" }],
    score: "3.58", delta: "0,32", up: true,
    items: [{ dot: "#10B981", label: "Бег", value: "4.22", info: true }, { dot: "#375DFB", label: "Плавание", value: "3.63", info: true }, { dot: "#F59E0B", label: "Велосипед", value: "2.94", info: true }, { dot: "#A78BFA", label: "Силовой", value: "2.73", info: true }],
  },
  tact: {
    title: "Тактическая подготовка",
    icon: <IcTactic size={18} color="#375DFB"/>,
    noteText: "Оценку ставит инструктор на практических занятиях",
    noteColor: "#375DFB", noteBg: "#EBF1FF", noteBorder: "#BFDBFE",
    series: TACT_SERIES, labels: TACT_LABELS, yMax: 1,
    legend: [{ c: "#10B981", l: "Дисциплина" }, { c: "#06B6D4", l: "Тактическая подготовка" }, { c: "#F59E0B", l: "Действия в группе" }, { c: "#A78BFA", l: "Стойкость" }, { c: "#9CA3AF", l: "Хитрость" }],
    score: "3.5", delta: "0,5", up: true,
    items: [{ dot: "#10B981", label: "Дисциплина", value: "1", info: true }, { dot: "#06B6D4", label: "Тактическая подготовка", value: "1", info: true }, { dot: "#F59E0B", label: "Действия в группе", value: "1", info: true }, { dot: "#A78BFA", label: "Стойкость", value: "0,5", info: true }, { dot: "#9CA3AF", label: "Хитрость", value: "0,5", info: true }],
  },
  cmd: {
    title: "Командирская подготовка",
    icon: <IcCmd size={18} color="#F59E0B"/>,
    noteText: "Оценку ставит инструктор и л/с на практических занятиях",
    noteColor: "#F59E0B", noteBg: "#FFFBEB", noteBorder: "#FDE68A",
    series: CMD_SERIES, labels: TACT_LABELS, yMax: 1,
    legend: [{ c: "#10B981", l: "Дисциплина в подразделении" }, { c: "#06B6D4", l: "Боевая слаженность" }, { c: "#F59E0B", l: "Планирование операций" }, { c: "#A78BFA", l: "Управление боем" }, { c: "#9CA3AF", l: "Оценка л/с и командиров" }],
    score: "4.24", delta: "0,24", up: true,
    items: [{ dot: "#10B981", label: "Дисциплина в подразделении", value: "0,87", info: true }, { dot: "#06B6D4", label: "Боевая слаженность", value: "1", info: true }, { dot: "#F59E0B", label: "Планирование операций", value: "0,64", info: true }, { dot: "#A78BFA", label: "Управление боем", value: "0,72", info: true }, { dot: "#9CA3AF", label: "Оценка л/с и командиров", value: "1", info: true }],
  },
  instr: {
    title: "Инструкторская подготовка",
    icon: <IcInstr size={18} color="#A78BFA"/>,
    noteText: "Оценку ставит инструктор и л/с на практических занятиях",
    noteColor: "#A78BFA", noteBg: "#F5F3FF", noteBorder: "#DDD6FE",
    series: INSTR_SERIES, labels: TACT_LABELS, yMax: 1,
    legend: [{ c: "#10B981", l: "Знание методик обучения" }, { c: "#06B6D4", l: "Подготовка бойцов" }, { c: "#F59E0B", l: "Подготовка командиров" }, { c: "#A78BFA", l: "Выживаемость обученного" }, { c: "#9CA3AF", l: "Интерес к обучению" }],
    score: "4.11", delta: "0,12", up: true,
    items: [{ dot: "#10B981", label: "Знание методик обучения", value: "0,87", info: true }, { dot: "#06B6D4", label: "Подготовка бойцов", value: "1", info: true }, { dot: "#F59E0B", label: "Подготовка командиров", value: "0,64", info: true }, { dot: "#A78BFA", label: "Выживаемость обученного", value: "0,72", info: true }, { dot: "#9CA3AF", label: "Интерес к обучению", value: "1", info: true }],
  },
};

const SEG_BTNS: [SectionView, string][] = [
  ["chart", "История замеров"],
  ["edit", "Редактировать данные"],
  ["history", "Смотреть историю"],
];

function SectionContent({ sectionKey, isMobile, series, onSeriesChange, initialView }: {
  sectionKey: EditableSectionKey;
  isMobile: boolean;
  series: ChartSeries[];
  onSeriesChange: (s: ChartSeries[]) => void;
  initialView?: SectionView;
}) {
  const m = SECTION_META[sectionKey];
  const [view, setView] = useState<SectionView>(initialView ?? "chart");

  const updatePoint = (si: number, di: number, raw: string) => {
    const n = parseFloat(raw.replace(",", "."));
    if (isNaN(n)) return;
    onSeriesChange(
      series.map((s, ri) =>
        ri === si ? { ...s, data: s.data.map((v, vi) => vi === di ? n : v) } : s
      )
    );
  };

  return (
    <div className="mp-section-fade">
      {/* 3-button segmented control */}
      <div style={{ display: "inline-flex", background: "#F3F4F6", borderRadius: 10, padding: 2, marginBottom: 18, gap: 0 }}>
        {SEG_BTNS.map(([v, label], i) => (
          <button key={v} onClick={() => setView(v)} style={segBtn(view === v, i === SEG_BTNS.length - 1)}>{label}</button>
        ))}
      </div>

      {view === "chart" && (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: m.noteBg, border: `1px solid ${m.noteBorder}`, borderRadius: 8, padding: "6px 14px" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill={m.noteColor} stroke="none"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12" stroke="#fff" strokeWidth="2"/><line x1="12" y1="8" x2="12.01" y2="8" stroke="#fff" strokeWidth="2"/></svg>
              <span style={{ fontSize: 13, color: m.noteColor, fontWeight: 500 }}>{m.noteText}</span>
            </div>
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
                <AreaChartRC series={series} labels={m.labels} yMax={m.yMax} height="100%" />
              </div>
              <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 10 }}>
                {m.legend.map(x => (
                  <span key={x.l} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#6B7280" }}>
                    <span style={{ width: 10, height: 10, borderRadius: "50%", background: x.c, display: "inline-block" }}/>{x.l}
                  </span>
                ))}
              </div>
            </div>
            <StatPanel score={m.score} delta={m.delta} up={m.up} items={m.items} ratings={RATING_ROWS}/>
          </div>
        </div>
      )}

      {view === "edit" && (
        <div style={{ overflowX: "auto" }}>
          <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 13 }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: "6px 10px", color: "#6B7280", fontWeight: 500, borderBottom: "1px solid #E5E7EB" }}>Серия</th>
                {m.labels.map(l => (
                  <th key={l} style={{ textAlign: "center", padding: "6px 10px", color: "#6B7280", fontWeight: 500, borderBottom: "1px solid #E5E7EB", whiteSpace: "nowrap" }}>{l}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {series.map((s, si) => (
                <tr key={si}>
                  <td style={{ padding: "6px 10px", borderBottom: "1px solid #F3F4F6" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ width: 10, height: 10, borderRadius: "50%", background: s.color, display: "inline-block", flexShrink: 0 }}/>
                      <span style={{ color: "#374151" }}>{m.legend[si]?.l ?? `Серия ${si + 1}`}</span>
                    </span>
                  </td>
                  {s.data.map((v, di) => (
                    <td key={di} style={{ padding: "4px 6px", borderBottom: "1px solid #F3F4F6" }}>
                      <input
                        type="number"
                        step="0.01"
                        defaultValue={v}
                        onBlur={e => updatePoint(si, di, e.target.value)}
                        onChange={e => updatePoint(si, di, e.target.value)}
                        style={{ width: 64, padding: "4px 6px", border: "1px solid #E5E7EB", borderRadius: 6, fontSize: 13, textAlign: "center", outline: "none" }}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ marginTop: 16, minHeight: 180 }}>
            <AreaChartRC series={series} labels={m.labels} yMax={m.yMax} height="180px" />
          </div>
        </div>
      )}

      {view === "history" && (
        <MeasurementsPanel />
      )}
    </div>
  );
}

/* ─── helper: стиль кнопки сегментированного переключателя ─── */
const segBtn = (active: boolean, isLast = false): React.CSSProperties => ({
  padding: "8px 18px",
  border: "none",
  borderRight: !isLast ? "1px solid #E5E7EB" : "none",
  fontSize: 13,
  fontWeight: active ? 600 : 400,
  background: active ? "#fff" : "transparent",
  color: active ? "#111" : "#6B7280",
  cursor: "pointer",
  boxShadow: active ? "0 1px 4px rgba(0,0,0,.08)" : "none",
  margin: active ? "2px" : "0",
  borderRadius: active ? "8px" : "0",
  transition: "all .15s",
  whiteSpace: "nowrap",
});

export function MyPath() {
  const isMobile = useMediaQuery("(max-width:900px)");
  const [overviewTab, setOverviewTab] = useState<"chart" | "measures">("chart");
  const [measuresView, setMeasuresView] = useState<SectionView>("chart");
  const [activeSection, setActiveSection] = useState<SectionKey>("all");
  const [compTab, setCompTab] = useState<"past" | "upcoming">("past");
  const visibleCompetitions = COMPETITIONS.filter(competition => competition.status === compTab);
  const [personalTab, setPersonalTab] = useState<"Данные" | "График подготовки" | "Сводка замеров">("Данные");
  const [avatarErr, setAvatarErr] = useState(false);
  const [rankErr, setRankErr] = useState(false);
  const [imgErrs, setImgErrs] = useState<Record<string, boolean>>({});
  const setErr = (k: string) => setImgErrs(p => ({ ...p, [k]: true }));
  const BADGE_W = 64;
  const badgesRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  type SeriesMap = Record<EditableSectionKey, ChartSeries[]>;
  const [seriesData, setSeriesData] = useState<SeriesMap>({
    phys: PHYS_SERIES.map(s => ({ ...s, data: [...s.data] })),
    tact: TACT_SERIES.map(s => ({ ...s, data: [...s.data] })),
    cmd:  CMD_SERIES.map(s => ({ ...s, data: [...s.data] })),
    instr: INSTR_SERIES.map(s => ({ ...s, data: [...s.data] })),
  });
  const [uporSeries, setUporSeries] = useState<ChartSeries[]>(
    UPOR_SERIES_INIT.map(s => ({ ...s, data: [...s.data] }))
  );
  const [uporView, setUporView] = useState<"chart" | "edit">("chart");

  const [dipIndex, setDipIndex] = useState<number | null>(null);
  const dipModal = dipIndex !== null ? DIPLOMAS[dipIndex] : null;
  const openDip = (idx: number) => setDipIndex(idx);
  const closeDip = () => setDipIndex(null);
  const prevDip = () => setDipIndex(i => i !== null ? (i - 1 + DIPLOMAS.length) % DIPLOMAS.length : null);
  const nextDip = () => setDipIndex(i => i !== null ? (i + 1) % DIPLOMAS.length : null);

  useEffect(() => {
    if (dipIndex === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") nextDip();
      else if (e.key === "ArrowLeft") prevDip();
      else if (e.key === "Escape") closeDip();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [dipIndex]);

  useEffect(() => {
    document.body.style.overflow = dipIndex !== null ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [dipIndex]);

  const SECTION_TABS: { key: SectionKey; label: string; color: string; bg: string; border: string }[] = [
    { key: "all",   label: "Все разделы",    color: "#374151", bg: "#F3F4F6", border: "#E5E7EB" },
    { key: "phys",  label: "Физическая",     color: "#10B981", bg: "#F0FDF4", border: "#BBF7D0" },
    { key: "tact",  label: "Тактическая",    color: "#375DFB", bg: "#EBF1FF", border: "#BFDBFE" },
    { key: "cmd",   label: "Командирская",   color: "#F59E0B", bg: "#FFFBEB", border: "#FDE68A" },
    { key: "instr", label: "Инструкторская", color: "#A78BFA", bg: "#F5F3FF", border: "#DDD6FE" },
  ];

  return (
    <div style={{ paddingTop: 60, marginLeft: 56, background: "#F8F9FA", minHeight: "100vh" }}>
      <div style={{ padding: "14px 20px 40px" }}>

        <div id="my-path-personal-file">
          <Profile mode="personal-only" embedded requestedTab={personalTab} />
        </div>

        {/* Старый обзор заменен единым блоком «Личное дело». */}
        {false && (
        <>
        {/* ══ OVERVIEW BLOCK ══ */}
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #E5E7EB", marginBottom: 16 }}>
          <div style={{ padding: "20px 28px 0" }}>
            {/* Аватар + имя + бейджи */}
            <div style={{ display: "flex", alignItems: "flex-start", gap: 20, marginBottom: 20, flexWrap: "wrap" }}>
              <div style={{ position: "relative", flexShrink: 0 }}>
                <div style={{ width: 86, height: 86, borderRadius: 16, overflow: "hidden", border: "2px solid #E5E7EB", background: "#F3F4F6" }}>
                  {!avatarErr
                    ? <img src="/teacher1-main.jpg" alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={() => setAvatarErr(true)}/>
                    : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}><IcPeople size={32}/></div>
                  }
                </div>
                {!rankErr && (
                  <div style={{ position: "absolute", bottom: -10, right: -10, width: 42, height: 42, zIndex: 3 }}>
                    <img src="/rank1.png" alt="" style={{ width: "100%", height: "100%", objectFit: "contain", filter: "drop-shadow(0 2px 8px rgba(0,0,0,.4))" }} onError={() => setRankErr(true)}/>
                  </div>
                )}
              </div>
              <div style={{ flex: 1, minWidth: 180, paddingTop: 2 }}>
                <div style={{ fontSize: 12, color: "#9CA3AF", marginBottom: 6 }}>Майор</div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 8 }}>
                  <span style={{ fontSize: 26, fontWeight: 700, color: "#111" }}>Торнадо</span>
                  <IVDisplay index={2463} rating={5.0} />
                </div>
                <div style={{ fontSize: 14, color: "#6B7280" }}>КР 2-й роты, 77-й учебный батальон</div>
              </div>
              <div style={{ position: "relative", flexShrink: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {["/1.png", "/2.png", "/3.png"].map((src, i) => (
                    <div key={i} style={{ position:"relative", flexShrink:0 }}>
                      <div style={{ width: BADGE_W, height: BADGE_W, borderRadius: 10, background: "#F3F4F6", border: "1px solid #E5E7EB", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                        <img src={src} alt="" style={{ width: "85%", height: "85%", objectFit: "contain" }} onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}/>
                      </div>
                      {i === 0 && <div style={{ position:"absolute", top:-7, right:-7, zIndex:10, pointerEvents:"none" }}><ElitaBadge small /></div>}
                    </div>
                  ))}
                  <ExtraBadge count={4} size={BADGE_W} onClick={() => badgesRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })} />
                </div>
              </div>
            </div>

            {/* ── Segment toggle: График подготовки / Сводка замеров ── */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
              <div style={{ display: "flex", border: "1px solid #E5E7EB", borderRadius: 10, overflow: "hidden" }}>
                <button onClick={() => setOverviewTab("chart")} style={segBtn(overviewTab === "chart")}>
                  График подготовки
                </button>
                <button onClick={() => setOverviewTab("measures")} style={segBtn(overviewTab === "measures", true)}>
                  Сводка замеров
                </button>
              </div>
              {overviewTab === "chart" && activeSection === "all" && <DD label="31.04 – 12.05"/>}
            </div>
          </div>

          {/* ── Chart tab ── */}
          {overviewTab === "chart" && (
            <div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", padding: "0 28px 16px", borderBottom: "1px solid #F0F0F0" }}>
                {SECTION_TABS.map(({ key, label, color, bg, border }) => (
                  <button
                    key={key}
                    className="mp-tab-btn"
                    onClick={() => setActiveSection(key)}
                    style={{
                      padding: "8px 18px", borderRadius: 8, cursor: "pointer",
                      border: `1.5px solid ${activeSection === key ? color : border}`,
                      background: activeSection === key ? bg : "#fff",
                      color: activeSection === key ? color : "#374151",
                      fontSize: 13, fontWeight: activeSection === key ? 700 : 400,
                      display: "flex", alignItems: "center", gap: 7,
                    }}
                  >
                    {key !== "all" && (
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: activeSection === key ? color : border, display: "inline-block", flexShrink: 0 }}/>
                    )}
                    {label}
                  </button>
                ))}
              </div>

              {activeSection === "all" && (
                <div className="mp-section-fade" style={{ display: "flex", gap: 20, padding: "20px 28px 24px", flexWrap: isMobile ? "wrap" : "nowrap" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <RadarChartRC data={[
                      { label: "Физическая",  value: 3.6, color: "#10B981", max: 5 },
                      { label: "Тактическая", value: 4.1, color: "#375DFB", max: 5 },
                      { label: "Командирская",value: 2.8, color: "#F59E0B", max: 5 },
                      { label: "Инструктор.", value: 4.5, color: "#A78BFA", max: 5 },
                      { label: "Интеллект.",  value: 3.2, color: "#06B6D4", max: 5 },
                    ]}/>
                      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center", marginTop: 4 }}>
                      {[
                        { c: "#10B981", l: "Физическая", v: "3.6" },
                        { c: "#375DFB", l: "Тактическая", v: "4.1" },
                        { c: "#F59E0B", l: "Командирская", v: "2.8" },
                        { c: "#A78BFA", l: "Инструктор.", v: "4.5" },
                        { c: "#06B6D4", l: "Интеллект.", v: "3.2" },
                      ].map(d => (
                        <span key={d.l} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#6B7280" }}>
                          <span style={{ width: 10, height: 10, borderRadius: "50%", background: d.c, display: "inline-block" }}/>
                          {d.l}: <strong style={{ color: "#111" }}>{d.v}</strong>
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
                      {[
                        { icon: <IcPeople size={15}/>, label: "Общий рейтинг",     delta: "+12", up: true,  val: "991" },
                        { icon: <IcCity size={15}/>,   label: "По городу",          delta: "+2",  up: true,  val: "34"  },
                        { icon: <IcGroup size={15}/>,  label: "В группе КМБ-77-41", delta: "-1",  up: false, val: "2"   },
                      ].map((r, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 20px", borderBottom: "1px solid #F5F5F7" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ color: "#C4C9D4" }}>{r.icon}</span><span style={{ fontSize: 13, color: "#374151" }}>{r.label}</span></div>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <Delta value={r.delta} up={r.up}/>
                            <span style={{ fontSize: 14, fontWeight: 700, color: "#111" }}>{r.val}</span>
                          </div>
                        </div>
                      ))}
                      <div style={{ padding: "12px 20px 6px", fontSize: 14, fontWeight: 700, color: "#374151", borderTop: "1px solid #F0F0F0" }}>Подготовка</div>
                      {[
                        { icon: <IcRun size={16} color="#10B981"/>,    label: "Физическая",     delta: "0,32", up: true,  val: "3,55" },
                        { icon: <IcTactic size={16} color="#375DFB"/>, label: "Тактическая",    delta: "0,55", up: false, val: "4,09" },
                        { icon: <IcCmd size={16} color="#F59E0B"/>,    label: "Командирская",   delta: "0,44", up: true,  val: "2,75" },
                        { icon: <IcInstr size={16} color="#A78BFA"/>,  label: "Инструкторская", delta: "0,12", up: false, val: "4,55" },
                      ].map((r, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 20px", borderBottom: i < 3 ? "1px solid #F5F5F7" : "none" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>{r.icon}<span style={{ fontSize: 13, color: "#374151" }}>{r.label}</span></div>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <Delta value={r.delta} up={r.up}/>
                            <span style={{ fontSize: 15, fontWeight: 700, color: "#111" }}>{r.val}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeSection !== "all" && (
                <div style={{ padding: "20px 28px 24px" }}>
                  <SectionContent
                    key={activeSection}
                    sectionKey={activeSection as EditableSectionKey}
                    isMobile={isMobile}
                    series={seriesData[activeSection as EditableSectionKey]}
                    onSeriesChange={s => setSeriesData(p => ({ ...p, [activeSection]: s }))}
                  />
                </div>
              )}
            </div>
          )}

          {/* ── Measures tab ── */}
          {overviewTab === "measures" && (
            <div style={{ padding: "20px 28px 24px" }}>
              <div style={{ display: "inline-flex", background: "#F3F4F6", borderRadius: 10, padding: 2, marginBottom: 18, gap: 0 }}>
                {SEG_BTNS.map(([v, label], i) => (
                  <button key={v} onClick={() => setMeasuresView(v as SectionView)} style={segBtn(measuresView === v, i === SEG_BTNS.length - 1)}>{label}</button>
                ))}
              </div>
              {measuresView === "chart" && (
                <div style={{ minHeight: 200, display: "flex", alignItems: "center", justifyContent: "center", color: "#9CA3AF", fontSize: 14 }}>
                  Выберите раздел в «График подготовки» для просмотра графика
                </div>
              )}
              {measuresView === "edit" && (
                <div style={{ minHeight: 200, display: "flex", alignItems: "center", justifyContent: "center", color: "#9CA3AF", fontSize: 14 }}>
                  Выберите раздел в «График подготовки» для редактирования
                </div>
              )}
              {measuresView === "history" && (
                <div style={{ overflowX: "auto" }}>
                  <MeasurementsPanel />
                </div>
              )}
            </div>
          )}
        </div>

        </>
        )}

        {/* ══ БАННЕР «ТРЕНИРУЙСЯ» ══ */}
        <div style={{ background: "conic-gradient(from 242.85deg at 60.57% 63.68%, #7AA2D1 -88.18deg, #0A072A 52.22deg, #7AA2D1 271.82deg, #0A072A 412.22deg)", borderRadius: 16, padding: "22px 32px", marginBottom: 16, display: "flex", alignItems: "center", gap: 24, overflow: "hidden", position: "relative" }}>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: "#fff", margin: "0 0 8px" }}>Тренируйся, Заполняй, Побеждай!</h2>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,.8)", margin: 0 }}>Введи свои тренировочные показатели и соревнуйся с друзьями и<br/>коллегами. Получай скидки на курсы и бонусы за достижения.</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexShrink: 0 }}>
            <div style={{ width: 120, height: 110, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
              <img src="/cubock.png" alt="" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", objectPosition: "bottom" }} onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}/>
            </div>
            <button onClick={() => { setOverviewTab("measures"); setPersonalTab("График подготовки"); document.getElementById("my-path-personal-file")?.scrollIntoView({ behavior: "smooth", block: "start" }); }} style={{ flexShrink: 0, background: "#375DFB", border: "none", borderRadius: 8, padding: "13px 28px", color: "#fff", fontSize: 15, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}
              onMouseEnter={e => (e.currentTarget.style.background = "#1E3F9F")} onMouseLeave={e => (e.currentTarget.style.background = "#375DFB")}>
              К показателям
            </button>
          </div>
        </div>

        {/* ══ DONUT + СОРЕВНОВАНИЯ ══ */}
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16, marginBottom: 16 }}>
          <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #E5E7EB" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "18px 24px", borderBottom: "1px solid #F0F0F0", flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                <span style={{ fontSize: 20, fontWeight: 700, color: "#111" }}>Упор на тренировки</span>
              </div>
              <div style={{ display: "inline-flex", background: "#F3F4F6", borderRadius: 10, padding: 2 }}>
                <button onClick={() => setUporView("chart")} style={segBtn(uporView === "chart")}>График</button>
                <button onClick={() => setUporView("edit")} style={segBtn(uporView === "edit", true)}>Редактировать</button>
              </div>
            </div>
            <div style={{ padding: "20px 24px" }}>
              <div style={{ marginTop: 0 }}>
                {uporView === "chart" && (
                  <>
                    <AreaChartRC series={uporSeries} labels={UPOR_LABELS} yMax={6} height="200px" />
                    <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 10 }}>
                      {UPOR_LEGEND.map(x => (
                        <span key={x.l} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#6B7280" }}>
                          <span style={{ width: 10, height: 10, borderRadius: "50%", background: x.c, display: "inline-block" }}/>{x.l}
                        </span>
                      ))}
                    </div>
                  </>
                )}
                {uporView === "edit" && (
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 13 }}>
                      <thead>
                        <tr>
                          <th style={{ textAlign: "left", padding: "6px 10px", color: "#6B7280", fontWeight: 500, borderBottom: "1px solid #E5E7EB" }}>Нагрузка (ч)</th>
                          {UPOR_LABELS.map(l => (
                            <th key={l} style={{ textAlign: "center", padding: "6px 10px", color: "#6B7280", fontWeight: 500, borderBottom: "1px solid #E5E7EB" }}>{l}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {uporSeries.map((s, si) => (
                          <tr key={si}>
                            <td style={{ padding: "6px 10px", borderBottom: "1px solid #F3F4F6" }}>
                              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <span style={{ width: 10, height: 10, borderRadius: "50%", background: s.color, flexShrink: 0, display: "inline-block" }}/>
                                <span style={{ color: "#374151" }}>{UPOR_LEGEND[si].l}</span>
                              </span>
                            </td>
                            {s.data.map((v, di) => (
                              <td key={di} style={{ padding: "4px 6px", borderBottom: "1px solid #F3F4F6" }}>
                                <input
                                  type="number" step="0.5" defaultValue={v}
                                  onBlur={e => {
                                    const n = parseFloat(e.target.value.replace(",", "."));
                                    if (isNaN(n)) return;
                                    setUporSeries(prev => prev.map((row, ri) =>
                                      ri === si ? { ...row, data: row.data.map((val, vi) => vi === di ? n : val) } : row
                                    ));
                                  }}
                                  onChange={e => {
                                    const n = parseFloat(e.target.value.replace(",", "."));
                                    if (isNaN(n)) return;
                                    setUporSeries(prev => prev.map((row, ri) =>
                                      ri === si ? { ...row, data: row.data.map((val, vi) => vi === di ? n : val) } : row
                                    ));
                                  }}
                                  style={{ width: 56, padding: "4px 6px", border: "1px solid #E5E7EB", borderRadius: 6, fontSize: 13, textAlign: "center", outline: "none" }}
                                />
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div style={{ marginTop: 16 }}>
                      <AreaChartRC series={uporSeries} labels={UPOR_LABELS} yMax={6} height="180px" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #E5E7EB" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px", borderBottom: "1px solid #F0F0F0" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <IcCmd size={22}/>
                <span style={{ fontSize: 20, fontWeight: 700, color: "#111" }}>Соревнования</span>
              </div>
              <div style={{ display: "flex", border: "1px solid #E5E7EB", borderRadius: 8, overflow: "hidden" }}>
                {["Прошли", "Ожидаются"].map((t, i) => (
                  <button key={t} onClick={() => setCompTab(i === 0 ? "past" : "upcoming")} style={{ padding: "6px 14px", border: "none", fontSize: 13, fontWeight: 500, cursor: "pointer", background: compTab === (i === 0 ? "past" : "upcoming") ? "#fff" : "transparent", color: compTab === (i === 0 ? "past" : "upcoming") ? "#111" : "#6B7280", borderRight: i === 0 ? "1px solid #E5E7EB" : "none", boxShadow: compTab === (i === 0 ? "past" : "upcoming") ? "0 1px 4px rgba(0,0,0,.08)" : "none", margin: compTab === (i === 0 ? "past" : "upcoming") ? "2px" : "0", borderRadius: compTab === (i === 0 ? "past" : "upcoming") ? "6px" : "0" }}>{t}</button>
                ))}
              </div>
            </div>
            <div className="mp-competition-scroll" style={{ padding: "8px 6px 8px 0", maxHeight: 430, minHeight: 400, overflowY: "auto" }}>
              {visibleCompetitions.map((c, i) => (
                <div className="mp-competition-row" key={c.id} onClick={() => navigate(`/competitions?competition=${c.id}`)} style={{ padding: "14px 18px 14px 24px", borderBottom: i < visibleCompetitions.length - 1 ? "1px solid #F0F0F0" : "none", cursor: "pointer", transition: "background .16s ease" }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "#111", marginBottom: 10 }}>{c.name}</div>
                  <div style={{ display: "flex", gap: 14 }}>
                    <div style={{ width: 80, height: 80, borderRadius: 12, overflow: "hidden", flexShrink: 0, background: "#F3F4F6" }}>
                      {!imgErrs[`comp${c.id}`]
                        ? <img src={c.img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={() => setErr(`comp${c.id}`)}/>
                        : <div style={{ width: "100%", height: "100%", background: "#EBF1FF" }}/>}
                    </div>
                    <div style={{ flex: 1 }}>
                      {[{ l: compTab === "past" ? "Результат" : "Формат", v: c.place }, { l: compTab === "past" ? "Проводился" : "Пройдёт", v: c.location }, { l: "Дата проведения", v: c.date }].map(r => (
                        <div key={r.l} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: 13 }}>
                          <span style={{ color: "#9CA3AF" }}>{r.l}</span>
                          <span style={{ color: "#111", fontWeight: 500, textAlign: "right", maxWidth: 200 }}>{r.v}</span>
                        </div>
                      ))}
                      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 6 }}>
                        <button onClick={e => { e.stopPropagation(); navigate(`/competitions?competition=${c.id}`); }} style={{ border: 0, background: "transparent", color: "#375DFB", fontSize: 12, fontWeight: 700, cursor: "pointer", padding: 0 }}>Подробнее →</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ══ БАННЕР «СЛЕДУЙ ЗА ЛИДЕРАМИ» ══ */}
        <div style={{ background: "conic-gradient(from 242.85deg at 60.57% 63.68%, #7AA2D1 -88.18deg, #0A072A 52.22deg, #7AA2D1 271.82deg, #0A072A 412.22deg)", borderRadius: 16, padding: "22px 32px", marginBottom: 16, display: "flex", alignItems: "center", gap: 24 }}>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: "#fff", margin: "0 0 8px" }}>Следуй за Лидерами – Стань Лидером!</h2>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,.8)", margin: 0 }}>Стань лидером и командиром своего подразделения,<br/>вдохновляй других!</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexShrink: 0 }}>
            <div style={{ width: 110, height: 100, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
              <img src="/медаль2.png" alt="" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", objectPosition: "bottom" }} onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}/>
            </div>
            <button onClick={() => navigate("/courses")} style={{ flexShrink: 0, background: "#375DFB", border: "none", borderRadius: 8, padding: "13px 28px", color: "#fff", fontSize: 15, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}
              onMouseEnter={e => (e.currentTarget.style.background = "#1E3F9F")} onMouseLeave={e => (e.currentTarget.style.background = "#375DFB")}>
              Выбрать курс
            </button>
          </div>
        </div>

        {/* ══ СПОРТИВНЫЕ + ДРУГИЕ ДОСТИЖЕНИЯ ══ */}
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16, marginBottom: 16 }}>
          {[{ title: "Спортивные достижения", items: SPORT_ACH }, { title: "Другие достижения", items: OTHER_ACH }].map(sec => (
            <div key={sec.title} style={{ background: "#fff", borderRadius: 16, border: "1px solid #E5E7EB" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px", borderBottom: "1px solid #F0F0F0" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <IcAward size={20}/>
                  <span style={{ fontSize: 18, fontWeight: 700, color: "#111" }}>{sec.title}</span>
                </div>
                <button onClick={() => navigate("/achievements")} style={{ width: 32, height: 32, background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: 8, fontSize: 20, color: "#374151", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
              </div>
              {sec.items.map((it, i) => (
                <div key={it.id} onClick={() => navigate(`/achievements?achievement=${sec.title === "Спортивные достижения" ? 20 + it.id : 39 + it.id}`)} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 24px", borderBottom: i < sec.items.length - 1 ? "1px solid #F0F0F0" : "none", cursor: "pointer" }}>
                  <div style={{ width: 80, height: 80, borderRadius: 12, overflow: "hidden", flexShrink: 0, background: "#F3F4F6", border: "1px solid #E5E7EB" }}>
                    {!imgErrs[`ach${i}${sec.title}`]
                      ? <img src={it.img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={() => setErr(`ach${i}${sec.title}`)}/>
                      : <div style={{ width: "100%", height: "100%", background: "#EBF1FF" }}/>}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: "#111", marginBottom: 3 }}>{it.name}</div>
                    <div style={{ fontSize: 12, color: "#6B7280", lineHeight: 1.4 }}>{it.info}</div>
                  </div>
                  <button onClick={e => { e.stopPropagation(); navigate(`/achievements?achievement=${sec.title === "Спортивные достижения" ? 20 + it.id : 39 + it.id}`); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#9CA3AF", padding: 4 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* ══ БАННЕР «ЗАСЛУЖИ НАГРАДЫ» ══ */}
        <div style={{ background: "conic-gradient(from 244.18deg at 68.28% 59.32%, #2A8665 -88.18deg, #072A21 52.22deg, #2A8665 271.82deg, #072A21 412.22deg)", borderRadius: 16, padding: "22px 32px", marginBottom: 16, display: "flex", alignItems: "center", gap: 24 }}>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: "#fff", margin: "0 0 8px" }}>Заслужи Награды за Свои Достижения!</h2>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,.8)", margin: 0 }}>Заполняй данные о достижениях и наградах и получай подарки<br/>и скидки на экипировку. Стань лучшим в своём городе!</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexShrink: 0 }}>
            <div style={{ width: 120, height: 110, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
              <img src="/gift.png" alt="" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", objectPosition: "bottom" }} onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}/>
            </div>
            <button onClick={() => navigate("/achievements")} style={{ flexShrink: 0, background: "#2D9F75", border: "none", borderRadius: 8, padding: "13px 28px", color: "#fff", fontSize: 15, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}
              onMouseEnter={e => (e.currentTarget.style.background = "#1e7a58")} onMouseLeave={e => (e.currentTarget.style.background = "#2D9F75")}>
              Указать достижения
            </button>
          </div>
        </div>

        {/* ══ ЗНАКИ ОТЛИЧИЯ И РАЗЛИЧИЯ ══ */}
        <div id="znaki-section" ref={badgesRef} style={{ background: "#fff", borderRadius: 16, border: "1px solid #E5E7EB", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "18px 28px", borderBottom: "1px solid #F0F0F0" }}>
            <IcCmd size={22}/>
            <span style={{ fontSize: 20, fontWeight: 700, color: "#111" }}>Знаки отличия и различия</span>
            <button className="voevoda-view-all" onClick={() => navigate("/achievements")} style={{ marginLeft: "auto", border: "1px solid #C7D2FE", background: "#EEF3FF", color: "#375DFB", borderRadius: 9, padding: "7px 13px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Все достижения</button>
          </div>
          <div style={{ padding: "20px 28px 28px" }}>
            {[
              { label: "Погон",          items: POGONS },
              { label: "Шеврон",         items: SHEVRONS },
              { label: "Берет",          items: BERETS },
              { label: "Знаки",          items: ZNAKI },
              { label: "Остальные знаки",items: OTHER_ZNAKI },
            ].map(section => (
              <div key={section.label} style={{ marginBottom: section.label === "Остальные знаки" ? 0 : 28 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: "#374151", marginBottom: 14 }}>{section.label}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                  {section.items.map((b, i) => (
                    <TooltipBadge key={i} src={b.src} active={b.active} elita={(b as any).elita} tooltip={DEFAULT_TOOLTIP} onClick={() => navigate(`/achievements?achievement=${b.achievementId}`)}/>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ══ ДИПЛОМЫ ОТ УТЦ ВОЕВОДА ══ */}
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #E5E7EB", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "18px 28px", borderBottom: "1px solid #F0F0F0" }}>
            <IcDiploma size={22}/>
            <span style={{ fontSize: 20, fontWeight: 700, color: "#111" }}>Дипломы от УТЦ Воевода</span>
          </div>
          <div style={{ padding: "0 28px 8px" }}>
            {DIPLOMAS.map((d, i) => (
              <div
                key={d.id}
                className="mp-dip-card"
                onClick={() => openDip(i)}
                style={{ display: "flex", alignItems: "flex-start", gap: 20, padding: "20px 0", borderBottom: i < DIPLOMAS.length - 1 ? "1px solid #F0F0F0" : "none", cursor: "pointer", borderRadius: 12, transition: "background .15s" }}
                onMouseEnter={e => (e.currentTarget.style.background = "#F8FAFF")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                <div style={{ width: 105, height: 148, borderRadius: 12, overflow: "hidden", flexShrink: 0, background: "#F3F4F6", border: "1px solid #E5E7EB" }}>
                  {!imgErrs[`dip${d.id}`]
                    ? <img src={d.img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform .2s" }} onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.04)")} onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")} onError={() => setErr(`dip${d.id}`)}/>
                    : <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg,#DBEAFE,#EDE9FE)" }}/>}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#111", marginBottom: 6 }}>{d.title}</div>
                  <div style={{ fontSize: 13, color: "#6B7280", marginBottom: 16, lineHeight: 1.5 }}>{d.desc}</div>
                  <div style={{ display: "flex", gap: 10 }}>
                    {d.badges.map((src, j) => (
                      <div key={j} className="mp-dip-badge" style={{ width: 52, height: 52, borderRadius: 10, overflow: "hidden", border: "1px solid #E5E7EB", background: "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <img src={src} alt="" style={{ width: "80%", height: "80%", objectFit: "contain" }} onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}/>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                  <span style={{ fontSize: 13, color: "#9CA3AF", whiteSpace: "nowrap" }}>Дата получения {d.date}</span>
                  <button onClick={e => { e.stopPropagation(); openDip(i); }} className="mp-dip-open" style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 13px", borderRadius: 9, border: "1px solid #C7D2FE", background: "linear-gradient(135deg,#F4F7FF,#E8EEFF)", color: "#2F52F0", fontSize: 12, fontWeight: 700, cursor: "pointer", boxShadow: "0 5px 14px rgba(55,93,251,.12)" }}>
                    Смотреть
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 16, borderTop: "1px solid #E5E7EB", flexWrap: "wrap", gap: 12 }}>
          <span style={{ fontSize: 14, color: "#9CA3AF" }}>© 2015–2026 УТЦ «ВОЕВОДА»</span>
          <VoevodaSocialLinks size={42} gap={10}/>
        </div>
      </div>

      {/* ══ МОДАЛ ДИПЛОМА ══ */}
      {dipModal && dipIndex !== null && (
        <div
          onClick={closeDip}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.82)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10000, padding: 20, animation: "mpFadeIn .18s ease" }}
        >
          <button onClick={e => { e.stopPropagation(); prevDip(); }} className="mp-dip-nav-btn" style={{ position: "absolute", left: 24, top: "50%", transform: "translateY(-50%)", width: 48, height: 48, borderRadius: "50%", background: "rgba(255,255,255,.1)", border: "1px solid rgba(255,255,255,.2)", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10001, backdropFilter: "blur(4px)" }} aria-label="Предыдущий диплом">
            <IcArrow dir="left"/>
          </button>
          <button onClick={e => { e.stopPropagation(); nextDip(); }} className="mp-dip-nav-btn" style={{ position: "absolute", right: 24, top: "50%", transform: "translateY(-50%)", width: 48, height: 48, borderRadius: "50%", background: "rgba(255,255,255,.1)", border: "1px solid rgba(255,255,255,.2)", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10001, backdropFilter: "blur(4px)" }} aria-label="Следующий диплом">
            <IcArrow dir="right"/>
          </button>
          <div onClick={e => e.stopPropagation()} style={{ maxWidth: 700, width: "100%", background: "#fff", borderRadius: 20, overflow: "hidden", boxShadow: "0 24px 60px rgba(0,0,0,.4)", animation: "mpFadeIn .2s ease both" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px", borderBottom: "1px solid #F0F0F0" }}>
              <div style={{ flex: 1, marginRight: 16 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#111", marginBottom: 2 }}>{dipModal.title}</div>
                <div style={{ fontSize: 12, color: "#9CA3AF" }}>Дата получения {dipModal.date}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                <div style={{ display: "flex", gap: 6 }}>
                  {DIPLOMAS.map((_, i) => (
                    <button key={i} onClick={() => setDipIndex(i)} style={{ width: i === dipIndex ? 20 : 8, height: 8, borderRadius: 4, background: i === dipIndex ? "#375DFB" : "#E5E7EB", border: "none", cursor: "pointer", padding: 0, transition: "all .2s" }} aria-label={`Диплом ${i + 1}`}/>
                  ))}
                </div>
                <span style={{ fontSize: 12, color: "#9CA3AF", minWidth: 36, textAlign: "center" }}>{dipIndex + 1} / {DIPLOMAS.length}</span>
                <button onClick={closeDip} style={{ background: "#F3F4F6", border: "none", width: 32, height: 32, borderRadius: 8, cursor: "pointer", fontSize: 18, color: "#6B7280", display: "flex", alignItems: "center", justifyContent: "center" }} onMouseEnter={e => (e.currentTarget.style.background = "#E5E7EB")} onMouseLeave={e => (e.currentTarget.style.background = "#F3F4F6")}>×</button>
              </div>
            </div>
            <div style={{ background: "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", minHeight: 300, position: "relative" }}>
              <img src={dipModal.img} alt="" style={{ width: "100%", maxHeight: "62vh", objectFit: "contain", display: "block" }} onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}/>
              <div className="voevoda-slider-panel">
                {DIPLOMAS.map((_, i) => (
                  <button key={i} className={`voevoda-slider-dot${i === dipIndex ? " is-active" : ""}`} onClick={() => setDipIndex(i)} aria-label={`Диплом ${i + 1}`}/>
                ))}
              </div>
            </div>
            <div style={{ padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #F0F0F0" }}>
              <div style={{ display: "flex", gap: 10 }}>
                {dipModal.badges.map((src, i) => (
                  <div key={i} style={{ width: 44, height: 44, borderRadius: 9, background: "#F3F4F6", border: "1px solid #E5E7EB", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                    <img src={src} alt="" style={{ width: "70%", height: "70%", objectFit: "contain" }} onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}/>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={e => { e.stopPropagation(); prevDip(); }} style={{ display: "flex", alignItems: "center", gap: 6, background: "#F3F4F6", border: "none", borderRadius: 10, padding: "10px 16px", color: "#374151", fontSize: 13, cursor: "pointer", transition: "background .15s" }} onMouseEnter={e => (e.currentTarget.style.background = "#E5E7EB")} onMouseLeave={e => (e.currentTarget.style.background = "#F3F4F6")}><IcArrow dir="left"/> Пред.</button>
                <button onClick={e => {
                  e.stopPropagation();
                  const extension = dipModal.img.split(".").pop()?.split("?")[0] || "png";
                  const a = document.createElement("a");
                  a.href = dipModal.img;
                  a.download = `diplom-${dipModal.id}.${extension}`;
                  document.body.appendChild(a);
                  a.click();
                  a.remove();
                }} style={{ background: "#375DFB", border: "none", borderRadius: 10, padding: "10px 20px", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "opacity .15s" }} onMouseEnter={e => (e.currentTarget.style.opacity = ".85")} onMouseLeave={e => (e.currentTarget.style.opacity = "1")}>Скачать</button>
                <button onClick={e => { e.stopPropagation(); nextDip(); }} style={{ display: "flex", alignItems: "center", gap: 6, background: "#F3F4F6", border: "none", borderRadius: 10, padding: "10px 16px", color: "#374151", fontSize: 13, cursor: "pointer", transition: "background .15s" }} onMouseEnter={e => (e.currentTarget.style.background = "#E5E7EB")} onMouseLeave={e => (e.currentTarget.style.background = "#F3F4F6")}>След. <IcArrow dir="right"/></button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
