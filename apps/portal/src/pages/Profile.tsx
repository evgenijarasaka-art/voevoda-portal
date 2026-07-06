import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { IVDisplay, ElitaBadge, ExtraBadge, BadgeBox, BADGE_TOOLTIPS } from "../components/PeopleSection";
import { TrainingPanel, MeasurementsPanel } from "../components/IndexCharts";
import { useFavoritesStore } from "../store/useFavoritesStore";
import { useNotifStore } from "../store/useNotifStore";
import { useCourseArchiveStore } from "../store/useCourseArchiveStore";
import { usePurchasedCoursesStore } from "../store/usePurchasedCoursesStore";
import { useCommunitiesStore } from "../store/useCommunitiesStore";
import { CURRENT_USER, useKaptorkaStore } from "../store/useKaptorkaStore";
import { PortalBreadcrumb } from "../components/PortalBreadcrumb";
import { useLearningSummary, ACTIVE_COURSE } from "../store/useLearningSummary";
import {
  useProfileAchievementsStore,
  type AchievementSection,
  type ProfileAchievement,
} from "../store/useProfileAchievementsStore";
import { readAndCompressImage } from "../utils/imageUpload";
import { useAuth } from "../hooks/useAuth";
import { getTestUser } from "../api/testApi";
import { HOME_JOURNAL_ARTICLES } from "../data/homeJournalArticles";

const ANIM = `
@keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
@keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
@keyframes archiveOut { 0%{opacity:1;transform:translateX(0) scale(1);max-height:200px;padding-top:20px;padding-bottom:20px} 60%{opacity:0;transform:translateX(110%) scale(.88)} 100%{opacity:0;transform:translateX(110%) scale(.88);max-height:0;padding-top:0;padding-bottom:0} }
@keyframes panelWaveIn { 0% { opacity:0; transform: translateX(68px) scale(.9); filter: blur(14px); clip-path: inset(18% 0 18% 100% round 28px); } 42% { opacity:1; transform: translateX(-10px) scale(1.018); filter: blur(2px); clip-path: inset(0 0 0 0 round 28px); } 72% { transform: translateX(3px) scale(.998); } 100% { opacity:1; transform: translateX(0) scale(1); filter: blur(0); clip-path: inset(0 0 0 0 round 28px); } }
@keyframes panelWaveOut { 0% { opacity:1; transform: translateX(0) scale(1); filter: blur(0); clip-path: inset(0 0 0 0 round 28px); } 100% { opacity:0; transform: translateX(56px) scale(.94); filter: blur(12px); clip-path: inset(12% 0 12% 100% round 28px); } }
@keyframes panelMiniPop { 0% { opacity:0; transform: translateY(12px) scale(.88); filter: blur(8px); } 100% { opacity:1; transform: translateY(0) scale(1); filter: blur(0); } }
@keyframes panelMiniOut { 0% { opacity:1; transform: translateY(0) scale(1); filter: blur(0); } 100% { opacity:0; transform: translateY(8px) scale(.88); filter: blur(8px); } }
.layout-editor-panel { animation: panelWaveIn .56s cubic-bezier(.16,1,.3,1) both; transition: box-shadow .22s ease, border-color .22s ease, transform .22s ease; will-change: transform, opacity, filter; }
.layout-editor-panel.is-closing { pointer-events:none; animation: panelWaveOut .34s cubic-bezier(.7,0,.84,0) both; }
.layout-editor-panel:hover { box-shadow:0 28px 90px rgba(15,23,42,.22) !important; }
.layout-editor-panel button { transition: transform .16s ease, box-shadow .16s ease, background .16s ease, border-color .16s ease, color .16s ease, opacity .16s ease; }
.layout-editor-panel button:hover:not(:disabled) { transform: translateY(-1px); box-shadow:0 8px 20px rgba(55,93,251,.16) !important; border-color:#A5B4FC !important; }
.layout-editor-panel button:active:not(:disabled) { transform: translateY(0) scale(.98); }
.layout-editor-panel button:disabled { opacity:.45; }
.layout-editor-scroll { scrollbar-width: thin; scrollbar-color:#375DFB #EEF2FF; }
.layout-editor-scroll::-webkit-scrollbar { width:10px; }
.layout-editor-scroll::-webkit-scrollbar-track { background:#EEF2FF; border-radius:999px; margin:8px; }
.layout-editor-scroll::-webkit-scrollbar-thumb { background:linear-gradient(180deg,#375DFB,#6D8DFF); border:2px solid #EEF2FF; border-radius:999px; }
.layout-editor-scroll::-webkit-scrollbar-thumb:hover { background:linear-gradient(180deg,#274BD8,#375DFB); }
.profile-resizable-box { transition:none; }
.profile-resizable-box.is-editing { scrollbar-width:thin; scrollbar-color:#375DFB #EEF2FF; }
.profile-resizable-box.is-editing::-webkit-scrollbar { width:10px; height:0; }
.profile-resizable-box.is-editing::-webkit-scrollbar:horizontal { display:none; height:0; }
.profile-resizable-box.is-editing::-webkit-scrollbar-track { background:#EEF2FF; border-radius:999px; }
.profile-resizable-box.is-editing::-webkit-scrollbar-thumb { background:linear-gradient(180deg,#375DFB,#6D8DFF); border:2px solid #EEF2FF; border-radius:999px; }
.profile-layout-edit-active .vcard { transition: box-shadow .18s ease, border-color .18s ease; }
.vc { animation:none !important; }
.vc:nth-child(2){animation-delay:.06s}
.vc:nth-child(3){animation-delay:.12s}
.vc:nth-child(4){animation-delay:.18s}
.vc:nth-child(5){animation-delay:.22s}
.vc:nth-child(6){animation-delay:.26s}
.vc:nth-child(7){animation-delay:.30s}
.vr:hover { background:#F8FAFF !important; }
.vbadge:hover { transform:scale(1.08) rotate(-2deg); }
.vblog-card:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(0,0,0,.09) !important; }
.vblog-img:hover { transform:scale(1.05); }
.vbtn-p:hover { opacity:.85; transform:translateY(-1px); box-shadow:0 4px 12px rgba(55,93,251,.25); }
.vbtn-g:hover { background:#DFE8FF !important; border-color:#A5B4FC !important; }
.vbtn-w:hover { background:#F3F4F6 !important; }
.vdip:hover .vdip-preview { transform:scale(1.03); box-shadow:0 6px 16px rgba(0,0,0,.12); }
.vdip-badge:hover { filter:grayscale(0%) !important; transform:translateY(-5px) scale(1.14) rotate(-3deg); box-shadow:0 10px 22px rgba(55,93,251,.28); border-color:#C7D2FE !important; z-index:1; }
.vdip-card:hover .vdip-badge { filter:grayscale(0%); }
.vdip-open { transition:transform .2s ease, box-shadow .2s ease, background .2s ease, color .2s ease, border-color .2s ease; }
.vdip-open svg { transition:transform .2s ease; }
.vdip-open:hover { background:#375DFB !important; color:#fff !important; border-color:#375DFB !important; box-shadow:0 10px 24px rgba(55,93,251,.3) !important; transform:translateY(-2px); }
.vdip-open:hover svg { transform:translateX(3px); }
.vdip-open:active { transform:translateY(0) scale(.98); }
.vdip-open:focus-visible { outline:3px solid rgba(55,93,251,.2);outline-offset:2px; }
.vlike:hover { transform:scale(1.18); }
.vprog { transition: width .6s cubic-bezier(.4,0,.2,1); }
.vcard:hover { box-shadow:0 4px 18px rgba(0,0,0,.06) !important; }
.vdip-card { cursor:pointer; transition: background .15s; }
.vdip-card:hover { background:#F8FAFF !important; }
.vdip-card:hover .vdip-preview { transform:scale(1.03); box-shadow:0 6px 16px rgba(0,0,0,.12); }
.vdip-nav-btn { transition: background .15s, opacity .15s; }
.vdip-nav-btn:hover { background: rgba(255,255,255,.15) !important; }
.vdip-nav-btn:disabled { opacity: .3 !important; cursor: default !important; }
.vach-row:hover .vach-actions { opacity:1 !important; }
.vedit-input:focus { border-color: #375DFB !important; background: #fff !important; }
`;

const PROFILE_INIT = {
  name: "Торнадо",
  rank: "Майор",
  position: "КР 2-й роты, 77-й учебный батальон",
  index: 2463,
  rating: 5.0,
  city: "Санкт-Петербург",
  birthYear: "5 марта, 1990",
  onPortal: "2 года, 9 месяцев",
  community: "«Вымпел»",
  courses: 3,
  awards: 8,
  followers: 1288,
  photo: "/teacher2-main.jpg",
  rankImage: "/rank1.png",
  badges: ["/1.png", "/2.png", "/3.png"],
  extraCount: 4,
  coverImage: "/profile.png",
  bio: "Попал я в ВДВ не просто так. Ещё на гражданке отпрыгал в ДОСААФ три прыжка. Не знаю как сейчас, а тогда это было бесплатно. Зато почти гарантированно должен был попасть в ВДВ. Придя в военкомат, туда и направили – ВДВ. Служивый может носить любые погоны. Но если он от природы мужественен, вынослив и полон сил даже на последнем издыхании.",
};

const profileSchema = z.object({
  name: z.string().min(1, "Обязательное поле"),
  rank: z.string().min(1, "Обязательное поле"),
  position: z.string().min(1, "Обязательное поле"),
  city: z.string().min(1, "Обязательное поле"),
  birthYear: z.string().min(1, "Обязательное поле"),
  community: z.string().min(1, "Обязательное поле"),
  bio: z.string(),
});
type ProfileFormValues = z.infer<typeof profileSchema>;
type ProfileData = typeof PROFILE_INIT;

const COURSES_DATA = [
  {
    id: 2,
    title: "Тактическая медицина для бойца",
    start: "24 апреля",
    end: "1 мая",
    progress: 100,
    hw: 100,
    rating: 5.0,
    img: "/kyrs1.png",
  },
  {
    id: 3,
    title: "Ускоренная военная подготовка",
    start: "24 апреля",
    end: "1 мая",
    progress: 100,
    hw: 90,
    rating: 5.0,
    img: "/kyrs2.png",
  },
  {
    id: 1,
    title: "Курс Молодого Бойца V5",
    start: "24 апреля",
    end: "1 мая",
    progress: 100,
    hw: 90,
    rating: 5.0,
    img: "/kyrs3.png",
  },
];

const BLOG_POSTS = HOME_JOURNAL_ARTICLES
  .filter((article) => article.category === "Блог")
  .slice(0, 6)
  .map((article) => ({
    id: article.id,
    img: article.image,
    title: article.title,
    date: article.date,
    views: article.stats.views,
    likes: article.stats.hearts,
    jumbo: article.stats.jumbo,
    author: article.author,
  }));

const DIPLOMAS_DATA = [
  {
    id: 1,
    img: "/dip1.png",
    title: "Успешное прохождение курса «Разведывательно-штурмовая подготовка»",
    desc: "Ведомственный знак отличия Министерства обороны Российской Федерации, учреждённый",
    date: "16 мая, 2024",
    badges: ["/teacher1-small1.jpg", "/teacher1-small2.jpg"],
  },
  {
    id: 2,
    img: "/dip2.png",
    title: "Успешное прохождение курса «Разведывательно-штурмовая подготовка»",
    desc: "Ведомственный знак отличия Министерства обороны Российской Федерации, учреждённый",
    date: "16 мая, 2024",
    badges: ["/teacher1-small1.jpg", "/teacher1-small2.jpg"],
  },
  {
    id: 3,
    img: "/dip1.png",
    title: "Успешное прохождение курса «КМБ V5»",
    desc: "Ведомственный знак отличия Министерства обороны Российской Федерации, учреждённый для поощрения военнослужащих",
    date: "12 ноября, 2023",
    badges: ["/teacher1-small1.jpg", "/teacher1-small2.jpg"],
  },
];

type Tab = "Данные" | "График подготовки" | "Сводка замеров";
type MeasuresView = "history" | "edit" | "chart";

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="vc vcard"
      style={{
        background: "#fff",
        borderRadius: 20,
        border: "1px solid #E5E7EB",
        marginBottom: 12,
        transition: "box-shadow .2s",
      }}
    >
      {children}
    </div>
  );
}

function SectionHeader({
  icon,
  title,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "20px 24px",
        borderBottom: "1px solid #F5F5F7",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {icon}
        <span style={{ fontSize: 18, fontWeight: 700, color: "#111" }}>
          {title}
        </span>
      </div>
      {action}
    </div>
  );
}

function IcHeart({ active }: { active?: boolean }) {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill={active ? "#EF4444" : "#CDD0D5"}
      stroke="none"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}
function IcThumb({ color = "#CDD0D5" }: { color?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.2875 5.14073L10.0608 6.37034C9.92347 6.50803 9.92303 6.7317 10.0598 6.86993C10.2925 7.10497 10.5166 7.05021 10.654 6.91253C10.5661 7.11692 10.3904 7.6271 10.3904 8.03268C10.3904 8.51692 10.5842 8.9555 10.8981 9.27436C10.3199 9.563 9.92236 10.1628 9.92236 10.8563C9.92236 11.3405 10.1162 11.7791 10.4301 12.0979C9.85188 12.3866 9.45433 12.9864 9.45433 13.6799C9.45433 14.655 10.2404 15.445 11.2094 15.445H13.0462L14.2389 15.6895C14.0446 15.6628 13.8534 15.682 13.6769 15.7391C13.8742 15.679 14.0892 15.6664 14.3057 15.7119L15.9356 16.0551C16.5886 16.1925 17.015 16.823 16.8994 17.4803C16.7812 18.1526 16.1408 18.6022 15.4683 18.485L13.8274 18.1991C13.7873 18.1921 13.7479 18.1833 13.7093 18.1728L10.1762 17.5672C9.98064 17.5307 9.62398 17.4894 9.28237 17.4498C9.0461 17.4225 8.81699 17.3959 8.65324 17.3724C8.2522 17.3147 7.82914 17.2478 7.45795 17.1764C7.07956 17.1037 6.60792 16.9651 6.60792 16.9651C6.60792 16.9651 5.77081 16.7047 5.39742 16.5476C5.14793 16.4392 4.52031 16.168 4.26625 16.0709C4.10537 16.0094 3.88391 15.9174 3.65706 15.8207C3.1816 15.618 2.94387 15.5167 2.8058 15.3077C2.66772 15.0988 2.66772 14.8353 2.66772 14.3083L2.66772 8.84776C2.66772 8.2805 2.66772 7.99687 2.8206 7.78063C2.97347 7.56439 3.23943 7.4703 3.77132 7.28214L3.77133 7.28213C3.95772 7.21619 4.13383 7.15435 4.26754 7.10832C4.77788 6.9326 5.26832 6.68651 5.67162 6.36904L9.68343 3.21107C9.71961 3.17049 9.75882 3.13176 9.80104 3.0952L11.4081 1.70339C11.9124 1.26658 12.6725 1.30921 13.1249 1.79968C13.5873 2.30109 13.5558 3.08241 13.0545 3.54499L11.4921 4.98674C11.428 5.04593 11.3594 5.09724 11.2875 5.14073ZM14.1346 13.6799C14.1346 13.0955 13.6634 12.6213 13.0816 12.6213H11.2094C10.6276 12.6213 10.1564 13.0955 10.1564 13.6799C10.1564 14.2642 10.6276 14.7385 11.2094 14.7385H13.0816C13.6634 14.7385 14.1346 14.2642 14.1346 13.6799ZM10.6244 10.8563C10.6244 11.4406 11.0956 11.9148 11.6774 11.9148H13.5496C14.1315 11.9148 14.6027 11.4405 14.6027 10.8562C14.6027 10.2752 14.1369 9.80312 13.5598 9.79764L11.6775 9.79774C11.0956 9.79768 10.6244 10.2719 10.6244 10.8563ZM12.1455 9.09127C11.5638 9.09114 11.0924 8.61696 11.0924 8.03268C11.0924 7.44832 11.5636 6.97409 12.1455 6.97409L14.017 6.9739C14.5989 6.97392 15.0701 7.44814 15.0701 8.03248C15.0701 8.61664 14.5992 9.09075 14.0176 9.09107L13.5436 9.09112L12.1455 9.09127Z"
        fill={color}
      />
    </svg>
  );
}
function IcBookmarkBlog({ active }: { active?: boolean }) {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill={active ? "#EF4444" : "none"}
      stroke={active ? "#EF4444" : "#CDD0D5"}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}
function IcArrow({ dir }: { dir: "left" | "right" }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {dir === "left" ? (
        <polyline points="15 18 9 12 15 6" />
      ) : (
        <polyline points="9 18 15 12 9 6" />
      )}
    </svg>
  );
}

