import { useEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent, KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { userProfilePath } from '../api/testApi';
import { shareOrCopy } from '../utils/share';
import { useFavoritesStore } from '../store/useFavoritesStore';
import { IVDisplay } from '../components/PeopleSection';
import { bindSmoothPageWheel } from '../utils/smoothWheelScroll';

type FeedFilter = 'all' | 'communities' | 'friends' | 'achievements';
type FeedItemType = 'post' | 'achievement' | 'course' | 'event';

interface Comment {
  id: number;
  author: string;
  avatar: string;
  text: string;
  time: string;
}

interface FeedItem {
  id: number;
  type: FeedItemType;
  source: 'community' | 'friend' | 'system';
  author: string;
  handle: string;
  avatar: string;
  title?: string;
  text: string;
  time: string;
  image?: string;
  badge?: {
    label: string;
    tone: 'gold' | 'green' | 'blue' | 'red';
  };
  community?: string;
  tags: string[];
  likes: number;
  comments: Comment[];
  reposts: number;
  shared?: boolean;
  liked: boolean;
  saved: boolean;
  jumbo: number;
  jumboed: boolean;
  achievementId?: number;
}

interface Person {
  id: string;
  name: string;
  role: string;
  avatar: string;
  status: string;
  following: boolean;
}

interface Community {
  id: string;
  name: string;
  avatar: string;
  members: string;
  lastUpdate: string;
  following: boolean;
}

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap');

.blog-feed-page {
  --ink: #101828;
  --muted: #667085;
  --soft: #F5F7FB;
  --line: #E1E7F0;
  --blue: #2F61F4;
  --blue-soft: #ECF2FF;
  --green: #13966D;
  --green-soft: #E9F8F1;
  --gold: #B7791F;
  --gold-soft: #FFF6DF;
  --red: #C03535;
  --red-soft: #FFF0F0;
  --panel: #FFFFFF;
  --shadow: 0 10px 30px rgba(16,24,40,.08);
  margin-left: 56px;
  padding-top: 60px;
  min-height: 100vh;
  background:
    linear-gradient(180deg, rgba(47,97,244,.08), rgba(47,97,244,0) 260px),
    #F4F6FA;
  color: var(--ink);
  font-family: 'Montserrat', system-ui, sans-serif;
}

.blog-feed-page * {
  box-sizing: border-box;
}

.blog-toast {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 400;
  padding: 11px 15px;
  border-radius: 8px;
  background: #17213b;
  color: #fff;
  box-shadow: 0 14px 36px rgba(15,23,42,.25);
  font-size: 11px;
  font-weight: 800;
  animation: feedIn .24s ease both;
}

.blog-shell {
  max-width: 1320px;
  margin: 0 auto;
  padding: 22px 24px 56px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 22px;
  align-items: start;
}

.blog-topbar {
  background: rgba(255,255,255,.88);
  border: 1px solid var(--line);
  border-radius: 14px;
  padding: 18px;
  box-shadow: 0 8px 22px rgba(16,24,40,.05);
  backdrop-filter: blur(12px);
  margin-bottom: 14px;
}

.blog-eyebrow {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--muted);
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .08em;
  margin-bottom: 7px;
}

.blog-title-row {
  display: flex;
  justify-content: space-between;
  gap: 18px;
  align-items: flex-end;
}

.blog-title {
  margin: 0;
  font-size: 28px;
  line-height: 1.08;
  letter-spacing: 0;
  font-weight: 900;
}

.blog-subtitle {
  max-width: 640px;
  margin: 8px 0 0;
  color: var(--muted);
  font-size: 13px;
  line-height: 1.55;
}

.blog-stats {
  display: grid;
  grid-template-columns: repeat(3, 108px);
  gap: 8px;
}

.blog-stat {
  background: var(--soft);
  border: 1px solid var(--line);
  border-radius: 10px;
  padding: 10px 12px;
}

.blog-stat b {
  display: block;
  font-size: 17px;
  line-height: 1;
  margin-bottom: 4px;
}

.blog-stat span {
  color: var(--muted);
  font-size: 11px;
  font-weight: 600;
}

.blog-tabs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin: 14px 0;
}

.blog-tab {
  border: 1px solid var(--line);
  background: #fff;
  color: #344054;
  border-radius: 10px;
  padding: 10px 13px;
  min-height: 40px;
  font-family: inherit;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: background .16s ease, border-color .16s ease, color .16s ease, transform .16s ease;
}

.blog-tab:hover,
.blog-tab.active {
  background: var(--blue-soft);
  border-color: #B9CAFF;
  color: var(--blue);
}

.blog-tab:hover {
  transform: translateY(-1px);
}

.blog-composer,
.feed-card,
.side-panel {
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 14px;
  box-shadow: 0 8px 20px rgba(16,24,40,.04);
}

.blog-composer {
  padding: 16px;
  margin-bottom: 14px;
}

.composer-row {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  overflow: hidden;
  background: #E5EAF2;
  flex-shrink: 0;
  border: 1px solid rgba(255,255,255,.8);
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.composer-body {
  flex: 1;
}

.composer-input {
  width: 100%;
  min-height: 76px;
  resize: vertical;
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 13px 14px;
  outline: none;
  font-family: inherit;
  font-size: 13px;
  line-height: 1.6;
  color: var(--ink);
  background: #FAFBFD;
  transition: border-color .16s ease, box-shadow .16s ease, background .16s ease;
}

.composer-input:focus {
  border-color: #98B4FF;
  box-shadow: 0 0 0 4px rgba(47,97,244,.1);
  background: #fff;
}

.composer-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
  gap: 10px;
}

.icon-button,
.action-button {
  border: 0;
  background: transparent;
  font-family: inherit;
  cursor: pointer;
  color: var(--muted);
  transition: background .16s ease, color .16s ease, transform .16s ease;
}

.icon-button {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--line);
  background: #fff;
}

.icon-button:hover {
  color: var(--blue);
  background: var(--blue-soft);
  transform: translateY(-1px);
}

.publish-button {
  border: 0;
  min-height: 38px;
  border-radius: 10px;
  padding: 0 18px;
  background: var(--blue);
  color: #fff;
  font-family: inherit;
  font-weight: 800;
  font-size: 12px;
  cursor: pointer;
  transition: opacity .16s ease, transform .16s ease, box-shadow .16s ease;
}

.publish-button:disabled {
  cursor: not-allowed;
  opacity: .42;
}

.publish-button:not(:disabled):hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 18px rgba(47,97,244,.24);
}

.feed-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

@keyframes feedIn {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

.feed-card {
  overflow: hidden;
  animation: feedIn .28s ease both;
}

.feed-card-header {
  padding: 16px 16px 0;
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.author-line {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.author-name {
  font-size: 14px;
  font-weight: 900;
  color: var(--ink);
}

.handle,
.time {
  color: var(--muted);
  font-size: 12px;
  font-weight: 600;
}

.source-chip,
.badge-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border-radius: 999px;
  padding: 4px 9px;
  font-size: 11px;
  font-weight: 800;
}

.source-chip {
  background: var(--soft);
  color: #475467;
  border: 1px solid var(--line);
}

.badge-chip.gold { background: var(--gold-soft); color: var(--gold); }
.badge-chip.green { background: var(--green-soft); color: var(--green); }
.badge-chip.blue { background: var(--blue-soft); color: var(--blue); }
.badge-chip.red { background: var(--red-soft); color: var(--red); }

.feed-card-body {
  padding: 12px 16px 0 72px;
}

.feed-title {
  margin: 0 0 7px;
  font-size: 16px;
  line-height: 1.35;
  font-weight: 900;
}

.feed-text {
  margin: 0;
  color: #344054;
  font-size: 13px;
  line-height: 1.68;
}

.feed-image {
  margin-top: 12px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--line);
  background: #EEF2F8;
  aspect-ratio: 16 / 7;
}

.feed-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform .35s ease;
}

.feed-card:hover .feed-image img {
  transform: scale(1.03);
}

.feed-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 12px;
}

.tag-chip {
  border: 1px solid var(--line);
  background: #FAFBFD;
  color: #475467;
  border-radius: 999px;
  padding: 4px 9px;
  font-size: 11px;
  font-weight: 700;
}

