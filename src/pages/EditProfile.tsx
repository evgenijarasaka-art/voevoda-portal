import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useCallback, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import apiClient from "../api/client";

/* ─── Schema ─── */
const schema = z.object({
  first_name: z.string().min(2, "Минимум 2 символа"),
  last_name: z.string().min(1, "Обязательное поле"),
  patronymic: z.string().optional(),
  callsign: z.string().optional(),
  phone: z.string().min(10, "Обязательное поле"),
  email: z.string().email("Неверный формат").or(z.literal("")).optional(),
  gender: z.enum(["male", "female", ""]).optional(),
  birth_year: z.number().min(1950).max(2010).nullable().optional(),
  city: z.string().optional(),
  rank: z.string().optional(),
  position: z.string().optional(),
  unit: z.string().optional(),
  about: z.string().max(500).optional(),
});
type F = z.infer<typeof schema>;

/* ─── Completion ─── */
const ALL_FIELDS: (keyof F)[] = ["first_name","last_name","patronymic","callsign","phone","email","gender","birth_year","city","rank","position","unit","about"];
const SECTION_FIELDS: Record<number, (keyof F)[]> = {
  0: ["first_name","last_name","patronymic","callsign","birth_year","gender","city"],
  1: ["rank","position","unit"],
  2: ["phone","email","about"],
};
function pct(v: Partial<F>, keys = ALL_FIELDS) {
  const n = keys.filter(k => { const x = v[k]; return x !== undefined && x !== null && x !== "" && !Number.isNaN(x as number); }).length;
  return Math.round((n / keys.length) * 100);
}

const CITIES = ["Москва","Санкт-Петербург","Казань","Екатеринбург","Новосибирск","Краснодар","Ростов-на-Дону","Воронеж","Саратов","Самара"];
const RANKS  = ["Рядовой","Ефрейтор","Мл. сержант","Сержант","Ст. сержант","Прапорщик","Лейтенант","Ст. лейтенант","Капитан","Майор","Подполковник","Полковник"];

