import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { BADGE_TOOLTIPS, IVDisplay, ElitaBadge, BadgeBox, ExtraBadge } from '../components/PeopleSection';
import { TrainingPanel, MeasurementsPanel } from '../components/IndexCharts';
import { ReportFormModal, StatusModal } from '../components/ReportModals';
import { PortalPageTop } from '../components/PortalPageTop';

/* ─── данные ─── */
type Soldier = { name: string; rank: string; iv: number; position: string; avatar: string };
type Group = { title: string; people: Soldier[] };

const ME = {
  name: 'Торнадо',
  rank: 'Майор',
  iv: 2463,
  rating: 5.0,
  position: 'КР 2-й роты, 77-й учебный батальон',
  avatar: '/teacher2-main.jpg',
  pogon: '/rank1.png',
  badges: ['/1.png', '/2.png', '/3.png', '/medal.png'],
  extra: 4,
};

const GROUPS: Group[] = [
  {
    title: 'Командиры Полков',
    people: [
      { name: 'Вихрь', rank: 'Майор', iv: 2463, position: 'Командир 1-го полка', avatar: '/sold1.png' },
      { name: 'Бек', rank: 'Майор', iv: 2463, position: 'Командир 2-го полка', avatar: '/sold2.png' },
      { name: 'Стрелок', rank: 'Майор', iv: 2463, position: 'Командир 3-го полка', avatar: '/sold3.png' },
    ],
  },
  {
    title: 'Командиры Батальонов',
    people: [
      { name: 'Воин', rank: 'Майор', iv: 2463, position: 'Командир 1-го батальона', avatar: '/teacher1-main.jpg' },
      { name: 'Воин', rank: 'Майор', iv: 2463, position: 'Командир 2-го батальона', avatar: '/teacher2-main.jpg' },
    ],
  },
  {
    title: 'Командиры Рот',
    people: [
      { name: 'Стрелок', rank: 'Майор', iv: 2463, position: 'Командир 2-ой роты', avatar: '/sold1.png' },
    ],
  },
  {
    title: 'Командиры Взводов',
    people: [
      { name: 'Стрелок', rank: 'Майор', iv: 2463, position: 'Командир 1-го взвода', avatar: '/sold2.png' },
      { name: 'Бек', rank: 'Майор', iv: 2463, position: 'Командир 2-го взвода', avatar: '/sold3.png' },
    ],
  },
  {
    title: 'Командиры Отделений',
    people: [
      { name: 'Стрелок', rank: 'Майор', iv: 2463, position: 'Командир 1-го отделения', avatar: '/teacher3-main.jpg' },
    ],
  },
  {
    title: 'Личный состав отделения',
    people: [
      { name: 'Вихрь', rank: 'Майор', iv: 2463, position: '1-й полк, 2 батальон, 2 рота, 4 взвод, 6 отделение • пулеметчик', avatar: '/sold1.png' },
      { name: 'Вихрь', rank: 'Майор', iv: 2463, position: '1-й полк, 2 батальон, 2 рота, 4 взвод, 6 отделение • пулеметчик', avatar: '/sold2.png' },
      { name: 'Вихрь', rank: 'Майор', iv: 2463, position: '1-й полк, 2 батальон, 2 рота, 4 взвод, 6 отделение • пулеметчик', avatar: '/sold3.png' },
      { name: 'Вихрь', rank: 'Майор', iv: 2463, position: '1-й полк, 2 батальон, 2 рота, 4 взвод, 6 отделение', avatar: '/teacher1-main.jpg' },
    ],
  },
];

/* ─── дерево (виды «Структура» и «Таблица») ─── */
type TreePerson = { name: string; rank: string; iv: number; sub: string; avatar: string };
type TreeRoster = { count: number; avatars: string[] };
type TreeNodeT = { role: string; person?: TreePerson; roster?: TreeRoster; self?: boolean; children?: TreeNodeT[] };

const SUB = 'КР 2-й роты, 77-й учебный батальон';
const TP = (role: string, avatar: string, self = false): TreeNodeT => ({ role, person: { name: 'Торнадо', rank: 'Майор', iv: 2463, sub: SUB, avatar }, self });
const TRoster = (role: string): TreeNodeT => ({ role, roster: { count: 122, avatars: ['/sold1.png', '/sold2.png', '/sold3.png'] } });

const TREE: TreeNodeT = {
  ...TP('Командир полка', '/sold1.png'),
  children: [
    {
      ...TP('Командир 1-го батальона', '/sold1.png'),
      children: [
        {
          ...TP('Командир 1-й роты', '/teacher1-main.jpg'),
          children: [
            {
              ...TP('Командир 1-го взвода', '/sold2.png', true),
              children: [
                { ...TP('Командир 1-го Отделения', '/teacher2-main.jpg'), children: [TRoster('Личный состав 1-го отделения')] },
                { ...TP('Командир 2-го Отделения', '/sold3.png'), children: [TRoster('Личный состав 2-го отделения')] },
              ],
            },
            {
              ...TP('Командир 2-го взвода', '/teacher2-main.jpg'),
              children: [
                { ...TP('Командир 3-го Отделения', '/sold1.png'), children: [TRoster('Личный состав 3-го отделения')] },
                { ...TP('Командир 4-го Отделения', '/teacher3-main.jpg'), children: [TRoster('Личный состав 4-го отделения')] },
              ],
            },
          ],
        },
        { ...TP('Командир 2-й роты', '/teacher3-main.jpg') },
        { ...TP('Командир 3-й роты', '/sold2.png') },
      ],
    },
    {
      ...TP('Командир 2-го батальона', '/sold2.png'),
      children: [
        { ...TP('Командир 4-й роты', '/teacher1-main.jpg') },
        { ...TP('Командир 5-й роты', '/sold3.png') },
      ],
    },
  ],
};

function flattenTree(node: TreeNodeT, acc: TreeNodeT[] = []): TreeNodeT[] {
  acc.push(node);
  node.children?.forEach(c => flattenTree(c, acc));
  return acc;
}

/* данные карточки «Личное дело» */
const DOSSIER = {
  commander: { name: 'Торнадо_92', rank: 'Майор', role: 'Командир 2-го взвода', avatar: '/teacher2-main.jpg' },
  position: 'Зам. командира 2-го взвода',
  zvanie: 'Старший лейтенант',
  specialty: 'Пулеметчик',
  courseBadges: ['/medal.png', '/1.png', '/3.png', '/2.png'],
  diploma: '/blag1.png',
  city: 'Москва',
  birthYear: '5 марта, 1990',
  onPortal: '2 года, 9 месяцев',
  community: '«Вымпел»',
  courses: 3,
  awards: 8,
  followers: 1288,
  bioImage: '/tank.png',
  bio: 'Попал я в ВДВ не просто так. Ещё на гражданке отпрыгал в ДОСААФ три прыжка. Не знаю как сейчас, а тогда это было бесплатно. Зато почти гарантированно должен был попасть в ВДВ. Придя в военкомат, туда и направили - ВДВ. Служивый может носить любые погоны. Но если он от природы мужественен, вынослив и полон сил даже на последнем издыхании.',
  badges: ['/1.png', '/2.png', '/3.png', '/medal.png'],
  extra: 4,
};