.feed-actions {
  margin-top: 14px;
  border-top: 1px solid var(--line);
  padding: 12px 16px 13px 72px;
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.action-button {
  min-height: 40px;
  padding: 0 13px;
  border: 1px solid #E1E6EF;
  border-radius: 8px;
  background: #FFFFFF;
  color: #475467;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  font-size: 12px;
  font-weight: 800;
  box-shadow: 0 2px 5px rgba(15,23,42,.025);
}

.action-button:hover {
  background: var(--blue-soft);
  border-color: #B9CAFF;
  color: var(--blue);
  transform: translateY(-1px);
}

.action-button.like.active { border-color:#F7B8C0; background:#FFF1F3; color:#D92D4D; }
.action-button.comment.active { border-color:#B9CAFF; background:#ECF2FF; color:#2F61F4; }
.action-button.jumbo.active { border-color:#F0D68E; background:#FFF8E7; color:#9A6700; }
.action-button.share.active { border-color:#A9DFC5; background:#ECFDF3; color:#138A5B; }
.action-button.save.active { border-color:#B9CAFF; background:#ECF2FF; color:#2F61F4; }
.action-button .action-count { min-width:20px; padding:2px 6px; border-radius:999px; background:#F2F4F7; color:inherit; font-size:10px; line-height:16px; }
.action-button.active .action-count { background:rgba(255,255,255,.72); }

.comments-box {
  border-top: 1px solid var(--line);
  background: #FAFBFD;
  padding: 12px 16px 14px 72px;
}

.comment-row {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.comment-row .avatar {
  width: 30px;
  height: 30px;
}

.comment-bubble {
  background: #fff;
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 9px 11px;
  flex: 1;
}

.comment-author {
  color: var(--ink);
  font-size: 12px;
  font-weight: 900;
  margin-bottom: 3px;
}

.comment-text {
  color: #475467;
  font-size: 12px;
  line-height: 1.48;
}

.comment-form {
  display: flex;
  gap: 9px;
  align-items: center;
}

.comment-form input {
  flex: 1;
  min-width: 0;
  border: 1px solid var(--line);
  border-radius: 999px;
  min-height: 36px;
  padding: 0 13px;
  outline: none;
  font-family: inherit;
  font-size: 12px;
}

.comment-form input:focus {
  border-color: #98B4FF;
}

.side-column {
  position: sticky;
  top: 82px;
  align-self: start;
  min-width: 0;
  max-height: calc(100vh - 98px);
  overflow-y: hidden;
  overscroll-behavior: contain;
  display: flex;
  flex-direction: column;
  gap: 14px;
  animation: sideRailEnter .45s cubic-bezier(.2,.8,.2,1) both;
}

.side-column > section {
  flex: 0 0 auto;
}

.side-column[data-fade-top="true"][data-fade-bottom="false"] {
  -webkit-mask-image: linear-gradient(to bottom, transparent 0, #000 22px, #000 100%);
  mask-image: linear-gradient(to bottom, transparent 0, #000 22px, #000 100%);
}

.side-column[data-fade-top="false"][data-fade-bottom="true"] {
  -webkit-mask-image: linear-gradient(to bottom, #000 0, #000 calc(100% - 22px), transparent 100%);
  mask-image: linear-gradient(to bottom, #000 0, #000 calc(100% - 22px), transparent 100%);
}

.side-column[data-fade-top="true"][data-fade-bottom="true"] {
  -webkit-mask-image: linear-gradient(to bottom, transparent 0, #000 22px, #000 calc(100% - 22px), transparent 100%);
  mask-image: linear-gradient(to bottom, transparent 0, #000 22px, #000 calc(100% - 22px), transparent 100%);
}

@keyframes sideRailEnter {
  from { transform: translateX(24px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

.side-panel {
  padding: 16px;
}

.side-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 12px;
}

.side-title h3 {
  margin: 0;
  font-size: 14px;
  font-weight: 900;
}

.side-title span {
  color: var(--muted);
  font-size: 11px;
  font-weight: 800;
}

.mini-list {
  display: flex;
  flex-direction: column;
  gap: 11px;
}

.mini-row {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.mini-copy {
  flex: 1;
  min-width: 0;
}

.mini-copy b {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
}

.mini-copy span {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--muted);
  font-size: 11px;
  margin-top: 2px;
}

.follow-button {
  border: 1px solid var(--line);
  background: #fff;
  border-radius: 9px;
  min-height: 30px;
  padding: 0 9px;
  font-family: inherit;
  color: #475467;
  font-size: 11px;
  font-weight: 800;
  cursor: pointer;
  transition: background .16s ease, color .16s ease, border-color .16s ease;
}

.follow-button.active,
.follow-button:hover {
  background: var(--blue-soft);
  border-color: #B9CAFF;
  color: var(--blue);
}

.agenda {
  display: grid;
  gap: 9px;
}

.agenda-card {
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 11px;
  background: #FAFBFD;
}

.agenda-card b {
  display: block;
  font-size: 12px;
  line-height: 1.4;
  margin-bottom: 5px;
}

.agenda-card span {
  color: var(--muted);
  font-size: 11px;
  font-weight: 600;
}

.honor-board-card {
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(197, 160, 74, .34);
  border-radius: 14px;
  padding: 16px;
  background: linear-gradient(145deg, #111a32, #1b294c);
  color: #fff;
}

.honor-board-card::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: .07;
  background-image: repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 1px, transparent 7px);
}

.honor-board-medals { display: flex; gap: 7px; margin: 13px 0; }
.honor-board-medals img { width: 42px; height: 42px; object-fit: contain; filter: drop-shadow(0 5px 8px rgba(0,0,0,.38)); }
.honor-board-button { position: relative; z-index: 1; width: 100%; min-height: 36px; border: 1px solid rgba(217,164,65,.42); background: rgba(217,164,65,.13); color: #f2d58d; font-family: inherit; font-size: 11px; font-weight: 850; cursor: pointer; }
.honor-board-button:hover { background: rgba(217,164,65,.22); }

@media (max-width: 1120px) {
  .blog-shell {
    grid-template-columns: 1fr;
  }
  .side-column {
    position: static;
    width: auto !important;
    max-height: none;
    overflow: visible;
    -webkit-mask-image: none;
    mask-image: none;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .blog-feed-page {
    margin-left: 56px;
  }
  .blog-shell {
    padding: 14px 12px 40px;
  }
  .blog-title-row {
    align-items: flex-start;
    flex-direction: column;
  }
  .blog-stats {
    width: 100%;
    grid-template-columns: repeat(3, 1fr);
  }
  .feed-card-body,
  .feed-actions,
  .comments-box {
    padding-left: 16px;
  }
  .side-column {
    grid-template-columns: 1fr;
  }
  .action-button { flex:1 1 calc(50% - 8px); }
  .action-button.save { margin-left:0 !important; }
}
`;

const referenceStyles = `
.blog-feed-page {
  --ink: #11182b;
  --muted: #91a1bd;
  --line: #e4e8f2;
  --blue: #375dfb;
  --blue-soft: #ebf1ff;
  background: #F4F5F8;
  overflow-x: clip;
}

.blog-shell {
  width: 100%;
  max-width: 1980px;
  padding: 26px 34px 64px;
  grid-template-columns: minmax(0, 1fr) minmax(340px, 420px);
  gap: 32px;
}

.blog-topbar {
  padding: 0 0 22px;
  margin: 0;
  border: 0;
  border-radius: 0;
  background: transparent;
  box-shadow: none;
  backdrop-filter: none;
}

.blog-title-row { align-items: flex-end; }
.blog-eyebrow { color:#375dfb; font-size:12px; letter-spacing:.12em; margin-bottom:14px; }
.blog-eyebrow svg { display:none; }
.blog-title { font-size:32px; letter-spacing:-.035em; }
.blog-subtitle { max-width:720px; margin-top:10px; color:#9aa8c1; font-size:14px; }
.blog-stats { grid-template-columns:repeat(3, 108px); gap:14px; }
.blog-stat { padding:15px 17px; min-height:70px; background:#fff; border:1px solid var(--line); border-radius:16px; box-shadow:0 3px 10px rgba(30,44,90,.035); }
.blog-stat { width:100%; font-family:inherit; text-align:left; cursor:pointer; transition:transform .2s ease, border-color .2s ease, box-shadow .2s ease, background .2s ease; }
.blog-stat:hover { transform:translateY(-2px); border-color:#c7d2fe; background:#fbfcff; box-shadow:0 9px 22px rgba(55,93,251,.11); }
.blog-stat:active { transform:translateY(0); }
.blog-stat b { font-size:22px; margin-bottom:8px; }
.blog-stat span { color:#9aa8bf; font-size:11px; }

.feed-filter-tabs {
  display:grid;
  grid-template-columns:repeat(4, 1fr);
  gap:8px;
  margin:0 0 18px;
  padding:8px;
  min-height:64px;
  border:1px solid var(--line);
  border-radius:14px;
  background:#fff;
  box-shadow:0 4px 14px rgba(26,37,80,.035);
}
.feed-filter-tabs .blog-tab {
  width:100%;
  justify-content:center;
  min-height:46px;
  padding:0 18px;
  border:1px solid transparent;
  border-radius:8px;
  background:transparent;
  color:#182137;
  font-size:13px;
  box-shadow:none;
  transform:none;
}
.feed-filter-tabs .blog-tab svg { display:none; }
.feed-filter-tabs .blog-tab span { min-width:24px; padding:3px 7px; border-radius:999px; background:#f0f2fa; color:#8d9bb4; font-size:10px; }
.feed-filter-tabs .blog-tab:hover {
  border-color:#d7e0fb;
  background:#f6f8ff;
  color:#375dfb;
  transform:none;
}
.feed-filter-tabs .blog-tab.active {
  border-color:#375dfb;
  background:#375dfb;
  color:#fff;
  box-shadow:0 6px 14px rgba(55,93,251,.2);
}
.feed-filter-tabs .blog-tab.active:hover { background:#3155e8; color:#fff; }
.feed-filter-tabs .blog-tab.active span { background:rgba(255,255,255,.2); color:#fff; }
.feed-filter-tabs .blog-tab.active span { background:rgba(255,255,255,.22); color:#fff; }

.blog-composer {
  min-height:198px;
  padding:20px 22px;
  margin:0 0 18px;
  border:1px solid var(--line);
  border-radius:20px;
  box-shadow:0 4px 14px rgba(26,37,80,.035);
}
.composer-row { gap:16px; }
.profile-letter-avatar { width:58px; height:58px; flex:0 0 58px; display:grid; place-items:center; border-radius:50%; background:#375dfb; color:#fff; font-size:19px; font-weight:900; position:relative; overflow:hidden; isolation:isolate; }
.profile-letter-avatar img { width:100%; height:100%; max-width:100%; display:block; object-fit:cover; }
.profile-letter-avatar.online::after { content:''; position:absolute; right:-1px; bottom:2px; width:12px; height:12px; border-radius:50%; background:#16b56b; border:3px solid #fff; }
.composer-input { min-height:92px; padding:8px 0; border:0; border-radius:0; background:transparent; font-size:15px; resize:none; }
.composer-input:focus { border:0; box-shadow:none; background:transparent; }
.composer-photo {
  position:relative;
  width:min(440px,100%);
  margin-top:10px;
  overflow:hidden;
  border:1px solid #dce4fb;
  border-radius:12px;
  background:#f3f6ff;
  animation:composerPhotoIn .28s cubic-bezier(.2,.8,.2,1) both;
}
.composer-photo img { width:100%; max-height:210px; display:block; object-fit:cover; }
.composer-photo-remove { position:absolute; top:8px; right:8px; width:30px; height:30px; border:1px solid rgba(255,255,255,.8); background:rgba(17,24,39,.72); color:#fff; cursor:pointer; backdrop-filter:blur(8px); }
.composer-photo-remove:hover { background:#375dfb; }
.composer-actions { margin-top:6px; padding-top:14px; border-top:1px solid #edf0f7; }
.icon-button { width:40px; height:40px; border:0; background:#f4f5fb; color:#8ea0bd; }
.icon-button.active { background:#ebf1ff; color:#375dfb; box-shadow:inset 0 0 0 1px #c7d2fe; }
.publish-button { min-width:160px; min-height:42px; background:#375dfb; }
.publish-button:disabled { background:#aeb7ed; opacity:.75; }

.topic-tabs { margin:0 0 4px !important; gap:8px; }
.topic-tabs .blog-tab { min-height:34px; padding:0 13px; border:1px solid #e7eaf3; border-radius:999px; background:#fff; color:#8fa0bb; font-size:11px; }
.topic-tabs .blog-tab.active { background:#ebf1ff; border-color:#c7d2fe; color:#375dfb; }

.feed-list { gap:0; }
.feed-card {
  padding:22px 0 12px;
  border:0;
  border-bottom:1px solid #e4e8f2;
  border-radius:0;
  background:transparent;
  box-shadow:none;
  overflow:visible;
}
.feed-card-header { padding:0; gap:12px; align-items:center; }
.feed-card-header .avatar { width:48px; height:48px; }
.author-line { gap:7px; }
.author-name { font-size:14px; }
.handle { color:#375dfb; font-size:12px; }
.author-meta { margin-top:4px; color:#91a1bd; font-size:11px; font-weight:600; }
.source-chip { display:none; }
.badge-chip { padding:3px 8px; font-size:10px; }
.feed-save { width:36px; height:36px; margin-left:auto; display:grid; place-items:center; border:0; background:transparent; color:#9badc5; cursor:pointer; }
.feed-save:hover,.feed-save.active { color:#375dfb; background:#ebf1ff; }
.feed-save.active svg { fill:currentColor; }
.feed-card-body { padding:18px 0 0; }
.feed-title { margin-bottom:9px; font-size:16px; }
.feed-text { font-size:14px; line-height:1.62; color:#33405a; }
.feed-tags { margin-top:12px; gap:7px; }
.tag-chip { padding:5px 11px; border:0; background:#eef2ff; color:#375dfb; font-size:10px; }
.feed-image { max-height:310px; margin-top:14px; border-radius:14px; aspect-ratio:16/6; }
.achievement-strip { width:100%; margin-top:14px; padding:12px 15px; display:flex; align-items:center; gap:13px; text-align:left; border:1px solid #f0d28f; background:#fff8e8; color:#8f6410; cursor:pointer; }
.achievement-icon { width:44px; height:44px; flex:0 0 44px; display:grid; place-items:center; border-radius:9px; background:#eab23f; overflow:hidden; }
.achievement-icon img { width:38px; height:38px; max-width:100%; object-fit:contain; display:block; }
.achievement-strip > span:last-child { min-width:0; }
.achievement-strip b,.achievement-strip small { display:block; }
.achievement-strip b { font-size:13px; }
.achievement-strip small { margin-top:4px; color:#b0822c; font-size:10px; }
.feed-actions { margin-top:14px; padding:12px 4px 0; border-top:1px solid #e4e8f2; gap:17px; }
.action-button { min-height:32px; padding:0 7px; border:0; background:transparent; box-shadow:none; color:#92a5c0; font-size:11px; }
.action-button:hover { border:0; background:#ebf1ff; color:#375dfb; transform:none; }
.action-button .action-count { min-width:0; padding:0; background:transparent; font-size:11px; }
.action-button.active .action-count { background:transparent; }
.action-button.like.active,.action-button.comment.active,.action-button.jumbo.active,.action-button.share.active { border:0; background:#ebf1ff; color:#375dfb; }
.comments-box { margin-top:8px; padding:14px; border:1px solid var(--line); border-radius:14px; background:#fff; }

.side-column { top:78px; max-height:calc(100vh - 94px); gap:18px; width:100%; overflow-x:hidden; scrollbar-width:none; -ms-overflow-style:none; }
.side-column::-webkit-scrollbar { width:0; height:0; display:none; }
.side-panel { width:100%; min-width:0; padding:20px; border:1px solid var(--line); border-radius:20px; box-shadow:0 4px 14px rgba(26,37,80,.035); overflow:hidden; }
.side-title { margin-bottom:16px; }
.side-title h3 { font-size:15px; }
.side-title > button { border:0; background:transparent; color:#375dfb; font-family:inherit; font-size:11px; font-weight:800; cursor:pointer; }
.profile-summary {
  padding:20px;
  border-color:#dce4fb;
  background:
    radial-gradient(circle at 100% 0, rgba(55,93,251,.09), transparent 42%),
    #fff;
  color:#11182b;
}
.profile-head { display:flex; align-items:center; gap:14px; }
.profile-head > div:last-child { min-width:0; }
.profile-head b { display:block; font-size:15px; }
.profile-head b span { color:#375dfb; font-size:12px; }
.profile-head small { display:block; margin-top:5px; color:#91a1bd; font-size:11px; }
.profile-metrics { display:grid; grid-template-columns:1fr; gap:10px; margin-top:16px; }
.profile-iv-card { min-width:0; min-height:78px; padding:13px 14px; border:1px solid #dfe7fb; border-radius:16px; background:#f7f9ff; }
.profile-iv-card > span { display:block; margin-bottom:9px; color:#91a1bd; font-size:10px; font-weight:900; letter-spacing:.08em; text-transform:uppercase; }
.rank-label { margin:17px 0 9px; color:#91a1bd; font-size:10px; font-weight:900; }
.rank-row { display:flex; gap:4px; width:100%; }
.rank-row button { flex:1; min-width:0; height:56px; padding:4px; border:none; background:transparent; cursor:pointer; overflow:visible; border-radius:10px; transition:transform .32s cubic-bezier(.34,1.56,.64,1); }
.rank-row button:hover { background:transparent; transform:translateY(-6px) scale(1.14); }
.rank-row button.featured { background:transparent; }
.rank-row button:active { transform:translateY(-2px) scale(1.04) !important; }
.rank-row img { width:100%; height:100%; max-width:100%; max-height:100%; display:block; object-fit:contain; filter:drop-shadow(0 3px 8px rgba(16,24,40,.22)); transition:filter .32s ease; }
.rank-row button:hover img { filter:drop-shadow(0 9px 18px rgba(55,93,251,.4)); }
.rank-row button.featured img { filter:drop-shadow(0 4px 10px rgba(55,93,251,.32)); }
.mini-list { gap:12px; }
.mini-row { gap:10px; min-width:0; grid-template-columns:44px minmax(0,1fr) auto; }
.mini-row .avatar { width:44px; height:44px; border-radius:12px; }
.mini-copy { min-width:0; }
.mini-copy b { max-width:100%; font-size:12px; }
.mini-copy span { margin-top:4px; font-size:10px; }
.follow-button { min-height:30px; padding:0 10px; border:0; border-radius:999px; background:#ecf8f1; color:#16a65b; font-size:10px; }
.follow-button.active { background:#e9f8f0; color:#12a058; }
.live-list,.mentor-list { display:grid; gap:16px; }
.live-row,.mentor-row { width:100%; min-width:0; display:grid; grid-template-columns:44px minmax(0,1fr) auto; gap:11px; align-items:center; }
.live-row > div,.mentor-row > div { min-width:0; }
.side-avatar-wrap { position:relative; width:44px; height:44px; flex:0 0 44px; }
.side-person-photo { width:44px; height:44px; display:block; border:1px solid #e4eaf5; border-radius:50%; object-fit:cover; object-position:center top; background:#eef2f8; box-shadow:0 5px 14px rgba(16,24,40,.08); }
.side-live-dot,.side-online-dot { position:absolute; right:0; bottom:1px; width:12px; height:12px; border:2px solid #fff; border-radius:50%; }
.side-live-dot { background:#ef4444; box-shadow:0 0 0 4px rgba(239,68,68,.14); }
.side-online-dot { background:#12b76a; }
.live-row b,.mentor-row b { display:block; min-width:0; overflow:hidden; text-overflow:ellipsis; font-size:11px; line-height:1.35; }
.live-row small,.mentor-row small { display:block; min-width:0; margin-top:3px; color:#91a1bd; font-size:9px; line-height:1.3; white-space:normal; }
.watch-button,.remind-button,.mentor-row > button { min-width:0; min-height:34px; padding:0 12px; border:0; white-space:nowrap; font-size:10px; font-weight:900; cursor:pointer; }
.watch-button { background:#e52b2f; color:#fff; }.remind-button { background:#eef0ff; color:#5363df; }
.mentor-row small { color:#13a459; font-weight:800; }
.mentor-row div > span { display:inline-block; margin-top:6px; padding:3px 7px; border-radius:999px; background:#f1f3f9; color:#9aa8bf; font-size:8px; }
.mentor-row > button { background:#5260dd; color:#fff; }
.forum-grid { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
.forum-button { min-width:0; min-height:62px; padding:10px; border:1px solid #e5eaf4; border-radius:13px; background:#fbfcff; color:#17213a; font-family:inherit; text-align:left; cursor:pointer; transition:transform .18s ease,border-color .18s ease,background .18s ease,box-shadow .18s ease; }
.forum-button:hover { transform:translateY(-2px); border-color:#c8d4fb; background:#f4f7ff; box-shadow:0 8px 18px rgba(55,93,251,.1); }
.forum-button b { display:block; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-size:11px; }
.forum-button span { display:inline-grid; width:28px; height:28px; place-items:center; margin-bottom:7px; border-radius:9px; background:#ebf1ff; color:#375dfb; font-size:9px; font-weight:900; }
.forum-button small { display:block; margin-top:4px; color:#91a1bd; font-size:9px; }
.forum-unread { display:inline-flex !important; width:auto !important; height:auto !important; margin:6px 0 0 !important; padding:2px 7px; border-radius:999px !important; background:#eef2ff !important; color:#375dfb !important; font-size:8px !important; }
.friend-events { display:grid; gap:13px; }
.friend-event-row { display:grid; grid-template-columns:44px minmax(0,1fr) auto; gap:11px; align-items:center; }
.friend-event-row > div { min-width:0; }
.friend-event-row b { display:block; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; color:#17213a; font-size:11px; }
.friend-event-row small { display:block; margin-top:3px; color:#91a1bd; font-size:9px; line-height:1.35; }
.friend-event-row button { min-height:32px; padding:0 11px; border:0; border-radius:999px; background:#eef2ff; color:#5260dd; font-family:inherit; font-size:10px; font-weight:900; cursor:pointer; }
.friend-event-row button:hover { transform:translateY(-2px); }
.nearest-list { display:grid; gap:10px; }
.nearest-card { display:grid; grid-template-columns:42px minmax(0,1fr); gap:11px; align-items:start; padding:10px; border:1px solid #e8edf6; border-radius:13px; background:#fbfcff; }
.nearest-date { display:grid; height:42px; place-items:center; border-radius:11px; background:#ebf1ff; color:#375dfb; line-height:1; }
.nearest-date b { font-size:13px; }
.nearest-date span { font-size:8px; font-weight:900; text-transform:uppercase; }
.nearest-card strong { display:block; color:#17213a; font-size:11px; line-height:1.35; }
.nearest-card small { display:block; margin-top:3px; color:#91a1bd; font-size:9px; }

.blog-topbar { animation:portalRise .42s cubic-bezier(.2,.8,.2,1) both; }
.feed-filter-tabs { animation:portalRise .42s .05s cubic-bezier(.2,.8,.2,1) both; }
.blog-composer { animation:portalRise .45s .1s cubic-bezier(.2,.8,.2,1) both; }
.topic-tabs { animation:portalRise .45s .15s cubic-bezier(.2,.8,.2,1) both; }
.side-column > .side-panel { animation:portalSideIn .42s cubic-bezier(.2,.8,.2,1) both; }
.side-column > .side-panel:nth-child(2) { animation-delay:.06s; }
.side-column > .side-panel:nth-child(3) { animation-delay:.12s; }
.side-column > .side-panel:nth-child(4) { animation-delay:.18s; }
.side-panel,.blog-composer { transition:border-color .22s ease, box-shadow .22s ease, transform .22s ease; }
.side-panel:hover { border-color:#d4def8; box-shadow:0 10px 28px rgba(55,93,251,.08); }
.rank-row button,.follow-button,.watch-button,.remind-button,.mentor-row > button,.publish-button,.icon-button,.feed-save,.action-button { transition:transform .18s ease, background-color .18s ease, color .18s ease, border-color .18s ease, box-shadow .18s ease; }
.rank-row button:hover,.follow-button:hover,.watch-button:hover,.remind-button:hover,.mentor-row > button:hover,.publish-button:not(:disabled):hover { transform:translateY(-2px); }
.rank-row button:active,.follow-button:active,.watch-button:active,.remind-button:active,.mentor-row > button:active,.publish-button:not(:disabled):active { transform:translateY(0) scale(.98); }

@keyframes portalRise {
  from { opacity:0; transform:translateY(12px); }
  to { opacity:1; transform:translateY(0); }
}
@keyframes portalSideIn {
  from { opacity:0; transform:translateX(14px); }
  to { opacity:1; transform:translateX(0); }
}
@keyframes composerPhotoIn {
  from { opacity:0; transform:scale(.98) translateY(5px); }
  to { opacity:1; transform:scale(1) translateY(0); }
}

@media (max-width: 1120px) {
  .blog-shell { grid-template-columns:1fr; padding:22px 20px 50px; }
  .side-column { max-height:none; overflow:visible; }
  .side-panel { overflow:hidden; }
}
@media (min-width:1121px) and (max-width:1400px) {
  .blog-shell { grid-template-columns:minmax(0,1fr) 360px; gap:20px; padding-inline:20px; }
  .side-panel { padding:16px; }
  .live-row,.mentor-row { grid-template-columns:40px minmax(0,1fr); }
  .side-avatar-wrap,.side-person-photo { width:40px; height:40px; }
  .watch-button,.remind-button,.mentor-row > button { grid-column:2; justify-self:start; }
}
@media (max-width: 760px) {
  .blog-shell { padding:16px 12px 40px; }
  .blog-title-row { gap:16px; }
  .blog-stats { grid-template-columns:repeat(3,1fr); gap:6px; }
  .blog-stat { min-height:60px; padding:11px; }
  .feed-filter-tabs { grid-template-columns:repeat(2,1fr); }
  .blog-composer { min-height:170px; }
  .profile-letter-avatar { width:46px; height:46px; flex-basis:46px; }
  .composer-input { font-size:13px; }
  .topic-tabs { flex-wrap:nowrap; overflow-x:auto; padding-bottom:5px; }
  .topic-tabs .blog-tab { flex:0 0 auto; }
  .feed-card { padding-top:18px; }
  .feed-actions { gap:7px; }
  .action-button { flex:0 0 auto; }
}
@media (prefers-reduced-motion: reduce) {
  .blog-feed-page *, .blog-feed-page *::before, .blog-feed-page *::after {
    animation-duration:.01ms !important;
    animation-delay:0ms !important;
    transition-duration:.01ms !important;
    scroll-behavior:auto !important;
  }
}

/* ═══════════════════════════════════════════
   MICRO-ANIMATIONS
   ═══════════════════════════════════════════ */

/* Feed card: staggered entrance */
@keyframes feedCardSlide {
  from { opacity:0; transform:translateY(16px); }
  to   { opacity:1; transform:translateY(0); }
}
.feed-card:nth-child(1) { animation:feedCardSlide .32s ease both; }
.feed-card:nth-child(2) { animation:feedCardSlide .32s .07s ease both; }
.feed-card:nth-child(3) { animation:feedCardSlide .32s .14s ease both; }
.feed-card:nth-child(4) { animation:feedCardSlide .32s .21s ease both; }
.feed-card:nth-child(5) { animation:feedCardSlide .32s .28s ease both; }

/* Feed card hover lift */
.feed-card { transition:background .18s ease, box-shadow .22s ease; border-radius:16px; padding:20px 22px 12px; }
.feed-card:hover { background:#fcfcff; box-shadow:0 6px 22px rgba(55,93,251,.08); }
.feed-card:hover .feed-image img { transform:scale(1.04); }

/* Author name interactive */
.author-name { transition:color .14s ease; display:inline; }
.author-name:hover { color:var(--blue) !important; }

/* Author avatar hover ring + scale */
.avatar { transition:transform .22s cubic-bezier(.34,1.56,.64,1), box-shadow .22s ease; }
.avatar:hover { transform:scale(1.1); box-shadow:0 0 0 3px rgba(55,93,251,.22), 0 4px 12px rgba(55,93,251,.18); }

/* Like heartbeat */
@keyframes heartPop {
  0%   { transform:scale(1); }
  30%  { transform:scale(1.45); }
  60%  { transform:scale(1.12); }
  100% { transform:scale(1); }
}
.action-button.like.active svg { animation:heartPop .38s cubic-bezier(.36,.07,.19,.97) both; fill:#D92D4D; }

/* Action button: press dip + smooth transition */
.action-button { transition:transform .14s ease, background .15s ease, color .15s ease, box-shadow .15s ease; }
.action-button:active { transform:scale(.9) !important; }

/* Tag chip hover pop */
.tag-chip { cursor:pointer; transition:transform .2s cubic-bezier(.34,1.56,.64,1), background .15s ease, color .15s ease; }
.tag-chip:hover { transform:translateY(-2px) scale(1.07); background:#EBF1FF; color:#375DFB; border-color:#C7D2FE; }

/* Badge chip spring entrance */
@keyframes badgeSpin {
  0%   { transform:scale(0) rotate(-8deg); opacity:0; }
  70%  { transform:scale(1.1) rotate(2deg); opacity:1; }
  100% { transform:scale(1) rotate(0); }
}
.badge-chip { animation:badgeSpin .35s cubic-bezier(.34,1.56,.64,1) both; }

/* Composer textarea: smooth expand on focus */
.composer-input { transition:min-height .3s cubic-bezier(.4,0,.2,1), border-color .16s ease, box-shadow .16s ease, background .16s ease; }
.composer-input:focus { min-height:112px; }

/* Icon buttons spring */
.icon-button { transition:transform .2s cubic-bezier(.34,1.56,.64,1), background .16s ease, color .16s ease, box-shadow .16s ease; }
.icon-button:hover { transform:translateY(-2px) scale(1.08); }
.icon-button:active { transform:scale(.9); }

/* Publish button shine sweep */
@keyframes btnShine {
  from { background-position:-200% center; }
  to   { background-position:300% center; }
}
.publish-button:not(:disabled):hover {
  background-image:linear-gradient(105deg, #375dfb 0%, #5b7fff 45%, #375dfb 55%, #375dfb 100%);
  background-size:200% auto;
  animation:btnShine .7s linear infinite;
}
.publish-button:not(:disabled):active { transform:scale(.96); }

/* Blog stats bounce */
.blog-stat { transition:transform .18s cubic-bezier(.34,1.56,.64,1), border-color .18s ease, box-shadow .18s ease, background .18s ease; }
.blog-stat:hover { transform:translateY(-3px); border-color:#C7D2FE; box-shadow:0 10px 24px rgba(55,93,251,.12); background:#fbfcff; }
.blog-stat:active { transform:translateY(0) scale(.97); }

/* Side panel hover lift */
.side-panel { transition:border-color .2s ease, box-shadow .2s ease, transform .2s ease; }
.side-panel:hover { border-color:#D4DEF8; box-shadow:0 12px 32px rgba(55,93,251,.1); transform:translateY(-2px); }

/* Mini row slide on hover */
.mini-row { transition:transform .18s ease, background .15s ease; border-radius:10px; padding:4px; margin:-4px; }
.mini-row:hover { transform:translateX(4px); background:rgba(55,93,251,.04); }

/* Follow / watch buttons spring */
.follow-button,.watch-button,.remind-button { transition:transform .2s cubic-bezier(.34,1.56,.64,1), background .16s ease, color .16s ease; }
.follow-button:hover,.watch-button:hover,.remind-button:hover { transform:translateY(-2px) scale(1.04); }
.follow-button:active,.watch-button:active,.remind-button:active { transform:scale(.93); }

/* Comment send button spin-pop on click */
.comment-form .icon-button:active { transform:scale(.85) rotate(-18deg); }

/* Filter tabs active indicator spring */
.feed-filter-tabs .blog-tab { transition:transform .18s cubic-bezier(.34,1.56,.64,1), background .16s ease, color .16s ease, border-color .16s ease, box-shadow .18s ease; }
.feed-filter-tabs .blog-tab:not(.active):hover { transform:translateY(-1px); }
.feed-filter-tabs .blog-tab:active { transform:scale(.95); }

/* Topic tag hover */
.topic-tabs .blog-tab { transition:transform .2s cubic-bezier(.34,1.56,.64,1), background .15s ease, color .15s ease, border-color .15s ease; }
.topic-tabs .blog-tab:hover { transform:translateY(-2px) scale(1.05); }
.topic-tabs .blog-tab:active { transform:scale(.94); }

/* Achievement strip hover */
.achievement-strip { transition:transform .2s ease, box-shadow .2s ease, background .15s ease; border-radius:14px; }
.achievement-strip:hover { transform:translateX(4px); box-shadow:0 4px 16px rgba(234,178,63,.2); }

/* Toast slide-up-fade */
@keyframes toastIn {
  from { opacity:0; transform:translateY(20px) scale(.94); }
  to   { opacity:1; transform:translateY(0) scale(1); }
}
.blog-toast { animation:toastIn .28s cubic-bezier(.34,1.56,.64,1) both; border-radius:12px; backdrop-filter:blur(12px); }

/* Rank label */
.rank-label { margin:18px 0 10px; color:#91a1bd; font-size:10px; font-weight:900; letter-spacing:.08em; }
`;


const initialFeed: FeedItem[] = [
  {
    id: 1,
    type: 'post',
    source: 'community',
    author: 'Коба',
    handle: '@коба',
    avatar: '/teacher3-main.jpg',
    title: 'Разбор тактического выхода группы СС-2',
    text: 'Отработали выдвижение и закрепление на рубеже. Главный вывод — связь решает: где она проседала, темп терялся. В четверг повторяем с упором на радиообмен.',
    time: '12 минут назад',
    badge: { label: 'Сообщество', tone: 'blue' },
    tags: ['тактика', 'разбор', 'сс2'],
    likes: 128,
    comments: [
      { id: 1, author: 'Торнадо', avatar: '/teacher1-main.jpg', text: 'Заслуженно. Темп держал весь поток.', time: '8 минут' },
    ],
    reposts: 9,
    liked: false,
    saved: false,
    jumbo: 42,
    jumboed: false,
  },
  {
    id: 2,
    type: 'achievement',
    source: 'friend',
    author: 'Торнадо',
    handle: '@торнадо',
    avatar: '/teacher1-main.jpg',
    title: 'Знак «За меткость»',
    text: 'Закрыл стрелковый норматив на «отлично» — и наконец знак за меткость. Кто хочет подтянуть стрельбу, записывайтесь на эфир в четверг.',
    time: '40 минут назад',
    badge: { label: 'Награда', tone: 'gold' },
    tags: ['награды', 'стрельба'],
    likes: 214,
    comments: [
      { id: 1, author: 'Коба', avatar: '/teacher3-main.jpg', text: 'Добавьте еще схему по отходу группы.', time: '22 минуты' },
    ],
    reposts: 18,
    liked: false,
    saved: true,
    jumbo: 96,
    jumboed: false,
    achievementId: 1,
  },
  {
    id: 3,
    type: 'course',
    source: 'friend',
    author: 'Нексус',
    handle: '@нексус',
    avatar: '/logo.png',
    title: 'Завершил курс «КМБ V5»',
    text: 'Прошел финальное занятие, получил диплом и открыл следующий этап пути. В профиле уже доступен новый прогресс.',
    time: '1 час назад',
    image: '/dip1.png',
    badge: { label: 'Достижение', tone: 'green' },
    tags: ['друзья', 'курсы', 'диплом'],
    likes: 61,
    comments: [],
    reposts: 7,
    liked: true,
    saved: false,
    jumbo: 24,
    jumboed: true,
  },
  {
    id: 4,
    type: 'event',
    source: 'community',
    author: 'Воевода Москва',
    handle: '@voevoda_msk',
    avatar: '/logo.png',
    community: 'Воевода Москва',
    title: 'Открыта запись на воскресные занятия',
    text: 'В ленту подписчиков добавлено расписание полигона на воскресенье. Доступны три окна: утро, день и вечерняя группа.',
    time: '2 часа назад',
    image: '/register-slide-2.jpg',
    badge: { label: 'Новость', tone: 'red' },
    tags: ['сообщества', 'расписание', 'москва'],
    likes: 33,
    comments: [],
    reposts: 5,
    liked: false,
    saved: false,
    jumbo: 12,
    jumboed: false,
  },
  {
    id: 5,
    type: 'post',
    source: 'friend',
    author: 'Торнадо',
    handle: '@торнадо',
    avatar: '/teacher1-main.jpg',
    title: 'Заметка инструктора',
    text: 'Если лента показывает только общие новости, люди быстро перестают смотреть. Нужны события от своих: кто получил награду, кто закрыл курс, где активность в сообществах.',
    time: 'Вчера в 19:40',
    badge: { label: 'Друг', tone: 'blue' },
    tags: ['друзья', 'мнение', 'портал'],
    likes: 104,
    comments: [
      { id: 1, author: 'Вы', avatar: '/teacher2-main.jpg', text: 'Вот это как раз и нужно заказчику.', time: 'Вчера' },
    ],
    reposts: 18,
    liked: false,
    saved: false,
    jumbo: 38,
    jumboed: false,
  },
];

const initialPeople: Person[] = [
  { id: 'tornado', name: 'Торнадо', role: 'Инструктор', avatar: '/teacher1-main.jpg', status: 'в сети', following: true },
  { id: 'bek', name: 'Бек', role: 'Курсант КМБ-77', avatar: '/teacher2-main.jpg', status: 'получил награду', following: true },
  { id: 'koba', name: 'Коба', role: 'Наставник', avatar: '/teacher3-main.jpg', status: 'готовит разбор', following: false },
];

const initialCommunities: Community[] = [
  { id: 'small-units', name: 'Клуб Воевод «Северный»', avatar: '/soobsh2.png', members: '312', lastUpdate: '38 минут назад', following: true },
  { id: 'voevoda-msk', name: 'Ветераны ВДВ', avatar: '/logo.png', members: '640', lastUpdate: '2 часа назад', following: true },
  { id: 'medicine', name: 'Медицина боя', avatar: '/soobsh1.png', members: '4 821', lastUpdate: 'сегодня', following: false },
];

const filterLabels: Record<FeedFilter, string> = {
  all: 'Моя лента',
  communities: 'Сообщества',
  friends: 'Друзья',
  achievements: 'Награды',
};

function Icon({ path, size = 18, fill = 'none' }: { path: string; size?: number; fill?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={path} />
    </svg>
  );
}

function Avatar({ src, alt, onClick }: { src: string; alt: string; onClick?: () => void }) {
  return (
    <div className="avatar" onClick={onClick} style={{ cursor: onClick ? 'pointer' : undefined }}>
      <img src={src} alt={alt} onError={(event) => { event.currentTarget.style.display = 'none'; }} />
    </div>
  );
}

function FeedCard({
  item,
  onToggleLike,
  onToggleSave,
  onToggleJumbo,
  onRepost,
  onAddComment,
}: {
  item: FeedItem;
  onToggleLike: (id: number) => void;
  onToggleSave: (id: number) => void;
  onToggleJumbo: (id: number) => void;
  onRepost: (id: number) => void;
  onAddComment: (id: number, text: string) => void;
}) {
  const navigate = useNavigate();
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [commentText, setCommentText] = useState('');

  const submitComment = () => {
    if (!commentText.trim()) return;
    onAddComment(item.id, commentText.trim());
    setCommentText('');
    setCommentsOpen(true);
  };

  const handleCommentKey = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') submitComment();
  };

  return (
    <article className="feed-card">
      <div className="feed-card-header">
        <Avatar src={item.avatar} alt={item.author} onClick={() => navigate(userProfilePath(item.author))} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="author-line">
            <span className="author-name" onClick={() => navigate(userProfilePath(item.author))} style={{ cursor: 'pointer' }}>{item.author}</span>
            <span className="handle">{item.handle}</span>
            {item.badge && <span className={`badge-chip ${item.badge.tone}`}>{item.badge.label}</span>}
          </div>
          <div className="author-meta">{item.source === 'community' ? 'Сообщество' : item.source === 'friend' ? 'из друзей' : 'событие портала'} · {item.time}</div>
        </div>
        <button className={`feed-save ${item.saved ? 'active' : ''}`} onClick={() => onToggleSave(item.id)} aria-label={item.saved ? 'Убрать из сохранённого' : 'Сохранить'} aria-pressed={item.saved}>
          <Icon path="M12 2l2.4 6.9H22l-6 4.4 2.3 7-6.3-4.3-6.3 4.3L8 13.3 2 8.9h7.6z" size={18} />
        </button>
      </div>

      <div className="feed-card-body">
        {item.title && item.type !== 'achievement' && <h2 className="feed-title">{item.title}</h2>}
        <p className="feed-text">{item.text}</p>
        {item.type === 'achievement' && (
          <button className="achievement-strip" onClick={() => navigate(`/achievements?achievement=${item.achievementId ?? 1}`)}>
            <span className="achievement-icon"><img src="/medal.png" alt="" /></span>
            <span><b>{item.title ?? 'Новая награда'}</b><small>Доска почёта · открыть наградной лист</small></span>
          </button>
        )}
        {item.image && item.type !== 'achievement' && (
          <div className="feed-image">
            <img src={item.image} alt="" onError={(event) => { event.currentTarget.style.display = 'none'; }} />
          </div>
        )}
        <div className="feed-tags">
          {item.tags.map((tag) => <span key={tag} className="tag-chip">#{tag}</span>)}
        </div>
      </div>

      <div className="feed-actions">
        <button className={`action-button like ${item.liked ? 'active' : ''}`} onClick={() => onToggleLike(item.id)} aria-pressed={item.liked}>
          <Icon path="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21.2l7.8-7.8a5.5 5.5 0 0 0 0-7.8z" />
          <span className="action-count">{item.likes}</span>
        </button>
        <button className={`action-button comment ${commentsOpen ? 'active' : ''}`} onClick={() => setCommentsOpen((value) => !value)} aria-expanded={commentsOpen}>
          <Icon path="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          <span className="action-count">{item.comments.length}</span>
        </button>
        <button className={`action-button share ${item.shared ? 'active' : ''}`} onClick={() => onRepost(item.id)} title="Поделиться публикацией">
          <Icon path="M17 1l4 4-4 4 M3 11V9a4 4 0 0 1 4-4h14 M7 23l-4-4 4-4 M21 13v2a4 4 0 0 1-4 4H3" />
          <span className="action-count">{item.reposts}</span>
        </button>
        <button className={`action-button jumbo ${item.jumboed ? 'active' : ''}`} onClick={() => onToggleJumbo(item.id)} aria-pressed={item.jumboed}>
          <Icon path="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.3a2 2 0 0 0 2-1.7l1.3-9A2 2 0 0 0 19.6 9H14z M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
          Джамбо · <span className="action-count">{item.jumbo}</span>
        </button>
      </div>

      {commentsOpen && (
        <div className="comments-box">
          {item.comments.map((comment) => (
            <div key={comment.id} className="comment-row">
              <Avatar src={comment.avatar} alt={comment.author} onClick={() => navigate(userProfilePath(comment.author))} />
              <div className="comment-bubble">
                <div className="comment-author"><span onClick={() => navigate(userProfilePath(comment.author))} style={{ cursor: 'pointer' }}>{comment.author}</span> <span className="time">{comment.time}</span></div>
                <div className="comment-text">{comment.text}</div>
              </div>
            </div>
          ))}
          <div className="comment-form">
            <input value={commentText} onChange={(event) => setCommentText(event.target.value)} onKeyDown={handleCommentKey} placeholder="Написать комментарий" />
            <button className="icon-button" onClick={submitComment} title="Отправить комментарий">
              <Icon path="M22 2L11 13 M22 2l-7 20-4-9-9-4 20-7" size={16} />
            </button>
          </div>
        </div>
      )}
    </article>
  );
}

export function Microblog() {
  const toggleFavorite = useFavoritesStore((state) => state.toggle);
  const hasFavorite = useFavoritesStore((state) => state.has);
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const feedRef = useRef<HTMLElement>(null);
  const sideColumnRef = useRef<HTMLElement>(null);
  const [filter, setFilter] = useState<FeedFilter>('all');
  const [feed, setFeed] = useState<FeedItem[]>(initialFeed);
  const [people, setPeople] = useState<Person[]>(initialPeople);
  const [communities, setCommunities] = useState<Community[]>(initialCommunities);
  const [draft, setDraft] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [liveReminders, setLiveReminders] = useState<string[]>([]);
  const [toast, setToast] = useState('');

  useEffect(() => {
    const column = sideColumnRef.current;
    const feedList = feedRef.current;
    if (!column || !feedList) return;

    let lastScrollY = window.scrollY;
    let frame = 0;

    const feedStart = () => feedList.getBoundingClientRect().top + window.scrollY - 82;
    const clampColumnScroll = (value: number) => Math.max(0, Math.min(value, column.scrollHeight - column.clientHeight));
    const updateEdgeFades = () => {
      const maxScroll = Math.max(0, column.scrollHeight - column.clientHeight);
      column.dataset.fadeTop = column.scrollTop > 2 ? 'true' : 'false';
      column.dataset.fadeBottom = column.scrollTop < maxScroll - 2 ? 'true' : 'false';
    };

    const syncColumn = (initialize = false) => {
      if (window.innerWidth <= 1120) {
        column.scrollTop = 0;
        updateEdgeFades();
        lastScrollY = window.scrollY;
        return;
      }

      const currentScrollY = window.scrollY;
      const trigger = feedStart();

      if (initialize) {
        column.scrollTop = clampColumnScroll(Math.max(0, currentScrollY - trigger));
      } else if (currentScrollY <= trigger) {
        column.scrollTop = 0;
      } else {
        const currentActiveScroll = Math.max(0, currentScrollY - trigger);
        const previousActiveScroll = Math.max(0, lastScrollY - trigger);
        column.scrollTop = clampColumnScroll(column.scrollTop + currentActiveScroll - previousActiveScroll);
      }

      updateEdgeFades();
      lastScrollY = currentScrollY;
    };

    const handleScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => syncColumn());
    };

    const handleResize = () => {
      column.scrollTop = clampColumnScroll(column.scrollTop);
      updateEdgeFades();
      lastScrollY = window.scrollY;
    };

    syncColumn(true);
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);
    const unbindSmoothWheel = bindSmoothPageWheel(column);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      unbindSmoothWheel();
    };
  }, []);

  const visibleFeed = useMemo(() => {
    return feed.filter((item) => {
      const byFilter =
        filter === 'all' ||
        (filter === 'communities' && item.source === 'community') ||
        (filter === 'friends' && item.source === 'friend') ||
        (filter === 'achievements' && item.type === 'achievement');
      const byTag = !selectedTag || item.tags.includes(selectedTag);
      return byFilter && byTag;
    });
  }, [feed, filter, selectedTag]);

  const allTags = useMemo(() => Array.from(new Set(feed.flatMap((item) => item.tags))).slice(0, 10), [feed]);
  const counters = {
    all: feed.length + 1,
    communities: feed.filter((item) => item.source === 'community').length,
    friends: feed.filter((item) => item.source === 'friend').length,
    achievements: feed.filter((item) => item.type === 'achievement').length,
  };

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 2200);
  };

  const publish = () => {
    if (!draft.trim() && !attachedImage) return;
    const newItem: FeedItem = {
      id: Date.now(),
      type: 'post',
      source: 'friend',
      author: 'Вы',
      handle: '@my_profile',
      avatar: '/teacher2-main.jpg',
      title: 'Новая запись',
      text: draft.trim() || 'Новая фотография',
      time: 'Только что',
      image: attachedImage ?? undefined,
      badge: { label: 'Мой пост', tone: 'blue' },
      tags: ['друзья', 'личное'],
      likes: 0,
      comments: [],
      reposts: 0,
      liked: false,
      saved: false,
      jumbo: 0,
      jumboed: false,
    };
    setFeed((items) => [newItem, ...items]);
    setDraft('');
    setAttachedImage(null);
    if (fileRef.current) fileRef.current.value = '';
    notify('Публикация добавлена в ленту');
  };

  const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      notify('Можно прикрепить только изображение');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      notify('Изображение должно быть меньше 8 МБ');
      return;
    }
    setAttachedImage(current => {
      if (current?.startsWith('blob:')) URL.revokeObjectURL(current);
      return URL.createObjectURL(file);
    });
    notify('Фотография прикреплена');
  };

  const removeAttachedImage = () => {
    if (attachedImage?.startsWith('blob:')) URL.revokeObjectURL(attachedImage);
    setAttachedImage(null);
    if (fileRef.current) fileRef.current.value = '';
    notify('Фотография удалена');
  };

  const addJournalLink = () => {
    const link = 'https://voevoda.ru/journal';
    if (draft.includes(link)) {
      notify('Ссылка уже добавлена');
      return;
    }
    setDraft(value => `${value}${value.trim() ? ' ' : ''}${link}`);
    notify('Ссылка добавлена');
  };

  const updateFeedItem = (id: number, updater: (item: FeedItem) => FeedItem) => {
    setFeed((items) => items.map((item) => (item.id === id ? updater(item) : item)));
  };

  const toggleFeedFavorite = (id: number) => {
    const item = feed.find((entry) => entry.id === id);
    if (!item) return;
    toggleFavorite({
      id: 500000 + item.id,
      kind: 'article',
      title: item.title ?? item.text.slice(0, 90),
      author: item.author,
      date: item.time,
      image: item.image ?? '/journal-main.jpg',
      category: 'Блог',
      stats: {
        views: 0,
        hearts: item.likes,
        likes: item.jumbo,
        comments: item.comments.length,
      },
      link: `/microblog?post=${item.id}`,
      available: true,
    });
  };

  const addComment = (id: number, text: string) => {
    updateFeedItem(id, (item) => ({
      ...item,
      comments: [
        ...item.comments,
        { id: Date.now(), author: 'Вы', avatar: '/teacher2-main.jpg', text, time: 'Только что' },
      ],
    }));
  };

  const sharePost = async (id: number) => {
    const item = feed.find(entry => entry.id === id);
    if (!item) return;
    const result = await shareOrCopy({
      title: item.title ?? 'Публикация портала «Воевода»',
      text: `${item.author}: ${item.text}`,
      url: `${window.location.origin}/microblog?post=${item.id}`,
    });
    if (result === 'cancelled') return;
    updateFeedItem(id, entry => entry.shared ? entry : { ...entry, shared: true, reposts: entry.reposts + 1 });
    notify(result === 'shared' ? 'Публикация отправлена' : 'Ссылка на публикацию скопирована');
  };

  return (
    <div className="blog-feed-page">
      <style>{styles + referenceStyles}</style>
      {toast && <div className="blog-toast" role="status">{toast}</div>}
      <div className="blog-shell">
        <main>
          <section className="blog-topbar">
            <div className="blog-title-row">
              <div>
                <div className="blog-eyebrow">
                  <Icon path="M3 11h18 M3 6h18 M3 16h18" size={15} />
                  социальная лента
                </div>
                <h1 className="blog-title">Блог</h1>
                <p className="blog-subtitle">
                  Новости подразделений, награды и разборы — всё, на что вы подписаны
                </p>
              </div>
              <div className="blog-stats">
                <button className="blog-stat" onClick={() => { setFilter('all'); feedRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}><b>{feed.length + 1}</b><span>событий</span></button>
                <button className="blog-stat" onClick={() => navigate('/communities')}><b>{communities.length}</b><span>сообщества</span></button>
                <button className="blog-stat" onClick={() => navigate('/my-circle')}><b>18</b><span>друзей</span></button>
              </div>
            </div>
          </section>

          <div className="blog-tabs feed-filter-tabs">
            {(Object.keys(filterLabels) as FeedFilter[]).map((key) => (
              <button key={key} className={`blog-tab ${filter === key ? 'active' : ''}`} onClick={() => setFilter(key)}>
                {key === 'all' && <Icon path="M3 12h18 M12 3v18" size={15} />}
                {key === 'communities' && <Icon path="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M23 21v-2a4 4 0 0 0-3-3.87" size={15} />}
                {key === 'friends' && <Icon path="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8" size={15} />}
                {key === 'achievements' && <Icon path="M12 2l2.4 6.9H22l-6 4.4 2.3 7-6.3-4.3-6.3 4.3L8 13.3 2 8.9h7.6z" size={15} />}
                {filterLabels[key]}
                <span>{counters[key]}</span>
              </button>
            ))}
          </div>

          <section className="blog-composer">
            <div className="composer-row">
              <div className="profile-letter-avatar" aria-label="Профиль Бека"><img src="/teacher2-main.jpg" alt="Бек" /></div>
              <div className="composer-body">
                <textarea
                  className="composer-input"
                  value={draft}
                  onChange={(event) => setDraft(event.target.value.slice(0, 600))}
                  placeholder="Напишите новость, поделитесь разбором или поздравьте товарища..."
                />
                {attachedImage && (
                  <div className="composer-photo">
                    <img src={attachedImage} alt="Прикреплённая фотография" />
                    <button className="composer-photo-remove" onClick={removeAttachedImage} title="Удалить фотографию" aria-label="Удалить фотографию">×</button>
                  </div>
                )}
                <div className="composer-actions">
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
                    <button className={`icon-button ${attachedImage ? 'active' : ''}`} title={attachedImage ? 'Заменить фото' : 'Добавить фото'} onClick={() => fileRef.current?.click()}>
                      <Icon path="M4 16l4.6-4.6a2 2 0 0 1 2.8 0L16 16 M14 14l1.6-1.6a2 2 0 0 1 2.8 0L20 14 M6 20h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z" />
                    </button>
                    <button className={`icon-button ${draft.includes('https://voevoda.ru/journal') ? 'active' : ''}`} title="Добавить ссылку" onClick={addJournalLink}>
                      <Icon path="M10 13a5 5 0 0 0 7.5.5l2-2a5 5 0 0 0-7.1-7.1l-1.1 1.1 M14 11a5 5 0 0 0-7.5-.5l-2 2a5 5 0 0 0 7.1 7.1l1.1-1.1" />
                    </button>
                  </div>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <span className="time">{draft.length}/600</span>
                    <button className="publish-button" disabled={!draft.trim() && !attachedImage} onClick={publish}>Опубликовать</button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="blog-tabs topic-tabs" style={{ marginTop: 0 }}>
            {allTags.map((tag) => (
              <button key={tag} className={`blog-tab ${selectedTag === tag ? 'active' : ''}`} onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}>
                #{tag}
              </button>
            ))}
          </div>

          <section ref={feedRef} className="feed-list">
            {visibleFeed.map((item) => (
              <FeedCard
                key={item.id}
                item={{ ...item, saved: hasFavorite(500000 + item.id, 'article') }}
                onToggleLike={(id) => updateFeedItem(id, (entry) => ({ ...entry, liked: !entry.liked, likes: entry.liked ? entry.likes - 1 : entry.likes + 1 }))}
                onToggleSave={toggleFeedFavorite}
                onToggleJumbo={(id) => updateFeedItem(id, (entry) => ({
                  ...entry,
                  jumboed: !entry.jumboed,
                  jumbo: entry.jumboed ? entry.jumbo - 1 : entry.jumbo + 1,
                }))}
                onRepost={sharePost}
                onAddComment={addComment}
              />
            ))}
          </section>
        </main>

        <aside ref={sideColumnRef} className="side-column">
          <section className="side-panel profile-summary">
            <div className="profile-head">
              <div className="profile-letter-avatar online"><img src="/teacher2-main.jpg" alt="Бек" /></div>
              <div><b>Бек <span>@бек</span></b><small>Сержант · СС-2 · Москва</small></div>
            </div>
            <div className="profile-metrics">
              <div className="profile-iv-card">
                <span>Индекс и рейтинг</span>
                <IVDisplay index={1980} rating={4.2} />
              </div>
            </div>
            <div className="rank-label">ПОГОНЫ И ШЕВРОНЫ</div>
            <div className="rank-row">
              {[
                { src: '/pogon1.png', label: 'Погоны сержанта' },
                { src: '/1.png', label: 'Шеврон УТЦ «Воевода»' },
                { src: '/2.png', label: 'Шеврон дружины' },
                { src: '/shevron3.png', label: 'Берет Воеводы' },
                { src: '/shevron4.png', label: 'Берет первого уровня' },
              ].map((rank, index) => (
                <button key={rank.src} className={index === 1 ? 'featured' : ''} title={rank.label} aria-label={rank.label} onClick={() => navigate('/achievements?view=board')}>
                  <img src={rank.src} alt="" />
                </button>
              ))}
            </div>
          </section>

          <section className="side-panel">
            <div className="side-title"><h3>Мои сообщества</h3><button onClick={() => navigate('/communities')}>Все</button></div>
            <div className="mini-list">
              {communities.slice(0, 2).map((community, index) => (
                <div key={community.id} className="mini-row">
                  <Avatar src={community.avatar} alt={community.name} onClick={() => navigate('/communities')} />
                  <div className="mini-copy" onClick={() => navigate('/communities')} style={{ cursor: 'pointer' }}><b>{community.name}</b><span>{community.members} участников</span></div>
                  <button className={`follow-button ${community.following ? 'active' : ''}`} onClick={() => setCommunities(items => items.map(item => item.id === community.id ? { ...item, following: !item.following } : item))}>{community.following ? (index === 0 ? 'В строю' : 'В ленте') : 'Следить'}</button>
                </div>
              ))}
            </div>
          </section>

          <section className="side-panel">
            <div className="side-title"><h3>В эфире</h3></div>
            <div className="live-list">
              {[
                { id: 'hero', image: '/teacher3-main.jpg', title: 'Q&A с Героем: штурмовые действия', meta: '342 смотрят · Гранит', live: true },
                { id: 'medicine', image: '/teacher2-main.jpg', title: 'Разбор по тактической медицине', meta: 'Сегодня 19:00 · Лавина' },
                { id: 'shooting', image: '/teacher1-main.jpg', title: 'Стрелковая подготовка с нуля', meta: 'Завтра 12:00 · Торнадо' },
              ].map(event => (
                <div className="live-row" key={event.id}>
                  <span className="side-avatar-wrap">
                    <img className="side-person-photo" src={event.image} alt="" />
                    {event.live && <i className="side-live-dot" />}
                  </span>
                  <div><b>{event.title}</b><small>{event.meta}</small></div>
                  <button className={event.live ? 'watch-button' : 'remind-button'} onClick={() => {
                    if (event.live) {
                      navigate('/journal');
                    } else {
                      setLiveReminders(items => items.includes(event.id) ? items.filter(id => id !== event.id) : [...items, event.id]);
                    }
                  }}>{event.live ? '● Смотреть' : liveReminders.includes(event.id) ? 'Готово' : 'Напомнить'}</button>
                </div>
              ))}
            </div>
          </section>

          <section className="side-panel">
            <div className="side-title"><h3>Наставничество</h3></div>
            <div className="mentor-list">
              {people.slice(0, 2).map((person, index) => (
                <div className="mentor-row" key={person.id}>
                  <span className="side-avatar-wrap">
                    <img className="side-person-photo" src={person.avatar} alt="" />
                    <i className="side-online-dot" />
                  </span>
                  <div><b>{person.name}</b><small>{index === 0 ? '2 свободных слота' : '1 свободный слот'}</small><span>{index === 0 ? 'Тактическая медицина · Эвакуация' : 'Командование · Тактика'}</span></div>
                  <button onClick={() => navigate(userProfilePath(person.name))}>Под крыло</button>
                </div>
              ))}
            </div>
          </section>

          <section className="side-panel">
            <div className="side-title"><h3>Форумы по интересам</h3></div>
            <div className="forum-grid">
              {[
                { name: 'Снайперы', mark: 'СН', members: 214, unread: 5 },
                { name: 'Экипажи БПЛА', mark: 'БП', members: 308, unread: 12 },
                { name: 'Сапёры', mark: 'СП', members: 96, unread: 0 },
                { name: 'Связисты', mark: 'СВ', members: 142, unread: 3 },
              ].map(forum => (
                <button key={forum.name} className="forum-button" onClick={() => notify(`Форум «${forum.name}» · ${forum.members} участников`)}>
                  <span>{forum.mark}</span>
                  <b>{forum.name}</b>
                  <small>{forum.members} участников</small>
                  {forum.unread > 0 && <i className="forum-unread">{forum.unread} новых</i>}
                </button>
              ))}
            </div>
          </section>

          <section className="side-panel">
            <div className="side-title"><h3>Друзья — живые события</h3></div>
            <div className="friend-events">
              {[
                { name: 'Гранит', image: '/teacher3-main.jpg', status: 'сейчас смотрит прямой эфир', action: 'Эфир', to: '/journal' },
                { name: 'Лавина', image: '/teacher2-main.jpg', status: 'записалась на тактическую медицину', action: 'Курс', to: '/courses' },
                { name: 'Коба', image: '/teacher3-main.jpg', status: 'получил новый шеврон', action: 'Доска', to: '/achievements?view=board' },
              ].map((event, index) => (
                <div className="friend-event-row" key={event.name}>
                  <span className="side-avatar-wrap">
                    <img className="side-person-photo" src={event.image} alt="" />
                    {index === 0 && <i className="side-live-dot" />}
                  </span>
                  <div><b>{event.name}</b><small>{event.status}</small></div>
                  <button onClick={() => navigate(event.to)}>{event.action}</button>
                </div>
              ))}
            </div>
          </section>

          <section className="side-panel">
            <div className="side-title"><h3>Ближайшее</h3></div>
            <div className="nearest-list">
              {[
                { day: '18', mon: 'ИЮН', title: 'Командный разбор после тренировки', meta: 'Сегодня · 19:30' },
                { day: '20', mon: 'ИЮН', title: 'Открытая тренировка по связи', meta: 'Пятница · Центр ВП' },
                { day: '22', mon: 'ИЮН', title: 'Сбор заявок на соревнования', meta: 'Воскресенье · онлайн' },
              ].map(event => (
                <div className="nearest-card" key={event.title}>
                  <div className="nearest-date"><b>{event.day}</b><span>{event.mon}</span></div>
                  <div><strong>{event.title}</strong><small>{event.meta}</small></div>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