/* ─── SVG Ring ─── */
function Ring({ value, size = 120, stroke = 5, color = "#375DFB" }: { value: number; size?: number; stroke?: number; color?: string }) {
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (value / 100) * circ;
  return (
    <svg width={size} height={size} style={{ position: "absolute", top: 0, left: 0, transform: "rotate(-90deg)" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#F0F0F0" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        style={{ transition: "stroke-dasharray .7s cubic-bezier(.4,0,.2,1), stroke .4s" }} />
    </svg>
  );
}

/* ─── Input ─── */
function Input({ error, disabled, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { error?: boolean }) {
  const [focus, setFocus] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      {focus && !disabled && <div style={{ position: "absolute", left: 0, top: 4, bottom: 4, width: 3, borderRadius: 3, background: "#375DFB", transition: "all .15s" }} />}
      <input
        {...props}
        disabled={disabled}
        onFocus={e => { setFocus(true); props.onFocus?.(e); }}
        onBlur={e => { setFocus(false); props.onBlur?.(e); }}
        style={{
          width: "100%", boxSizing: "border-box",
          padding: focus ? "10px 14px 10px 18px" : "10px 14px",
          border: `1.5px solid ${error ? "#EF4444" : focus ? "#375DFB" : "#E5E7EB"}`,
          borderRadius: 10, fontSize: 14,
          color: disabled ? "#9CA3AF" : "#111",
          background: disabled ? "#F9FAFB" : focus ? "#FAFBFF" : "#fff",
          outline: "none", fontFamily: "inherit",
          transition: "all .15s",
          boxShadow: focus ? "0 0 0 3px rgba(55,93,251,.08)" : "none",
          cursor: disabled ? "not-allowed" : "auto",
          appearance: "none", WebkitAppearance: "none",
          ...props.style,
        }}
      />
    </div>
  );
}

function Select({ error, disabled, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { error?: boolean }) {
  const [focus, setFocus] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      {focus && !disabled && <div style={{ position: "absolute", left: 0, top: 4, bottom: 4, width: 3, borderRadius: 3, background: "#375DFB" }} />}
      <select {...props} disabled={disabled}
        onFocus={e => { setFocus(true); props.onFocus?.(e as React.FocusEvent<HTMLSelectElement>); }}
        onBlur={e => { setFocus(false); props.onBlur?.(e as React.FocusEvent<HTMLSelectElement>); }}
        style={{
          width: "100%", boxSizing: "border-box",
          padding: focus ? "10px 14px 10px 18px" : "10px 14px",
          border: `1.5px solid ${error ? "#EF4444" : focus ? "#375DFB" : "#E5E7EB"}`,
          borderRadius: 10, fontSize: 14,
          color: props.value === "" || disabled ? "#9CA3AF" : "#111",
          background: disabled ? "#F9FAFB" : focus ? "#FAFBFF" : "#fff",
          outline: "none", fontFamily: "inherit",
          transition: "all .15s", cursor: disabled ? "not-allowed" : "pointer",
          boxShadow: focus ? "0 0 0 3px rgba(55,93,251,.08)" : "none",
          appearance: "none", WebkitAppearance: "none",
        }}>
        {children}
      </select>
      <svg style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
    </div>
  );
}

/* ─── Field wrapper ─── */
function Field({ label, error, required, hint, span2, children }: { label: string; error?: string; required?: boolean; hint?: string; span2?: boolean; children: React.ReactNode }) {
  return (
    <div style={span2 ? { gridColumn: "1 / -1" } : {}}>
      <label style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, color: "#4B5563", marginBottom: 6, letterSpacing: ".2px" }}>
        {label}{required && <span style={{ color: "#EF4444" }}>*</span>}
        {hint && <span style={{ color: "#9CA3AF", fontWeight: 400 }}>{hint}</span>}
      </label>
      {children}
      {error && (
        <p style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#EF4444", marginTop: 5, animation: "epShake .3s ease" }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          {error}
        </p>
      )}
    </div>
  );
}

/* ─── Section card ─── */
function Section({ num, icon, title, subtitle, pctVal, children, animDelay }: {
  num: string; icon: React.ReactNode; title: string; subtitle: string; pctVal: number; children: React.ReactNode; animDelay: string;
}) {
  const done = pctVal === 100;
  return (
    <div style={{ background: "#fff", borderRadius: 18, border: "1px solid #E5E7EB", overflow: "hidden", animation: `epFadeUp .45s ease ${animDelay} both`, boxShadow: "0 1px 3px rgba(0,0,0,.04)" }}>
      <div style={{ padding: "20px 26px 0", display: "flex", alignItems: "center", gap: 14, borderBottom: "1px solid #F5F5F7", paddingBottom: 18, marginBottom: 22 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: done ? "#ECFDF5" : "#EBF1FF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: done ? "#10B981" : "#375DFB", transition: "all .3s" }}>
          {done
            ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            : icon}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#111", display: "flex", alignItems: "center", gap: 8 }}>
            {title}
            <span style={{ fontSize: 11, fontWeight: 600, background: done ? "#ECFDF5" : "#F4F5F8", color: done ? "#10B981" : "#6B7280", padding: "2px 8px", borderRadius: 20, border: `1px solid ${done ? "#A7F3D0" : "#E5E7EB"}`, transition: "all .3s" }}>
              {pctVal}%
            </span>
          </div>
          <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 2 }}>{subtitle}</div>
        </div>
        <span style={{ fontSize: 22, fontWeight: 800, color: "#F0F0F0", fontVariantNumeric: "tabular-nums" }}>{num}</span>
      </div>
      <div style={{ padding: "0 26px 24px" }}>{children}</div>
    </div>
  );
}