const CSS = `
.os-page { padding-top:60px; margin-left:56px; min-height:100vh; background:#F8F9FB; }
.os-wrap { padding:20px 24px 56px; }
.os-panel { background:#fff; border:1px solid #E5E7EB; border-radius:20px; overflow:hidden; animation:osFade .4s ease both; }
@keyframes osFade { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
.os-head { display:flex; align-items:center; gap:12px; padding:22px 28px; }
.os-head h1 { margin:0; font-size:24px; font-weight:800; color:#111; flex:1; }
.os-toggle { display:flex; background:#F1F3F7; border-radius:12px; padding:4px; gap:4px; }
.os-toggle button { border:none; background:none; padding:8px 18px; border-radius:9px; font:600 14px inherit; color:#6B7280; cursor:pointer; transition:all .18s; white-space:nowrap; }
.os-toggle button:not(.active):hover { color:#111; background:rgba(255,255,255,.55); }
.os-toggle button.active { background:#fff; color:#111; box-shadow:0 2px 8px rgba(17,24,39,.1); }
.os-crumbs { display:flex; align-items:center; gap:8px; padding:13px 28px; border-top:1px solid #F0F1F3; border-bottom:1px solid #F0F1F3; font-size:13px; color:#9CA3AF; flex-wrap:wrap; }
.os-crumbs button { border:none; background:none; cursor:pointer; color:#9CA3AF; font:inherit; padding:0; transition:color .15s; }
.os-crumbs button:hover { color:#375DFB; }
.os-crumbs .cur { color:#374151; font-weight:500; }

/* ── карточка профиля ── */
.os-me-wrap { padding:22px 28px 6px; }
.os-me { display:flex; align-items:center; gap:20px; flex-wrap:wrap; }
.os-me-av { position:relative; flex-shrink:0; }
.os-me-av > .pic { width:104px; height:104px; border-radius:18px; overflow:hidden; border:2px solid #EAECF0; background:#1a2744; }
.os-me-av > .pic img { width:100%; height:100%; object-fit:cover; display:block; }
.os-me-pogon { position:absolute; bottom:-10px; right:-12px; width:46px; height:46px; object-fit:contain; filter:drop-shadow(0 3px 8px rgba(0,0,0,.4)); }
.os-me-info { flex:1; min-width:200px; }
.os-me-rank { font-size:13px; color:#9CA3AF; margin-bottom:5px; }
.os-me-nameline { display:flex; align-items:center; gap:12px; flex-wrap:wrap; margin-bottom:7px; }
.os-me-name { font-size:28px; font-weight:800; color:#111; letter-spacing:-.4px; }
.os-me-pos { font-size:14px; color:#6B7280; }
.os-me-badges { display:flex; align-items:center; gap:10px; flex-shrink:0; }
.os-more { width:60px; height:60px; border-radius:12px; background:#EBF1FF; border:1px solid #C7D2FE; display:flex; align-items:center; justify-content:center; font-size:15px; font-weight:800; color:#375DFB; cursor:pointer; transition:all .22s ease; flex-shrink:0; }
.os-more:hover { background:linear-gradient(135deg,#375DFB,#7B9FFF); color:#fff; border-color:transparent; transform:scale(1.06); box-shadow:0 8px 20px rgba(55,93,251,.32); }

.os-chev { display:flex; justify-content:center; margin-top:14px; }
.os-chev button { width:38px; height:38px; border-radius:50%; border:1px solid #E5E7EB; background:#fff; color:#6B7280; cursor:pointer; display:grid; place-items:center; transition:all .2s ease; box-shadow:0 2px 10px rgba(26,39,68,.06); }
.os-chev button:hover { border-color:#C7D2FE; color:#375DFB; transform:translateY(-2px); box-shadow:0 8px 18px rgba(55,93,251,.16); }
.os-chev svg { transition:transform .25s ease; }

.os-chart { padding:8px 28px 4px; animation:osChart .35s ease both; }
@keyframes osChart { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
.os-seg { display:inline-flex; border:1px solid #E5E7EB; border-radius:10px; overflow:hidden; margin-bottom:16px; }
.os-seg button { border:none; background:#fff; padding:10px 18px; font:600 14px inherit; color:#6B7280; cursor:pointer; transition:all .18s; }
.os-seg button + button { border-left:1px solid #E5E7EB; }
.os-seg button.active { background:#EBF1FF; color:#375DFB; }

/* ── фильтры ── */
.os-viewbar { display:flex; align-items:center; gap:12px; padding:18px 28px 2px; border-top:1px solid #F0F1F3; scroll-margin-top:72px; }
.os-filters { display:flex; align-items:center; gap:10px; padding:14px 28px; flex-wrap:wrap; }
.os-select { height:42px; padding:0 14px; border:1px solid #E5E7EB; border-radius:11px; background:#fff; color:#374151; font:600 14px inherit; cursor:pointer; outline:none; transition:border-color .2s ease,box-shadow .2s ease; }
.os-select:hover { border-color:#C7D2FE; box-shadow:0 6px 16px rgba(55,93,251,.08); }
.os-search { width:42px; height:42px; border:1px solid #E5E7EB; border-radius:11px; background:#fff; color:#6B7280; cursor:pointer; display:grid; place-items:center; margin-left:auto; transition:all .18s; }
.os-search:hover { border-color:#C7D2FE; color:#375DFB; transform:translateY(-2px) scale(1.06); box-shadow:0 8px 18px rgba(55,93,251,.16); }
.os-searchbox { margin-left:auto; width:240px; height:42px; padding:0 14px; border:1px solid #C7D2FE; border-radius:11px; outline:none; font:14px inherit; color:#111; }

/* ── группы / строки ── */
.os-group-title { padding:16px 28px 8px; font-size:13px; color:#9CA3AF; font-weight:600; }
.os-row { display:flex; align-items:center; gap:16px; padding:14px 28px; border-bottom:1px solid #F5F5F7; transition:background .14s; flex-wrap:wrap; }
.os-row:hover { background:#FAFBFF; }
.os-row-av { position:relative; flex-shrink:0; width:62px; height:62px; cursor:pointer; }
.os-row-av img.pic { width:56px; height:56px; border-radius:12px; object-fit:cover; border:1px solid #E5E7EB; background:#1a2744; display:block; }
.os-row-pogon { position:absolute; bottom:0; right:0; width:24px; height:24px; object-fit:contain; filter:drop-shadow(0 2px 5px rgba(0,0,0,.35)); }
.os-row-meta { flex:1; min-width:180px; cursor:pointer; }
.os-row-rank { font-size:10px; color:#9CA3AF; text-transform:uppercase; letter-spacing:.5px; margin-bottom:2px; }
.os-row-nameline { display:flex; align-items:center; gap:8px; flex-wrap:wrap; margin-bottom:3px; }
.os-row-name { font-size:16px; font-weight:700; color:#111; transition:color .15s; }
.os-row:hover .os-row-name { color:#375DFB; }
.os-row-pos { font-size:12px; color:#6B7280; }
.os-row-actions { display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
.os-action { height:40px; padding:0 16px; border:1px solid #E5E7EB; border-radius:11px; background:#fff; color:#374151; font:600 13px inherit; cursor:pointer; white-space:nowrap; transition:all .2s ease; }
.os-action:hover { border-color:#C7D2FE; color:#375DFB; background:#EEF3FF; transform:translateY(-2px); box-shadow:0 8px 18px rgba(55,93,251,.14); }
.os-action:active { transform:translateY(0) scale(.98); }
.os-action.primary { background:#EBF1FF; border-color:#D4DEFA; color:#375DFB; }
.os-action.primary:hover { background:#375DFB; border-color:#375DFB; color:#fff; box-shadow:0 10px 22px rgba(55,93,251,.4); }
.os-iconbtn { width:40px; height:40px; border:1px solid #E5E7EB; border-radius:11px; background:#fff; color:#6B7280; cursor:pointer; display:grid; place-items:center; transition:all .2s ease; flex-shrink:0; }
.os-iconbtn:hover { border-color:#C7D2FE; color:#375DFB; background:#EEF3FF; transform:translateY(-2px) rotate(-6deg); box-shadow:0 8px 18px rgba(55,93,251,.18); }

/* ── вид «Структура»: дерево с коннекторами ── */
.os-canvas-shell { margin:14px 28px 28px; border:1px solid #DCE3F2; border-radius:18px; overflow:hidden; background:#F7F9FD; box-shadow:inset 0 1px 0 #fff; }
.os-canvas-toolbar { min-height:54px; padding:8px 10px; display:flex; align-items:center; justify-content:space-between; gap:12px; border-bottom:1px solid #E2E7F0; background:rgba(255,255,255,.92); backdrop-filter:blur(12px); }
.os-canvas-hint { display:flex; align-items:center; gap:8px; min-width:0; color:#7B879E; font-size:11px; font-weight:600; }
.os-canvas-hint svg { flex:0 0 auto; color:#375DFB; }
.os-canvas-controls { display:flex; align-items:center; gap:6px; flex:0 0 auto; }
.os-canvas-controls button { min-width:38px; height:38px; padding:0 10px; border:1px solid #DCE3F2; border-radius:8px; background:#fff; color:#4B5563; font:700 12px inherit; cursor:pointer; display:grid; place-items:center; transition:background .18s,border-color .18s,color .18s,transform .18s,box-shadow .18s; }
.os-canvas-controls button:hover { border-color:#B9C9FF; background:#EBF1FF; color:#375DFB; box-shadow:0 6px 16px rgba(55,93,251,.12); transform:translateY(-1px); }
.os-canvas-controls button:active { transform:scale(.96); }
.os-canvas-controls .zoom-value { min-width:58px; color:#375DFB; }
.os-canvas-viewport { position:relative; height:680px; overflow:hidden; overscroll-behavior:contain; cursor:grab; touch-action:none; user-select:none; background-color:#F8FAFE; background-image:radial-gradient(circle,#CCD5E6 1px,transparent 1.4px); background-size:22px 22px; }
.os-canvas-viewport.dragging { cursor:grabbing; }
.os-canvas-stage { position:absolute; left:0; top:0; width:max-content; transform-origin:0 0; will-change:transform; transition:transform .18s cubic-bezier(.2,.8,.2,1); }
.os-canvas-viewport.dragging .os-canvas-stage { transition:none; }
.os-scroll { padding:10px 0 28px; }
.tree { display:flex; justify-content:center; padding:24px 28px 0; min-width:max-content; }
.tree ul { padding-top:26px; position:relative; display:flex; justify-content:center; margin:0; }
.tree li { list-style:none; position:relative; padding:26px 12px 0; display:flex; flex-direction:column; align-items:center; }
.tree li::before, .tree li::after { content:''; position:absolute; top:0; right:50%; border-top:2px solid #E2E6EF; width:50%; height:26px; }
.tree li::after { right:auto; left:50%; border-left:2px solid #E2E6EF; }
.tree li:only-child::after, .tree li:only-child::before { display:none; }
.tree li:only-child { padding-top:0; }
.tree li:first-child::before, .tree li:last-child::after { border:0 none; }
.tree li:last-child::before { border-right:2px solid #E2E6EF; border-radius:0 6px 0 0; }
.tree li:first-child::after { border-radius:6px 0 0 0; }
.tree ul ul::before { content:''; position:absolute; top:0; left:50%; border-left:2px solid #E2E6EF; width:0; height:26px; }
.tree > li { padding-top:0; }
.tree > li::before, .tree > li::after { display:none; }
.os-node-wrap { width:300px; min-height:130px; perspective:1100px; cursor:pointer; }
.os-node { position:relative; width:100%; min-height:130px; transform-style:preserve-3d; transition:filter .25s; }
.os-node-wrap:hover .os-node { filter:drop-shadow(0 12px 18px rgba(26,39,68,.12)); }
.os-node-face { position:absolute; inset:0; min-height:130px; padding:14px 16px; border:1px solid #E5E7EB; border-radius:16px; background:#fff; box-shadow:0 2px 10px rgba(26,39,68,.04); backface-visibility:hidden; -webkit-backface-visibility:hidden; overflow:hidden; transition:opacity .24s ease,transform .58s cubic-bezier(.2,.72,.2,1),visibility .24s; }
.os-node-face::after { content:'Нажмите, чтобы перевернуть'; position:absolute; right:11px; bottom:8px; color:#A1AABA; font-size:8px; font-weight:700; opacity:0; transform:translateY(4px); transition:opacity .2s,transform .2s; }
.os-node-wrap:hover .os-node-face::after { opacity:1; transform:none; }
.os-node-front { opacity:1; visibility:visible; transform:rotateY(0deg); }
.os-node-back { opacity:0; visibility:hidden; transform:rotateY(-180deg); display:flex; flex-direction:column; justify-content:center; gap:8px; background:linear-gradient(145deg,#F9FBFF,#EEF3FF); border-color:#C7D2FE; }
.os-node.flipped .os-node-front { opacity:0; visibility:hidden; transform:rotateY(180deg); }
.os-node.flipped .os-node-back { opacity:1; visibility:visible; transform:rotateY(0deg); }
.os-node.self .os-node-face { border-color:#375DFB; box-shadow:0 0 0 3px rgba(55,93,251,.15),0 10px 24px rgba(55,93,251,.12); }
.os-node-back-title { color:#375DFB; font-size:11px; font-weight:900; letter-spacing:.08em; text-transform:uppercase; }
.os-node-back-role { color:#111827; font-size:16px; font-weight:850; line-height:1.3; }
.os-node-back-data { display:grid; grid-template-columns:auto 1fr; gap:5px 10px; color:#7B879E; font-size:10px; }
.os-node-back-data b { overflow:hidden; color:#374151; text-overflow:ellipsis; white-space:nowrap; }
.os-node-flip-mark { position:absolute; top:9px; right:10px; width:24px; height:24px; display:grid; place-items:center; border-radius:8px; background:#EEF3FF; color:#375DFB; }
.os-node-title { text-align:center; font-size:16px; font-weight:800; color:#111; margin-bottom:12px; }
.os-node-body { display:flex; align-items:center; gap:12px; }
.os-av { position:relative; width:64px; height:64px; flex-shrink:0; }
.os-av > img:first-child { width:64px; height:64px; border-radius:14px; object-fit:cover; display:block; background:#1a2744; }
.os-pogon { position:absolute; left:-7px; bottom:-7px; width:22px; height:auto; object-fit:contain; filter:drop-shadow(0 2px 5px rgba(0,0,0,.35)); }
.os-meta { flex:1; min-width:0; }
.os-rank { font-size:12px; color:#9CA3AF; }
.os-nameline { display:flex; align-items:center; gap:8px; margin:1px 0 3px; }
.os-name { font-size:19px; font-weight:800; color:#111; }
.os-sub { font-size:12px; color:#6B7280; line-height:1.3; }
.os-roster { display:flex; align-items:center; justify-content:space-between; gap:12px; }
.os-roster-avs { display:flex; align-items:center; }
.os-roster-avs img { width:38px; height:38px; border-radius:50%; border:2px solid #fff; object-fit:cover; margin-left:-10px; background:#1a2744; }
.os-roster-avs img:first-child { margin-left:0; }
.os-roster-count { margin-left:8px; font-size:15px; font-weight:800; color:#111; }
.os-expand { height:38px; padding:0 16px; border:1px solid #E5E7EB; border-radius:10px; background:#F9FAFB; color:#374151; font:600 13px inherit; cursor:pointer; transition:all .15s; }
.os-expand:hover { background:#EBF1FF; border-color:#C7D2FE; color:#375DFB; transform:translateY(-2px); box-shadow:0 8px 18px rgba(55,93,251,.16); }
.os-expand:active { transform:translateY(0) scale(.97); }
.os-roster-overlay { position:fixed; inset:0; z-index:10020; display:flex; justify-content:flex-end; background:rgba(34,49,79,.18); backdrop-filter:blur(4px); animation:osRosterFade .2s ease both; }
.os-roster-drawer { width:min(520px,calc(100vw - 24px)); height:100%; overflow-y:auto; background:#fff; border-left:1px solid #E3E8F2; box-shadow:-24px 0 70px rgba(44,62,104,.16); animation:osRosterIn .34s cubic-bezier(.2,.78,.2,1) both; }
@keyframes osRosterFade { from{opacity:0} to{opacity:1} }
@keyframes osRosterIn { from{opacity:0;transform:translateX(44px)} to{opacity:1;transform:none} }
.os-roster-drawer-head { position:sticky; top:0; z-index:2; display:flex; align-items:flex-start; justify-content:space-between; gap:18px; padding:26px 28px 22px; border-bottom:1px solid #EDF0F5; background:rgba(255,255,255,.94); backdrop-filter:blur(12px); }
.os-roster-kicker { margin-bottom:6px; color:#375DFB; font-size:11px; font-weight:850; letter-spacing:.09em; text-transform:uppercase; }
.os-roster-drawer h2 { margin:0; color:#111827; font-size:23px; line-height:1.2; }
.os-roster-summary { margin-top:8px; color:#7B879E; font-size:13px; }
.os-roster-close { width:40px; height:40px; flex:0 0 auto; display:grid; place-items:center; border:1px solid #E1E6EF; background:#F7F9FC; color:#647089; font-size:22px; cursor:pointer; transition:background .18s,color .18s,transform .18s; }
.os-roster-close:hover { background:#EBF1FF; color:#375DFB; transform:translateX(-2px); }
.os-roster-list { display:grid; gap:10px; padding:20px 28px 28px; }
.os-roster-person { display:grid; grid-template-columns:52px minmax(0,1fr) auto; align-items:center; gap:13px; padding:12px; border:1px solid #E7EAF0; border-radius:14px; background:#fff; transition:border-color .18s,box-shadow .18s,transform .18s; }
.os-roster-person:hover { border-color:#C7D2FE; box-shadow:0 10px 24px rgba(55,93,251,.09); transform:translateY(-2px); }
.os-roster-person img { width:52px; height:52px; border-radius:12px; object-fit:cover; background:#EEF2F7; }
.os-roster-person strong { display:block; overflow:hidden; color:#172033; font-size:14px; text-overflow:ellipsis; white-space:nowrap; }
.os-roster-person span { display:block; margin-top:4px; color:#8792A7; font-size:12px; }
.os-roster-status { padding:6px 9px; border-radius:8px; background:#EAF8F0; color:#159553!important; font-size:11px!important; font-weight:800; white-space:nowrap; }
.os-roster-return { width:calc(100% - 56px); margin:0 28px 28px; padding:12px 16px; border:1px solid #C7D2FE; background:#EBF1FF; color:#375DFB; font-size:13px; font-weight:800; cursor:pointer; transition:background .18s,transform .18s; }
.os-roster-return:hover { background:#DFE8FF; transform:translateY(-1px); }
@media(max-width:600px){.os-roster-drawer-head,.os-roster-list{padding-left:18px;padding-right:18px}.os-roster-return{width:calc(100% - 36px);margin-left:18px;margin-right:18px}}
@media(max-width:760px){.os-canvas-shell{margin:12px 14px 22px}.os-canvas-viewport{height:560px}.os-canvas-toolbar{align-items:flex-start;flex-direction:column}.os-canvas-controls{width:100%;overflow-x:auto}.os-canvas-hint{font-size:10px}}
@media(prefers-reduced-motion:reduce){.os-node,.os-canvas-stage,.os-roster-overlay,.os-roster-drawer{transition:none!important;animation:none!important}}
/* ── вид «Таблица» ── */
.os-table { padding:8px 28px 28px; overflow-x:auto; }
.os-table table { width:100%; border-collapse:collapse; min-width:560px; }
.os-table th { text-align:left; font-size:12px; font-weight:700; color:#9CA3AF; text-transform:uppercase; letter-spacing:.03em; padding:12px 14px; border-bottom:1px solid #F0F1F3; }
.os-table td { padding:13px 14px; border-bottom:1px solid #F5F5F7; font-size:14px; color:#374151; }
.os-trow:hover { background:#F9FAFB; }
.os-trow.self td { background:#EBF1FF; }
.os-tname { display:flex; align-items:center; gap:10px; }
.os-tname img { width:36px; height:36px; border-radius:50%; object-fit:cover; background:#1a2744; }
.os-tname b { color:#111; }

/* ── модалка «Личное дело» ── */
.ld-overlay { position:fixed; inset:0; z-index:10000; display:grid; place-items:center; padding:24px; background:rgba(10,16,32,.6); backdrop-filter:blur(6px); animation:ldBg .2s ease both; }
@keyframes ldBg { from{opacity:0} to{opacity:1} }
.ld-modal { width:min(1000px,100%); max-height:92vh; overflow-y:auto; background:#fff; border-radius:22px; box-shadow:0 36px 90px rgba(0,0,0,.4); animation:ldPop .3s cubic-bezier(.2,.8,.2,1) both; }
@keyframes ldPop { from{opacity:0;transform:translateY(18px) scale(.97)} to{opacity:1;transform:translateY(0) scale(1)} }
.ld-head { display:flex; align-items:center; justify-content:space-between; padding:20px 28px; }
.ld-head-title { display:flex; align-items:center; gap:12px; font-size:22px; font-weight:800; color:#111; }
.ld-close { width:40px; height:40px; border:1px solid #E5E7EB; border-radius:12px; background:#F7F8FB; color:#6B7280; font-size:22px; cursor:pointer; display:grid; place-items:center; transition:all .18s; }
.ld-close:hover { background:#FEF2F2; border-color:#FECACA; color:#EF4444; transform:rotate(90deg); }
.ld-profile { display:flex; align-items:center; gap:18px; padding:6px 28px 22px; border-bottom:1px solid #F0F1F3; flex-wrap:wrap; }
.ld-av { position:relative; flex-shrink:0; }
.ld-av .pic { width:108px; height:108px; border-radius:18px; overflow:hidden; border:2px solid #EAECF0; background:#1a2744; }
.ld-av .pic img { width:100%; height:100%; object-fit:cover; display:block; }
.ld-av .pogon { position:absolute; bottom:-10px; right:-12px; width:46px; height:46px; object-fit:contain; filter:drop-shadow(0 3px 8px rgba(0,0,0,.4)); }
.ld-pinfo { flex:1; min-width:200px; }
.ld-prank { font-size:13px; color:#9CA3AF; margin-bottom:4px; }
.ld-pnameline { display:flex; align-items:center; gap:12px; flex-wrap:wrap; margin-bottom:6px; }
.ld-pname { font-size:26px; font-weight:800; color:#111; letter-spacing:-.3px; }
.ld-ppos { font-size:13px; color:#6B7280; }
.ld-pbadges { display:flex; align-items:center; gap:10px; }
.ld-tabs { display:flex; gap:8px; padding:16px 28px 0; flex-wrap:wrap; }
.ld-tab { padding:9px 18px; border-radius:10px; border:none; background:#F1F3F7; color:#6B7280; font:600 14px inherit; cursor:pointer; transition:all .18s; }
.ld-tab:hover { color:#111; }
.ld-tab.active { background:#fff; color:#111; box-shadow:0 2px 8px rgba(17,24,39,.1); border:1px solid #E5E7EB; }
.ld-body { padding:22px 28px; }
.ld-sub { font-size:14px; color:#9CA3AF; margin-bottom:10px; }
.ld-cmd { display:flex; align-items:center; gap:14px; border:1px solid #EEF0F4; background:#F7F8FB; border-radius:16px; padding:14px 18px; flex-wrap:wrap; }
.ld-cmd-av { width:52px; height:52px; border-radius:50%; overflow:hidden; flex-shrink:0; background:#1a2744; }
.ld-cmd-av img { width:100%; height:100%; object-fit:cover; }
.ld-cmd-name { font-size:17px; font-weight:700; color:#111; }
.ld-cmd-sub { font-size:13px; color:#9CA3AF; }
.ld-cmd-actions { margin-left:auto; display:flex; gap:10px; flex-wrap:wrap; }
.ld-fields { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; margin-top:18px; }
.ld-field { border:1px solid #E5E7EB; border-radius:14px; padding:13px 16px; }
.ld-field .k { font-size:13px; color:#9CA3AF; margin-bottom:6px; }
.ld-field .v { font-size:16px; font-weight:600; color:#111; }
.ld-badges-head { display:flex; align-items:center; justify-content:space-between; margin:22px 0 10px; }
.ld-badges-head .l { font-size:13px; color:#9CA3AF; }
.ld-badges-row { display:flex; gap:12px; align-items:flex-start; }
.ld-slots { display:flex; gap:12px; flex:1; flex-wrap:wrap; }
.ld-slot { width:74px; height:74px; border-radius:14px; background:#F3F4F6; display:grid; place-items:center; overflow:hidden; flex-shrink:0; transition:transform .25s ease,box-shadow .25s ease; }
.ld-slot.filled { background:linear-gradient(160deg,#FCFDFF,#EEF2FB); }
.ld-slot.filled:hover { transform:translateY(-4px) scale(1.05); box-shadow:0 12px 26px rgba(26,39,68,.16); }
.ld-slot img { width:56px; height:56px; object-fit:contain; }
.ld-dip { width:120px; flex-shrink:0; }
.ld-dip-img { width:120px; height:88px; border-radius:12px; overflow:hidden; border:1px solid #E5E7EB; background:#fff; cursor:pointer; transition:transform .25s ease,box-shadow .25s ease; }
.ld-dip-img:hover { transform:translateY(-3px) scale(1.03); box-shadow:0 14px 30px rgba(26,39,68,.2); }
.ld-dip-img img { width:100%; height:100%; object-fit:cover; display:block; }
.ld-data { display:flex; gap:24px; flex-wrap:wrap; }
.ld-data-col { flex:0 0 320px; min-width:260px; }
.ld-data-row { display:flex; align-items:center; justify-content:space-between; padding:13px 16px; border:1px solid #E5E7EB; border-radius:12px; margin-bottom:10px; }
.ld-data-row .k { display:flex; align-items:center; gap:10px; font-size:14px; color:#6B7280; }
.ld-data-row .v { font-size:14px; font-weight:700; color:#111; }
.ld-data-main { flex:1; min-width:240px; }
.ld-data-img { width:100%; height:210px; border-radius:14px; overflow:hidden; background:#F3F4F6; margin-bottom:14px; }
.ld-data-img img { width:100%; height:100%; object-fit:cover; }
.ld-bio { font-size:14px; color:#374151; line-height:1.7; margin:0; }
.ld-foot { display:flex; align-items:center; gap:12px; padding:18px 28px 24px; flex-wrap:wrap; }
.ld-foot .grow { margin-left:auto; }
.ld-pill { height:46px; padding:0 22px; border:1px solid #E5E7EB; border-radius:12px; background:#fff; color:#374151; font:700 14px inherit; cursor:pointer; transition:all .2s ease; white-space:nowrap; }
.ld-pill:hover { border-color:#C7D2FE; color:#375DFB; background:#EEF3FF; transform:translateY(-2px); box-shadow:0 8px 18px rgba(55,93,251,.14); }
.ld-pill.primary { background:#375DFB; border-color:#375DFB; color:#fff; box-shadow:0 8px 20px rgba(55,93,251,.28); }
.ld-pill.primary:hover { background:#2D4FE0; color:#fff; box-shadow:0 12px 26px rgba(55,93,251,.42); }
.ld-icon { width:46px; height:46px; border:1px solid #E5E7EB; border-radius:12px; background:#fff; color:#6B7280; cursor:pointer; display:grid; place-items:center; transition:all .2s ease; }
.ld-icon:hover { border-color:#C7D2FE; color:#375DFB; background:#EEF3FF; transform:translateY(-2px); box-shadow:0 8px 18px rgba(55,93,251,.18); }
@media(max-width:680px){ .ld-fields { grid-template-columns:1fr; } }
`;