function AchieveModal({
  open,
  title,
  initial,
  onSave,
  onClose,
  onDelete,
  defaultImage,
}: {
  open: boolean;
  title: string;
  initial: Pick<ProfileAchievement, "name" | "info" | "img"> | null;
  onSave: (data: Pick<ProfileAchievement, "name" | "info" | "img">) => void;
  onClose: () => void;
  onDelete?: () => void;
  defaultImage: string;
}) {
  const [name, setName] = useState("");
  const [info, setInfo] = useState("");
  const [image, setImage] = useState(defaultImage);
  const [imageError, setImageError] = useState("");
  useEffect(() => {
    if (open) {
      setName(initial?.name ?? "");
      setInfo(initial?.info ?? "");
      setImage(initial?.img ?? defaultImage);
      setImageError("");
    }
  }, [defaultImage, open, initial]);
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);
  if (!open) return null;
  const isEdit = initial !== null;
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.65)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10000,
        padding: 20,
        animation: "fadeIn .18s ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: 20,
          width: "100%",
          maxWidth: 520,
          overflow: "hidden",
          boxShadow: "0 24px 60px rgba(0,0,0,.35)",
          animation: "fadeUp .2s ease both",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "18px 24px",
            borderBottom: "1px solid #F0F0F0",
          }}
        >
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#111" }}>
              {isEdit ? "Редактировать достижение" : "Добавить достижение"}
            </div>
            <div style={{ marginTop: 3, fontSize: 12, color: "#9CA3AF" }}>{title}</div>
          </div>
          <button type="button"
            onClick={onClose}
            style={{
              background: "#F3F4F6",
              border: "none",
              width: 32,
              height: 32,
              borderRadius: 8,
              cursor: "pointer",
              fontSize: 18,
              color: "#6B7280",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#E5E7EB")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#F3F4F6")}
          >
            ×
          </button>
        </div>
        <div
          style={{
            padding: "20px 24px",
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <div>
            <label
              style={{
                display: "block",
                fontSize: 13,
                fontWeight: 600,
                color: "#374151",
                marginBottom: 6,
              }}
            >
              Название
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="напр. КМС по жиму лёжа"
              style={{
                width: "100%",
                padding: "10px 14px",
                border: "1px solid #E5E7EB",
                borderRadius: 10,
                fontSize: 14,
                outline: "none",
                boxSizing: "border-box",
                transition: "border .15s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#375DFB")}
              onBlur={(e) => (e.target.style.borderColor = "#E5E7EB")}
            />
          </div>
          <div>
            <label
              style={{
                display: "block",
                fontSize: 13,
                fontWeight: 600,
                color: "#374151",
                marginBottom: 6,
              }}
            >
              Описание
            </label>
            <textarea
              value={info}
              onChange={(e) => setInfo(e.target.value)}
              rows={3}
              placeholder="напр. 2018 год, Москва, спорт-комплекс Динамо"
              style={{
                width: "100%",
                padding: "10px 14px",
                border: "1px solid #E5E7EB",
                borderRadius: 10,
                fontSize: 14,
                outline: "none",
                boxSizing: "border-box",
                resize: "vertical",
                fontFamily: "inherit",
                transition: "border .15s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#375DFB")}
              onBlur={(e) => (e.target.style.borderColor = "#E5E7EB")}
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
              Фотография
            </label>
            <label
              htmlFor="achievement-photo"
              style={{
                minHeight: 150,
                background: "#F8FAFF",
                border: "1.5px dashed #C7D2FE",
                borderRadius: 14,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                cursor: "pointer",
                position: "relative",
              }}
            >
              <img src={image} alt="Предпросмотр достижения" style={{ width: "100%", height: 190, objectFit: "contain", background: "#F3F4F6" }} />
              <span style={{ position: "absolute", right: 10, bottom: 10, padding: "7px 10px", borderRadius: 8, background: "rgba(17,24,39,.82)", color: "#fff", fontSize: 11, fontWeight: 700 }}>
                Заменить фото
              </span>
            </label>
            <input
              id="achievement-photo"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              style={{ position: "absolute", width: 1, height: 1, opacity: 0, pointerEvents: "none" }}
              onChange={async (event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                try {
                  setImage(await readAndCompressImage(file));
                  setImageError("");
                } catch (error) {
                  setImageError(error instanceof Error ? error.message : "Не удалось загрузить изображение");
                }
              }}
            />
            <div style={{ marginTop: 6, fontSize: 11, color: imageError ? "#EF4444" : "#9CA3AF" }}>
              {imageError || "JPG, PNG или WEBP до 8 МБ. Фото сохранится вместе с достижением."}
            </div>
          </div>
        </div>
        <div
          style={{
            padding: "16px 24px",
            borderTop: "1px solid #F0F0F0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 10,
          }}
        >
          <div>
            {isEdit && onDelete && (
              <button type="button"
                onClick={onDelete}
                style={{
                  padding: "10px 16px",
                  background: "#FEF2F2",
                  border: "1px solid #FECACA",
                  borderRadius: 10,
                  fontSize: 13,
                  color: "#EF4444",
                  cursor: "pointer",
                  fontWeight: 600,
                  transition: "background .15s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#FEE2E2")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "#FEF2F2")
                }
              >
                Удалить
              </button>
            )}
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button type="button"
              onClick={onClose}
              style={{
                padding: "10px 20px",
                background: "#F3F4F6",
                border: "none",
                borderRadius: 6,
                fontSize: 14,
                color: "#374151",
                cursor: "pointer",
                transition: "background .15s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#E5E7EB")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "#F3F4F6")
              }
            >
              Отмена
            </button>
            <button type="button"
              onClick={() => {
                if (name.trim())
                  onSave({ name: name.trim(), info: info.trim(), img: image });
              }}
              disabled={!name.trim()}
              style={{
                padding: "10px 24px",
                background: name.trim() ? "#375DFB" : "#C7D2FE",
                border: "none",
                borderRadius: 6,
                fontSize: 14,
                fontWeight: 600,
                color: "#fff",
                cursor: name.trim() ? "pointer" : "default",
                transition: "opacity .15s",
              }}
              onMouseEnter={(e) => {
                if (name.trim()) e.currentTarget.style.opacity = ".85";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = "1";
              }}
            >
              {isEdit ? "Сохранить" : "Добавить"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AchievementDetailModal({
  achievement,
  onClose,
  onEdit,
  onOpenAll,
}: {
  achievement: ProfileAchievement | null;
  onClose: () => void;
  onEdit: () => void;
  onOpenAll: () => void;
}) {
  useEffect(() => {
    if (!achievement) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [achievement, onClose]);

  if (!achievement) return null;
  const sectionLabel = achievement.section === "sport" ? "Спортивное достижение" : "Другое достижение";

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10000,
        display: "grid",
        placeItems: "center",
        padding: 20,
        background: "rgba(7,12,24,.74)",
        backdropFilter: "blur(8px)",
        animation: "fadeIn .18s ease",
      }}
    >
      <article
        onClick={(event) => event.stopPropagation()}
        style={{
          width: "min(680px, 100%)",
          overflow: "hidden",
          borderRadius: 24,
          background: "#fff",
          boxShadow: "0 34px 90px rgba(55,93,251,.25)",
          animation: "fadeUp .24s ease both",
          border: "1px solid #C7D2FE",
        }}
      >
        <div style={{ position: "relative", height: 300, background: "linear-gradient(135deg,#0d1b4b 0%,#1a3080 50%,#375DFB 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: "28px 32px", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 30% 30%, rgba(99,133,255,.35) 0%, transparent 60%)" }} />
          <img src={achievement.img} alt={achievement.name} style={{ maxHeight: "100%", maxWidth: "80%", objectFit: "contain", filter: "drop-shadow(0 16px 32px rgba(0,0,0,.4))", position: "relative", zIndex: 1 }} />
          <button type="button" onClick={onClose} aria-label="Закрыть" style={{ position: "absolute", top: 14, right: 14, width: 36, height: 36, border: "1px solid rgba(255,255,255,.25)", borderRadius: 10, background: "rgba(255,255,255,.15)", backdropFilter: "blur(8px)", color: "#fff", fontSize: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
          <span style={{ position: "absolute", left: 16, bottom: 16, padding: "6px 12px", borderRadius: 8, background: "rgba(255,255,255,.18)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,.3)", color: "#fff", fontSize: 11, fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase" as const }}>
            {sectionLabel}
          </span>
        </div>
        <div style={{ padding: "22px 24px 24px", background: "linear-gradient(180deg,#F8FAFF,#fff)" }}>
          <h2 style={{ margin: "0 0 8px", color: "#111827", fontSize: 22, lineHeight: 1.25, fontWeight: 800 }}>{achievement.name}</h2>
          <p style={{ margin: "0 0 20px", color: "#5F6B7A", fontSize: 14, lineHeight: 1.7 }}>{achievement.info || "Описание достижения пока не добавлено."}</p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button type="button" onClick={onEdit} className="vbtn-p" style={{ padding: "10px 18px", border: 0, borderRadius: 10, background: "#375DFB", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", boxShadow: "0 6px 16px rgba(55,93,251,.3)" }}>Редактировать</button>
            <button type="button" onClick={onOpenAll} className="vbtn-g voevoda-view-all" style={{ padding: "10px 18px", border: "1px solid #C7D2FE", borderRadius: 10, background: "#EBF1FF", color: "#375DFB", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Все достижения →</button>
            <button type="button" onClick={onClose} className="vbtn-w" style={{ marginLeft: "auto", padding: "10px 18px", border: "1px solid #E5E7EB", borderRadius: 10, background: "#fff", color: "#6B7280", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Закрыть</button>
          </div>
        </div>
      </article>
    </div>
  );
}

function FormField({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        style={{
          display: "block",
          fontSize: 13,
          fontWeight: 600,
          color: "#374151",
          marginBottom: 6,
        }}
      >
        {label}
      </label>
      {children}
      {error && (
        <span
          style={{
            fontSize: 12,
            color: "#EF4444",
            marginTop: 4,
            display: "block",
          }}
        >
          {error}
        </span>
      )}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  border: "1px solid #E5E7EB",
  borderRadius: 10,
  fontSize: 14,
  outline: "none",
  boxSizing: "border-box",
  transition: "border .15s",
  background: "#F9FAFB",
  fontFamily: "inherit",
  color: "#111",
};

function ProfileEditModal({
  open,
  initial,
  onSave,
  onClose,
}: {
  open: boolean;
  initial: ProfileFormValues;
  onSave: (data: ProfileFormValues) => void;
  onClose: () => void;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: initial,
  });
  useEffect(() => {
    if (open) reset(initial);
  }, [open]);
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);
  if (!open) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.65)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10001,
        padding: 20,
        animation: "fadeIn .18s ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: 20,
          width: "100%",
          maxWidth: 600,
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 24px 60px rgba(0,0,0,.35)",
          animation: "fadeUp .2s ease both",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "18px 24px",
            borderBottom: "1px solid #F0F0F0",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#375DFB"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4z" />
            </svg>
            <span style={{ fontSize: 16, fontWeight: 700, color: "#111" }}>
              Редактировать профиль
            </span>
          </div>
          <button type="button"
            onClick={onClose}
            style={{
              background: "#F3F4F6",
              border: "none",
              width: 32,
              height: 32,
              borderRadius: 8,
              cursor: "pointer",
              fontSize: 18,
              color: "#6B7280",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background .15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#E5E7EB")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "#F3F4F6")}
          >
            ×
          </button>
        </div>
        <form
          onSubmit={handleSubmit(onSave)}
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              overflowY: "auto",
              flex: 1,
              padding: "20px 24px",
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            <div
              style={{
                background: "#F9FAFB",
                border: "1px dashed #E5E7EB",
                borderRadius: 12,
                padding: "16px 18px",
                display: "flex",
                alignItems: "center",
                gap: 14,
              }}
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#9CA3AF"
                strokeWidth="1.5"
                strokeLinecap="round"
              >
                <rect x="3" y="3" width="18" height="18" rx="3" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
              <div>
                <div
                  style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}
                >
                  Фото и обложка
                </div>
                <div style={{ fontSize: 12, color: "#9CA3AF" }}>
                  Загрузка доступна в полной версии
                </div>
              </div>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 14,
              }}
            >
              <FormField label="Псевдоним" error={errors.name?.message}>
                <input
                  className="vedit-input"
                  {...register("name")}
                  style={inputStyle}
                  placeholder="напр. Торнадо"
                  onFocus={(e) => {
                    e.target.style.borderColor = "#375DFB";
                    e.target.style.background = "#fff";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#E5E7EB";
                    e.target.style.background = "#F9FAFB";
                  }}
                />
              </FormField>
              <FormField label="Звание" error={errors.rank?.message}>
                <input
                  className="vedit-input"
                  {...register("rank")}
                  style={inputStyle}
                  placeholder="напр. Майор"
                  onFocus={(e) => {
                    e.target.style.borderColor = "#375DFB";
                    e.target.style.background = "#fff";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#E5E7EB";
                    e.target.style.background = "#F9FAFB";
                  }}
                />
              </FormField>
            </div>
            <FormField label="Должность" error={errors.position?.message}>
              <input
                className="vedit-input"
                {...register("position")}
                style={inputStyle}
                placeholder="напр. КР 2-й роты, 77-й учебный батальон"
                onFocus={(e) => {
                  e.target.style.borderColor = "#375DFB";
                  e.target.style.background = "#fff";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#E5E7EB";
                  e.target.style.background = "#F9FAFB";
                }}
              />
            </FormField>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 14,
              }}
            >
              <FormField label="Город" error={errors.city?.message}>
                <input
                  className="vedit-input"
                  {...register("city")}
                  style={inputStyle}
                  placeholder="напр. Санкт-Петербург"
                  onFocus={(e) => {
                    e.target.style.borderColor = "#375DFB";
                    e.target.style.background = "#fff";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#E5E7EB";
                    e.target.style.background = "#F9FAFB";
                  }}
                />
              </FormField>
              <FormField
                label="Дата рождения"
                error={errors.birthYear?.message}
              >
                <input
                  className="vedit-input"
                  {...register("birthYear")}
                  style={inputStyle}
                  placeholder="напр. 5 марта, 1990"
                  onFocus={(e) => {
                    e.target.style.borderColor = "#375DFB";
                    e.target.style.background = "#fff";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#E5E7EB";
                    e.target.style.background = "#F9FAFB";
                  }}
                />
              </FormField>
            </div>
            <FormField label="Сообщество" error={errors.community?.message}>
              <input
                className="vedit-input"
                {...register("community")}
                style={inputStyle}
                placeholder="напр. «Вымпел»"
                onFocus={(e) => {
                  e.target.style.borderColor = "#375DFB";
                  e.target.style.background = "#fff";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#E5E7EB";
                  e.target.style.background = "#F9FAFB";
                }}
              />
            </FormField>
            <FormField label="О себе" error={errors.bio?.message}>
              <textarea
                className="vedit-input"
                {...register("bio")}
                rows={4}
                style={{ ...inputStyle, resize: "vertical" }}
                placeholder="Расскажите о себе..."
                onFocus={(e) => {
                  e.target.style.borderColor = "#375DFB";
                  e.target.style.background = "#fff";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#E5E7EB";
                  e.target.style.background = "#F9FAFB";
                }}
              />
            </FormField>
          </div>
          <div
            style={{
              padding: "16px 24px",
              borderTop: "1px solid #F0F0F0",
              display: "flex",
              justifyContent: "flex-end",
              gap: 10,
              flexShrink: 0,
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "10px 20px",
                background: "#F3F4F6",
                border: "none",
                borderRadius: 8,
                fontSize: 14,
                color: "#374151",
                cursor: "pointer",
                transition: "background .15s",
                fontWeight: 500,
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#E5E7EB")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "#F3F4F6")
              }
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                padding: "10px 28px",
                background: "#375DFB",
                border: "none",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 700,
                color: "#fff",
                cursor: "pointer",
                transition: "opacity .15s",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = ".85")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#fff"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                <polyline points="17 21 17 13 7 13 7 21" />
                <polyline points="7 3 7 8 15 8" />
              </svg>
              Сохранить
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

type LayoutSize = { w?: number; h?: number };
type LayoutSizes = Record<"info" | "cover", LayoutSize>;

type ResizableBoxProps = {
  enabled: boolean;
  size: LayoutSize;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  resizeDirections?: Array<"x" | "y" | "xy">;
  label?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
  onResize: (size: LayoutSize) => void;
};

function ResizableBox({
  enabled,
  size,
  minWidth = 160,
  minHeight = 80,
  maxWidth,
  maxHeight,
  resizeDirections = ["x", "y", "xy"],
  label,
  style,
  children,
  onResize,
}: ResizableBoxProps) {
  const allowX = resizeDirections.includes("x") || resizeDirections.includes("xy");
  const allowY = resizeDirections.includes("y") || resizeDirections.includes("xy");
  const allowCorners = resizeDirections.includes("xy");

  const startResize =
    (dir: "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw") =>
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!enabled) return;
      e.preventDefault();
      e.stopPropagation();
      const box = e.currentTarget.parentElement as HTMLElement;
      const startX = e.clientX;
      const startY = e.clientY;
      const startW = box.offsetWidth;
      const startH = box.offsetHeight;
      const cursor =
        dir === "n" || dir === "s"
          ? "ns-resize"
          : dir === "e" || dir === "w"
            ? "ew-resize"
            : dir === "ne" || dir === "sw"
              ? "nesw-resize"
              : "nwse-resize";

      const onMove = (ev: MouseEvent) => {
        const next: LayoutSize = {};
        if (allowX && (dir.includes("e") || dir.includes("w"))) {
          const delta = dir.includes("e") ? ev.clientX - startX : startX - ev.clientX;
          let w = Math.max(minWidth, startW + delta);
          if (maxWidth) w = Math.min(maxWidth, w);
          next.w = w;
        }
        if (allowY && (dir.includes("s") || dir.includes("n"))) {
          const delta = dir.includes("s") ? ev.clientY - startY : startY - ev.clientY;
          let h = Math.max(minHeight, startH + delta);
          if (maxHeight) h = Math.min(maxHeight, h);
          next.h = h;
        }
        onResize(next);
      };

      const onUp = () => {
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
        document.body.style.userSelect = "";
        document.body.style.cursor = "";
      };

      document.body.style.userSelect = "none";
      document.body.style.cursor = cursor;
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    };

  const resizeHint = allowX && allowY
    ? "можно тянуть стороны и углы"
    : allowX
      ? "можно тянуть боковые стороны"
      : allowY
        ? "можно тянуть верх/низ"
        : "";

  const edgeCommon: React.CSSProperties = {
    position: "absolute",
    zIndex: 9,
    background: "transparent",
  };

  return (
    <div
      className={`profile-resizable-box${enabled ? " is-editing" : ""}`}
      style={{
        position: "relative",
        width: size.w ? size.w : undefined,
        height: allowY ? (size.h ? size.h : undefined) : undefined,
        maxWidth: "100%",
        outline: enabled ? "1px dashed #375DFB" : "none",
        outlineOffset: enabled ? 4 : 0,
        boxShadow: enabled ? "0 0 0 3px rgba(55,93,251,.025)" : undefined,
        transition: "none",
        flexShrink: 0,
        ...style,
      }}
    >
      {children}
      {enabled && (
        <>
          {label && (
            <div
              style={{
                position: "absolute",
                top: -30,
                left: 0,
                background: "#375DFB",
                color: "#fff",
                borderRadius: 999,
                padding: "5px 10px",
                fontSize: 11,
                fontWeight: 800,
                zIndex: 10,
                display: "flex",
                alignItems: "center",
                gap: 6,
                boxShadow: "0 8px 18px rgba(55,93,251,.22)",
                whiteSpace: "nowrap",
                pointerEvents: "none",
              }}
            >
              <span>{label}</span>
              {resizeHint && (
                <span
                  style={{
                    padding: "2px 6px",
                    borderRadius: 999,
                    background: "rgba(255,255,255,.18)",
                    fontSize: 10,
                    fontWeight: 700,
                  }}
                >
                  {resizeHint}
                </span>
              )}
            </div>
          )}
          {allowX && (
            <>
              <div onMouseDown={startResize("e")} title="Изменить ширину" style={{ ...edgeCommon, top: 0, right: -8, width: 16, height: "100%", cursor: "ew-resize" }} />
              <div onMouseDown={startResize("w")} title="Изменить ширину" style={{ ...edgeCommon, top: 0, left: -8, width: 16, height: "100%", cursor: "ew-resize" }} />
            </>
          )}
          {allowY && (
            <>
              <div onMouseDown={startResize("s")} title="Изменить высоту" style={{ ...edgeCommon, left: 0, bottom: -8, width: "100%", height: 16, cursor: "ns-resize" }} />
              <div onMouseDown={startResize("n")} title="Изменить высоту" style={{ ...edgeCommon, left: 0, top: -8, width: "100%", height: 16, cursor: "ns-resize" }} />
            </>
          )}
          {allowCorners && (
            <>
              <div onMouseDown={startResize("nw")} title="Изменить размер" style={{ ...edgeCommon, left: -10, top: -10, width: 22, height: 22, cursor: "nwse-resize" }} />
              <div onMouseDown={startResize("ne")} title="Изменить размер" style={{ ...edgeCommon, right: -10, top: -10, width: 22, height: 22, cursor: "nesw-resize" }} />
              <div onMouseDown={startResize("sw")} title="Изменить размер" style={{ ...edgeCommon, left: -10, bottom: -10, width: 22, height: 22, cursor: "nesw-resize" }} />
              <div onMouseDown={startResize("se")} title="Изменить размер" style={{ ...edgeCommon, right: -10, bottom: -10, width: 22, height: 22, cursor: "nwse-resize" }} />
            </>
          )}
        </>
      )}
    </div>
  );
}

const DEFAULT_LAYOUT_SIZES: LayoutSizes = {
  info: { w: 480 },
  cover: { h: 280 },
};

type SectionKey =
  | "profile"
  | "courses"
  | "blog"
  | "communities"
  | "kaptorka"
  | "sportAch"
  | "otherAch"
  | "diplomas";

type SectionConfig = { key: SectionKey; title: string; description: string };

const SECTION_CONFIG: SectionConfig[] = [
  {
    key: "profile",
    title: "Личное дело",
    description: "шапка, данные, флаг и биография",
  },
  {
    key: "courses",
    title: "Пройденные курсы",
    description: "список завершённых курсов",
  },
  { key: "blog", title: "Мой блог", description: "карточки публикаций" },
  {
    key: "communities",
    title: "Мои сообщества",
    description: "список сообществ",
  },
  { key: "kaptorka", title: "Каптёрка", description: "предметы пользователя" },
  {
    key: "sportAch",
    title: "Спортивные достижения",
    description: "спортивные награды и разряды",
  },
  {
    key: "otherAch",
    title: "Другие достижения",
    description: "прочие достижения",
  },
  { key: "diplomas", title: "Дипломы", description: "дипломы от УТЦ Воевода" },
];

type SectionVisibility = Record<SectionKey, boolean>;
type SectionSizes = Partial<Record<SectionKey, LayoutSize>>;

const DEFAULT_SECTION_VISIBILITY: SectionVisibility = SECTION_CONFIG.reduce(
  (acc, item) => {
    acc[item.key] = true;
    return acc;
  },
  {} as SectionVisibility,
);

const DEFAULT_SECTION_ORDER: SectionKey[] = SECTION_CONFIG.map(
  (item) => item.key,
);
const LAYOUT_STORAGE_KEY = "profile-page-layout-v4";

type StoredLayout = {
  sectionVisibility?: Partial<SectionVisibility>;
  sectionOrder?: SectionKey[];
  sectionSizes?: SectionSizes;
  layoutSizes?: LayoutSizes;
  coverFit?: "cover" | "contain";
};

function ProfileEditableSection({
  sectionKey,
  label,
  minHeight = 220,
  minWidth = 420,
  layoutEdit,
  sectionVisibility,
  sectionOrder,
  sectionSizes,
  onResize,
  children,
}: {
  sectionKey: SectionKey;
  label: string;
  minHeight?: number;
  minWidth?: number;
  layoutEdit: boolean;
  sectionVisibility: SectionVisibility;
  sectionOrder: SectionKey[];
  sectionSizes: SectionSizes;
  onResize: (key: SectionKey, size: LayoutSize) => void;
  children: React.ReactNode;
}) {
  if (!sectionVisibility[sectionKey]) return null;
  const order = sectionOrder.indexOf(sectionKey);
  void sectionSizes;
  void onResize;
  return (
    <ResizableBox
      enabled={false}
      label={label}
      size={{}}
      minWidth={minWidth}
      minHeight={minHeight}
      resizeDirections={[]}
      onResize={() => undefined}
      style={{
        order: order < 0 ? undefined : order,
        width: "100%",
        height: undefined,
        flex: "0 0 100%",
        maxWidth: "100%",
        marginBottom: 0,
        alignSelf: "flex-start",
        overflowY: "visible",
        overflowX: "hidden",
      }}
    >
      <div style={{ minWidth: 0 }}>
        <SectionCard>{children}</SectionCard>
      </div>
    </ResizableBox>
  );
}

type PanelFrame = { x: number; y: number; w: number; h: number };

const PANEL_FRAME_STORAGE_KEY = "profile-page-layout-editor-panel-v2";
const PANEL_MIN_W = 340;
const PANEL_MIN_H = 420;
const PANEL_MARGIN = 16;
const INFO_MIN_W = 360;
const INFO_MIN_H = 520;

const clampNumber = (
  value: unknown,
  min: number,
  max: number,
  fallback: number,
) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
};

const sanitizeLayoutSizes = (sizes?: LayoutSizes): LayoutSizes => {
  const info = sizes?.info ?? DEFAULT_LAYOUT_SIZES.info;
  const cover = sizes?.cover ?? DEFAULT_LAYOUT_SIZES.cover;
  return {
    info: {
      ...info,
      w: info.w
        ? clampNumber(
            info.w,
            INFO_MIN_W,
            1200,
            DEFAULT_LAYOUT_SIZES.info.w ?? 480,
          )
        : info.w,
      h: undefined,
    },
    cover: {
      ...cover,
      w: cover.w ? clampNumber(cover.w, 260, 1600, cover.w) : cover.w,
      h: cover.h
        ? clampNumber(cover.h, 180, 720, DEFAULT_LAYOUT_SIZES.cover.h ?? 280)
        : cover.h,
    },
  };
};

const getDefaultPanelFrame = (): PanelFrame => {
  if (typeof window === "undefined") return { x: 24, y: 16, w: 420, h: 760 };
  const w = Math.min(420, Math.max(PANEL_MIN_W, window.innerWidth - PANEL_MARGIN * 2));
  const h = Math.max(PANEL_MIN_H, window.innerHeight - PANEL_MARGIN * 2);
  return { x: Math.max(PANEL_MARGIN, window.innerWidth - w - PANEL_MARGIN), y: PANEL_MARGIN, w, h };
};

const clampPanelFrame = (frame: PanelFrame): PanelFrame => {
  if (typeof window === "undefined") return frame;
  const visible = 88;
  const maxW = Math.max(PANEL_MIN_W, window.innerWidth - PANEL_MARGIN * 2);
  const maxH = Math.max(PANEL_MIN_H, window.innerHeight - PANEL_MARGIN * 2);
  const w = clampNumber(frame.w, PANEL_MIN_W, maxW, 380);
  const h = clampNumber(frame.h, PANEL_MIN_H, maxH, 760);
  const x = clampNumber(
    frame.x,
    -w + visible,
    Math.max(visible, window.innerWidth - visible),
    Math.max(PANEL_MARGIN, window.innerWidth - w - 20),
  );
  const y = clampNumber(
    frame.y,
    0,
    Math.max(visible, window.innerHeight - visible),
    PANEL_MARGIN,
  );
  return { x, y, w, h };
};

const loadPanelFrame = (): PanelFrame => {
  if (typeof window === "undefined") return getDefaultPanelFrame();
  try {
    const raw = window.localStorage.getItem(PANEL_FRAME_STORAGE_KEY);
    return raw
      ? clampPanelFrame(JSON.parse(raw) as PanelFrame)
      : getDefaultPanelFrame();
  } catch {
    return getDefaultPanelFrame();
  }
};

function loadStoredLayout(): StoredLayout {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(LAYOUT_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredLayout) : {};
  } catch {
    return {};
  }
}

function LayoutEditorPanel({
  open,
  sectionVisibility,
  sectionOrder,
  layoutSizes,
  coverFit,
  onClose,
  onToggleSection,
  onMoveSection,
  onSetCoverSize,
  onSetCoverFit,
  onReset,
}: {
  open: boolean;
  sectionVisibility: SectionVisibility;
  sectionOrder: SectionKey[];
  layoutSizes: LayoutSizes;
  coverFit: "cover" | "contain";
  onClose: () => void;
  onToggleSection: (key: SectionKey) => void;
  onMoveSection: (key: SectionKey, dir: -1 | 1) => void;
  onSetCoverSize: (size: LayoutSize) => void;
  onSetCoverFit: (fit: "cover" | "contain") => void;
  onReset: () => void;
}) {
  const [panelFrame, setPanelFrame] = useState<PanelFrame>(() =>
    loadPanelFrame(),
  );
  const [panelMinimized, setPanelMinimized] = useState(false);
  const [mounted, setMounted] = useState(open);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (open) {
      setPanelMinimized(false);
      setPanelFrame(getDefaultPanelFrame());
      setMounted(true);
      const id = window.requestAnimationFrame(() => setClosing(false));
      return () => window.cancelAnimationFrame(id);
    }
    if (mounted) {
      setClosing(true);
      const timer = window.setTimeout(() => setMounted(false), 360);
      return () => window.clearTimeout(timer);
    }
  }, [open, mounted]);

  const resetPanelFrame = () => {
    setPanelMinimized(false);
    setPanelFrame(getDefaultPanelFrame());
  };

  const togglePanelMinimized = () => {
    setPanelMinimized((value) => {
      const next = !value;
      if (!next) setPanelFrame((frame) => clampPanelFrame(frame));
      return next;
    });
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(
      PANEL_FRAME_STORAGE_KEY,
      JSON.stringify(panelFrame),
    );
  }, [panelFrame]);

  useEffect(() => {
    if (!open) return;
    const onResize = () => setPanelFrame((frame) => clampPanelFrame(frame));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [open]);

  const startPanelMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.closest("button, input, textarea, select, label")) return;
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const startFrame = panelFrame;
    const onMove = (ev: MouseEvent) => {
      setPanelFrame(
        clampPanelFrame({
          ...startFrame,
          x: startFrame.x + ev.clientX - startX,
          y: startFrame.y + ev.clientY - startY,
        }),
      );
    };
    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    };
    document.body.style.userSelect = "none";
    document.body.style.cursor = "move";
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  const startPanelResize =
    (dir: "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw") =>
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      const startX = e.clientX;
      const startY = e.clientY;
      const startFrame = panelFrame;
      const startRight = startFrame.x + startFrame.w;
      const startBottom = startFrame.y + startFrame.h;
      const cursor =
        dir === "n" || dir === "s"
          ? "ns-resize"
          : dir === "e" || dir === "w"
            ? "ew-resize"
            : dir === "ne" || dir === "sw"
              ? "nesw-resize"
              : "nwse-resize";

      const onMove = (ev: MouseEvent) => {
        const dx = ev.clientX - startX;
        const dy = ev.clientY - startY;
        let next: PanelFrame = { ...startFrame };

        if (dir.includes("e")) next.w = startFrame.w + dx;
        if (dir.includes("s")) next.h = startFrame.h + dy;
        if (dir.includes("w")) {
          next.w = startFrame.w - dx;
          next.x = startRight - Math.max(PANEL_MIN_W, next.w);
        }
        if (dir.includes("n")) {
          next.h = startFrame.h - dy;
          next.y = startBottom - Math.max(PANEL_MIN_H, next.h);
        }

        setPanelFrame(clampPanelFrame(next));
      };
      const onUp = () => {
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
        document.body.style.userSelect = "";
        document.body.style.cursor = "";
      };
      document.body.style.userSelect = "none";
      document.body.style.cursor = cursor;
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    };

  if (!mounted) return null;

  const orderedSections = sectionOrder
    .map((key) => SECTION_CONFIG.find((item) => item.key === key))
    .filter(Boolean) as SectionConfig[];

  if (panelMinimized) {
    return (
      <div
        className={`layout-editor-panel${closing ? " is-closing" : ""}`}
        onMouseDown={startPanelMove}
        style={{
          position: "fixed",
          left: panelFrame.x,
          top: panelFrame.y,
          width: 224,
          minHeight: 118,
          zIndex: 9000,
          background: "rgba(255,255,255,.92)",
          border: "1px solid rgba(229,231,235,.95)",
          borderRadius: 22,
          boxShadow: "0 22px 60px rgba(15,23,42,.18)",
          backdropFilter: "blur(14px)",
          display: "flex",
          flexDirection: "column",
          gap: 12,
          padding: 14,
          cursor: "move",
          userSelect: "none",
          animation: closing ? "panelMiniOut .24s cubic-bezier(.7,0,.84,0) both" : "panelMiniPop .26s cubic-bezier(.16,1,.3,1) both",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 12,
              background: "linear-gradient(135deg,#375DFB,#6D8DFF)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 900,
              boxShadow: "0 10px 24px rgba(55,93,251,.25)",
            }}
          >
            ⚙
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 900, color: "#111827" }}>
              Настройка
            </div>
            <div style={{ fontSize: 11, color: "#6B7280", marginTop: 2 }}>
              Режим активен
            </div>
          </div>
          <button type="button"
            onClick={onClose}
            title="Закрыть"
            style={{
              width: 30,
              height: 30,
              borderRadius: 10,
              border: "1px solid #E5E7EB",
              background: "#fff",
              color: "#6B7280",
              cursor: "pointer",
              fontSize: 18,
              lineHeight: 1,
              fontWeight: 800,
            }}
          >
            ×
          </button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <button type="button"
            onClick={(e) => { e.stopPropagation(); setPanelFrame(getDefaultPanelFrame()); togglePanelMinimized(); }}
            style={{
              padding: "9px 10px",
              borderRadius: 12,
              border: "none",
              background: "#375DFB",
              color: "#fff",
              fontWeight: 900,
              cursor: "pointer",
              boxShadow: "0 8px 18px rgba(55,93,251,.22)",
            }}
          >
            Открыть
          </button>
          <button type="button"
            onClick={(e) => { e.stopPropagation(); resetPanelFrame(); }}
            style={{
              padding: "9px 10px",
              borderRadius: 12,
              border: "1px solid #E5E7EB",
              background: "#fff",
              color: "#374151",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            Сброс
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`layout-editor-panel${closing ? " is-closing" : ""}`}
      style={{
        position: "fixed",
        left: panelFrame.x,
        top: panelFrame.y,
        width: panelFrame.w,
        height: panelFrame.h,
        zIndex: 9000,
        background: "rgba(255,255,255,.96)",
        border: "1px solid rgba(229,231,235,.92)",
        borderRadius: 24,
        boxShadow: "0 24px 70px rgba(15,23,42,.18)",
        backdropFilter: "blur(18px)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <div
        onMouseDown={startPanelMove}
        style={{
          padding: "18px 20px 16px",
          borderBottom: "1px solid #EEF0F4",
          background: "linear-gradient(135deg,rgba(248,250,255,.95),rgba(255,255,255,.95))",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 14,
          flexWrap: "wrap",
          cursor: "move",
          userSelect: "none",
        }}
      >
        <div style={{ flex: "1 1 210px", minWidth: 190 }}>
          <div style={{ fontSize: 18, fontWeight: 900, color: "#111827", letterSpacing: "-.02em" }}>
            Настройка страницы
          </div>
          <div
            style={{
              fontSize: 12,
              color: "#6B7280",
              marginTop: 4,
              lineHeight: 1.45,
            }}
          >
            Перетаскивайте панель за шапку. Для блоков доступны видимость и порядок; размер меняется только у флага.
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flex: "0 1 auto", flexWrap: "wrap", justifyContent: "flex-end" }}>
          <button type="button"
            onClick={resetPanelFrame}
            title="Вернуть стандартный размер панели"
            style={{
              height: 34,
              padding: "0 10px",
              borderRadius: 999,
              border: "1px solid #E5E7EB",
              background: "#fff",
              color: "#374151",
              cursor: "pointer",
              fontSize: 12,
              fontWeight: 800,
              boxShadow: "0 1px 3px rgba(15,23,42,.06)",
            }}
          >
            Сброс
          </button>
          <button type="button"
            onClick={togglePanelMinimized}
            title={panelMinimized ? "Развернуть панель" : "Свернуть в маленькое окно"}
            style={{
              height: 34,
              padding: "0 10px",
              borderRadius: 999,
              border: "1px solid #D7E0FF",
              background: panelMinimized ? "#EBF1FF" : "#fff",
              color: "#375DFB",
              cursor: "pointer",
              fontSize: 12,
              fontWeight: 800,
              boxShadow: "0 1px 3px rgba(15,23,42,.06)",
            }}
          >
            {panelMinimized ? "Развернуть" : "Мини"}
          </button>
          <button type="button"
            onClick={onClose}
            title="Закрыть"
            style={{
              height: 34,
              padding: "0 12px",
              borderRadius: 999,
              border: "1px solid #E5E7EB",
              background: "#fff",
              color: "#374151",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              gap: 6,
              boxShadow: "0 1px 3px rgba(15,23,42,.06)",
            }}
          >
            Закрыть{" "}
            <span style={{ fontSize: 18, lineHeight: 1, color: "#9CA3AF" }}>
              ×
            </span>
          </button>
        </div>
      </div>

      {!panelMinimized && (
      <div
        className="layout-editor-scroll"
        style={{
          padding: 16,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        <div
          style={{
            background: "#F8FAFF",
            border: "1px solid #DDE7FF",
            borderRadius: 14,
            padding: 14,
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 800,
              color: "#111827",
              marginBottom: 8,
            }}
          >
            Большая картинка-флаг
          </div>
          <div style={{ fontSize: 11, color: "#6B7280", lineHeight: 1.45, marginBottom: 10 }}>
Флаг можно настраивать прямо на странице: тяните синий контур за стороны или углы.
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 8,
              marginBottom: 12,
            }}
          >
            <button type="button"
              onClick={() => onSetCoverFit("cover")}
              style={{
                padding: "9px 10px",
                borderRadius: 10,
                border:
                  coverFit === "cover"
                    ? "1px solid #375DFB"
                    : "1px solid #E5E7EB",
                background: coverFit === "cover" ? "#EBF1FF" : "#fff",
                color: coverFit === "cover" ? "#375DFB" : "#374151",
                fontWeight: coverFit === "cover" ? 800 : 600,
                cursor: "pointer",
              }}
            >
              Заполнить
            </button>
            <button type="button"
              onClick={() => onSetCoverFit("contain")}
              style={{
                padding: "9px 10px",
                borderRadius: 10,
                border:
                  coverFit === "contain"
                    ? "1px solid #375DFB"
                    : "1px solid #E5E7EB",
                background: coverFit === "contain" ? "#EBF1FF" : "#fff",
                color: coverFit === "contain" ? "#375DFB" : "#374151",
                fontWeight: coverFit === "contain" ? 800 : 600,
                cursor: "pointer",
              }}
            >
              Целиком
            </button>
          </div>
          <label
            style={{
              display: "block",
              fontSize: 12,
              fontWeight: 700,
              color: "#374151",
              marginBottom: 6,
            }}
          >
            Размер флага: {layoutSizes.cover.w ? `${layoutSizes.cover.w}px × ` : ""}{layoutSizes.cover.h ?? 280}px
          </label>
          <input
            type="range"
            min={160}
            max={620}
            value={layoutSizes.cover.h ?? 280}
            onChange={(e) => onSetCoverSize({ h: Number(e.target.value) })}
            style={{ width: "100%" }}
          />
        </div>

        <div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 800,
              color: "#111827",
              marginBottom: 10,
            }}
          >
            Блоки страницы
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {orderedSections.map((item, idx) => {
              return (
                <div
                  key={item.key}
                  style={{
                    border: "1px solid #E5E7EB",
                    borderRadius: 14,
                    padding: 12,
                    background: sectionVisibility[item.key]
                      ? "#fff"
                      : "#F9FAFB",
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    <input
                      type="checkbox"
                      checked={sectionVisibility[item.key]}
                      onChange={() => onToggleSection(item.key)}
                      style={{ width: 18, height: 18, accentColor: "#375DFB" }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 800,
                          color: "#111827",
                        }}
                      >
                        {item.title}
                      </div>
                      <div
                        style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}
                      >
                        {item.description}
                      </div>
                    </div>
                    <button type="button"
                      disabled={idx === 0}
                      onClick={() => onMoveSection(item.key, -1)}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 8,
                        border: "1px solid #E5E7EB",
                        background: "#fff",
                        color: idx === 0 ? "#D1D5DB" : "#374151",
                        cursor: idx === 0 ? "default" : "pointer",
                      }}
                    >
                      ↑
                    </button>
                    <button type="button"
                      disabled={idx === orderedSections.length - 1}
                      onClick={() => onMoveSection(item.key, 1)}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 8,
                        border: "1px solid #E5E7EB",
                        background: "#fff",
                        color:
                          idx === orderedSections.length - 1
                            ? "#D1D5DB"
                            : "#374151",
                        cursor:
                          idx === orderedSections.length - 1
                            ? "default"
                            : "pointer",
                      }}
                    >
                      ↓
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      )}

      {!panelMinimized && (
      <div
        style={{
          padding: 16,
          borderTop: "1px solid #EEF0F4",
          display: "flex",
          gap: 10,
        }}
      >
        <button type="button"
          onClick={onReset}
          style={{
            flex: 1,
            padding: "11px 14px",
            borderRadius: 10,
            border: "1px solid #E5E7EB",
            background: "#fff",
            color: "#374151",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Сбросить всё
        </button>
        <button type="button"
          onClick={onClose}
          style={{
            flex: 1,
            padding: "11px 14px",
            borderRadius: 10,
            border: "none",
            background: "#375DFB",
            color: "#fff",
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          Готово
        </button>
      </div>
      )}
      <div
        onMouseDown={startPanelResize("n")}
        title="Изменить высоту сверху"
        style={{
          position: "absolute",
          left: 18,
          right: 18,
          top: -5,
          height: 10,
          cursor: "ns-resize",
        }}
      />
      <div
        onMouseDown={startPanelResize("s")}
        title="Изменить высоту снизу"
        style={{
          position: "absolute",
          left: 18,
          right: 18,
          bottom: -5,
          height: 10,
          cursor: "ns-resize",
        }}
      />
      <div
        onMouseDown={startPanelResize("e")}
        title="Изменить ширину справа"
        style={{
          position: "absolute",
          top: 18,
          right: -5,
          bottom: 18,
          width: 10,
          cursor: "ew-resize",
        }}
      />
      <div
        onMouseDown={startPanelResize("w")}
        title="Изменить ширину слева"
        style={{
          position: "absolute",
          top: 18,
          left: -5,
          bottom: 18,
          width: 10,
          cursor: "ew-resize",
        }}
      />
      <div
        onMouseDown={startPanelResize("nw")}
        title="Изменить размер"
        style={{
          position: "absolute",
          left: -6,
          top: -6,
          width: 16,
          height: 16,
          cursor: "nwse-resize",
        }}
      />
      <div
        onMouseDown={startPanelResize("ne")}
        title="Изменить размер"
        style={{
          position: "absolute",
          right: -6,
          top: -6,
          width: 16,
          height: 16,
          cursor: "nesw-resize",
        }}
      />
      <div
        onMouseDown={startPanelResize("sw")}
        title="Изменить размер"
        style={{
          position: "absolute",
          left: -6,
          bottom: -6,
          width: 16,
          height: 16,
          cursor: "nesw-resize",
        }}
      />
      <div
        onMouseDown={startPanelResize("se")}
        title="Изменить размер панели"
        style={{
          position: "absolute",
          right: -6,
          bottom: -6,
          width: 16,
          height: 16,
          cursor: "nwse-resize",
        }}
      />
    </div>
  );
}


type DetailField = { label: string; value: React.ReactNode };

function ProfileDetailModal({
  open,
  title,
  subtitle,
  image,
  imageFit = "cover",
  fields = [],
  description,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
  onClose,
}: {
  open: boolean;
  title: string;
  subtitle?: string;
  image?: string;
  imageFit?: "cover" | "contain";
  fields?: DetailField[];
  description?: React.ReactNode;
  primaryLabel?: string;
  onPrimary?: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10020,
        background: "rgba(15,23,42,.62)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        animation: "fadeIn .16s ease both",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: 720,
          maxHeight: "90vh",
          overflow: "hidden",
          background: "#fff",
          borderRadius: 24,
          border: "1px solid rgba(229,231,235,.95)",
          boxShadow: "0 30px 90px rgba(15,23,42,.32)",
          animation: "fadeUp .2s cubic-bezier(.16,1,.3,1) both",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            padding: "18px 22px",
            borderBottom: "1px solid #F1F5F9",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            flexShrink: 0,
          }}
        >
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#111827", lineHeight: 1.25 }}>{title}</div>
            {subtitle && <div style={{ fontSize: 13, color: "#9CA3AF", marginTop: 4 }}>{subtitle}</div>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="vbtn-w"
            style={{
              width: 36,
              height: 36,
              borderRadius: 12,
              border: "1px solid #E5E7EB",
              background: "#F9FAFB",
              color: "#6B7280",
              fontSize: 20,
              lineHeight: 1,
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            ×
          </button>
        </div>

        <div className="layout-editor-scroll" style={{ overflowY: "auto", padding: 22 }}>
          {image && (
            <div style={{ height: 260, borderRadius: 18, overflow: "hidden", background: "#F3F4F6", marginBottom: 18, border: "1px solid #E5E7EB" }}>
              <img
                src={image}
                alt=""
                style={{ width: "100%", height: "100%", objectFit: imageFit, display: "block" }}
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
            </div>
          )}

          {fields.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10, marginBottom: description ? 18 : 0 }}>
              {fields.map((field) => (
                <div key={field.label} style={{ border: "1px solid #E5E7EB", borderRadius: 14, background: "#F9FAFB", padding: "12px 14px" }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 5 }}>{field.label}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>{field.value}</div>
                </div>
              ))}
            </div>
          )}

          {description && (
            <div style={{ fontSize: 14, color: "#4B5563", lineHeight: 1.65, background: "#fff", border: "1px solid #EEF2F7", borderRadius: 16, padding: 16 }}>
              {description}
            </div>
          )}
        </div>

        {(primaryLabel || secondaryLabel) && (
          <div style={{ padding: "16px 22px", borderTop: "1px solid #F1F5F9", display: "flex", justifyContent: "flex-end", gap: 10, flexShrink: 0 }}>
            {secondaryLabel && (
              <button type="button" onClick={onSecondary} className="vbtn-w" style={{ padding: "10px 18px", borderRadius: 10, border: "1px solid #E5E7EB", background: "#fff", color: "#374151", cursor: "pointer", fontSize: 14, fontWeight: 700 }}>
                {secondaryLabel}
              </button>
            )}
            {primaryLabel && (
              <button type="button" onClick={onPrimary} className="vbtn-p" style={{ padding: "10px 20px", borderRadius: 10, border: "none", background: "#375DFB", color: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 800 }}>
                {primaryLabel}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

type ProfileMode = "full" | "personal-only" | "without-personal";

export function Profile({
  mode = "full",
  embedded = false,
  requestedTab,
}: {
  mode?: ProfileMode;
  embedded?: boolean;
  requestedTab?: Tab;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useParams<{ login?: string }>();
  const authUser = useAuth((state) => state.user);
  const testUser = getTestUser(login ?? authUser?.login ?? "tornado") ?? getTestUser("tornado");
  const initialProfile: ProfileData = testUser ? {
    ...PROFILE_INIT,
    name: testUser.callsign,
    rank: testUser.rank,
    position: testUser.position,
    index: testUser.index,
    rating: testUser.rating,
    city: testUser.city,
    birthYear: testUser.birthYear,
    onPortal: testUser.onPortal,
    community: testUser.community,
    courses: testUser.courses,
    awards: testUser.awards,
    followers: testUser.followers,
    photo: testUser.avatar,
    rankImage: testUser.rankImage,
    badges: testUser.badges,
    extraCount: testUser.extraCount,
    coverImage: testUser.coverImage,
    bio: testUser.bio,
  } : PROFILE_INIT;
  const isOwnProfile = !login || login === authUser?.login;
  const showPersonalFile = mode !== "without-personal";
  const showRemaining = mode !== "personal-only";
  const { toggle: toggleFav, has: isFav } = useFavoritesStore();
  const addNotif = useNotifStore((s) => s.add);
  const { courses: purchasedCourses } = usePurchasedCoursesStore();

  const storedLayout = loadStoredLayout();
  const [profile, setProfile] = useState<ProfileData>(initialProfile);
  const profileData = isOwnProfile ? profile : initialProfile;
  const [layoutEdit, setLayoutEdit] = useState(false);
  const [isFollowingProfile, setIsFollowingProfile] = useState(false);
  const [layoutSizes, setLayoutSizes] = useState<LayoutSizes>(() =>
    sanitizeLayoutSizes({
      ...DEFAULT_LAYOUT_SIZES,
      ...(storedLayout.layoutSizes ?? {}),
    }),
  );
  const [coverFit, setCoverFit] = useState<"cover" | "contain">(
    storedLayout.coverFit ?? "contain",
  );
  const [sectionVisibility, setSectionVisibility] = useState<SectionVisibility>(
    {
      ...DEFAULT_SECTION_VISIBILITY,
      ...(storedLayout.sectionVisibility ?? {}),
    },
  );
  const [sectionOrder, setSectionOrder] = useState<SectionKey[]>(() => {
    const saved = storedLayout.sectionOrder ?? DEFAULT_SECTION_ORDER;
    return [
      ...saved.filter((key) => DEFAULT_SECTION_ORDER.includes(key)),
      ...DEFAULT_SECTION_ORDER.filter((key) => !saved.includes(key)),
    ];
  });
  const [sectionSizes, setSectionSizes] = useState<SectionSizes>(
    storedLayout.sectionSizes ?? {},
  );

  const updateLayoutSize = (key: keyof LayoutSizes, size: LayoutSize) => {
    setLayoutSizes((prev) =>
      sanitizeLayoutSizes({ ...prev, [key]: { ...prev[key], ...size } }),
    );
  };

  const updateSectionSize = (key: SectionKey, size: LayoutSize) => {
    setSectionSizes((prev) => ({
      ...prev,
      [key]: { ...(prev[key] ?? {}), ...size },
    }));
  };

  const toggleSectionVisibility = (key: SectionKey) => {
    setSectionVisibility((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const moveSection = (key: SectionKey, dir: -1 | 1) => {
    setSectionOrder((prev) => {
      const next = [...prev];
      const idx = next.indexOf(key);
      const target = idx + dir;
      if (idx < 0 || target < 0 || target >= next.length) return prev;
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  };

  const resetLayout = () => {
    setSectionVisibility(DEFAULT_SECTION_VISIBILITY);
    setSectionOrder(DEFAULT_SECTION_ORDER);
    setSectionSizes({});
    setLayoutSizes(sanitizeLayoutSizes(DEFAULT_LAYOUT_SIZES));
    setCoverFit("contain");
    if (typeof window !== "undefined")
      window.localStorage.removeItem(LAYOUT_STORAGE_KEY);
  };

  const layoutStyle = `
    body { scrollbar-width:thin; scrollbar-color:#375DFB #EEF2FF; }
    body::-webkit-scrollbar { width:10px; }
    body::-webkit-scrollbar-track { background:#EEF2FF; }
    body::-webkit-scrollbar-thumb { background:linear-gradient(180deg,#375DFB,#6D8DFF); border:2px solid #EEF2FF; border-radius:999px; }
    body::-webkit-scrollbar-thumb:hover { background:linear-gradient(180deg,#274BD8,#375DFB); }
    .profile-layout { display:flex; flex-direction:row; flex-wrap:wrap; gap:12px; align-items:flex-start; overflow-x:hidden; }
    .profile-layout > .profile-resizable-box { min-width:0; }
    .profile-layout-edit-active { scrollbar-width:thin; scrollbar-color:#375DFB #EEF2FF; }
    .profile-layout-edit-active *::-webkit-scrollbar { width:10px; height:10px; }
    .profile-layout-edit-active *::-webkit-scrollbar-track { background:#EEF2FF; border-radius:999px; }
    .profile-layout-edit-active *::-webkit-scrollbar-thumb { background:linear-gradient(180deg,#375DFB,#6D8DFF); border:2px solid #EEF2FF; border-radius:999px; }
    .profile-layout-edit-active *::-webkit-scrollbar-thumb:hover { background:linear-gradient(180deg,#274BD8,#375DFB); }
    .profile-layout-edit-active *::-webkit-scrollbar:horizontal { height:0 !important; display:none; }
    html, body, #root { overflow-x:hidden !important; }
    .profile-layout-edit-active, .profile-layout-edit-active * { overflow-x:clip !important; }
    .profile-segmented { display:flex; align-items:center; gap:4px; padding:3px; border:1px solid #E5E7EB; border-radius:12px; background:#fff; width:fit-content; max-width:100%; overflow:hidden; box-shadow:0 1px 2px rgba(15,23,42,.02); }
    .profile-segmented-btn { appearance:none !important; margin:0 !important; border:0 !important; border-inline:0 !important; outline:0 !important; border-radius:9px; padding:5px 12px; min-height:29px; font-size:12.5px; font-weight:650; background:transparent; color:#6B7280; cursor:pointer; white-space:nowrap; box-shadow:none !important; transform:none !important; line-height:1.15; transition:background-color .16s cubic-bezier(.16,1,.3,1), color .16s cubic-bezier(.16,1,.3,1), box-shadow .16s cubic-bezier(.16,1,.3,1), opacity .16s ease; }
    .profile-segmented > .profile-segmented-btn, .profile-segmented > button { border:0 !important; border-left:0 !important; border-right:0 !important; border-inline:0 !important; box-shadow:none !important; }
    .profile-segmented-btn::before, .profile-segmented-btn::after { display:none !important; content:none !important; }
    .profile-segmented-btn + .profile-segmented-btn { border-left:0 !important; margin-left:0 !important; }
    .profile-segmented-btn:hover { background:#EEF2FF !important; color:#375DFB !important; box-shadow:none !important; }
    .profile-segmented-btn:active { opacity:.86; }
    .profile-segmented-btn.active { background:#fff !important; color:#111 !important; box-shadow:0 2px 8px rgba(15,23,42,.10) !important; }
    .profile-training-smooth button { transition:background-color .16s cubic-bezier(.16,1,.3,1), color .16s cubic-bezier(.16,1,.3,1), border-color .16s cubic-bezier(.16,1,.3,1), box-shadow .16s cubic-bezier(.16,1,.3,1), opacity .16s ease !important; transform:none !important; background-clip:padding-box !important; }
    .profile-training-smooth button:hover { background:#EEF2FF !important; color:#375DFB !important; border-color:#A5B4FC !important; box-shadow:0 8px 22px rgba(55,93,251,.10) !important; }
    .profile-training-smooth div:has(> button:nth-child(3)):not(:has(> button:nth-child(4))) { display:flex !important; align-items:center !important; gap:4px !important; padding:3px !important; border:1px solid #E5E7EB !important; border-radius:12px !important; background:#fff !important; overflow:hidden !important; width:fit-content !important; max-width:100% !important; box-shadow:0 1px 2px rgba(15,23,42,.02) !important; }
    .profile-training-smooth div:has(> button:nth-child(3)):not(:has(> button:nth-child(4))) > button { appearance:none !important; border:0 !important; border-left:0 !important; border-right:0 !important; border-inline:0 !important; outline:0 !important; margin:0 !important; border-radius:9px !important; padding:5px 12px !important; min-height:29px !important; font-size:12.5px !important; line-height:1.15 !important; white-space:nowrap !important; background-clip:padding-box !important; }
    .profile-training-smooth div:has(> button:nth-child(3)):not(:has(> button:nth-child(4))) > button::before, .profile-training-smooth div:has(> button:nth-child(3)):not(:has(> button:nth-child(4))) > button::after { display:none !important; content:none !important; }
    .profile-training-smooth div:has(> button:nth-child(3)):not(:has(> button:nth-child(4))) > button:hover { background:#EEF2FF !important; color:#375DFB !important; border-color:transparent !important; box-shadow:none !important; }
    .profile-measures-content { overflow-x:clip; transition:opacity .16s cubic-bezier(.16,1,.3,1), transform .16s cubic-bezier(.16,1,.3,1); }
  `;

  useEffect(() => {
    const state = location.state as {
      openEdit?: boolean;
      tab?: Tab;
      chartView?: string;
      chartSection?: string;
      measuresView?: string;
    } | null;
    if (state?.tab) setActiveTab(state.tab);
    if (state?.openEdit) navigate("/edit-profile");
    if (state?.chartSection) setChartInitSection(state.chartSection);
    if (state?.chartView) setChartInitView(state.chartView);
    if (state?.measuresView) setMeasuresView(state.measuresView as "history" | "edit" | "chart");
    if (
      state?.tab ||
      state?.openEdit ||
      state?.chartSection ||
      state?.chartView ||
      state?.measuresView
    )
      window.history.replaceState({}, "");
  }, []);

  useEffect(() => {
    const savedScroll = sessionStorage.getItem("voevoda_profile_scroll");
    if (!savedScroll) return;
    sessionStorage.removeItem("voevoda_profile_scroll");
    window.setTimeout(() => {
      window.requestAnimationFrame(() => {
        window.scrollTo({ top: Number(savedScroll), behavior: "auto" });
      });
    }, 0);
  }, []);

  const saveProfile = (data: ProfileFormValues) => {
    setProfile((p) => ({ ...p, ...data }));
    addNotif({
      kind: "system",
      title: "Профиль обновлён",
      body: "Данные личного дела сохранены",
      link: "/profile",
    });
  };

  // Живая сводка реального прогресса из стора занятий и тестов
  const learning = useLearningSummary();
  const activeCourse = {
    id: 999,
    title: ACTIVE_COURSE.title,
    start: "24 марта",
    end: learning.overallPct >= 100 ? "завершён" : "в процессе",
    progress: learning.lessonPct,
    hw: learning.testPct,
    rating: learning.bestScore ? Number((learning.bestScore / 20).toFixed(1)) : 0,
    img: ACTIVE_COURSE.img,
    live: true,
    lessonsViewed: learning.lessonsViewed,
    lessonsTotal: learning.lessonsTotal,
    testsPassed: learning.testsPassed,
    testsTotal: learning.testsTotal,
  };
  const allCourses = [
    activeCourse,
    ...COURSES_DATA,
    ...purchasedCourses.map((c) => ({
      id: Number(c.id.replace("pc_", "")),
      title: c.title,
      start: c.start,
      end: c.end,
      progress: c.progress,
      hw: c.hw,
      rating: c.rating,
      img: c.img,
    })),
  ];

  const [activeTab, setActiveTab] = useState<Tab>("Данные");
  useEffect(() => {
    if (requestedTab) setActiveTab(requestedTab);
  }, [requestedTab]);
  const [measuresView, setMeasuresView] = useState<MeasuresView>("history");
  const [chartInitSection, setChartInitSection] = useState<string | undefined>(
    undefined,
  );
  const [chartInitView, setChartInitView] = useState<string | undefined>(
    undefined,
  );
  const [courseSort, setCourseSort] = useState<"date" | "rating">("date");
  const [showSortDrop, setShowSortDrop] = useState(false);
  const [blogLikes, setBlogLikes] = useState<Record<number, boolean>>({});
  const [blogComments, setBlogComments] = useState<Record<number, boolean>>({});
  const [dipIndex, setDipIndex] = useState<number | null>(null);
  const [commSort, setCommSort] = useState<"newest" | "oldest">("newest");
  const [showCourseFilterDrop, setShowCourseFilterDrop] = useState(false);
  const [courseFilter, setCourseFilter] = useState<"all" | "completed" | "favorite">("all");
  const courseControlsRef = useRef<HTMLDivElement>(null);
  const { addToArchive, isArchived } = useCourseArchiveStore();
  const [archivingIds, setArchivingIds] = useState<Set<number>>(new Set());

  const handleArchiveCourse = (c: { id: number; title: string; img: string; progress: number; hw: number; rating: number; start: string; end: string }) => {
    if (archivingIds.has(c.id)) return;
    setArchivingIds(prev => new Set([...prev, c.id]));
    setTimeout(() => {
      addToArchive({ id: c.id, title: c.title, img: c.img, slug: c.title, courseProgress: c.progress, hwProgress: c.hw, passed: true, rating: c.rating, start: c.start, end: c.end });
      setArchivingIds(prev => { const n = new Set(prev); n.delete(c.id); return n; });
    }, 440);
  };
  const [selectedCourse, setSelectedCourse] = useState<any | null>(null);
  const [selectedBlogPost, setSelectedBlogPost] = useState<any | null>(null);
  const communities = useCommunitiesStore((state) => state.communities);
  const toggleCommunityJoin = useCommunitiesStore((state) => state.toggleJoin);
  const kaptorkaAds = useKaptorkaStore((state) => state.ads);
  const achievements = useProfileAchievementsStore((state) => state.achievements);
  const addAchievement = useProfileAchievementsStore((state) => state.addAchievement);
  const updateAchievement = useProfileAchievementsStore((state) => state.updateAchievement);
  const deleteAchievement = useProfileAchievementsStore((state) => state.deleteAchievement);

  useEffect(() => {
    if (!showSortDrop && !showCourseFilterDrop) return;
    const closeMenus = (event: MouseEvent) => {
      if (!courseControlsRef.current?.contains(event.target as Node)) {
        setShowSortDrop(false);
        setShowCourseFilterDrop(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowSortDrop(false);
        setShowCourseFilterDrop(false);
      }
    };
    document.addEventListener("mousedown", closeMenus);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeMenus);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [showCourseFilterDrop, showSortDrop]);

  const visibleCourses = [...allCourses]
    .filter((c) => !isArchived(c.id))
    .filter((c) => courseFilter === "all" || (courseFilter === "completed" ? c.progress >= 100 : c.rating >= 5))
    .sort((a, b) => (courseSort === "rating" ? b.rating - a.rating : b.id - a.id));
  const joinedCommunities = communities.filter((community) => community.joined);
  const communityJoinedTime = (community: (typeof communities)[number]) => {
    const timestamp = community.joinedAt ? Date.parse(community.joinedAt) : Number.NaN;
    if (Number.isFinite(timestamp)) return timestamp;
    return community.id === 1 ? Date.parse("2026-05-18T09:00:00.000Z") : 0;
  };
  const visibleCommunities = [...joinedCommunities].sort((a, b) => {
    const delta = communityJoinedTime(b) - communityJoinedTime(a);
    return commSort === "newest" ? delta : -delta;
  });
  const formatCommunityJoinedAt = (community: (typeof communities)[number]) => {
    const timestamp = communityJoinedTime(community);
    if (!timestamp) return "дата подписки не указана";
    return `подписка ${new Intl.DateTimeFormat("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(timestamp)}`;
  };
  const ownKaptorkaAds = kaptorkaAds.filter((ad) => ad.seller === CURRENT_USER && ad.active !== false);
  const sportAch = achievements.filter((a) => a.section === "sport" && a.showInProfile !== false);
  const otherAch = achievements.filter((a) => a.section === "other" && a.showInProfile !== false);
  const [selectedAchievementId, setSelectedAchievementId] = useState<number | null>(null);

  const [achModal, setAchModal] = useState<{
    open: boolean;
    section: AchievementSection;
    editId: number | null;
  }>({ open: false, section: "sport", editId: null });

  const openAddAch = (section: AchievementSection) =>
    setAchModal({ open: true, section, editId: null });
  const openEditAch = (section: AchievementSection, id: number) => {
    setSelectedAchievementId(null);
    setAchModal({ open: true, section, editId: id });
  };

  const closeAchModal = () => setAchModal((p) => ({ ...p, open: false }));

  const achInitial =
    achModal.editId !== null
      ? (achievements.find((achievement) => achievement.id === achModal.editId) ?? null)
      : null;
  const selectedAchievement = selectedAchievementId === null
    ? null
    : (achievements.find((achievement) => achievement.id === selectedAchievementId) ?? null);

  const saveAch = (data: Pick<ProfileAchievement, "name" | "info" | "img">) => {
    if (achModal.editId !== null) {
      updateAchievement(achModal.editId, data);
    } else {
      addAchievement({ ...data, section: achModal.section });
    }
    closeAchModal();
  };

  const deleteAch = () => {
    if (achModal.editId !== null) deleteAchievement(achModal.editId);
    closeAchModal();
  };

  const dipModal = dipIndex !== null ? DIPLOMAS_DATA[dipIndex] : null;
  const openDip = (idx: number) => setDipIndex(idx);
  const closeDip = () => setDipIndex(null);
  const prevDip = () =>
    setDipIndex((i) =>
      i !== null ? (i - 1 + DIPLOMAS_DATA.length) % DIPLOMAS_DATA.length : null,
    );
  const nextDip = () =>
    setDipIndex((i) => (i !== null ? (i + 1) % DIPLOMAS_DATA.length : null));

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
    return () => {
      document.body.style.overflow = "";
    };
  }, [dipIndex]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const data: StoredLayout = {
      sectionVisibility,
      sectionOrder,
      sectionSizes,
      layoutSizes,
      coverFit,
    };
    window.localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(data));
  }, [sectionVisibility, sectionOrder, sectionSizes, layoutSizes, coverFit]);

  const handleBlogLike = (id: number) => {
    const was = blogLikes[id];
    setBlogLikes((p) => ({ ...p, [id]: !p[id] }));
    if (!was)
      addNotif({
        kind: "like",
        title: "Вы оценили запись",
        body: BLOG_POSTS.find((p) => p.id === id)?.title || "",
        link: "/profile",
      });
  };
  const handleBlogFav = (post: (typeof BLOG_POSTS)[0]) => {
    toggleFav({
      id: post.id,
      kind: "article",
      title: post.title,
      author: post.author,
      date: post.date,
      image: post.img,
      stats: { views: post.views, hearts: post.likes, likes: 0 },
      category: "Блог",
      available: true,
    });
  };

  const openBlogArticle = (post: (typeof BLOG_POSTS)[0]) => {
    sessionStorage.setItem("voevoda_profile_scroll", String(window.scrollY));
    navigate(`/journal/${post.id}`, { state: { returnTo: "/profile" } });
  };

  const segBtn = (active: boolean): React.CSSProperties => ({
    padding: "8px 18px",
    border: "none",
    borderRadius: 9,
    fontSize: 13,
    fontWeight: 700,
    background: active ? "#fff" : "transparent",
    color: active ? "#111" : "#6B7280",
    cursor: "pointer",
    boxShadow: active ? "0 2px 8px rgba(15,23,42,.08)" : "none",
    transition: "background .18s ease, color .18s ease, box-shadow .18s ease, opacity .18s ease",
    whiteSpace: "nowrap",
  });




  return (
    <div
      style={{
        paddingTop: embedded ? 0 : 60,
        marginLeft: embedded ? 0 : 56,
        minHeight: embedded ? undefined : "100vh",
        background: embedded ? "transparent" : "#F8F9FB",
        overflowX: "hidden",
      }}
    >
      <style>
        {ANIM}
        {layoutStyle}
      </style>
      {showPersonalFile && isOwnProfile && <LayoutEditorPanel
        open={layoutEdit}
        sectionVisibility={sectionVisibility}
        sectionOrder={sectionOrder}
        layoutSizes={layoutSizes}
        coverFit={coverFit}
        onClose={() => setLayoutEdit(false)}
        onToggleSection={toggleSectionVisibility}
        onMoveSection={moveSection}
        onSetCoverSize={(size) => updateLayoutSize("cover", size)}
        onSetCoverFit={setCoverFit}
        onReset={resetLayout}
      />}
      <div className={`profile-layout${layoutEdit ? " profile-layout-edit-active" : ""}`} style={{ padding: embedded ? 0 : "20px 24px 40px" }}>
        {/* ══ ЛИЧНОЕ ДЕЛО ══ */}
        {showPersonalFile && (
        <ProfileEditableSection layoutEdit={layoutEdit} sectionVisibility={sectionVisibility} sectionOrder={sectionOrder} sectionSizes={sectionSizes} onResize={updateSectionSize} sectionKey="profile" label="Личное дело" minHeight={520} minWidth={620}>
          {!embedded && <div
            className="profile-page-heading"
            style={{
              padding: "20px 24px 16px",
              borderBottom: "1px solid #F5F5F7",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 10,
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#374151"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <h1
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  color: "#111",
                  margin: 0,
                }}
              >
                Личное дело
              </h1>
            </div>
            <PortalBreadcrumb className="compact-breadcrumb" items={[{ label:"Главная", to:"/" }, { label:"Личное дело" }]} />
          </div>}

          <div
            style={{
              padding: "20px 24px 16px",
              display: "flex",
              alignItems: "flex-start",
              gap: 20,
              flexWrap: "wrap",
            }}
          >
            <div style={{ position: "relative", flexShrink: 0 }}>
              <div
                style={{
                  width: 90,
                  height: 90,
                  borderRadius: 16,
                  overflow: "hidden",
                  border: "2px solid #E5E7EB",
                  background: "#F3F4F6",
                  transition: "box-shadow .2s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.boxShadow =
                    "0 6px 18px rgba(0,0,0,.14)")
                }
                onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
              >
                <img
                  src={profileData.photo}
                  alt=""
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
              <div
                style={{
                  position: "absolute",
                  bottom: -8,
                  right: -8,
                  width: 38,
                  height: 38,
                }}
              >
                <img
                  src={profileData.rankImage}
                  alt=""
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    filter: "drop-shadow(0 2px 6px rgba(0,0,0,.4))",
                  }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 160 }}>
              <div style={{ fontSize: 11, color: "#9CA3AF", marginBottom: 3 }}>
                {profileData.rank}
              </div>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  color: "#111",
                  marginBottom: 6,
                }}
              >
                {profileData.name}
              </div>
              <div style={{ marginBottom: 6 }}>
                <IVDisplay index={profileData.index} rating={profileData.rating} />
              </div>
              <div style={{ fontSize: 13, color: "#6B7280" }}>
                {profileData.position}
              </div>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              {profileData.badges.slice(0, 3).map((src, i) => (
                <BadgeBox
                  key={i}
                  src={src}
                  size={72}
                  tooltip={BADGE_TOOLTIPS[i]}
                  topRight={i === 0 ? <ElitaBadge small /> : undefined}
                />
              ))}
              <ExtraBadge count={profileData.extraCount} size={72} onClick={() => navigate("/achievements")} />
            </div>
          </div>

          {/* ─── ТАБЫ ─── */}
          <div
            style={{ padding: "12px 24px", borderBottom: "1px solid #F0F0F0" }}
          >
            <div
              className="profile-segmented"
            >
              {(["Данные", "График подготовки", "Сводка замеров"] as Tab[]).map(
                (t, i, arr) => (
                  <button type="button"
                    key={t}
                    onClick={() => setActiveTab(t)}
                    className={`profile-segmented-btn${activeTab === t ? " active" : ""}`}
                  >
                    {t}
                  </button>
                ),
              )}
            </div>
          </div>

          <div style={{ padding: "24px 24px 20px" }}>
            {activeTab === "Данные" && (
              <div
                style={{
                  display: "flex",
                  gap: 32,
                  flexWrap: "wrap",
                  alignItems: "stretch",
                }}
              >
                <ResizableBox
                  enabled={false}
                  label="Данные"
                  size={layoutSizes.info}
                  minWidth={INFO_MIN_W}
                  minHeight={INFO_MIN_H}
                  resizeDirections={[]}
                  onResize={() => undefined}
                  style={{ flex: "0 0 auto" }}
                >
                  <div style={{ width: "100%" }}>
                    <div
                      style={{
                        background: "#fff",
                        borderRadius: 16,
                        border: "1px solid #E5E7EB",
                        overflow: "hidden",
                        marginBottom: 20,
                      }}
                    >
                      {[
                        {
                          l: "Город",
                          v: profileData.city,
                          icon: (
                            <svg
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="#9CA3AF"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                            >
                              <rect x="2" y="7" width="20" height="14" rx="2" />
                              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                            </svg>
                          ),
                        },
                        {
                          l: "Год рождения",
                          v: profileData.birthYear,
                          icon: (
                            <svg
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="#9CA3AF"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                            >
                              <rect x="3" y="4" width="18" height="18" rx="2" />
                              <line x1="16" y1="2" x2="16" y2="6" />
                              <line x1="8" y1="2" x2="8" y2="6" />
                              <line x1="3" y1="10" x2="21" y2="10" />
                            </svg>
                          ),
                        },
                        {
                          l: "На портале",
                          v: profileData.onPortal,
                          icon: (
                            <svg
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="#9CA3AF"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                            >
                              <circle cx="12" cy="12" r="10" />
                              <polyline points="12 6 12 12 16 14" />
                            </svg>
                          ),
                        },
                        {
                          l: "Сообщество",
                          v: profileData.community,
                          icon: (
                            <svg
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="#9CA3AF"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                            >
                              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                              <circle cx="9" cy="7" r="4" />
                              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                            </svg>
                          ),
                        },
                        {
                          l: "Прошёл курсов",
                          v: String(profileData.courses),
                          icon: (
                            <svg
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="#9CA3AF"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                            >
                              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                            </svg>
                          ),
                        },
                        {
                          l: "Наград",
                          v: String(profileData.awards),
                          icon: (
                            <svg
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="#9CA3AF"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                            >
                              <circle cx="12" cy="8" r="6" />
                              <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
                            </svg>
                          ),
                        },
                        {
                          l: "Подписчиков",
                          v: profileData.followers.toLocaleString(),
                          icon: (
                            <svg
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="#9CA3AF"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                            >
                              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                              <circle cx="9" cy="7" r="4" />
                              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                            </svg>
                          ),
                        },
                      ].map(({ l, v, icon }, i, arr) => (
                        <div
                          key={l}
                          className="vr"
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "16px 20px",
                            borderBottom:
                              i < arr.length - 1 ? "1px solid #F5F5F7" : "none",
                            transition: "background .15s",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 12,
                            }}
                          >
                            {icon}
                            <span style={{ fontSize: 15, color: "#374151" }}>
                              {l}
                            </span>
                          </div>
                          <span
                            style={{
                              fontSize: 15,
                              fontWeight: 700,
                              color: "#111",
                            }}
                          >
                            {v}
                          </span>
                        </div>
                      ))}
                    </div>
                    {isOwnProfile ? (
                    <div style={{ display: "flex", gap: 10 }}>
                      <button type="button"
                        className="vbtn-p"
                        onClick={() => navigate("/edit-profile")}
                        style={{
                          flex: 1,
                          padding: "13px 0",
                          background: "#375DFB",
                          border: "none",
                          borderRadius: 8,
                          color: "#fff",
                          fontSize: 14,
                          fontWeight: 600,
                          cursor: "pointer",
                          transition: "all .15s",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 8,
                        }}
                      >
                        <svg
                          width="15"
                          height="15"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="#fff"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4z" />
                        </svg>
                        Редактировать
                      </button>
                      <button type="button"
                        className="vbtn-w"
                        onClick={() => setLayoutEdit((v) => !v)}
                        style={{
                          flex: 1,
                          padding: "13px 0",
                          background: layoutEdit ? "#EBF1FF" : "#fff",
                          border: layoutEdit
                            ? "1px solid #A5B4FC"
                            : "1px solid #E5E7EB",
                          borderRadius: 8,
                          color: layoutEdit ? "#375DFB" : "#374151",
                          fontSize: 14,
                          cursor: "pointer",
                          transition: "background .15s",
                          fontWeight: layoutEdit ? 700 : 400,
                        }}
                      >
                        {layoutEdit ? "Готово" : "Видимость блоков"}
                      </button>
                    </div>
                    ) : (
                    <div style={{ display: "flex", gap: 10 }}>
                      <button type="button" className="vbtn-p" onClick={() => setIsFollowingProfile(value => !value)} style={{ flex: 1, padding: "13px 0", background: isFollowingProfile ? "#ECFDF5" : "#375DFB", border: isFollowingProfile ? "1px solid #A7F3D0" : "1px solid #375DFB", borderRadius: 8, color: isFollowingProfile ? "#047857" : "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                        {isFollowingProfile ? "Вы подписаны" : "Подписаться"}
                      </button>
                      <button type="button" className="vbtn-w" onClick={() => navigate(`/messages?chat=${testUser?.id ?? 1}`)} style={{ flex: 1, padding: "13px 0", background: "#fff", border: "1px solid #E5E7EB", borderRadius: 8, color: "#374151", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                        Написать
                      </button>
                    </div>
                    )}
                  </div>
                </ResizableBox>
                <div
                  style={{
                    flex: 1,
                    minWidth: 220,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <ResizableBox
                    enabled={layoutEdit}
                    label="Флаг"
                    size={layoutSizes.cover}
                    minWidth={260}
                    minHeight={180}
                    maxHeight={720}
                    resizeDirections={["x", "y", "xy"]}
                    onResize={(size) => updateLayoutSize("cover", size)}
                    style={{ marginBottom: 16 }}
                  >
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        borderRadius: 16,
                        overflow: "hidden",
                        background: "#F3F4F6",
                      }}
                    >
                      <img
                        src={profileData.coverImage}
                        alt=""
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: coverFit,
                          objectPosition: "center",
                          display: "block",
                        }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    </div>
                  </ResizableBox>
                  <p
                    style={{
                      fontSize: 16,
                      color: "#374151",
                      lineHeight: 1.7,
                      margin: 0,
                      flex: 1,
                    }}
                  >
                    {profileData.bio}
                  </p>
                </div>
              </div>
            )}

            {activeTab === "График подготовки" && (
              <div className="profile-training-smooth">
                <TrainingPanel
                  initialSection={chartInitSection as any}
                  initialView={chartInitView as any}
                />
              </div>
            )}

            {activeTab === "Сводка замеров" && (
              <div>
                <div
                  className="profile-segmented"
                  style={{ marginBottom: 20 }}
                >
                  <button type="button"
                    className={`profile-segmented-btn${measuresView === "history" ? " active" : ""}`}
                    onClick={() => setMeasuresView("history")}
                  >
                    Смотреть историю
                  </button>
                  {isOwnProfile && <button type="button"
                    className={`profile-segmented-btn${measuresView === "edit" ? " active" : ""}`}
                    onClick={() => setMeasuresView("edit")}
                  >
                    Редактировать данные
                  </button>}
                  <button type="button"
                    className={`profile-segmented-btn${measuresView === "chart" ? " active" : ""}`}
                    onClick={() => setMeasuresView("chart")}
                  >
                    История замеров
                  </button>
                </div>
                <div className="profile-measures-content">
                  <MeasurementsPanel
                    editable={isOwnProfile && measuresView === "edit"}
                    showHistory={measuresView === "chart"}
                  />
                </div>
              </div>
            )}
          </div>
        </ProfileEditableSection>
        )}

        {showRemaining && (<>
        {/* ══ ПРОЙДЕННЫЕ КУРСЫ ══ */}
        <ProfileEditableSection layoutEdit={layoutEdit} sectionVisibility={sectionVisibility} sectionOrder={sectionOrder} sectionSizes={sectionSizes} onResize={updateSectionSize} sectionKey="courses" label="Пройденные курсы" minHeight={280}>
          <SectionHeader
            icon={
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#374151"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z" />
                <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
              </svg>
            }
            title="Пройденные курсы"
            action={
              <div ref={courseControlsRef} style={{ display: "flex", gap: 10 }}>
                <button type="button"
                  onClick={() => navigate("/course-archive")}
                  className="vbtn-w"
                  style={{ display: "flex", alignItems: "center", gap: 6, background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: 10, padding: "8px 14px", fontSize: 13, fontWeight: 600, color: "#374151", cursor: "pointer", transition: "all .15s" }}
                  onMouseEnter={e => { e.currentTarget.style.background="#EBF1FF"; e.currentTarget.style.borderColor="#C7D2FE"; e.currentTarget.style.color="#375DFB"; }}
                  onMouseLeave={e => { e.currentTarget.style.background="#F9FAFB"; e.currentTarget.style.borderColor="#E5E7EB"; e.currentTarget.style.color="#374151"; }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg>
                  Архив
                </button>
                <div style={{ position: "relative" }}>
                  <button type="button"
                    onClick={() => {
                      setShowSortDrop((open) => !open);
                      setShowCourseFilterDrop(false);
                    }}
                    aria-expanded={showSortDrop}
                    className="vbtn-w"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      background: showSortDrop ? "#EBF1FF" : "#F9FAFB",
                      border: `1px solid ${showSortDrop ? "#C7D2FE" : "#E5E7EB"}`,
                      borderRadius: 10,
                      padding: "8px 14px",
                      fontSize: 13,
                      color: showSortDrop ? "#375DFB" : "#374151",
                      cursor: "pointer",
                      transition: "background .15s",
                    }}
                  >
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <line x1="8" y1="6" x2="21" y2="6" />
                      <line x1="8" y1="12" x2="21" y2="12" />
                      <line x1="8" y1="18" x2="21" y2="18" />
                      <line x1="3" y1="6" x2="3.01" y2="6" />
                      <line x1="3" y1="12" x2="3.01" y2="12" />
                      <line x1="3" y1="18" x2="3.01" y2="18" />
                    </svg>
                    По {courseSort === "date" ? "дате" : "рейтингу"}
                    <svg
                      width="11"
                      height="11"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <polyline points="6 9 12 15 18 9" style={{ transformOrigin: "12px 12px", transform: showSortDrop ? "rotate(180deg)" : "none", transition: "transform .18s ease" }} />
                    </svg>
                  </button>
                  {showSortDrop && (
                    <div
                      style={{
                        position: "absolute",
                        top: "calc(100% + 4px)",
                        right: 0,
                        background: "#fff",
                        border: "1px solid #E5E7EB",
                        borderRadius: 8,
                        boxShadow: "0 8px 24px rgba(0,0,0,.1)",
                        zIndex: 100,
                        overflow: "hidden",
                        minWidth: 160,
                        animation: "fadeUp .15s ease both",
                      }}
                    >
                      {[
                        ["date", "По дате"],
                        ["rating", "По рейтингу"],
                      ].map(([v, l]) => (
                        <button type="button"
                          key={v}
                          onClick={() => {
                            setCourseSort(v as "date" | "rating");
                            setShowSortDrop(false);
                          }}
                          style={{
                            display: "block",
                            width: "100%",
                            padding: "10px 16px",
                            background: courseSort === v ? "#EBF1FF" : "none",
                            border: "none",
                            textAlign: "left",
                            fontSize: 13,
                            color: courseSort === v ? "#375DFB" : "#374151",
                            cursor: "pointer",
                            fontWeight: courseSort === v ? 600 : 400,
                            transition: "background .12s",
                          }}
                        >
                          {l}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div style={{ position: "relative" }}>
                  <button type="button"
                    className="vbtn-w"
                    onClick={() => {
                      setShowCourseFilterDrop((open) => !open);
                      setShowSortDrop(false);
                    }}
                    aria-expanded={showCourseFilterDrop}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      background: courseFilter !== "all" || showCourseFilterDrop ? "#EBF1FF" : "#F9FAFB",
                      border: `1px solid ${courseFilter !== "all" || showCourseFilterDrop ? "#C7D2FE" : "#E5E7EB"}`,
                      borderRadius: 8,
                      padding: "8px 14px",
                      fontSize: 13,
                      color: courseFilter !== "all" || showCourseFilterDrop ? "#375DFB" : "#374151",
                      cursor: "pointer",
                      transition: "background .15s",
                    }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <line x1="4" y1="6" x2="20" y2="6" />
                      <line x1="8" y1="12" x2="16" y2="12" />
                      <line x1="11" y1="18" x2="13" y2="18" />
                    </svg>
                    {courseFilter === "all" ? "Фильтры" : courseFilter === "completed" ? "Завершённые" : "Лучшие"}
                  </button>
                  {showCourseFilterDrop && (
                    <div style={{ position: "absolute", top: "calc(100% + 4px)", right: 0, background: "#fff", border: "1px solid #E5E7EB", borderRadius: 8, boxShadow: "0 8px 24px rgba(0,0,0,.1)", zIndex: 100, overflow: "hidden", minWidth: 170, animation: "fadeUp .15s ease both" }}>
                      {[["all", "Все курсы"], ["completed", "Завершённые"], ["favorite", "Рейтинг 5.0"]].map(([v, l]) => (
                        <button type="button" key={v} onClick={() => { setCourseFilter(v as "all" | "completed" | "favorite"); setShowCourseFilterDrop(false); }} style={{ display: "block", width: "100%", padding: "10px 16px", background: courseFilter === v ? "#EBF1FF" : "none", border: "none", textAlign: "left", fontSize: 13, color: courseFilter === v ? "#375DFB" : "#374151", cursor: "pointer", fontWeight: courseFilter === v ? 700 : 400 }}>
                          {l}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            }
          />
          {isOwnProfile && (
            <div style={{ margin: "0 24px 4px", background: "linear-gradient(135deg,#EEF3FF,#F7FAFF)", border: "1px solid #DBE5FF", borderRadius: 16, padding: "16px 18px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ position: "relative", width: 56, height: 56, flexShrink: 0 }}>
                    <svg width="56" height="56" viewBox="0 0 56 56">
                      <circle cx="28" cy="28" r="24" fill="none" stroke="#DBE5FF" strokeWidth="6" />
                      <circle cx="28" cy="28" r="24" fill="none" stroke="#375DFB" strokeWidth="6" strokeLinecap="round" strokeDasharray={2 * Math.PI * 24} strokeDashoffset={2 * Math.PI * 24 * (1 - learning.overallPct / 100)} transform="rotate(-90 28 28)" style={{ transition: "stroke-dashoffset .6s ease" }} />
                    </svg>
                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: "#375DFB" }}>{learning.overallPct}%</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#111", display: "flex", alignItems: "center", gap: 8 }}>
                      Прогресс обучения
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 700, color: "#059669", background: "#ECFDF5", border: "1px solid #A7F3D0", borderRadius: 20, padding: "2px 8px" }}><span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10B981" }} />вживую</span>
                    </div>
                    <div style={{ fontSize: 13, color: "#4B5563", marginTop: 3 }}>
                      Просмотрено уроков <b style={{ color: "#111" }}>{learning.lessonsViewed} / {learning.lessonsTotal}</b> · сдано тестов <b style={{ color: "#111" }}>{learning.testsPassed} / {learning.testsTotal}</b>
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button type="button" onClick={() => navigate("/lessons/1")} style={{ padding: "9px 16px", background: "#375DFB", border: "none", borderRadius: 10, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Продолжить обучение</button>
                  {learning.hasProgress && <button type="button" onClick={() => { if (window.confirm("Сбросить весь прогресс обучения — отметки о просмотре уроков и результаты тестов?")) learning.resetAll(); }} style={{ padding: "9px 14px", background: "#fff", border: "1px solid #E5E7EB", borderRadius: 10, color: "#6B7280", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Сбросить прогресс</button>}
                </div>
              </div>
            </div>
          )}
          <div style={{ padding: "0 24px" }}>
            {visibleCourses.length === 0 && (
              <div style={{ padding: "42px 20px", textAlign: "center", color: "#6B7280" }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#374151", marginBottom: 6 }}>Курсы не найдены</div>
                <div style={{ fontSize: 13, marginBottom: 14 }}>Для выбранного фильтра пока нет результатов.</div>
                <button type="button" onClick={() => setCourseFilter("all")} style={{ padding: "9px 15px", border: "1px solid #C7D2FE", background: "#EBF1FF", color: "#375DFB", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Показать все курсы</button>
              </div>
            )}
            {visibleCourses.map((c, idx) => (
              <div
                key={c.id}
                className="vr"
                onClick={() =>
                  !layoutEdit &&
                  navigate(`/my-courses/${encodeURIComponent(c.title)}`, {
                    state: { title: c.title },
                  })
                }
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 20,
                  padding: "20px 0",
                  borderBottom:
                    idx < visibleCourses.length - 1 ? "1px solid #F5F5F7" : "none",
                  transition: "background .15s",
                  cursor: layoutEdit ? "default" : "pointer",
                  animation: archivingIds.has(c.id) ? 'archiveOut .44s ease forwards' : undefined,
                  overflow: archivingIds.has(c.id) ? 'hidden' : undefined,
                  pointerEvents: archivingIds.has(c.id) ? 'none' : undefined,
                }}
              >
                <div
                  style={{
                    width: 160,
                    height: 115,
                    borderRadius: 12,
                    overflow: "hidden",
                    flexShrink: 0,
                    background: "#F3F4F6",
                  }}
                >
                  <img
                    src={c.img}
                    alt=""
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      objectPosition: "center top",
                      transition: "transform .3s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.transform = "scale(1.04)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.transform = "scale(1)")
                    }
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                      color: "#111",
                      marginBottom: 4,
                    }}
                  >
                    {c.title}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "#9CA3AF",
                      marginBottom: 14,
                      display: "flex",
                      gap: 8,
                      alignItems: "center",
                    }}
                  >
                    Начало - {c.start}{" "}
                    <span
                      style={{
                        width: 3,
                        height: 3,
                        background: "#D1D5DB",
                        borderRadius: "50%",
                        display: "inline-block",
                      }}
                    />{" "}
                    Конец - {c.end}
                  </div>
                  <div style={{ display: "flex", gap: 24 }}>
                    {[
                      ["Общий прогресс курса", c.progress, "#C2D6FF"],
                      ["Домашние задания", c.hw, "#38C793"],
                    ].map(([label, pct, color]) => (
                      <div key={String(label)} style={{ flex: 1 }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: 6,
                          }}
                        >
                          <span style={{ fontSize: 12, color: "#6B7280" }}>
                            {label}
                          </span>
                          <span
                            style={{
                              fontSize: 12,
                              fontWeight: 600,
                              color: "#374151",
                            }}
                          >
                            {pct}%
                          </span>
                        </div>
                        <div
                          style={{
                            height: 5,
                            background: "#E5E7EB",
                            borderRadius: 3,
                          }}
                        >
                          <div
                            className="vprog"
                            style={{
                              width: `${pct}%`,
                              height: "100%",
                              background: String(color),
                              borderRadius: 3,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                    gap: 8,
                    flexShrink: 0,
                  }}
                >
                  {c.progress >= 100 ? (
                    <>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 5 }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" fill="#ECFDF5" />
                      <polyline
                        points="7 13 10 16 17 9"
                        stroke="#10B981"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#10B981",
                      }}
                    >
                      Пройден
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "#6B7280",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    Балов за курс{" "}
                    <span style={{ fontWeight: 700, color: "#374151" }}>
                      {c.rating}
                    </span>
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="#F59E0B"
                      stroke="none"
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  </div>
                    </>
                  ) : (
                    <>
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="9" /><polyline points="12 7 12 12 15 14" /></svg>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#F59E0B" }}>В процессе</span>
                  </div>
                  <div style={{ fontSize: 12, color: "#9CA3AF", whiteSpace: "nowrap", textAlign: "right" }}>
                    {(c as { live?: boolean }).live
                      ? `Уроки ${(c as { lessonsViewed?: number }).lessonsViewed ?? 0}/${(c as { lessonsTotal?: number }).lessonsTotal ?? 0} · тесты ${(c as { testsPassed?: number }).testsPassed ?? 0}/${(c as { testsTotal?: number }).testsTotal ?? 0}`
                      : `Пройдено ${c.progress}%`}
                  </div>
                    </>
                  )}
                  <button type="button"
                    className="vbtn-g"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/my-courses/${encodeURIComponent(c.title)}`, {
                        state: { title: c.title },
                      });
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      background: "#EBF1FF",
                      border: "1px solid #C7D2FE",
                      borderRadius: 6,
                      padding: "7px 12px",
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#375DFB",
                      cursor: "pointer",
                      transition: "all .15s",
                    }}
                  >
                    Подробнее{" "}
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                  {c.progress >= 100 && (
                    <button type="button"
                      onClick={(e) => { e.stopPropagation(); handleArchiveCourse(c as any); }}
                      title="Добавить в архив"
                      style={{ display: "flex", alignItems: "center", gap: 4, background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: 6, padding: "7px 12px", fontSize: 12, fontWeight: 600, color: "#6B7280", cursor: "pointer", transition: "all .15s" }}
                      onMouseEnter={e => { e.currentTarget.style.background="#FFF0F0"; e.currentTarget.style.borderColor="#FECACA"; e.currentTarget.style.color="#EF4444"; }}
                      onMouseLeave={e => { e.currentTarget.style.background="#F9FAFB"; e.currentTarget.style.borderColor="#E5E7EB"; e.currentTarget.style.color="#6B7280"; }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg>
                      В архив
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ProfileEditableSection>

        {/* ══ МОЙ БЛОГ ══ */}
        <ProfileEditableSection layoutEdit={layoutEdit} sectionVisibility={sectionVisibility} sectionOrder={sectionOrder} sectionSizes={sectionSizes} onResize={updateSectionSize} sectionKey="blog" label="Мой блог" minHeight={320}>
          <SectionHeader
            icon={
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#374151"
                strokeWidth="1.5"
                strokeLinecap="round"
              >
                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z" />
                <path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
              </svg>
            }
            title="Мой блог"
            action={
              <button type="button"
                className="vbtn-g"
                onClick={() => navigate("/microblog")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  background: "#EBF1FF",
                  border: "1px solid #C7D2FE",
                  borderRadius: 6,
                  padding: "8px 16px",
                  fontSize: 13,
                  color: "#375DFB",
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all .15s",
                }}
              >
                Добавить +
              </button>
            }
          />
          <div
            style={{
              padding: "20px 24px",
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 16,
            }}
          >
            {BLOG_POSTS.map((post) => {
              const liked = blogLikes[post.id];
              const juked = blogComments[post.id];
              const favd = isFav(post.id, "article");
              return (
                <div
                  key={post.id}
                  className="vblog-card"
                  onClick={() => !layoutEdit && openBlogArticle(post)}
                  style={{
                    background: "#F9FAFB",
                    borderRadius: 16,
                    border: "1px solid #E5E7EB",
                    overflow: "hidden",
                    transition: "transform .2s, box-shadow .2s",
                    cursor: layoutEdit ? "default" : "pointer",
                  }}
                >
                  <div
                    style={{
                      height: 180,
                      background: "#F3F4F6",
                      cursor: "pointer",
                      overflow: "hidden",
                    }}
                  >
                    <img
                      src={post.img}
                      alt=""
                      className="vblog-img"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        transition: "transform .35s",
                      }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                  <div style={{ padding: "12px 14px" }}>
                    <p
                      style={
                        {
                          fontSize: 13,
                          fontWeight: 600,
                          color: "#111",
                          lineHeight: 1.4,
                          marginBottom: 8,
                          cursor: "pointer",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          transition: "color .15s",
                        } as React.CSSProperties
                      }
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.color = "#375DFB")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.color = "#111")
                      }
                    >
                      {post.title}
                    </p>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 10,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 500,
                          color: "#374151",
                        }}
                      >
                        ВДВ СКОВ
                      </span>
                      <span style={{ fontSize: 12, color: "#9CA3AF" }}>
                        {post.date}
                      </span>
                    </div>
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 12 }}
                    >
                      <button type="button"
                        onClick={(e) => { e.stopPropagation(); handleBlogLike(post.id); }}
                        className="vlike"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: 0,
                          fontSize: 12,
                          color: liked ? "#EF4444" : "#9CA3AF",
                          transition: "transform .15s, color .15s",
                        }}
                      >
                        <IcHeart active={liked} />
                        {post.likes + (liked ? 1 : 0)}
                      </button>
                      <button type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setBlogComments((p) => ({
                            ...p,
                            [post.id]: !p[post.id],
                          }));
                        }}
                        className="vlike"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: 0,
                          fontSize: 12,
                          color: juked ? "#10B981" : "#9CA3AF",
                          transition: "transform .15s",
                        }}
                      >
                        <IcThumb color={juked ? "#10B981" : "#CDD0D5"} />
                        {post.jumbo + (juked ? 1 : 0)}
                      </button>
                      <button type="button"
                        onClick={(e) => { e.stopPropagation(); handleBlogFav(post); }}
                        style={{
                          marginLeft: "auto",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: 2,
                          display: "flex",
                          transition: "transform .15s",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.transform = "scale(1.2)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.transform = "scale(1)")
                        }
                      >
                        <IcBookmarkBlog active={favd} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ProfileEditableSection>

        {/* ══ МОИ СООБЩЕСТВА ══ */}
        <ProfileEditableSection layoutEdit={layoutEdit} sectionVisibility={sectionVisibility} sectionOrder={sectionOrder} sectionSizes={sectionSizes} onResize={updateSectionSize} sectionKey="communities" label="Мои сообщества" minHeight={300}>
          <SectionHeader
            icon={
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#374151"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            }
            title="Мои сообщества"
            action={
              <button type="button"
                onClick={() => setCommSort((sort) => (sort === "newest" ? "oldest" : "newest"))}
                className="vbtn-w"
                title="Изменить порядок по дате подписки"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  background: "#F9FAFB",
                  border: "1px solid #E5E7EB",
                  borderRadius: 10,
                  padding: "8px 14px",
                  fontSize: 13,
                  color: "#374151",
                  cursor: "pointer",
                  transition: "background .15s",
                }}
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <line x1="8" y1="6" x2="21" y2="6" />
                  <line x1="8" y1="12" x2="21" y2="12" />
                  <line x1="8" y1="18" x2="21" y2="18" />
                  <line x1="3" y1="6" x2="3.01" y2="6" />
                </svg>
                {commSort === "newest" ? "Сначала новые" : "Сначала старые"}
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  style={{
                    transform: commSort === "newest" ? "rotate(0deg)" : "rotate(180deg)",
                    transition: "transform .15s",
                  }}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
            }
          />
          <div style={{ padding: "0 24px" }}>
            {visibleCommunities.length === 0 && (
              <div style={{ padding: "28px 0", textAlign: "center", color: "#6B7280", fontSize: 13 }}>
                Вы пока не состоите в сообществах.{" "}
                <button type="button" onClick={() => navigate("/communities")} style={{ border: 0, background: "none", color: "#375DFB", fontWeight: 700, cursor: "pointer" }}>
                  Выбрать сообщество
                </button>
              </div>
            )}
            {visibleCommunities.map((c, idx) => (
              <div
                key={c.id}
                className="vr"
                onClick={() => !layoutEdit && navigate(`/communities?community=${c.id}`)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  padding: "16px 0",
                  borderBottom:
                    idx < visibleCommunities.length - 1
                      ? "1px solid #F5F5F7"
                      : "none",
                  transition: "background .15s",
                  cursor: layoutEdit ? "default" : "pointer",
                }}
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 12,
                    overflow: "hidden",
                    flexShrink: 0,
                    background: "#F3F4F6",
                    border: "1px solid #E5E7EB",
                  }}
                >
                  <img
                    src={c.image}
                    alt=""
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      objectPosition: "center top",
                    }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: "#111",
                      marginBottom: 3,
                    }}
                  >
                    {c.name}
                  </div>
                  <div style={{ fontSize: 12, color: "#9CA3AF" }}>
                    {c.city} · {c.type} · {c.members.toLocaleString()} участников · {formatCommunityJoinedAt(c)}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
                  <button type="button"
                    className="vbtn-w"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleCommunityJoin(c.id);
                      addNotif({ kind: "system", title: "Вы вышли из сообщества", body: c.name, link: "/communities" });
                    }}
                    style={{
                      background: "#fff",
                      border: "1px solid #E5E7EB",
                      borderRadius: 6,
                      padding: "8px 14px",
                      fontSize: 13,
                      color: "#374151",
                      cursor: "pointer",
                      transition: "background .15s",
                    }}
                  >
                    Отписаться
                  </button>
                  <button type="button"
                    className="vbtn-g"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/communities?community=${c.id}`);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      background: "#EBF1FF",
                      border: "1px solid #C7D2FE",
                      borderRadius: 6,
                      padding: "8px 14px",
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#375DFB",
                      cursor: "pointer",
                      transition: "all .15s",
                    }}
                  >
                    Подробнее{" "}
                    <svg
                      width="11"
                      height="11"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    >
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </ProfileEditableSection>

        {/* ══ КАПТЁРКА ══ */}
        <ProfileEditableSection layoutEdit={layoutEdit} sectionVisibility={sectionVisibility} sectionOrder={sectionOrder} sectionSizes={sectionSizes} onResize={updateSectionSize} sectionKey="kaptorka" label="Каптёрка" minHeight={260}>
          <SectionHeader
            icon={
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#374151"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
            }
            title="Мои объявления в каптёрке"
            action={
              <button type="button"
                className="vbtn-g"
                onClick={() => navigate("/kaptorka?create=1")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  background: "#EBF1FF",
                  border: "1px solid #C7D2FE",
                  borderRadius: 6,
                  padding: "8px 16px",
                  fontSize: 13,
                  color: "#375DFB",
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all .15s",
                }}
              >
                Добавить объявление +
              </button>
            }
          />
          <div style={{ padding: "0 24px" }}>
            {ownKaptorkaAds.length === 0 && (
              <div style={{ padding: "28px 0", textAlign: "center", color: "#6B7280", fontSize: 13 }}>
                У вас пока нет объявлений. Нажмите «Добавить объявление», чтобы разместить первое.
              </div>
            )}
            {ownKaptorkaAds.map((k, idx) => (
              <div
                key={k.id}
                className="vr"
                onClick={() => !layoutEdit && navigate(`/kaptorka/${k.id}`)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  padding: "16px 0",
                  borderBottom:
                    idx < ownKaptorkaAds.length - 1
                      ? "1px solid #F5F5F7"
                      : "none",
                  transition: "background .15s",
                  cursor: layoutEdit ? "default" : "pointer",
                }}
              >
                <div
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 12,
                    overflow: "hidden",
                    flexShrink: 0,
                    background: "#F3F4F6",
                    border: "1px solid #E5E7EB",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <img
                    src={k.image}
                    alt=""
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: "#111",
                      marginBottom: 4,
                    }}
                  >
                    {k.title}
                  </div>
                  <div style={{ fontSize: 12, color: "#9CA3AF" }}>
                    {k.category} · {k.condition}
                  </div>
                  <div style={{ fontSize: 12, color: "#9CA3AF" }}>
                    {k.city} · {k.date}
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                    gap: 8,
                    flexShrink: 0,
                  }}
                >
                  <span
                    style={{ fontSize: 16, fontWeight: 700, color: "#059669" }}
                  >
                    {k.price ? `${k.price.toLocaleString()} ₽` : "Обмен"}
                  </span>
                  <button type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/kaptorka/${k.id}`);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      background: "none",
                      border: "none",
                      fontSize: 12,
                      color: "#9CA3AF",
                      cursor: "pointer",
                      transition: "color .15s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = "#375DFB")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = "#9CA3AF")
                    }
                  >
                    К объявлению
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 8 16 12 12 16" />
                      <line x1="8" y1="12" x2="16" y2="12" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </ProfileEditableSection>

        {/* ══ СПОРТИВНЫЕ ДОСТИЖЕНИЯ ══ */}
        <ProfileEditableSection layoutEdit={layoutEdit} sectionVisibility={sectionVisibility} sectionOrder={sectionOrder} sectionSizes={sectionSizes} onResize={updateSectionSize} sectionKey="sportAch" label="Спортивные достижения" minHeight={260}>
          <SectionHeader
            icon={
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#374151"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="8" r="6" />
                <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
              </svg>
            }
            title="Спортивные достижения"
            action={
              <button type="button"
                onClick={() => openAddAch("sport")}
                style={{
                  width: 34,
                  height: 34,
                  background: "#EBF1FF",
                  border: "1px solid #C7D2FE",
                  borderRadius: 6,
                  fontSize: 20,
                  color: "#375DFB",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 400,
                  transition: "background .15s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#DFE8FF")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "#EBF1FF")
                }
                title="Добавить достижение"
              >
                +
              </button>
            }
          />
          <div style={{ padding: "0 24px" }}>
            {sportAch.length === 0 && (
              <div
                style={{
                  padding: "32px 0",
                  textAlign: "center",
                  color: "#9CA3AF",
                  fontSize: 14,
                }}
              >
                Нет достижений. Нажмите «+» чтобы добавить.
              </div>
            )}
            {sportAch.map((it, i) => (
              <div
                key={it.id}
                className="vach-row vr"
                onClick={() => !layoutEdit && setSelectedAchievementId(it.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "14px 0",
                  borderBottom:
                    i < sportAch.length - 1 ? "1px solid #F0F0F0" : "none",
                  transition: "background .15s",
                  position: "relative",
                  cursor: layoutEdit ? "default" : "pointer",
                }}
              >
                <div
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 12,
                    overflow: "hidden",
                    flexShrink: 0,
                    background: "#F3F4F6",
                    border: "1px solid #E5E7EB",
                  }}
                >
                  <img
                    src={it.img}
                    alt=""
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 600,
                      color: "#111",
                      marginBottom: 3,
                    }}
                  >
                    {it.name}
                  </div>
                  <div
                    style={{ fontSize: 12, color: "#6B7280", lineHeight: 1.4 }}
                  >
                    {it.info}
                  </div>
                </div>
                <button type="button"
                  className="vach-actions"
                  onClick={(e) => {
                    e.stopPropagation();
                    openEditAch("sport", it.id);
                  }}
                  style={{
                    background: "#F3F4F6",
                    border: "1px solid #E5E7EB",
                    borderRadius: 8,
                    cursor: "pointer",
                    color: "#6B7280",
                    padding: "7px 9px",
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "background .15s, color .15s, opacity .15s",
                    opacity: 0,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#EBF1FF";
                    e.currentTarget.style.borderColor = "#C7D2FE";
                    e.currentTarget.style.color = "#375DFB";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#F3F4F6";
                    e.currentTarget.style.borderColor = "#E5E7EB";
                    e.currentTarget.style.color = "#6B7280";
                  }}
                  title="Редактировать"
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  >
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4z" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </ProfileEditableSection>

        {/* ══ ДРУГИЕ ДОСТИЖЕНИЯ ══ */}
        <ProfileEditableSection layoutEdit={layoutEdit} sectionVisibility={sectionVisibility} sectionOrder={sectionOrder} sectionSizes={sectionSizes} onResize={updateSectionSize} sectionKey="otherAch" label="Другие достижения" minHeight={260}>
          <SectionHeader
            icon={
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#374151"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="8" r="6" />
                <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
              </svg>
            }
            title="Другие достижения"
            action={
              <button type="button"
                onClick={() => openAddAch("other")}
                style={{
                  width: 34,
                  height: 34,
                  background: "#EBF1FF",
                  border: "1px solid #C7D2FE",
                  borderRadius: 6,
                  fontSize: 20,
                  color: "#375DFB",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 400,
                  transition: "background .15s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#DFE8FF")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "#EBF1FF")
                }
                title="Добавить достижение"
              >
                +
              </button>
            }
          />
          <div style={{ padding: "0 24px" }}>
            {otherAch.length === 0 && (
              <div
                style={{
                  padding: "32px 0",
                  textAlign: "center",
                  color: "#9CA3AF",
                  fontSize: 14,
                }}
              >
                Нет достижений. Нажмите «+» чтобы добавить.
              </div>
            )}
            {otherAch.map((it, i) => (
              <div
                key={it.id}
                className="vach-row vr"
                onClick={() => !layoutEdit && setSelectedAchievementId(it.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "14px 0",
                  borderBottom:
                    i < otherAch.length - 1 ? "1px solid #F0F0F0" : "none",
                  transition: "background .15s",
                  position: "relative",
                  cursor: layoutEdit ? "default" : "pointer",
                }}
              >
                <div
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 12,
                    overflow: "hidden",
                    flexShrink: 0,
                    background: "#F3F4F6",
                    border: "1px solid #E5E7EB",
                  }}
                >
                  <img
                    src={it.img}
                    alt=""
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 600,
                      color: "#111",
                      marginBottom: 3,
                    }}
                  >
                    {it.name}
                  </div>
                  <div
                    style={{ fontSize: 12, color: "#6B7280", lineHeight: 1.4 }}
                  >
                    {it.info}
                  </div>
                </div>
                <button type="button"
                  className="vach-actions"
                  onClick={(e) => {
                    e.stopPropagation();
                    openEditAch("other", it.id);
                  }}
                  style={{
                    background: "#F3F4F6",
                    border: "1px solid #E5E7EB",
                    borderRadius: 8,
                    cursor: "pointer",
                    color: "#6B7280",
                    padding: "7px 9px",
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "background .15s, color .15s, opacity .15s",
                    opacity: 0,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#EBF1FF";
                    e.currentTarget.style.borderColor = "#C7D2FE";
                    e.currentTarget.style.color = "#375DFB";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#F3F4F6";
                    e.currentTarget.style.borderColor = "#E5E7EB";
                    e.currentTarget.style.color = "#6B7280";
                  }}
                  title="Редактировать"
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  >
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4z" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </ProfileEditableSection>

        {/* ══ ДИПЛОМЫ ══ */}
        <ProfileEditableSection layoutEdit={layoutEdit} sectionVisibility={sectionVisibility} sectionOrder={sectionOrder} sectionSizes={sectionSizes} onResize={updateSectionSize} sectionKey="diplomas" label="Дипломы" minHeight={280}>
          <SectionHeader
            icon={
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#374151"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="8" r="6" />
                <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
              </svg>
            }
            title="Дипломы от УТЦ Воевода"
          />
          <div style={{ padding: "0 24px" }}>
            {DIPLOMAS_DATA.map((d, idx) => (
              <div
                key={d.id}
                onClick={() => openDip(idx)}
                className="vdip-card vr"
                style={{
                  display: "flex",
                  gap: 16,
                  padding: "20px 0",
                  borderBottom:
                    idx < DIPLOMAS_DATA.length - 1
                      ? "1px solid #F5F5F7"
                      : "none",
                  transition: "background .15s",
                  borderRadius: 12,
                }}
              >
                <div
                  style={{
                    width: 105,
                    height: 148,
                    borderRadius: 10,
                    overflow: "hidden",
                    flexShrink: 0,
                    background: "#F3F4F6",
                  }}
                >
                  <img
                    className="vdip-preview"
                    src={d.img}
                    alt=""
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      transition: "transform .2s, box-shadow .2s",
                    }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: "#111",
                      marginBottom: 4,
                    }}
                  >
                    {d.title}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "#9CA3AF",
                      marginBottom: 12,
                      lineHeight: 1.5,
                    }}
                  >
                    {d.desc}
                  </div>
                  <div style={{ display: "flex", gap: 10 }}>
                    {d.badges.map((b, i) => (
                      <div
                        key={i}
                        className="vdip-badge"
                        style={{
                          width: 52,
                          height: 52,
                          borderRadius: 10,
                          background: "#F3F4F6",
                          border: "1px solid #E5E7EB",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          overflow: "hidden",
                          filter: "grayscale(100%)",
                          transition:
                            "filter .25s ease, transform .25s cubic-bezier(.34,1.4,.64,1), box-shadow .25s ease, border-color .25s ease",
                        }}
                      >
                        <img
                          src={b}
                          alt=""
                          style={{
                            width: "70%",
                            height: "70%",
                            objectFit: "contain",
                          }}
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display =
                              "none";
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                    gap: 6,
                    flexShrink: 0,
                  }}
                >
                  <span
                    style={{
                      fontSize: 12,
                      color: "#9CA3AF",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Дата получения {d.date}
                  </span>
                  <button
                    type="button"
                    onClick={(event) => { event.stopPropagation(); openDip(idx); }}
                    className="vdip-open"
                    style={{
                      fontSize: 12,
                      color: "#2F52F0",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                      fontWeight: 700,
                      padding: "7px 14px",
                      borderRadius: 9,
                      border: "1px solid #C7D2FE",
                      background: "linear-gradient(135deg,#F4F7FF,#E8EEFF)",
                      boxShadow: "0 4px 12px rgba(55,93,251,.12)",
                      cursor: "pointer",
                    }}
                  >
                    Открыть
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    >
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </ProfileEditableSection>
        </>)}
      </div>

      <ProfileDetailModal
        open={!!selectedCourse}
        title={selectedCourse?.title ?? "Курс"}
        subtitle={selectedCourse ? `Начало ${selectedCourse.start} • Конец ${selectedCourse.end}` : undefined}
        image={selectedCourse?.img}
        fields={selectedCourse ? [
          { label: "Прогресс", value: `${selectedCourse.progress}%` },
          { label: "Домашние задания", value: `${selectedCourse.hw}%` },
          { label: "Оценка", value: `${selectedCourse.rating} ★` },
          { label: "Статус", value: selectedCourse.progress >= 100 ? "Пройден" : "В процессе" },
        ] : []}
        description="Карточка курса открывается целиком: здесь можно быстро посмотреть прогресс, домашние задания, оценку и перейти к материалам курса."
        primaryLabel="Открыть курс"
        onPrimary={() => {
          if (!selectedCourse) return;
          navigate(`/my-courses/${encodeURIComponent(selectedCourse.title)}`);
        }}
        secondaryLabel="Закрыть"
        onSecondary={() => setSelectedCourse(null)}
        onClose={() => setSelectedCourse(null)}
      />

      <ProfileDetailModal
        open={!!selectedBlogPost}
        title={selectedBlogPost?.title ?? "Публикация"}
        subtitle={selectedBlogPost?.date}
        image={selectedBlogPost?.img}
        fields={selectedBlogPost ? [
          { label: "Просмотры", value: selectedBlogPost.views },
          { label: "Нравится", value: selectedBlogPost.likes + (blogLikes[selectedBlogPost.id] ? 1 : 0) },
          { label: "Оценки", value: selectedBlogPost.jumbo + (blogComments[selectedBlogPost.id] ? 1 : 0) },
          { label: "Автор", value: selectedBlogPost.author },
        ] : []}
        description="Открыта публикация из профиля. Можно перейти в журнал, поставить отметку или добавить материал в избранное прямо из карточки."
        primaryLabel="Открыть в журнале"
        onPrimary={() => {
          if (selectedBlogPost) openBlogArticle(selectedBlogPost);
        }}
        secondaryLabel={selectedBlogPost && isFav(selectedBlogPost.id, "article") ? "Убрать из избранного" : "В избранное"}
        onSecondary={() => {
          if (selectedBlogPost) handleBlogFav(selectedBlogPost);
        }}
        onClose={() => setSelectedBlogPost(null)}
      />

      <AchievementDetailModal
        achievement={selectedAchievement}
        onClose={() => setSelectedAchievementId(null)}
        onEdit={() => {
          if (selectedAchievement) openEditAch(selectedAchievement.section, selectedAchievement.id);
        }}
        onOpenAll={() => navigate("/all-achievements")}
      />

      <AchieveModal
        open={achModal.open}
        title={
          achModal.section === "sport"
            ? "Спортивные достижения"
            : "Другие достижения"
        }
        initial={
          achInitial ? { name: achInitial.name, info: achInitial.info, img: achInitial.img } : null
        }
        onSave={saveAch}
        onClose={closeAchModal}
        onDelete={achModal.editId !== null ? deleteAch : undefined}
        defaultImage={achModal.section === "sport" ? "/dost1.png" : "/dost3.png"}
      />

      {dipModal && dipIndex !== null && (
        <div
          onClick={closeDip}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.82)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10000,
            padding: 20,
            animation: "fadeIn .18s ease",
          }}
        >
          <button type="button"
            onClick={(e) => {
              e.stopPropagation();
              prevDip();
            }}
            className="vdip-nav-btn"
            style={{
              position: "absolute",
              left: 24,
              top: "50%",
              transform: "translateY(-50%)",
              width: 48,
              height: 48,
              borderRadius: "50%",
              background: "rgba(255,255,255,.1)",
              border: "1px solid rgba(255,255,255,.2)",
              color: "#fff",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 10001,
              backdropFilter: "blur(4px)",
              transition: "background .15s",
            }}
            aria-label="Предыдущий диплом"
          >
            <IcArrow dir="left" />
          </button>
          <button type="button"
            onClick={(e) => {
              e.stopPropagation();
              nextDip();
            }}
            className="vdip-nav-btn"
            style={{
              position: "absolute",
              right: 24,
              top: "50%",
              transform: "translateY(-50%)",
              width: 48,
              height: 48,
              borderRadius: "50%",
              background: "rgba(255,255,255,.1)",
              border: "1px solid rgba(255,255,255,.2)",
              color: "#fff",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 10001,
              backdropFilter: "blur(4px)",
              transition: "background .15s",
            }}
            aria-label="Следующий диплом"
          >
            <IcArrow dir="right" />
          </button>
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: 700,
              width: "100%",
              background: "#fff",
              borderRadius: 20,
              overflow: "hidden",
              boxShadow: "0 24px 60px rgba(0,0,0,.4)",
              animation: "fadeUp .2s ease both",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px 24px",
                borderBottom: "1px solid #F0F0F0",
              }}
            >
              <div style={{ flex: 1, marginRight: 16 }}>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: "#111",
                    marginBottom: 2,
                  }}
                >
                  {dipModal.title}
                </div>
                <div style={{ fontSize: 12, color: "#9CA3AF" }}>
                  Дата получения {dipModal.date}
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  flexShrink: 0,
                }}
              >
                <div style={{ display: "flex", gap: 6 }}>
                  {DIPLOMAS_DATA.map((_, i) => (
                    <button type="button"
                      key={i}
                      onClick={() => setDipIndex(i)}
                      style={{
                        width: i === dipIndex ? 20 : 8,
                        height: 8,
                        borderRadius: 4,
                        background: i === dipIndex ? "#375DFB" : "#E5E7EB",
                        border: "none",
                        cursor: "pointer",
                        padding: 0,
                        transition: "all .2s",
                      }}
                      aria-label={`Диплом ${i + 1}`}
                    />
                  ))}
                </div>
                <span
                  style={{
                    fontSize: 12,
                    color: "#9CA3AF",
                    minWidth: 36,
                    textAlign: "center",
                  }}
                >
                  {dipIndex + 1} / {DIPLOMAS_DATA.length}
                </span>
                <button type="button"
                  onClick={closeDip}
                  style={{
                    background: "#F3F4F6",
                    border: "none",
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    cursor: "pointer",
                    fontSize: 18,
                    color: "#6B7280",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "background .15s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#E5E7EB")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "#F3F4F6")
                  }
                >
                  ×
                </button>
              </div>
            </div>
            <div
              style={{
                background: "#F3F4F6",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 300,
                position: "relative",
              }}
            >
              <img
                src={dipModal.img}
                alt=""
                style={{
                  width: "100%",
                  maxHeight: "62vh",
                  objectFit: "contain",
                  display: "block",
                }}
              />
              <div className="voevoda-slider-panel">
                {DIPLOMAS_DATA.map((_, i) => (
                  <button type="button" key={i} className={`voevoda-slider-dot${i === dipIndex ? " is-active" : ""}`} onClick={() => setDipIndex(i)} aria-label={`Диплом ${i + 1}`} />
                ))}
              </div>
            </div>
            <div
              style={{
                padding: "16px 24px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderTop: "1px solid #F0F0F0",
              }}
            >
              <div style={{ display: "flex", gap: 10 }}>
                {dipModal.badges.map((b, i) => (
                  <div
                    key={i}
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 9,
                      background: "#F3F4F6",
                      border: "1px solid #E5E7EB",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                    }}
                  >
                    <img
                      src={b}
                      alt=""
                      style={{
                        width: "70%",
                        height: "70%",
                        objectFit: "contain",
                      }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    prevDip();
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    background: "#F3F4F6",
                    border: "none",
                    borderRadius: 10,
                    padding: "10px 16px",
                    color: "#374151",
                    fontSize: 13,
                    cursor: "pointer",
                    transition: "background .15s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#E5E7EB")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "#F3F4F6")
                  }
                >
                  <IcArrow dir="left" /> Пред.
                </button>
                <button type="button"
                  className="vbtn-p"
                  onClick={(e) => {
                    e.stopPropagation();
                    const extension = dipModal.img.split(".").pop()?.split("?")[0] || "png";
                    const a = document.createElement("a");
                    a.href = dipModal.img;
                    a.download = `profile-diploma-${dipModal.id}.${extension}`;
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                  }}
                  style={{
                    background: "#375DFB",
                    border: "none",
                    borderRadius: 6,
                    padding: "10px 20px",
                    color: "#fff",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all .15s",
                  }}
                >
                  Скачать
                </button>
                <button type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    nextDip();
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    background: "#F3F4F6",
                    border: "none",
                    borderRadius: 10,
                    padding: "10px 16px",
                    color: "#374151",
                    fontSize: 13,
                    cursor: "pointer",
                    transition: "background .15s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#E5E7EB")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "#F3F4F6")
                  }
                >
                  След. <IcArrow dir="right" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