/* ─── Save Button ─── */
function SaveButton({ pending, disabled }: { pending: boolean; disabled: boolean }) {
  const isDisabled = pending || disabled;
  return (
    <button type="submit" disabled={isDisabled}
      style={{
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        padding: "12px 32px", borderRadius: 12, border: "none",
        background: isDisabled ? "#E5E7EB" : "linear-gradient(135deg, #375DFB 0%, #2240D9 100%)",
        color: isDisabled ? "#9CA3AF" : "#fff",
        fontSize: 14, fontWeight: 600, cursor: isDisabled ? "not-allowed" : "pointer",
        transition: "all .2s", minWidth: 200,
        boxShadow: isDisabled ? "none" : "0 4px 16px rgba(55,93,251,.3)",
        transform: isDisabled ? "none" : "translateY(0)",
      }}
      onMouseEnter={e => { if (!isDisabled) { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(55,93,251,.4)"; } }}
      onMouseLeave={e => { if (!isDisabled) { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(55,93,251,.3)"; } }}
    >
      {pending ? (
        <><span style={{ width: 15, height: 15, borderRadius: "50%", border: "2.5px solid rgba(255,255,255,.3)", borderTopColor: "#fff", animation: "epSpin .6s linear infinite", display: "block" }} />Сохранение...</>
      ) : (
        <><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>Сохранить изменения</>
      )}
    </button>
  );
}

/* ─── Live Preview Card ─── */
function ProfilePreview({ values, avatar }: { values: Partial<F>; avatar: string | null }) {
  const name = [values.last_name, values.first_name, values.patronymic].filter(Boolean).join(" ") || "Иванов Иван";
  const callsign = values.callsign || "позывной";
  const city = values.city || "Город";
  const rank = values.rank || "";
  return (
    <div style={{ borderRadius: 16, overflow: "hidden", border: "1px solid #E5E7EB", boxShadow: "0 8px 32px rgba(55,93,251,.1)" }}>
      {/* Card header */}
      <div style={{ background: "linear-gradient(135deg, #1e3a8a 0%, #375DFB 60%, #60a5fa 100%)", padding: "20px 20px 36px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,.06)" }} />
        <div style={{ position: "absolute", bottom: -20, left: -10, width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,.04)" }} />
        <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,.5)", letterSpacing: 3, marginBottom: 14, textTransform: "uppercase" }}>УТЦ «Воевода» · Портал</div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 52, height: 52, borderRadius: "50%", border: "2.5px solid rgba(255,255,255,.4)", overflow: "hidden", background: "rgba(255,255,255,.1)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {avatar
              ? <img src={avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.5)" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", lineHeight: 1.2, transition: "all .2s" }}>{name}</div>
            {rank && <div style={{ fontSize: 11, color: "rgba(255,255,255,.7)", marginTop: 2 }}>{rank}</div>}
          </div>
        </div>
      </div>
      {/* Card body */}
      <div style={{ background: "#fff", padding: "14px 20px 16px", marginTop: -1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
          <span style={{ background: "#EBF1FF", color: "#375DFB", fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 20 }}>@{callsign}</span>
          {city !== "Город" && <span style={{ fontSize: 11, color: "#9CA3AF" }}>{city}</span>}
        </div>
        <div style={{ fontSize: 11, color: "#9CA3AF", lineHeight: 1.6 }}>
          {values.about
            ? <span style={{ color: "#374151" }}>{values.about.slice(0, 80)}{values.about.length > 80 ? "..." : ""}</span>
            : <span style={{ fontStyle: "italic" }}>О себе не указано</span>}
        </div>
        <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px solid #F5F5F7", display: "flex", gap: 14 }}>
          {[["0", "Курсов"],["0", "Наград"],["0", "Подписч."]].map(([v, l]) => (
            <div key={l} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#111" }}>{v}</div>
              <div style={{ fontSize: 10, color: "#9CA3AF" }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Toast ─── */
function Toast({ text, type, show }: { text: string; type: "success" | "error" | "offline"; show: boolean }) {
  const cfg = {
    success: { color: "#10B981", bg: "#ECFDF5", border: "#A7F3D0", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg> },
    error:   { color: "#EF4444", bg: "#FEF2F2", border: "#FCA5A5", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> },
    offline: { color: "#F59E0B", bg: "#FFFBEB", border: "#FDE68A", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2"><path d="M1.05 1l21.95 22M16.72 11.06A10.94 10.94 0 0 1 19 12.55M5 12.55a10.94 10.94 0 0 1 5.17-2.39M10.71 5.05A16 16 0 0 1 22.56 9M1.42 9a15.91 15.91 0 0 1 4.7-2.88M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01"/></svg> },
  }[type];
  return (
    <div style={{ position: "fixed", top: 24, right: 24, zIndex: 9999, background: "#fff", border: `1px solid ${cfg.border}`, borderLeft: `3px solid ${cfg.color}`, borderRadius: 12, padding: "14px 20px", display: "flex", alignItems: "center", gap: 10, boxShadow: "0 8px 30px rgba(0,0,0,.1)", fontSize: 14, fontWeight: 500, color: "#111", pointerEvents: "none", transform: show ? "translateX(0)" : "translateX(calc(100% + 24px))", transition: "transform .4s cubic-bezier(.34,1.56,.64,1)" }}>
      <div style={{ width: 28, height: 28, borderRadius: "50%", background: cfg.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{cfg.icon}</div>
      {text}
    </div>
  );
}

/* ════════════════════════════════════════════════ */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
* { font-family: Inter, system-ui, sans-serif; }
@keyframes epFadeUp  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
@keyframes epSlideR  { from{opacity:0;transform:translateX(24px)} to{opacity:1;transform:translateX(0)} }
@keyframes epSpin    { to{transform:rotate(360deg)} }
@keyframes epPulse   { 0%,100%{opacity:1}50%{opacity:.4} }
@keyframes epShake   { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-4px)} 75%{transform:translateX(4px)} }
@keyframes epPop     { 0%{transform:scale(.9);opacity:0} 60%{transform:scale(1.03)} 100%{transform:scale(1);opacity:1} }
.ep-hero  { animation: epFadeUp .5s ease both; }
.ep-s1    { animation: epFadeUp .45s ease .07s both; }
.ep-s2    { animation: epFadeUp .45s ease .14s both; }
.ep-s3    { animation: epFadeUp .45s ease .21s both; }
.ep-acts  { animation: epFadeUp .45s ease .28s both; }
.ep-r1    { animation: epSlideR .4s ease .06s both; }
.ep-r2    { animation: epSlideR .4s ease .14s both; }
.ep-r3    { animation: epSlideR .4s ease .22s both; }
.ep-r4    { animation: epSlideR .4s ease .30s both; }
.ep-card  { background:#fff; border-radius:18px; border:1px solid #E5E7EB; box-shadow:0 1px 3px rgba(0,0,0,.04); }
`;

export function EditProfile() {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [avatar, setAvatar] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; text: string; type: "success"|"error"|"offline" }>({ show: false, text: "", type: "success" });

  const { register, handleSubmit, reset, watch, control, getValues, formState: { errors, isDirty } } = useForm<F>({
    resolver: zodResolver(schema),
    defaultValues: { gender: "" },
  });
  const vals = watch();
  const totalPct = pct(vals);
  const aboutLen = vals.about?.length ?? 0;
  const ringColor = totalPct >= 80 ? "#10B981" : totalPct >= 50 ? "#F59E0B" : "#375DFB";

  useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      // Restore draft first
      const draft = localStorage.getItem("profile_draft");
      if (draft) {
        try { reset(JSON.parse(draft)); } catch {}
      }
      try {
        const { data } = await apiClient.get<F & { avatar?: string }>("/profile/");
        reset(data);
        if (data.avatar) setAvatar(data.avatar);
        localStorage.removeItem("profile_draft");
        return data;
      } catch {
        // backend offline — keep draft
        return null;
      }
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: F) => {
      const fd = new FormData();
      (Object.entries(data) as [string, unknown][]).forEach(([k, v]) => {
        if (v !== undefined && v !== null) fd.append(k, String(v));
      });
      if (fileRef.current?.files?.[0]) fd.append("avatar", fileRef.current.files[0]);
      return apiClient.patch("/profile/", fd, { headers: { "Content-Type": "multipart/form-data" } });
    },
    onSuccess: () => {
      localStorage.removeItem("profile_draft");
      fire("Профиль успешно обновлён", "success");
      setTimeout(() => navigate("/profile"), 1800);
    },
    onError: (err: unknown) => {
      const isOffline =
        (err as { code?: string })?.code === "ERR_NETWORK" ||
        (err as { message?: string })?.message === "Network Error" ||
        String(err).includes("ERR_CONNECTION_REFUSED");
      if (isOffline) {
        localStorage.setItem("profile_draft", JSON.stringify(getValues()));
        fire("Черновик сохранён — сервер недоступен", "offline");
      } else {
        fire("Ошибка при сохранении", "error");
      }
    },
  });

  const fire = (text: string, type: "success"|"error"|"offline") => {
    setToast({ show: true, text, type });
    setTimeout(() => setToast(t => ({ ...t, show: false })), 3500);
  };

  const onFile = useCallback((file: File) => {
    const r = new FileReader();
    r.onloadend = () => setAvatar(r.result as string);
    r.readAsDataURL(file);
  }, []);

  const grid: React.CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 20px" };

  return (
    <div style={{ marginTop: 60, marginLeft: 56, minHeight: "calc(100vh - 60px)", background: "#F4F5F8" }}>
      <style>{STYLES}</style>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "28px 24px 72px" }}>

        {/* ── Hero banner ── */}
        <div className="ep-hero ep-card" style={{ marginBottom: 18, overflow: "hidden", position: "relative" }}>
          {/* Gradient mesh background */}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, #EBF1FF 0%, #F0F7FF 40%, #F8F9FF 70%, #fff 100%)", zIndex: 0 }} />
          <div style={{ position: "absolute", top: -60, right: -60, width: 280, height: 280, borderRadius: "50%", background: "radial-gradient(circle, rgba(55,93,251,.07) 0%, transparent 70%)", zIndex: 0 }} />
          <div style={{ position: "absolute", bottom: -40, left: 60, width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle, rgba(55,93,251,.05) 0%, transparent 70%)", zIndex: 0 }} />

          <div style={{ position: "relative", zIndex: 1, padding: "28px 32px", display: "flex", alignItems: "center", gap: 28 }}>
            {/* Avatar with ring */}
            <div style={{ position: "relative", width: 120, height: 120, flexShrink: 0, cursor: "pointer" }}
              onClick={() => fileRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f?.type.startsWith("image/")) onFile(f); }}
            >
              <Ring value={totalPct} size={120} stroke={5} color={ringColor} />
              <div style={{ position: "absolute", top: 8, left: 8, width: 104, height: 104, borderRadius: "50%", overflow: "hidden", background: "#F0F4FF", display: "flex", alignItems: "center", justifyContent: "center", transition: "filter .2s" }}>
                {avatar
                  ? <img src={avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#C7D7FD" strokeWidth="1.2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
                <div style={{ position: "absolute", inset: 0, background: dragging ? "rgba(55,93,251,.3)" : "rgba(55,93,251,0)", display: "flex", alignItems: "center", justifyContent: "center", transition: "background .2s", borderRadius: "50%" }}>
                  {dragging && <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>}
                </div>
              </div>
              {/* Pct label */}
              <div style={{ position: "absolute", bottom: -4, left: "50%", transform: "translateX(-50%)", background: ringColor, color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, whiteSpace: "nowrap", boxShadow: `0 2px 8px ${ringColor}55`, transition: "background .4s" }}>
                {totalPct}%
              </div>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f); }} />
            </div>

            {/* Hero text */}
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: "#9CA3AF", letterSpacing: 2, textTransform: "uppercase" }}>Личное дело</div>
                <div style={{ height: 1, flex: 1, background: "linear-gradient(90deg, #E5E7EB, transparent)" }} />
              </div>
              <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0F172A", margin: "0 0 4px", lineHeight: 1.2 }}>
                {[vals.last_name, vals.first_name].filter(Boolean).join(" ") || "Редактирование профиля"}
              </h1>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                {vals.callsign && <span style={{ background: "#EBF1FF", color: "#375DFB", fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 20 }}>@{vals.callsign}</span>}
                {vals.city && <span style={{ fontSize: 13, color: "#6B7280", display: "flex", alignItems: "center", gap: 4 }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>{vals.city}</span>}
                {vals.rank && <span style={{ fontSize: 12, color: "#6B7280", background: "#F9FAFB", border: "1px solid #E5E7EB", padding: "2px 9px", borderRadius: 20 }}>{vals.rank}</span>}
              </div>
              <div style={{ marginTop: 16, display: "flex", gap: 6, flexWrap: "wrap" }}>
                {([0,1,2] as const).map(i => {
                  const sp = pct(vals, SECTION_FIELDS[i]);
                  const labels = ["Личные данные", "Служебные", "Контакты"];
                  const done = sp === 100;
                  return (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 20, background: done ? "#ECFDF5" : "#F4F5F8", border: `1px solid ${done ? "#A7F3D0" : "#E5E7EB"}` }}>
                      <div style={{ width: 5, height: 5, borderRadius: "50%", background: done ? "#10B981" : sp > 0 ? "#F59E0B" : "#D1D5DB", animation: done ? "none" : sp > 0 ? "epPulse 2s infinite" : "none" }} />
                      <span style={{ fontSize: 11, fontWeight: 600, color: done ? "#10B981" : sp > 0 ? "#92400E" : "#9CA3AF" }}>{labels[i]}</span>
                      <span style={{ fontSize: 10, color: done ? "#10B981" : "#9CA3AF" }}>{sp}%</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Back button */}
            <button onClick={() => navigate("/profile")} style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 16px", borderRadius: 10, border: "1.5px solid #E5E7EB", background: "#fff", color: "#374151", fontSize: 13, fontWeight: 500, cursor: "pointer", flexShrink: 0, alignSelf: "flex-start" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg>
              Назад
            </button>
          </div>

          {/* Breadcrumb */}
          <div style={{ position: "relative", zIndex: 1, padding: "10px 32px", borderTop: "1px solid rgba(229,231,235,.6)", display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#9CA3AF" }}>
            <span style={{ color: "#375DFB", cursor: "pointer" }} onClick={() => navigate("/")}>Главная</span>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
            <span style={{ color: "#375DFB", cursor: "pointer" }} onClick={() => navigate("/profile")}>Профиль</span>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
            <span>Редактирование</span>
          </div>
        </div>

        {/* ── Two-column layout ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 272px", gap: 16, alignItems: "start" }}>

          {/* ── Form ── */}
          <form onSubmit={handleSubmit(d => mutate(d))} style={{ display: "flex", flexDirection: "column", gap: 14 }}>

            {/* S1 */}
            <div className="ep-s1">
              <Section num="01" pctVal={pct(vals, SECTION_FIELDS[0])} animDelay="0s"
                title="Личные данные" subtitle="ФИО, позывной, дата рождения"
                icon={<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}>
                <div style={grid}>
                  <Field label="Фамилия" error={errors.last_name?.message} required>
                    <Input {...register("last_name")} error={!!errors.last_name} placeholder="Иванов" />
                  </Field>
                  <Field label="Имя" error={errors.first_name?.message} required>
                    <Input {...register("first_name")} error={!!errors.first_name} placeholder="Иван" />
                  </Field>
                  <Field label="Отчество">
                    <Input {...register("patronymic")} placeholder="Иванович" />
                  </Field>
                  <Field label="Позывной / Логин">
                    <Input {...register("callsign")} placeholder="Alpha-1" />
                  </Field>
                  <Field label="Год рождения" error={errors.birth_year?.message}>
                    <Input {...register("birth_year", { valueAsNumber: true })} type="number" error={!!errors.birth_year} placeholder="1990" />
                  </Field>
                  <Field label="Пол">
                    <Controller name="gender" control={control} render={({ field }) => (
                      <Select value={field.value ?? ""} onChange={field.onChange}>
                        <option value="">— Не указан —</option>
                        <option value="male">Мужской</option>
                        <option value="female">Женский</option>
                      </Select>
                    )} />
                  </Field>
                  <Field label="Город" span2>
                    <Select {...register("city")}>
                      <option value="">— Не указан —</option>
                      {CITIES.map(c => <option key={c}>{c}</option>)}
                    </Select>
                  </Field>
                </div>
              </Section>
            </div>

            {/* S2 */}
            <div className="ep-s2">
              <Section num="02" pctVal={pct(vals, SECTION_FIELDS[1])} animDelay="0s"
                title="Служебные данные" subtitle="Назначаются системой — только просмотр"
                icon={<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>}>
                <div style={{ background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 10, padding: "10px 14px", marginBottom: 18, display: "flex", alignItems: "flex-start", gap: 8, fontSize: 13, color: "#92400E", lineHeight: 1.5 }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                  Для изменения звания, должности и подразделения обратитесь к администратору.
                </div>
                <div style={grid}>
                  <Field label="Звание в клубе">
                    <Select disabled value={vals.rank ?? ""}>
                      <option value="">— Не присвоено —</option>
                      {RANKS.map(r => <option key={r}>{r}</option>)}
                    </Select>
                  </Field>
                  <Field label="Должность">
                    <Input disabled placeholder="Командир взвода" style={{ opacity: .5 }} />
                  </Field>
                  <Field label="Подразделение" span2>
                    <Input disabled placeholder="3-й мотострелковый батальон" style={{ opacity: .5 }} />
                  </Field>
                </div>
              </Section>
            </div>

            {/* S3 */}
            <div className="ep-s3">
              <Section num="03" pctVal={pct(vals, SECTION_FIELDS[2])} animDelay="0s"
                title="Контакты и о себе" subtitle="Телефон, почта, краткая биография"
                icon={<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.07h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.7a16 16 0 0 0 6 6l.94-.94a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>}>
                <div style={grid}>
                  <Field label="Телефон" error={errors.phone?.message} required>
                    <Input {...register("phone")} error={!!errors.phone} placeholder="+7 (999) 123-45-67" />
                  </Field>
                  <Field label="Электронная почта" error={errors.email?.message}>
                    <Input {...register("email")} type="email" error={!!errors.email} placeholder="ivanov@example.ru" />
                  </Field>
                  <Field label="О себе" hint={`${aboutLen}/500`} error={errors.about?.message} span2>
                    <div style={{ position: "relative" }}>
                      <textarea {...register("about")} rows={4}
                        style={{ width: "100%", boxSizing: "border-box", padding: "10px 14px", border: `1.5px solid ${errors.about ? "#EF4444" : "#E5E7EB"}`, borderRadius: 10, fontSize: 14, color: "#111", background: "#fff", outline: "none", fontFamily: "inherit", lineHeight: 1.55, resize: "vertical", minHeight: 90, transition: "border-color .15s, box-shadow .15s" }}
                        onFocus={e => { e.currentTarget.style.borderColor = "#375DFB"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(55,93,251,.08)"; }}
                        onBlur={e => { e.currentTarget.style.borderColor = errors.about ? "#EF4444" : "#E5E7EB"; e.currentTarget.style.boxShadow = "none"; }}
                        placeholder="Кратко о себе: боевой опыт, специализация, цели..." />
                    </div>
                  </Field>
                </div>
              </Section>
            </div>

            {/* ── Actions ── */}
            <div className="ep-acts" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
              <button type="button" onClick={() => navigate("/restore")}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "11px 18px", borderRadius: 10, border: "1.5px solid #E5E7EB", background: "#fff", color: "#374151", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                Сбросить пароль
              </button>
              <div style={{ display: "flex", gap: 8 }}>
                <button type="button" onClick={() => navigate("/profile")}
                  style={{ padding: "11px 20px", borderRadius: 10, border: "1.5px solid #E5E7EB", background: "#fff", color: "#374151", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
                  Отмена
                </button>
                <SaveButton pending={isPending} disabled={!isDirty} />
              </div>
            </div>
          </form>

          {/* ── Right sidebar ── */}
          <div style={{ position: "sticky", top: 84, display: "flex", flexDirection: "column", gap: 14 }}>

            {/* Upload card */}
            <div className="ep-r1 ep-card" style={{ padding: "20px" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 14, display: "flex", alignItems: "center", gap: 6 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                Фото профиля
              </div>
              <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                <div onClick={() => fileRef.current?.click()}
                  onDragOver={e => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f?.type.startsWith("image/")) onFile(f); }}
                  style={{ width: 64, height: 64, borderRadius: 16, border: `2px dashed ${dragging ? "#375DFB" : "#E5E7EB"}`, background: "#F9FAFB", cursor: "pointer", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all .2s", position: "relative" }}>
                  {avatar
                    ? <img src={avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>}
                </div>
                <div style={{ flex: 1 }}>
                  <button type="button" onClick={() => fileRef.current?.click()}
                    style={{ width: "100%", padding: "8px", borderRadius: 8, border: "1.5px solid #E5E7EB", background: "#fff", color: "#374151", fontSize: 12, fontWeight: 500, cursor: "pointer", marginBottom: 6 }}>
                    Выбрать фото
                  </button>
                  <div style={{ fontSize: 10, color: "#9CA3AF", lineHeight: 1.5 }}>JPG, PNG до 5 МБ<br />или перетащите</div>
                </div>
              </div>
            </div>

            {/* Live preview */}
            <div className="ep-r2">
              <div style={{ fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                Превью карточки
              </div>
              <ProfilePreview values={vals} avatar={avatar} />
            </div>

            {/* Progress */}
            <div className="ep-r3 ep-card" style={{ padding: "18px 20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#374151" }}>Готовность профиля</div>
                <span style={{ fontSize: 18, fontWeight: 800, color: ringColor, transition: "color .4s", fontVariantNumeric: "tabular-nums" }}>{totalPct}%</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { label: "Личные данные", keys: SECTION_FIELDS[0] },
                  { label: "Служебные", keys: SECTION_FIELDS[1] },
                  { label: "Контакты", keys: SECTION_FIELDS[2] },
                ].map(({ label, keys }) => {
                  const p = pct(vals, keys);
                  const c = p === 100 ? "#10B981" : p > 0 ? "#F59E0B" : "#E5E7EB";
                  return (
                    <div key={label}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#6B7280", marginBottom: 4 }}>
                        <span>{label}</span><span style={{ fontWeight: 600, color: c }}>{p}%</span>
                      </div>
                      <div style={{ height: 4, background: "#F3F4F6", borderRadius: 4, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${p}%`, background: c, borderRadius: 4, transition: "width .5s ease, background .4s" }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Tip */}
            <div className="ep-r4" style={{ background: "linear-gradient(135deg, #EBF1FF, #F0EEFF)", borderRadius: 16, border: "1px solid #C7D7FD", padding: "16px 18px" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#375DFB", marginBottom: 6, display: "flex", alignItems: "center", gap: 5 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                Совет
              </div>
              <p style={{ fontSize: 12, color: "#374151", lineHeight: 1.65, margin: 0 }}>
                Полный профиль открывает Путь Воеводы, командирские инструменты и выход в рейтинги портала.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Toast {...toast} />
    </div>
  );
}