function injectCss() {
  if (typeof document === 'undefined') return;
  const existing = document.getElementById('os-css') as HTMLStyleElement | null;
  if (existing) {
    if (existing.textContent !== CSS) existing.textContent = CSS;
    return;
  }
  const style = document.createElement('style');
  style.id = 'os-css';
  style.textContent = CSS;
  document.head.appendChild(style);
}

const ChatIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);
const MailIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-10 6L2 7" />
  </svg>
);
const PhoneIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

function imgFallback(e: React.SyntheticEvent<HTMLImageElement>) {
  (e.currentTarget as HTMLImageElement).style.display = 'none';
}

/* ── вид «Структура»: карточка-узел дерева ── */
function NodeCard({ node, flipped, onFlip, onExpand }: { node: TreeNodeT; flipped: boolean; onFlip: () => void; onExpand: () => void }) {
  return (
    <div className="os-node-wrap" role="button" tabIndex={0} aria-label={`${node.role}. Перевернуть карточку`} onClick={onFlip} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onFlip(); } }}>
      <div className={`os-node${node.self ? ' self' : ''}${flipped ? ' flipped' : ''}`}>
        <div className="os-node-face os-node-front">
          <span className="os-node-flip-mark" aria-hidden="true">↻</span>
          <div className="os-node-title">{node.role}</div>
          {node.person && (
            <div className="os-node-body">
              <div className="os-av">
                <img src={node.person.avatar} alt={node.person.name} onError={imgFallback} />
                <img className="os-pogon" src="/rank1.png" alt="" onError={imgFallback} />
              </div>
              <div className="os-meta">
                <div className="os-rank">{node.person.rank}</div>
                <div className="os-nameline"><span className="os-name">{node.person.name}</span><IVDisplay index={node.person.iv} rating={null} /></div>
                <div className="os-sub">{node.person.sub}</div>
              </div>
            </div>
          )}
          {node.roster && (
            <div className="os-roster">
              <div className="os-roster-avs">
                {node.roster.avatars.map((a, i) => <img key={i} src={a} alt="" onError={imgFallback} />)}
                <span className="os-roster-count">{node.roster.count}</span>
              </div>
              <button className="os-expand" onClick={event => { event.stopPropagation(); onExpand(); }}>Развернуть</button>
            </div>
          )}
        </div>
        <div className="os-node-face os-node-back">
          <span className="os-node-flip-mark" aria-hidden="true">↻</span>
          <div className="os-node-back-title">{node.person ? 'Личное дело' : 'Состав подразделения'}</div>
          <div className="os-node-back-role">{node.role}</div>
          <div className="os-node-back-data">
            {node.person ? (
              <>
                <span>Позывной</span><b>{node.person.name}</b>
                <span>Звание</span><b>{node.person.rank}</b>
                <span>Индекс</span><b>{node.person.iv}</b>
                <span>Часть</span><b>{node.person.sub}</b>
              </>
            ) : (
              <>
                <span>Бойцов</span><b>{node.roster?.count ?? 0}</b>
                <span>Статус</span><b>В строю</b>
                <span>Доступ</span><b>Открыть полный состав</b>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function TreeNode({ node, path = '0', flipped, onFlip, onExpand }: { node: TreeNodeT; path?: string; flipped: Set<string>; onFlip: (id: string) => void; onExpand: (node: TreeNodeT, path: string) => void }) {
  return (
    <li>
      <NodeCard node={node} flipped={flipped.has(path)} onFlip={() => onFlip(path)} onExpand={() => onExpand(node, path)} />
      {node.children && node.children.length > 0 && (
        <ul>{node.children.map((c, i) => <TreeNode key={i} node={c} path={`${path}-${i}`} flipped={flipped} onFlip={onFlip} onExpand={onExpand} />)}</ul>
      )}
    </li>
  );
}

const ROSTER_PEOPLE = [
  { name:'Бек', rank:'Сержант · командир отделения', avatar:'/sold1.png' },
  { name:'Коба', rank:'Ефрейтор · старший стрелок', avatar:'/teacher1-main.jpg' },
  { name:'Торнадо', rank:'Рядовой · пулемётчик', avatar:'/teacher2-main.jpg' },
  { name:'Вихрь', rank:'Рядовой · стрелок', avatar:'/sold2.png' },
  { name:'Гранит', rank:'Рядовой · связист', avatar:'/sold3.png' },
  { name:'Лавина', rank:'Рядовой · санитар', avatar:'/teacher3-main.jpg' },
];

function RosterDrawer({ node, onClose }: { node: TreeNodeT; onClose: () => void }) {
  useEffect(() => {
    const previous = document.body.style.overflow;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [onClose]);

  return createPortal(
    <div className="os-roster-overlay" onClick={onClose}>
      <aside className="os-roster-drawer" aria-modal="true" role="dialog" aria-label={`Полный состав: ${node.role}`} onClick={event => event.stopPropagation()}>
        <header className="os-roster-drawer-head">
          <div>
            <div className="os-roster-kicker">Штатный состав</div>
            <h2>{node.role}</h2>
            <div className="os-roster-summary">{node.roster?.count ?? 0} бойцов · 6 показаны в текущем составе</div>
          </div>
          <button className="os-roster-close" onClick={onClose} aria-label="Вернуться к структуре">×</button>
        </header>
        <div className="os-roster-list">
          {ROSTER_PEOPLE.map((person, index) => (
            <article className="os-roster-person" key={person.name}>
              <img src={person.avatar} alt={person.name} onError={imgFallback} />
              <div><strong>{person.name}</strong><span>{person.rank}</span></div>
              <span className="os-roster-status">{index === 5 ? 'На занятии' : 'В строю'}</span>
            </article>
          ))}
        </div>
        <button className="os-roster-return" onClick={onClose}>← Вернуться к этой карточке</button>
      </aside>
    </div>,
    document.body,
  );
}

function StructureCanvas() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(.72);
  const [pan, setPan] = useState({ x: 34, y: 24 });
  const zoomRef = useRef(zoom);
  const panRef = useRef(pan);
  const [dragging, setDragging] = useState(false);
  const [flipped, setFlipped] = useState<Set<string>>(() => new Set());
  const [openedRoster, setOpenedRoster] = useState<{ node: TreeNodeT; path: string } | null>(null);
  const dragRef = useRef({ pointerId: 0, x: 0, y: 0, panX: 0, panY: 0, moved: false });

  const clampZoom = (value: number) => Math.min(1.35, Math.max(.32, value));
  const applyZoom = (next: number) => setZoom(clampZoom(next));

  useEffect(() => {
    zoomRef.current = zoom;
  }, [zoom]);

  useEffect(() => {
    panRef.current = pan;
  }, [pan]);

  const fit = () => {
    const viewport = viewportRef.current;
    const stage = stageRef.current;
    if (!viewport || !stage) return;
    const width = stage.scrollWidth;
    const height = stage.scrollHeight;
    if (!width || !height) return;
    const next = clampZoom(Math.min((viewport.clientWidth - 56) / width, (viewport.clientHeight - 56) / height));
    setZoom(next);
    setPan({
      x: Math.max(28, (viewport.clientWidth - width * next) / 2),
      y: Math.max(28, (viewport.clientHeight - height * next) / 2),
    });
  };

  useEffect(() => {
    const frame = window.requestAnimationFrame(fit);
    const observer = new ResizeObserver(fit);
    if (viewportRef.current) observer.observe(viewportRef.current);
    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      event.stopPropagation();

      const rect = viewport.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const currentZoom = zoomRef.current;
      const currentPan = panRef.current;
      const next = clampZoom(currentZoom * (event.deltaY > 0 ? .9 : 1.1));
      const worldX = (x - currentPan.x) / currentZoom;
      const worldY = (y - currentPan.y) / currentZoom;
      const nextPan = { x:x - worldX * next, y:y - worldY * next };

      zoomRef.current = next;
      panRef.current = nextPan;
      setZoom(next);
      setPan(nextPan);
    };

    viewport.addEventListener('wheel', handleWheel, { passive:false });
    return () => viewport.removeEventListener('wheel', handleWheel);
  }, []);

  const zoomAt = (nextZoom: number, clientX?: number, clientY?: number) => {
    const viewport = viewportRef.current;
    const next = clampZoom(nextZoom);
    if (!viewport || clientX === undefined || clientY === undefined) {
      setZoom(next);
      return;
    }
    const rect = viewport.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const worldX = (x - pan.x) / zoom;
    const worldY = (y - pan.y) / zoom;
    setPan({ x: x - worldX * next, y: y - worldY * next });
    setZoom(next);
  };

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest('.os-node-wrap,button')) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { pointerId:event.pointerId, x:event.clientX, y:event.clientY, panX:pan.x, panY:pan.y, moved:false };
    setDragging(true);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging || dragRef.current.pointerId !== event.pointerId) return;
    const dx = event.clientX - dragRef.current.x;
    const dy = event.clientY - dragRef.current.y;
    if (Math.abs(dx) + Math.abs(dy) > 3) dragRef.current.moved = true;
    setPan({ x:dragRef.current.panX + dx, y:dragRef.current.panY + dy });
  };

  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    setDragging(false);
    window.setTimeout(() => {
      dragRef.current.moved = false;
    }, 0);
  };

  const toggleFlip = (id: string) => {
    setFlipped(current => {
      const next = new Set(current);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  useEffect(() => {
    const handleHistoryBack = () => setOpenedRoster(null);
    window.addEventListener('popstate', handleHistoryBack);
    return () => window.removeEventListener('popstate', handleHistoryBack);
  }, []);

  const openRoster = (node: TreeNodeT, path: string) => {
    setOpenedRoster({ node, path });
    window.history.pushState({ ...window.history.state, orgStructureRoster:path }, '', `${window.location.pathname}${window.location.search}#unit-${path}`);
  };

  const closeRoster = () => {
    if (!openedRoster) return;
    if (window.history.state?.orgStructureRoster === openedRoster.path) {
      window.history.back();
    } else {
      setOpenedRoster(null);
    }
  };

  return (
    <section className="os-canvas-shell">
      <div className="os-canvas-toolbar">
        <div className="os-canvas-hint">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M5 9V5a2 2 0 0 1 4 0v4M9 8V4a2 2 0 0 1 4 0v4M13 8V5a2 2 0 0 1 4 0v7M17 10a2 2 0 0 1 4 0v4c0 5-3 8-8 8h-1c-4 0-6-2-8-5l-2-3a2 2 0 0 1 3-3l2 2V9"/></svg>
          Тяните пустое поле для перемещения · колесо меняет масштаб · карточка переворачивается по нажатию
        </div>
        <div className="os-canvas-controls">
          <button onClick={() => zoomAt(zoom - .1)} aria-label="Уменьшить масштаб">−</button>
          <button className="zoom-value" onClick={() => zoomAt(1)} title="Масштаб 100%">{Math.round(zoom * 100)}%</button>
          <button onClick={() => zoomAt(zoom + .1)} aria-label="Увеличить масштаб">+</button>
          <button onClick={fit} title="Вписать структуру в окно" aria-label="Вписать структуру в окно">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5"/></svg>
          </button>
          <button onClick={() => { setFlipped(new Set()); fit(); }} title="Сбросить холст" aria-label="Сбросить холст">↺</button>
        </div>
      </div>
      <div
        ref={viewportRef}
        className={`os-canvas-viewport${dragging ? ' dragging' : ''}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <div ref={stageRef} className="os-canvas-stage" style={{ transform:`translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}>
          <ul className="tree"><TreeNode node={TREE} flipped={flipped} onFlip={toggleFlip} onExpand={openRoster} /></ul>
        </div>
      </div>
      {openedRoster && <RosterDrawer node={openedRoster.node} onClose={closeRoster} />}
    </section>
  );
}

/* ── строка состава ── */
function PersonRow({ p, onOpen, onSubmitReport, onRequestReport }: { p: Soldier; onOpen: () => void; onSubmitReport: () => void; onRequestReport: () => void }) {
  const navigate = useNavigate();
  return (
    <div className="os-row">
      <div className="os-row-av" onClick={onOpen}>
        <img className="pic" src={p.avatar} alt={p.name} onError={imgFallback} />
        <img className="os-row-pogon" src="/rank1.png" alt="" onError={imgFallback} />
      </div>
      <div className="os-row-meta" onClick={onOpen}>
        <div className="os-row-rank">{p.rank}</div>
        <div className="os-row-nameline">
          <span className="os-row-name">{p.name}</span>
          <IVDisplay index={p.iv} rating={null} />
        </div>
        <div className="os-row-pos">{p.position}</div>
      </div>
      <div className="os-row-actions">
        <button className="os-action" onClick={onSubmitReport}>Подать рапор</button>
        <button className="os-action" onClick={onRequestReport}>Запросить рапорт</button>
        <button className="os-iconbtn" title="Связаться" onClick={() => navigate('/messages?chat=1')}><ChatIcon /></button>
        <button className="os-action primary" onClick={onOpen}>Личное дело</button>
      </div>
    </div>
  );
}

/* ── модалка «Личное дело» ── */
type DossierTab = 'На курсе' | 'Данные' | 'Подготовка' | 'Замеры';

function LichnoeDeloModal({ p, onClose, onRequestReport, onViewReport }: { p: Soldier; onClose: () => void; onRequestReport: () => void; onViewReport: () => void }) {
  const navigate = useNavigate();
  const [tab, setTab] = useState<DossierTab>('На курсе');
  const [subscribed, setSubscribed] = useState(false);
  const d = DOSSIER;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [onClose]);

  const slots = Array.from({ length: 8 }, (_, i) => d.courseBadges[i] ?? null);

  return createPortal(
    <div className="ld-overlay" onClick={onClose}>
      <div className="ld-modal" onClick={e => e.stopPropagation()}>
        <div className="ld-head">
          <div className="ld-head-title">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#375DFB" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="10" r="2" /><path d="M15 8h3M15 12h3M7 16h10" />
            </svg>
            Личное дело
          </div>
          <button className="ld-close" onClick={onClose} aria-label="Закрыть">×</button>
        </div>

        {/* шапка профиля */}
        <div className="ld-profile">
          <div className="ld-av">
            <div className="pic"><img src={p.avatar} alt={p.name} onError={imgFallback} /></div>
            <img className="pogon" src="/rank2.png" alt="" onError={imgFallback} />
          </div>
          <div className="ld-pinfo">
            <div className="ld-prank">Капитан</div>
            <div className="ld-pnameline">
              <span className="ld-pname">{p.name}</span>
              <IVDisplay index={p.iv} rating={5.0} />
            </div>
            <div className="ld-ppos">КР 2-й роты, 77-й учебный батальон</div>
          </div>
          <div className="ld-pbadges">
            {d.badges.map((src, i) => (
              <BadgeBox key={i} src={src} size={60} tooltip={BADGE_TOOLTIPS[i]} topRight={i === 0 ? <ElitaBadge /> : undefined} />
            ))}
            <ExtraBadge count={d.extra} size={60} onClick={() => { onClose(); navigate('/achievements'); }} />
          </div>
        </div>

        {/* вкладки */}
        <div className="ld-tabs">
          {(['На курсе', 'Данные', 'Подготовка', 'Замеры'] as DossierTab[]).map(t => (
            <button key={t} className={`ld-tab${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>{t}</button>
          ))}
        </div>

        <div className="ld-body">
          {tab === 'На курсе' && (
            <>
              <div className="ld-sub">Под командованием</div>
              <div className="ld-cmd">
                <div className="ld-cmd-av"><img src={d.commander.avatar} alt={d.commander.name} onError={imgFallback} /></div>
                <div>
                  <div className="ld-cmd-name">{d.commander.name}</div>
                  <div className="ld-cmd-sub">{d.commander.rank} • {d.commander.role}</div>
                </div>
                <div className="ld-cmd-actions">
                  <button className="os-action" onClick={() => { onClose(); navigate('/commanders'); }}>Все командиры</button>
                  <button className="os-action" onClick={() => { onClose(); navigate(`/users/${encodeURIComponent(d.commander.name)}`); }}>Личное дело</button>
                  <button className="os-action" onClick={() => { onClose(); navigate('/messages?chat=1'); }}>Связаться</button>
                </div>
              </div>
              <div className="ld-fields">
                <div className="ld-field"><div className="k">Должность</div><div className="v">{d.position}</div></div>
                <div className="ld-field"><div className="k">Звание</div><div className="v">{d.zvanie}</div></div>
                <div className="ld-field"><div className="k">Специальность</div><div className="v">{d.specialty}</div></div>
              </div>
              <div className="ld-badges-head">
                <span className="l">Знаки отличия и различия полученные на курсе</span>
                <span className="l">Диплом</span>
              </div>
              <div className="ld-badges-row">
                <div className="ld-slots">
                  {slots.map((src, i) => (
                    <div key={i} className={`ld-slot${src ? ' filled' : ''}`}>{src && <img src={src} alt="" onError={imgFallback} />}</div>
                  ))}
                </div>
                <div className="ld-dip">
                  <div className="ld-dip-img" title="Открыть диплом" onClick={() => window.open(d.diploma, '_blank', 'noopener,noreferrer')}>
                    <img src={d.diploma} alt="Диплом" onError={imgFallback} />
                  </div>
                </div>
              </div>
            </>
          )}

          {tab === 'Данные' && (
            <div className="ld-data">
              <div className="ld-data-col">
                {([
                  ['Город', d.city],
                  ['Год рождения', d.birthYear],
                  ['На портале', d.onPortal],
                  ['Сообщество', d.community],
                  ['Прошёл курсов', String(d.courses)],
                  ['Наград', String(d.awards)],
                  ['Подписчиков', d.followers.toLocaleString('ru-RU')],
                ] as [string, string][]).map(([k, v]) => (
                  <div key={k} className="ld-data-row"><span className="k">{k}</span><span className="v">{v}</span></div>
                ))}
              </div>
              <div className="ld-data-main">
                <div className="ld-data-img"><img src={d.bioImage} alt="" onError={imgFallback} /></div>
                <p className="ld-bio">{d.bio}</p>
              </div>
            </div>
          )}

          {tab === 'Подготовка' && <TrainingPanel compact />}
          {tab === 'Замеры' && <MeasurementsPanel compact />}
        </div>

        {/* нижняя панель действий */}
        {tab === 'На курсе' ? (
          <div className="ld-foot">
            <button className="ld-pill" onClick={onRequestReport}>Запросить рапорт</button>
            <button className="ld-pill" onClick={onViewReport}>Рапорт</button>
            <button className="ld-icon grow" title="Почта" onClick={() => { onClose(); navigate('/messages?chat=1'); }}><MailIcon /></button>
            <button className="ld-icon" title="Позвонить" onClick={() => { onClose(); navigate('/messages?chat=1'); }}><PhoneIcon /></button>
            <button className="ld-icon" title="Написать в чат" onClick={() => { onClose(); navigate('/messages?chat=1'); }}><ChatIcon /></button>
            <button className="ld-pill primary" onClick={() => { onClose(); navigate(`/users/${encodeURIComponent(p.name)}`); }}>Личное дело</button>
          </div>
        ) : (
          <div className="ld-foot">
            <button className="ld-pill primary" onClick={() => setSubscribed(s => !s)}>{subscribed ? 'Вы подписаны' : 'Подписаться'}</button>
            <button className="ld-pill" onClick={() => { onClose(); navigate('/messages?chat=1'); }}>Написать в чат</button>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}

/* Модалки «Подать рапорт» и статус-модалки вынесены в ../components/ReportModals */

export function OrgStructure() {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(true);
  const [chartTab, setChartTab] = useState<'chart' | 'measures'>('chart');
  const [searchOpen, setSearchOpen] = useState(false);
  const [view, setView] = useState<'list' | 'tree' | 'table'>('list');
  const [selected, setSelected] = useState<Soldier | null>(null);
  const [reportFor, setReportFor] = useState<Soldier | null>(null);
  const [status, setStatus] = useState<{ kind: 'success' | 'error'; title: string; text: string } | null>(null);
  const tableRows = useMemo(() => flattenTree(TREE).filter(n => n.person), []);
  const contentRef = useRef<HTMLDivElement>(null);
  const selectView = (v: 'list' | 'tree' | 'table') => {
    setView(v);
    window.setTimeout(() => {
      contentRef.current?.scrollIntoView({ block: 'start' });
      if (v === 'tree') {
        const sc = contentRef.current?.parentElement?.querySelector<HTMLElement>('.os-scroll');
        if (sc) sc.scrollLeft = (sc.scrollWidth - sc.clientWidth) / 2;
      }
    }, 0);
  };
  const requestReport = () => {
    setSelected(null);
    setStatus({ kind: 'success', title: 'Рапорт запрошен!', text: 'Запрошенные рапорта отображаются в личном деле' });
  };
  const submitReport = () => {
    setReportFor(null);
    const online = typeof navigator === 'undefined' || navigator.onLine;
    setStatus(online
      ? { kind: 'success', title: 'Рапорт составлен!', text: 'Статус по рапортам можно отследить в личном деле.' }
      : { kind: 'error', title: 'Ошибка!', text: 'Проверьте подключение к интернету или попробуйте снова' });
  };
  const viewReport = () => { setSelected(null); navigate('/study-groups/report'); };
  injectCss();

  return (
    <div className="os-page">
      <div className="os-wrap">
        <div className="os-panel">
          <PortalPageTop title="Организационно Штатная структура" icon={<svg viewBox="0 0 24 24" fill="none" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="2" width="6" height="6" rx="1" /><rect x="2" y="16" width="6" height="6" rx="1" /><rect x="16" y="16" width="6" height="6" rx="1" /><path d="M12 8v4M5 16v-2h14v2" /></svg>} />

          {/* карточка профиля */}
          <div className="os-me-wrap">
            <div className="os-me">
              <div className="os-me-av">
                <div className="pic"><img src={ME.avatar} alt={ME.name} onError={imgFallback} /></div>
                <img className="os-me-pogon" src={ME.pogon} alt="" onError={imgFallback} />
              </div>
              <div className="os-me-info">
                <div className="os-me-rank">{ME.rank}</div>
                <div className="os-me-nameline">
                  <span className="os-me-name">{ME.name}</span>
                  <IVDisplay index={ME.iv} rating={ME.rating} />
                </div>
                <div className="os-me-pos">{ME.position}</div>
              </div>
              <div className="os-me-badges">
                {ME.badges.map((src, i) => (
                  <BadgeBox key={i} src={src} size={60} tooltip={BADGE_TOOLTIPS[i]} topRight={i === 0 ? <ElitaBadge /> : undefined} />
                ))}
                <ExtraBadge count={ME.extra} size={60} onClick={() => navigate('/achievements')} />
              </div>
            </div>

            <div className="os-chev">
              <button onClick={() => setExpanded(v => !v)} aria-label={expanded ? 'Свернуть' : 'Развернуть'} aria-expanded={expanded}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: expanded ? 'rotate(180deg)' : 'none' }}>
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
            </div>
          </div>

          {/* раскрывающийся график (как в профиле) */}
          {expanded && (
            <div className="os-chart">
              <div className="os-seg">
                <button className={chartTab === 'chart' ? 'active' : ''} onClick={() => setChartTab('chart')}>График подготовки</button>
                <button className={chartTab === 'measures' ? 'active' : ''} onClick={() => setChartTab('measures')}>Сводка замеров</button>
              </div>
              {chartTab === 'chart' ? <TrainingPanel /> : <MeasurementsPanel />}
            </div>
          )}

          {/* переключатель вида */}
          <div className="os-viewbar" ref={contentRef}>
            <div className="os-toggle">
              <button className={view === 'list' ? 'active' : ''} onClick={() => selectView('list')}>Список</button>
              <button className={view === 'tree' ? 'active' : ''} onClick={() => selectView('tree')}>Структура</button>
              <button className={view === 'table' ? 'active' : ''} onClick={() => selectView('table')}>Таблица</button>
            </div>
          </div>

          {/* фильтры */}
          <div className="os-filters">
            <select className="os-select" defaultValue=""><option value="">Полк</option><option>1-й полк</option><option>2-й полк</option><option>3-й полк</option></select>
            <select className="os-select" defaultValue=""><option value="">Батальон</option><option>1 батальон</option><option>2 батальон</option></select>
            <select className="os-select" defaultValue=""><option value="">Рота</option><option>1 рота</option><option>2 рота</option></select>
            <select className="os-select" defaultValue=""><option value="">Взвод</option><option>1-й взвод</option><option>2-й взвод</option></select>
            <select className="os-select" defaultValue=""><option value="">Отделение</option><option>1-е отделение</option><option>2-е отделение</option></select>
            {searchOpen
              ? <input className="os-searchbox" placeholder="Поиск по позывному…" autoFocus onBlur={() => setSearchOpen(false)} />
              : (
                <button className="os-search" onClick={() => setSearchOpen(true)} aria-label="Поиск">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                </button>
              )}
          </div>

          {/* состав — список */}
          {view === 'list' && GROUPS.map(g => (
            <div key={g.title}>
              <div className="os-group-title">{g.title}</div>
              {g.people.map((p, i) => (
                <PersonRow key={`${g.title}-${i}`} p={p} onOpen={() => setSelected(p)} onSubmitReport={() => setReportFor(p)} onRequestReport={requestReport} />
              ))}
            </div>
          ))}

          {/* вид «Структура» */}
          {view === 'tree' && (
            <StructureCanvas />
          )}

          {/* вид «Таблица» */}
          {view === 'table' && (
            <div className="os-table">
              <table>
                <thead>
                  <tr><th>Должность</th><th>Звание</th><th>Позывной</th><th>ИВ</th><th>Подразделение</th></tr>
                </thead>
                <tbody>
                  {tableRows.map((n, i) => (
                    <tr key={i} className={`os-trow${n.self ? ' self' : ''}`}>
                      <td>{n.role}</td>
                      <td>{n.person!.rank}</td>
                      <td><span className="os-tname"><img src={n.person!.avatar} alt="" onError={imgFallback} /><b>{n.person!.name}</b></span></td>
                      <td><IVDisplay index={n.person!.iv} rating={null} /></td>
                      <td>{n.person!.sub}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {selected && <LichnoeDeloModal p={selected} onClose={() => setSelected(null)} onRequestReport={requestReport} onViewReport={viewReport} />}
      {reportFor && <ReportFormModal onClose={() => setReportFor(null)} onSubmit={submitReport} />}
      {status && <StatusModal kind={status.kind} title={status.title} text={status.text} onClose={() => setStatus(null)} />}
    </div>
  );
}
