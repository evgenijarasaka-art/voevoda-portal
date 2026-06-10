import { useRef, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMediaQuery } from "../useMediaQuery";

interface HeroProps {
  isAuthorized: boolean;
}

export function Hero({ isAuthorized }: HeroProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);
  const [btnHov, setBtnHov] = useState(false);

  const bannerRef = useRef<HTMLDivElement>(null);
  const soldierRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLImageElement>(null);
  const tickingRef = useRef(false);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!bannerRef.current) return;
    const rect = bannerRef.current.getBoundingClientRect();
    const mx = (e.clientX - rect.left) / rect.width - 0.5;
    const my = (e.clientY - rect.top) / rect.height - 0.5;
    if (!tickingRef.current) {
      requestAnimationFrame(() => {
        if (soldierRef.current)
          soldierRef.current.style.transform = `translate(${mx * 22}px, ${my * 12}px) scale(1.08)`;
        if (bgRef.current)
          bgRef.current.style.transform = `translate(${mx * -10}px, ${my * -6}px)`;
        tickingRef.current = false;
      });
      tickingRef.current = true;
    }
  }, []);

  const handleMouseEnter = useCallback(() => {
    setHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHovered(false);
    const ease = "transform .45s cubic-bezier(.25,.46,.45,.94)";
    if (soldierRef.current) {
      soldierRef.current.style.transition = ease;
      soldierRef.current.style.transform = "translate(0,0) scale(1)";
    }
    if (bgRef.current) {
      bgRef.current.style.transition = ease;
      bgRef.current.style.transform = "translate(0,0)";
    }
    setTimeout(() => {
      if (soldierRef.current) soldierRef.current.style.transition = "transform .12s ease-out";
      if (bgRef.current) bgRef.current.style.transition = "transform .12s ease-out";
    }, 450);
  }, []);

  return (
    <section style={{ padding: isMobile ? "16px 16px 0" : "24px 24px 0" }}>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "280px 1fr", gap: 20 }}>
        {/* ── Левая карточка ── */}
        <div style={{ background: "#fff", borderRadius: 16, padding: "28px 20px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 16, border: "1px solid #F0F0F0" }}>
          <div style={{ width: 120, height: 120, borderRadius: "50%", overflow: "hidden", border: "1px solid #E5E7EB", flexShrink: 0 }}>
            <img src="/logo.png" alt="УТЦ Воевода" style={{ width: "100%", height: "100%", objectFit: "contain" }} onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#111", marginBottom: 8 }}>УТЦ «ВОЕВОДА»</div>
            <div style={{ fontSize: 12, color: "#6B7280", lineHeight: 1.6 }}>Сообщество патриотов России на базе всероссийской сети центров военной и служебно-прикладной подготовки</div>
          </div>
        </div>

        {/* ── Правый баннер ── */}
        <div
          ref={bannerRef}
          onMouseEnter={isMobile ? undefined : handleMouseEnter}
          onMouseMove={isMobile ? undefined : handleMouseMove}
          onMouseLeave={isMobile ? undefined : handleMouseLeave}
          style={{
            borderRadius: 16,
            position: "relative",
            overflow: "hidden",
            minHeight: isMobile ? 220 : 280,
            border: `1px solid ${hovered ? "rgba(55,93,251,.35)" : "#F0F0F0"}`,
            boxShadow: hovered ? "0 0 0 3px rgba(55,93,251,.12), 0 8px 32px rgba(55,93,251,.15)" : "none",
            transition: "box-shadow .3s ease, border-color .3s ease",
          }}
        >
          {/* Фон (флаг) — inset: -20px даёт 20px запаса со всех сторон, параллакс ±10px не вылезет */}
          <img
            ref={bgRef}
            src="/flag-bg.jpg"
            alt=""
            style={{
              position: "absolute",
              inset: -20,
              width: "calc(100% + 40px)",
              height: "calc(100% + 40px)",
              objectFit: "cover",
              willChange: "transform",
              transition: "transform .12s ease-out",
            }}
            onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
          />

          {/* Градиент-оверлей */}
          <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "linear-gradient(90deg, rgba(255,255,255,.96) 0%, rgba(255,255,255,.85) 25%, rgba(255,255,255,.5) 45%, rgba(255,255,255,0) 65%)" }} />

          {/* Текст */}
          <div style={{ position: "relative", zIndex: 1, maxWidth: isMobile ? "100%" : "55%", padding: isMobile ? "24px 20px" : "32px 40px", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: isMobile ? "center" : "flex-start", textAlign: isMobile ? "center" : "left" }}>
            <h1 style={{ fontSize: isMobile ? 22 : 28, fontWeight: 700, color: "#111", lineHeight: 1.3, margin: "0 0 12px" }}>Вступай в сообщество<br />патриотов России</h1>
            <p style={{ color: "#4B5563", fontSize: 14, lineHeight: 1.55, margin: "0 0 20px" }}>Общайся с единомышленниками, заводи друзей<br />по всей стране и совершенствуй свои навыки</p>
            <button
              onMouseEnter={() => setBtnHov(true)}
              onMouseLeave={() => setBtnHov(false)}
              onClick={() => navigate(isAuthorized ? "/courses" : "/register")}
              style={{ background: btnHov ? "#1E3F9F" : "#375DFB", color: "#fff", border: "none", width: isAuthorized ? 180 : 140, height: 44, borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: "pointer", transition: "background .2s" }}
            >
              {isAuthorized ? "Смотреть курсы" : "Вступить"}
            </button>
          </div>

          {/* Солдат */}
          {!isMobile && (
            <div
              ref={soldierRef}
              style={{
                position: "absolute", top: 0, right: 0, bottom: -14,
                width: "40%", zIndex: 1,
                display: "flex", alignItems: "stretch", justifyContent: "center",
                willChange: "transform",
                transition: "transform .12s ease-out",
              }}
            >
              <img
                src="/soldier.png"
                alt=""
                style={{ width: "100%", height: "100%", objectFit: "contain", objectPosition: "center bottom", display: "block" }}
                onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}