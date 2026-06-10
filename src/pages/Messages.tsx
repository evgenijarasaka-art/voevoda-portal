import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { io, type Socket } from 'socket.io-client';
import { useAuth } from '../hooks/useAuth';

/* ─── TYPES ─── */
interface Reaction { emoji: string; count: number; reacted: boolean; }
interface Attachment {
  type: 'image' | 'file' | 'voice' | 'sticker';
  name?: string; size?: string; duration?: number; url?: string; emoji?: string;
  mime?: string; waveform?: number[]; createdAt?: number;
}
interface Message {
  id: number; from: 'me' | 'them'; text: string; time: string;
  status: 'sent' | 'delivered' | 'read';
  reactions: Reaction[]; replyTo?: number; attachment?: Attachment;
  pinned?: boolean; deleted?: boolean; edited?: boolean; senderLogin?: string;
}
interface ChatUser {
  id: number; name: string; callsign: string; avatar: string; rank?: string;
  lastMsg: string; time: string; unread: number; online: boolean;
  isGroup?: boolean; membersCount?: number; lastSeen?: string; unit?: string;
  bio?: string; coverSeed?: string; rating?: number; missions?: number;
  role?: string; location?: string; joined?: string; skills?: string[]; achievements?: string[]; login?: string;
}
type CallKind = 'audio' | 'video';
type CallMode = 'outgoing' | 'incoming';
interface CallSignalOffer { from: string; to: string; kind: CallKind; offer: RTCSessionDescriptionInit; }
interface CallSignalAnswer { from: string; to: string; answer: RTCSessionDescriptionInit; }
interface CallSignalIce { from: string; to: string; candidate: RTCIceCandidateInit; }
interface IncomingCallState { chat: ChatUser; fromUserId: string; kind: CallKind; offer: RTCSessionDescriptionInit; }
const SIGNALING_URL = import.meta.env.VITE_SIGNALING_URL || 'http://localhost:4000';
const getCurrentUserId = () => {
  if (typeof window === 'undefined') return 'me';
  const fromQuery = new URLSearchParams(window.location.search).get('userId');
  if (fromQuery) { localStorage.setItem('demoUserId', fromQuery); return fromQuery; }
  const saved = localStorage.getItem('demoUserId');
  if (saved) return saved;
  localStorage.setItem('demoUserId', 'me');
  return 'me';
};

/* ─── SOUND SYSTEM ─── */
class SoundSystem {
  private ctx: AudioContext | null = null;
  private ringInterval: ReturnType<typeof setInterval> | null = null;

  private getCtx(): AudioContext {
    if (!this.ctx) {
      const W = window as unknown as { webkitAudioContext?: typeof AudioContext };
      this.ctx = new (window.AudioContext || W.webkitAudioContext!)();
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume();
    return this.ctx;
  }

  private tone(freq: number, start: number, dur: number, vol = 0.22, type: OscillatorType = 'sine') {
    try {
      const ctx = this.getCtx();
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.connect(g); g.connect(ctx.destination);
      o.type = type; o.frequency.value = freq;
      const t = ctx.currentTime;
      g.gain.setValueAtTime(0, t + start);
      g.gain.linearRampToValueAtTime(vol, t + start + 0.02);
      g.gain.setValueAtTime(vol, t + start + dur - 0.04);
      g.gain.linearRampToValueAtTime(0, t + start + dur);
      o.start(t + start); o.stop(t + start + dur + 0.01);
    } catch { /* AudioContext blocked by browser */ }
  }

  playSent()     { this.tone(880, 0, 0.08, 0.18); this.tone(1100, 0.09, 0.07, 0.12); }
  playReceived() { this.tone(660, 0, 0.07, 0.22); this.tone(880, 0.09, 0.1, 0.18); }
  playReaction() { this.tone(1200, 0, 0.05, 0.12); this.tone(1500, 0.06, 0.05, 0.08); }
  playCallEnd()  { this.tone(440, 0, 0.08, 0.3); this.tone(330, 0.1, 0.08, 0.25); this.tone(220, 0.2, 0.15, 0.2); }

  startRinging() {
    const ring = () => {
      this.tone(880, 0, 0.14, 0.3, 'triangle');
      this.tone(660, 0.2, 0.14, 0.25, 'triangle');
      this.tone(880, 0.4, 0.14, 0.3, 'triangle');
      this.tone(660, 0.6, 0.14, 0.25, 'triangle');
    };
    ring();
    this.ringInterval = setInterval(ring, 2800);
  }

  stopRinging() {
    if (this.ringInterval) { clearInterval(this.ringInterval); this.ringInterval = null; }
  }
}

const sounds = new SoundSystem();

/* ─── CSS ─── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap');
  :root {
    --navy-950:#050D18; --navy-900:#07111F; --navy-800:#0D1B2A; --navy-700:#102236;
    --navy-600:#1A3A5C; --navy-500:#1E4A7A; --accent:#1A56DB; --accent-2:#2563EB;
    --accent-light:#EBF2FF; --accent-mid:#C7D9FA; --steel:#4B6A8E; --steel-2:#6B8EAE;
    --surface:#F4F6FB; --surface-2:#EEF1F8; --surface-3:#E8ECF4;
    --border:#DDE3EE; --border-2:#C8D0E2;
    --text-primary:#0D1B2A; --text-secondary:#4A5568; --text-muted:#8A96A8;
    --success:#1A8A57; --success-bg:#E8F7EE; --danger:#B91C1C;
    --warn:#C07A10; --warn-bg:#FEF3DC;
    --msg-me-bg:#1A56DB; --msg-me-text:#FFFFFF;
    --msg-them-bg:#FFFFFF; --msg-them-text:#0D1B2A;
    --radius-sm:8px; --radius:14px; --radius-lg:20px;
    --shadow:0 4px 16px rgba(13,27,42,.10); --shadow-lg:0 12px 36px rgba(13,27,42,.15);
    --font:'Montserrat',sans-serif;
  }
  *{box-sizing:border-box;margin:0;padding:0;}
  .msg-root{font-family:var(--font);}
  @keyframes msg-slide-in-left{from{opacity:0;transform:translateX(-10px)}to{opacity:1;transform:none}}
  @keyframes msg-slide-in-right{from{opacity:0;transform:translateX(10px)}to{opacity:1;transform:none}}
  @keyframes msg-fade{from{opacity:0}to{opacity:1}}
  @keyframes msg-typing-dot{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
  @keyframes msg-record-pulse{0%,100%{box-shadow:0 0 0 0 rgba(220,38,38,.45)}50%{box-shadow:0 0 0 9px rgba(220,38,38,0)}}
  @keyframes msg-pin-drop{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:none}}
  @keyframes msg-reaction-pop{0%{transform:scale(0)}70%{transform:scale(1.2)}100%{transform:scale(1)}}
  @keyframes msg-context-in{from{opacity:0;transform:scale(.93) translateY(-5px)}to{opacity:1;transform:none}}
  @keyframes msg-call-wave{0%{transform:scale(1);opacity:.6}100%{transform:scale(2.8);opacity:0}}
  @keyframes msg-slide-up-panel{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:none}}
  @keyframes msg-counter{from{transform:scale(.5);opacity:0}to{transform:none;opacity:1}}
  @keyframes msg-row-appear{from{opacity:0;transform:translateX(-6px)}to{opacity:1;transform:none}}
  @keyframes msg-emoji-pop{0%{transform:scale(0)}60%{transform:scale(1.35)}100%{transform:scale(1)}}
  .msg-bubble-me{animation:msg-slide-in-right .22s cubic-bezier(.34,1,.64,1) both;}
  .msg-bubble-them{animation:msg-slide-in-left .22s cubic-bezier(.34,1,.64,1) both;}
  .msg-root ::-webkit-scrollbar{width:4px;}
  .msg-root ::-webkit-scrollbar-track{background:transparent;}
  .msg-root ::-webkit-scrollbar-thumb{background:var(--border-2);border-radius:4px;}
  .msg-chat-row{display:flex;align-items:center;gap:12px;padding:12px 16px;cursor:pointer;transition:background .15s;position:relative;border-left:3px solid transparent;animation:msg-row-appear .25s ease both;}
  .msg-chat-row:hover{background:var(--surface);}
  .msg-chat-row.active{background:var(--accent-light);border-left-color:var(--accent);}
  .msg-avatar{position:relative;flex-shrink:0;width:46px;height:46px;border-radius:50%;overflow:hidden;background:var(--surface-3);display:flex;align-items:center;justify-content:center;}
  .msg-avatar-group{border-radius:12px !important;background:var(--navy-700) !important;}
  .msg-online-dot{position:absolute;bottom:1px;right:1px;width:11px;height:11px;border-radius:50%;background:var(--success);border:2px solid #fff;}
  .msg-bubble{max-width:68%;position:relative;}
  .msg-bubble-inner{border-radius:18px;padding:11px 15px;position:relative;line-height:1.55;font-size:14px;box-shadow:var(--shadow);}
  .msg-bubble-inner.me{background:var(--msg-me-bg);color:var(--msg-me-text);border-bottom-right-radius:4px;}
  .msg-bubble-inner.them{background:var(--msg-them-bg);color:var(--msg-them-text);border-bottom-left-radius:4px;border:1px solid var(--border);}
  .msg-bubble-inner.deleted{background:var(--surface-3) !important;color:var(--text-muted) !important;font-style:italic;border:1px solid var(--border) !important;box-shadow:none !important;}
  .msg-reaction{display:inline-flex;align-items:center;gap:3px;height:24px;min-width:34px;padding:2px 7px;border-radius:999px;border:1px solid rgba(104,154,216,.28);background:rgba(255,255,255,.92);backdrop-filter:blur(12px);box-shadow:0 1px 2px rgba(13,27,42,.06);font-size:15px;font-weight:700;cursor:pointer;transition:transform .14s cubic-bezier(.2,1.35,.35,1),background .14s,border-color .14s;animation:msg-reaction-pop .22s cubic-bezier(.34,1.56,.64,1) both;line-height:1;}
  .msg-reaction:hover{transform:scale(1.08);background:#fff;border-color:#74A7E8;}
  .msg-reaction.active{border-color:#6AB3FF;background:#E8F3FF;color:#2481CC;box-shadow:0 2px 8px rgba(36,129,204,.16);}
  .msg-reaction-count{font-size:11px;font-weight:800;line-height:1;color:inherit;margin-left:1px;}
  .msg-context{position:fixed;background:#fff;border-radius:14px;border:1px solid var(--border);box-shadow:var(--shadow-lg);z-index:900;min-width:180px;overflow:hidden;animation:msg-context-in .18s cubic-bezier(.34,1.56,.64,1) both;}
  .msg-context-item{display:flex;align-items:center;gap:10px;padding:12px 16px;font-size:13px;cursor:pointer;font-family:var(--font);font-weight:500;color:var(--text-primary);transition:background .12s;border:none;background:none;width:100%;text-align:left;}
  .msg-context-item:hover{background:var(--surface);}
  .msg-context-item.danger{color:var(--danger);}
  .msg-context-item.danger:hover{background:#FEE2E2;}
  .msg-input-wrap{display:flex;align-items:flex-end;gap:10px;padding:14px 18px;background:#fff;border-top:1px solid var(--border);position:relative;}
  .msg-input{flex:1;border:none;background:transparent;padding:10px 0;font-size:14px;color:var(--text-primary);outline:none;font-family:var(--font);resize:none;max-height:120px;min-height:24px;line-height:1.6;}
  .msg-input-bg{flex:1;display:flex;align-items:flex-end;gap:0;background:var(--surface);border-radius:16px;border:1.5px solid var(--border);padding:0 14px;transition:border-color .18s;}
  .msg-input-bg:focus-within{border-color:var(--accent);box-shadow:0 0 0 3px rgba(26,86,219,.09);}
  .msg-icon-btn{width:40px;height:40px;border-radius:12px;border:none;background:transparent;cursor:pointer;display:flex;align-items:center;justify-content:center;color:var(--text-muted);font-family:var(--font);transition:all .15s;flex-shrink:0;}
  .msg-icon-btn:hover{background:var(--surface);color:var(--accent);}
  .msg-icon-btn.send{background:var(--accent);color:#fff;border-radius:14px;width:44px;height:44px;}
  .msg-icon-btn.send:hover{background:var(--accent-2);transform:scale(1.06);}
  .msg-icon-btn.send:disabled{background:var(--border);cursor:not-allowed;transform:none;}
  .msg-icon-btn.danger:hover{background:#FEE2E2;color:var(--danger);}
  .msg-icon-btn.recording{background:#DC2626;color:#fff !important;animation:msg-record-pulse 1s ease infinite;}
  .msg-reply-strip{display:flex;align-items:center;gap:10px;padding:10px 18px;background:var(--accent-light);border-top:1px solid var(--accent-mid);animation:msg-fade .15s ease;}
  .typing-dot{width:7px;height:7px;border-radius:50%;background:var(--steel);display:inline-block;}
  .typing-dot:nth-child(1){animation:msg-typing-dot 1.2s .0s ease infinite;}
  .typing-dot:nth-child(2){animation:msg-typing-dot 1.2s .2s ease infinite;}
  .typing-dot:nth-child(3){animation:msg-typing-dot 1.2s .4s ease infinite;}
  .msg-pinned-bar{display:flex;align-items:center;gap:10px;padding:10px 18px;background:var(--warn-bg);border-bottom:1px solid rgba(192,122,16,.18);cursor:pointer;animation:msg-pin-drop .2s ease;transition:background .15s;}
  .msg-pinned-bar:hover{background:#FDE68A44;}
  .msg-date-divider{display:flex;align-items:center;gap:12px;padding:12px 0;margin:4px 0;color:var(--text-muted);font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:.8px;}
  .msg-date-divider::before,.msg-date-divider::after{content:'';flex:1;height:1px;background:var(--border);}
  .msg-voice{display:flex;align-items:center;gap:10px;padding:8px 12px;border-radius:12px;min-width:200px;}
  .msg-voice-bars{flex:1;display:flex;align-items:center;gap:2px;height:24px;}
  .msg-voice-bar{width:3px;border-radius:2px;flex-shrink:0;transition:background .15s;}
  .msg-call-overlay{position:fixed;inset:0;background:rgba(5,13,24,.85);z-index:1000;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(8px);animation:msg-fade .2s ease;}
  .msg-call-modal{background:linear-gradient(145deg,var(--navy-800) 0%,var(--navy-600) 100%);border-radius:28px;padding:48px 40px;text-align:center;width:340px;position:relative;overflow:hidden;animation:msg-slide-up-panel .3s cubic-bezier(.34,1.56,.64,1);border:1px solid rgba(255,255,255,.08);}
  .msg-call-wave{position:absolute;border-radius:50%;border:1.5px solid rgba(255,255,255,.15);animation:msg-call-wave 2.5s ease infinite;}
  .msg-call-avatar{width:90px;height:90px;border-radius:50%;overflow:hidden;background:var(--navy-600);margin:0 auto 18px;border:3px solid rgba(255,255,255,.2);position:relative;z-index:1;}
  .msg-call-btn{width:60px;height:60px;border-radius:50%;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .18s;flex-shrink:0;}
  .msg-call-btn.end{background:#DC2626;}
  .msg-call-btn.end:hover{background:#B91C1C;transform:scale(1.08);}
  .msg-call-btn.accept{background:var(--success);}
  .msg-call-btn.accept:hover{background:#147A4A;transform:scale(1.08);}
  .msg-call-btn.mute{background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.18);}
  .msg-call-btn.mute:hover{background:rgba(255,255,255,.2);}
  .msg-info-panel{width:280px;border-left:1px solid var(--border);background:#fff;display:flex;flex-direction:column;overflow:hidden;animation:msg-slide-up-panel .3s ease;}
  .msg-info-section{padding:16px 20px;border-bottom:1px solid var(--border);}
  .msg-media-thumb{width:80px;height:80px;border-radius:10px;overflow:hidden;background:var(--surface-3);cursor:pointer;transition:transform .15s;}
  .msg-media-thumb:hover{transform:scale(1.04);}
  .msg-chat-header{display:flex;align-items:center;gap:14px;padding:14px 20px;background:#fff;border-bottom:1px solid var(--border);}
  .msg-unread{min-width:20px;height:20px;border-radius:10px;background:var(--accent);color:#fff;font-size:11px;font-weight:700;padding:0 5px;display:flex;align-items:center;justify-content:center;animation:msg-counter .2s cubic-bezier(.34,1.56,.64,1);}
  .msg-attachment{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:10px;border:1px solid rgba(255,255,255,.2);margin-bottom:8px;background:rgba(255,255,255,.1);}
  .msg-attachment.them{border-color:var(--border);background:var(--surface);}
  .msg-forward-overlay{position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:800;display:flex;align-items:center;justify-content:center;padding:24px;backdrop-filter:blur(4px);animation:msg-fade .15s ease;}
  .msg-forward-modal{background:#fff;border-radius:20px;max-width:440px;width:100%;max-height:80vh;overflow-y:auto;box-shadow:var(--shadow-lg);animation:msg-slide-up-panel .25s cubic-bezier(.34,1.56,.64,1);}
  .msg-selected-bar{display:flex;align-items:center;gap:12px;padding:12px 20px;background:var(--accent);animation:msg-slide-up-panel .2s ease;}
  /* ── TELEGRAM-LIKE REACTIONS ── */
  .msg-emoji-popup{position:fixed;background:rgba(255,255,255,.96);border-radius:24px;border:1px solid rgba(209,217,229,.72);box-shadow:0 12px 34px rgba(20,35,54,.24);z-index:950;display:flex;align-items:center;gap:2px;padding:7px 8px;animation:msg-context-in .16s cubic-bezier(.2,1.35,.35,1) both;backdrop-filter:blur(18px);transform-origin:center bottom;}
  .msg-emoji-popup::after{content:'';position:absolute;left:32px;bottom:-6px;width:12px;height:12px;background:rgba(255,255,255,.96);border-right:1px solid rgba(209,217,229,.72);border-bottom:1px solid rgba(209,217,229,.72);transform:rotate(45deg);}
  .msg-emoji-btn{position:relative;background:none;border:none;cursor:pointer;font-size:25px;width:34px;height:34px;padding:0;border-radius:50%;transition:transform .13s cubic-bezier(.2,1.45,.35,1),background .13s;line-height:1;display:flex;align-items:center;justify-content:center;z-index:1;}
  .msg-emoji-btn:hover{transform:translateY(-8px) scale(1.42);background:rgba(238,243,250,.98);}
  .msg-emoji-more{font-size:18px;color:#6E7D8F;background:#F1F5FA;}

  /* ── TELEGRAM-LIKE STICKERS ── */
  .msg-sticker-panel{position:absolute;bottom:76px;right:10px;width:380px;background:rgba(255,255,255,.97);border-radius:20px;border:1px solid rgba(209,217,229,.82);box-shadow:0 18px 46px rgba(13,27,42,.22);z-index:260;overflow:hidden;animation:msg-slide-up-panel .2s cubic-bezier(.2,1.22,.35,1);backdrop-filter:blur(18px);}
  .msg-sticker-search{height:38px;margin:10px 12px 8px;padding:0 12px;border-radius:12px;background:#F2F5F9;color:#8B98A8;font-size:13px;font-weight:600;display:flex;align-items:center;gap:8px;}
  .msg-sticker-tabs{display:flex;align-items:center;gap:3px;border-top:1px solid #EEF2F7;background:#FAFBFD;padding:5px 8px;overflow-x:auto;}
  .msg-sticker-tab{min-width:42px;height:38px;border:none;background:transparent;cursor:pointer;border-radius:11px;font-size:22px;display:flex;align-items:center;justify-content:center;transition:background .13s,transform .13s;position:relative;}
  .msg-sticker-tab:hover{background:#EEF4FB;transform:translateY(-1px)}
  .msg-sticker-tab.active{background:#E8F3FF;}
  .msg-sticker-tab.active::after{content:'';position:absolute;left:11px;right:11px;bottom:2px;height:3px;border-radius:3px;background:#3390EC;}
  .msg-sticker-grid{height:292px;overflow-y:auto;padding:7px 9px 12px;display:grid;grid-template-columns:repeat(4,1fr);gap:5px;align-content:start;}
  .msg-sticker-title{font-size:12px;font-weight:800;color:#657487;padding:4px 12px 3px;display:flex;align-items:center;justify-content:space-between;}
  .msg-sticker-btn{height:82px;background:none;border:none;cursor:pointer;font-size:50px;padding:5px;border-radius:16px;transition:transform .13s cubic-bezier(.2,1.4,.35,1),background .12s,filter .12s;line-height:1;display:flex;align-items:center;justify-content:center;filter:drop-shadow(0 2px 3px rgba(13,27,42,.1));}
  .msg-sticker-btn:hover{transform:translateY(-4px) scale(1.18) rotate(-2deg);background:#F1F6FC;filter:drop-shadow(0 9px 12px rgba(13,27,42,.14));}
  .msg-sticker-message{font-size:78px;line-height:1;display:inline-flex;align-items:center;justify-content:center;filter:drop-shadow(0 7px 12px rgba(13,27,42,.16));animation:msg-sticker-bounce .46s cubic-bezier(.34,1.56,.64,1);user-select:none;transform-origin:center bottom;}
  .msg-sticker-message:hover{animation:msg-sticker-wiggle .58s ease both;}
  .msg-sticker-time{display:inline-flex;align-items:center;gap:4px;margin-top:2px;padding:2px 6px;border-radius:999px;background:rgba(0,0,0,.28);color:#fff;font-size:10px;font-weight:700;backdrop-filter:blur(6px);}
  @keyframes msg-sticker-wiggle{0%,100%{transform:rotate(0) scale(1)}20%{transform:rotate(-7deg) scale(1.05)}45%{transform:rotate(6deg) scale(1.08)}70%{transform:rotate(-3deg) scale(1.04)}}
  /* ── PROFILE MODAL ── */
  .msg-profile-overlay{position:fixed;inset:0;background:rgba(0,0,0,.65);z-index:1000;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(12px);animation:msg-fade .2s ease;padding:20px;}
  .msg-profile-modal{background:#fff;border-radius:26px;width:430px;max-height:90vh;overflow-y:auto;box-shadow:0 24px 64px rgba(0,0,0,.35);animation:msg-slide-up-panel .3s cubic-bezier(.34,1.56,.64,1);}
  .msg-profile-modal::-webkit-scrollbar{width:0;}
  .msg-profile-cover{width:100%;height:190px;object-fit:cover;display:block;}
  .msg-profile-avatar{width:86px;height:86px;border-radius:50%;border:4px solid #fff;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,.2);}
  /* ── LIGHTBOX ── */
  .msg-lightbox{position:fixed;inset:0;background:rgba(0,0,0,.96);z-index:1100;display:flex;align-items:center;justify-content:center;animation:msg-fade .15s ease;}
  .msg-lightbox img{max-width:90vw;max-height:85vh;border-radius:12px;box-shadow:0 8px 40px rgba(0,0,0,.5);object-fit:contain;}
  /* ── MSG HOVER ZONE ── */
  .msg-hover-zone{position:relative;}
  .msg-hover-zone .msg-react-trigger{opacity:0;transition:opacity .15s;pointer-events:none;}
  .msg-hover-zone:hover .msg-react-trigger{opacity:1;pointer-events:auto;}

  /* ── REAL VOICE / CALLS ── */
  .msg-voice.error{opacity:.72;}
  .msg-call-modal.wide{width:min(980px,94vw);min-height:620px;padding:0;display:flex;flex-direction:column;text-align:left;background:var(--navy-950);}
  .msg-call-topbar{display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid rgba(255,255,255,.08);color:#fff;position:relative;z-index:2;}
  .msg-call-stage{flex:1;display:grid;grid-template-columns:1fr 260px;gap:14px;padding:16px;min-height:430px;}
  .msg-video-tile{position:relative;overflow:hidden;border-radius:22px;background:linear-gradient(135deg,var(--navy-800),var(--navy-600));display:flex;align-items:center;justify-content:center;box-shadow:inset 0 0 0 1px rgba(255,255,255,.07);}
  .msg-video-tile video{width:100%;height:100%;object-fit:cover;display:block;background:#000;}
  .msg-video-badge{position:absolute;left:14px;bottom:14px;padding:7px 10px;border-radius:999px;background:rgba(0,0,0,.42);backdrop-filter:blur(8px);color:#fff;font-size:12px;font-weight:700;display:flex;align-items:center;gap:6px;}
  .msg-call-side{display:flex;flex-direction:column;gap:14px;min-width:0;}
  .msg-screen-tile{height:160px;border:1px dashed rgba(255,255,255,.2);border-radius:18px;background:rgba(255,255,255,.045);display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,.62);text-align:center;font-size:12px;padding:16px;overflow:hidden;}
  .msg-call-tile-actions{position:absolute;top:10px;right:10px;display:flex;gap:6px;z-index:5;opacity:0;transition:opacity .15s;}
  .msg-video-tile:hover .msg-call-tile-actions{opacity:1;}
  .msg-call-tile-btn{height:30px;min-width:30px;border:none;border-radius:10px;background:rgba(0,0,0,.45);color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(10px);font-size:11px;font-weight:800;padding:0 9px;}
  .msg-call-tile-btn:hover{background:rgba(255,255,255,.18);}
  .msg-call-expanded{position:fixed;inset:0;background:#05080f;z-index:1400;display:flex;flex-direction:column;animation:msg-fade .14s ease;}
  .msg-call-expanded-head{height:58px;display:flex;align-items:center;justify-content:space-between;padding:0 18px;border-bottom:1px solid rgba(255,255,255,.08);color:#fff;font-size:13px;font-weight:800;background:rgba(5,8,15,.88);backdrop-filter:blur(14px);}
  .msg-call-expanded-body{flex:1;min-height:0;display:flex;align-items:center;justify-content:center;padding:72px 18px 24px;position:relative;}
  .msg-call-expanded-body video{width:100%;height:100%;object-fit:contain;background:#000;border-radius:18px;box-shadow:0 18px 80px rgba(0,0,0,.45);}
  .msg-call-participants{position:absolute;top:72px;left:50%;transform:translateX(-50%);display:flex;gap:10px;z-index:3;max-width:calc(100vw - 40px);overflow-x:auto;padding:4px;}
  .msg-call-participant{width:138px;height:82px;border-radius:16px;overflow:hidden;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.13);box-shadow:0 10px 30px rgba(0,0,0,.35);position:relative;display:flex;align-items:center;justify-content:center;color:#fff;flex-shrink:0;}
  .msg-call-participant video{width:100%;height:100%;object-fit:cover;border-radius:0;box-shadow:none;}
  .msg-call-participant-label{position:absolute;left:7px;bottom:7px;padding:4px 7px;border-radius:999px;background:rgba(0,0,0,.48);font-size:10px;font-weight:800;color:#fff;backdrop-filter:blur(8px);}
  .msg-call-screen-safe{width:100%;height:100%;display:flex;align-items:center;justify-content:center;text-align:center;padding:22px;border-radius:18px;background:linear-gradient(135deg,rgba(255,255,255,.06),rgba(255,255,255,.025));color:rgba(255,255,255,.72);font-size:13px;line-height:1.55;}
  .msg-call-share-preview{position:fixed;right:22px;bottom:112px;width:300px;height:188px;border-radius:20px;background:rgba(5,13,24,.88);border:1px solid rgba(255,255,255,.14);box-shadow:0 20px 70px rgba(0,0,0,.42);z-index:1450;overflow:hidden;backdrop-filter:blur(18px);animation:msg-slide-up-panel .2s cubic-bezier(.34,1.56,.64,1);user-select:none;}
  .msg-call-share-preview.dragging{transition:none;cursor:grabbing;}
  .msg-call-share-preview-head{height:38px;display:flex;align-items:center;justify-content:space-between;padding:0 10px 0 12px;color:#fff;font-size:11px;font-weight:900;background:rgba(0,0,0,.34);cursor:grab;}
  .msg-call-share-preview-body{height:calc(100% - 38px);position:relative;background:#000;display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,.68);font-size:12px;text-align:center;}
  .msg-call-share-preview-body video{width:100%;height:100%;object-fit:contain;background:#000;display:block;}
  .msg-call-share-preview-actions{display:flex;gap:6px;align-items:center;}
  .msg-call-mini-btn{height:26px;padding:0 9px;border-radius:999px;border:1px solid rgba(255,255,255,.16);background:rgba(255,255,255,.1);color:#fff;font-size:10px;font-weight:900;cursor:pointer;font-family:var(--font);display:inline-flex;align-items:center;gap:5px;transition:background .12s,transform .12s;}
  .msg-call-mini-btn:hover{background:rgba(255,255,255,.18);transform:translateY(-1px);}
  .msg-call-mini-btn.danger{background:rgba(220,38,38,.82);border-color:rgba(255,255,255,.1);}
  .msg-call-mini-btn.danger:hover{background:#DC2626;}
  .msg-call-pip-hidden{position:fixed;width:1px;height:1px;left:-9999px;top:-9999px;opacity:.01;pointer-events:none;}
  .msg-call-share-hint{position:absolute;left:10px;bottom:10px;right:10px;padding:8px 10px;border-radius:12px;background:rgba(0,0,0,.55);color:#fff;font-size:11px;font-weight:700;line-height:1.35;backdrop-filter:blur(10px);} 

  .msg-active-call-pill{position:fixed;left:22px;bottom:22px;z-index:1500;display:flex;align-items:center;gap:8px;padding:10px;background:linear-gradient(135deg,rgba(26,86,219,.96),rgba(16,34,54,.97));border:1px solid rgba(255,255,255,.18);border-radius:22px;box-shadow:0 18px 60px rgba(5,13,24,.34),0 0 0 1px rgba(37,99,235,.12);backdrop-filter:blur(20px);animation:msg-slide-up-panel .22s cubic-bezier(.34,1.56,.64,1);font-family:var(--font);}
  .msg-active-call-pill::before{content:'';position:absolute;inset:-1px;border-radius:22px;background:linear-gradient(135deg,rgba(255,255,255,.16),transparent 46%,rgba(235,242,255,.08));pointer-events:none;}
  .msg-active-call-main{position:relative;display:flex;align-items:center;gap:10px;min-width:208px;padding:8px 10px;border:none;background:rgba(255,255,255,.1);border-radius:16px;color:#fff;cursor:pointer;text-align:left;font-family:var(--font);transition:background .14s,transform .14s;}
  .msg-active-call-main:hover{background:rgba(255,255,255,.17);transform:translateY(-1px);}
  .msg-active-call-main b{display:block;font-size:13px;font-weight:900;line-height:1.15;max-width:164px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
  .msg-active-call-main small{display:block;margin-top:3px;font-size:10px;font-weight:700;color:rgba(255,255,255,.72);max-width:170px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
  .msg-active-call-dot{width:10px;height:10px;border-radius:50%;background:#22C55E;box-shadow:0 0 0 4px rgba(34,197,94,.18),0 0 18px rgba(34,197,94,.55);flex-shrink:0;animation:msg-record-pulse 1.6s ease infinite;}
  .msg-active-call-action{position:relative;width:36px;height:36px;border-radius:14px;border:1px solid rgba(255,255,255,.17);background:rgba(235,242,255,.14);color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:900;font-family:var(--font);transition:transform .14s,background .14s,border-color .14s,box-shadow .14s;}
  .msg-active-call-action:hover{transform:translateY(-2px);background:rgba(255,255,255,.23);box-shadow:0 8px 22px rgba(0,0,0,.18);}
  .msg-active-call-action.active{background:#fff;color:var(--accent);border-color:#fff;box-shadow:0 8px 22px rgba(0,0,0,.18);}
  .msg-active-call-action.danger{background:#DC2626;border-color:rgba(255,255,255,.16);color:#fff;}
  .msg-active-call-action.danger:hover{background:#B91C1C;}
  .msg-active-call-action.pip{width:36px;min-width:36px;padding:0;}
  .msg-active-call-action svg{display:block;}
  .msg-call-live-dot{width:7px;height:7px;border-radius:50%;background:#22C55E;box-shadow:0 0 0 3px rgba(34,197,94,.18);display:inline-block;margin-right:7px;vertical-align:1px;}
  .msg-chat-call-banner{margin:0 14px 10px;padding:9px 12px;border:none;border-radius:15px;background:linear-gradient(135deg,var(--accent),var(--navy-600));color:#fff;box-shadow:0 10px 26px rgba(26,86,219,.24);display:flex;align-items:center;gap:10px;cursor:pointer;font-family:var(--font);animation:msg-pin-drop .2s ease;}
  .msg-chat-call-banner:hover{filter:brightness(1.04);}
  .msg-chat-call-live{display:inline-flex;align-items:center;gap:6px;padding:5px 8px;border-radius:999px;background:rgba(34,197,94,.18);font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:.45px;white-space:nowrap;}
  .msg-chat-call-live-dot{width:7px;height:7px;border-radius:50%;background:#22C55E;box-shadow:0 0 0 3px rgba(34,197,94,.18);}
  .msg-chat-call-title{font-size:13px;font-weight:900;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
  .msg-chat-call-time{margin-left:auto;font-size:12px;font-weight:900;font-variant-numeric:tabular-nums;color:rgba(255,255,255,.88);white-space:nowrap;}
  .msg-chat-call-return{font-size:11px;font-weight:900;color:#fff;background:rgba(255,255,255,.16);padding:6px 9px;border-radius:999px;white-space:nowrap;}
  .msg-call-controls{display:flex;align-items:center;justify-content:center;gap:12px;padding:16px 20px 20px;border-top:1px solid rgba(255,255,255,.08);}
  .msg-call-btn.active{background:#fff !important;color:var(--accent) !important;}
  .msg-call-btn.active svg{stroke:var(--accent) !important;}
  .msg-call-permission{position:absolute;inset:auto 18px 88px 18px;background:rgba(185,28,28,.88);color:#fff;border-radius:14px;padding:10px 12px;font-size:12px;font-weight:600;text-align:center;z-index:4;}
  .msg-profile-chip{display:inline-flex;align-items:center;gap:6px;padding:6px 9px;border-radius:999px;background:var(--surface);color:var(--text-secondary);font-size:11px;font-weight:700;}
  @media (max-width: 920px){.msg-call-stage{grid-template-columns:1fr}.msg-call-side{display:grid;grid-template-columns:1fr 1fr}.msg-call-modal.wide{min-height:560px}.msg-info-panel{display:none}.msg-bubble{max-width:84%;}}
`;


/* ─── STICKER PACKS ─── */
const STICKER_PACKS = [
  { id: 'fav', icon: '⭐️', name: 'Избранные', stickers: ['😀','😁','😂','🤣','😍','😘','😎','🤩','🥳','😇','🙃','😉','😌','🥹','😅','😋'] },
  { id: 'cat', icon: '🐱', name: 'Коты', stickers: ['😺','😸','😹','😻','😼','😽','🙀','😿','😾','🐱','🐈','🐾','🦁','🐯','🐶','🦊'] },
  { id: 'hands', icon: '👍', name: 'Жесты', stickers: ['👍','👎','👏','🙌','👌','🤝','🙏','💪','👀','✍️','🤌','🫡','✌️','🤙','👊','🫶'] },
  { id: 'hearts', icon: '❤️', name: 'Любимые', stickers: ['❤️','🧡','💛','💚','💙','💜','🖤','🤍','💔','💯','🔥','🎉','✨','⭐️','🌟','💫'] },
  { id: 'faces', icon: '😎', name: 'Эмоции', stickers: ['🥰','😭','😡','🤯','🥶','😴','🤔','😐','😬','😱','🤫','🤭','😤','😈','🤠','🫠'] },
  { id: 'tactic', icon: '🎖️', name: 'Тактика', stickers: ['🎖️','🛡️','🧭','🗺️','📡','🎯','🚁','⛺️','🔦','🧰','📍','🏕️','🪖','📌','✅','⚠️'] },
  { id: 'party', icon: '🎉', name: 'Праздник', stickers: ['🎉','🎊','🥳','🏆','🥇','💥','🚀','⚡️','🌈','☀️','🍀','🎁','🪩','🎈','🫡','🔥'] },
] as const;

/* ─── QUICK REACTIONS ─── */
const QUICK_EMOJIS = ['👍','❤️','🔥','🥰','👏','😁','🤔','😢'];

/* ─── CHAT DATA ─── */
const CHATS: ChatUser[] = [
  {
    id: 1, name: 'Торнадо', callsign: 'Торнадо', login: 'tornado',
    avatar: 'https://i.pravatar.cc/150?img=33',
    rank: 'Майор', lastMsg: 'Жду тебя на следующем занятии, приходи пораньше',
    time: '14:32', unread: 2, online: true, unit: '1-й батальон',
    bio: 'Инструктор по тактической подготовке. 12 лет в спецназе. Специализация: городской бой, планирование операций.',
    coverSeed: 'tornado-military', rating: 4.9, missions: 47, role: 'Старший инструктор', location: 'Учебный центр Север', joined: '2022', skills: ['Городской бой','Планирование','Разбор полётов'], achievements: ['47 миссий','Наставник месяца'],
  },
  {
    id: 2, name: 'Бек', callsign: 'Бек', login: 'bek',
    avatar: 'https://i.pravatar.cc/150?img=52',
    rank: 'Лейтенант', lastMsg: 'ДЗ принято, работа выполнена на отлично',
    time: '11:08', unread: 0, online: true, unit: 'Рота А',
    bio: 'Инструктор по тактической медицине и TCCC. Сертифицированный военный медик первого класса.',
    coverSeed: 'bek-field', rating: 4.7, missions: 29, role: 'Тактический медик', location: 'Медблок / Полигон', joined: '2023', skills: ['TCCC','Эвакуация','Первая помощь'], achievements: ['29 выездов','Медик I класса'],
  },
  {
    id: 4, name: 'Группа КМБ-77', callsign: 'КМБ-77', avatar: '',
    lastMsg: 'Стрелок: кто едет в субботу на полигон?',
    time: 'Вчера', unread: 8, online: false, isGroup: true, membersCount: 24,
  },
  {
    id: 3, name: 'Коба', callsign: 'Коба', login: 'koba',
    avatar: 'https://i.pravatar.cc/150?img=51',
    rank: 'Подполковник', lastMsg: 'Снаряжение на складе, приедешь завтра?',
    time: 'Вчера', unread: 0, online: false, lastSeen: 'час назад', unit: 'Штаб',
    bio: 'Командир учебного центра. 20+ лет боевого и преподавательского опыта. Аналитик, тактик, стратег.',
    coverSeed: 'koba-command', rating: 5.0, missions: 112, role: 'Командир центра', location: 'Штаб', joined: '2020', skills: ['Стратегия','Управление','Аналитика'], achievements: ['112 операций','Куратор курса'],
  },
  {
    id: 5, name: 'Стрелок', callsign: 'Стрелок', login: 'shooter',
    avatar: 'https://i.pravatar.cc/150?img=15',
    rank: '', lastMsg: 'Посмотри видео, там всё объяснено подробно',
    time: 'Пн', unread: 0, online: false, lastSeen: '3 часа назад',
    bio: 'Инструктор огневой подготовки. Мастер спорта по практической стрельбе. IPSC, 3-Gun.',
    coverSeed: 'shooter-range', rating: 4.8, missions: 34, role: 'Огневой инструктор', location: 'Стрелковый комплекс', joined: '2021', skills: ['IPSC','3-Gun','Безопасность'], achievements: ['34 тренировки','Мастер спорта'],
  },
  {
    id: 6, name: 'Группа Снайпер-V4', callsign: 'Снайпер-V4', avatar: '',
    lastMsg: 'Следующее занятие 15 апреля в 09:00',
    time: 'Вс', unread: 0, online: false, isGroup: true, membersCount: 11,
  },
  {
    id: 7, name: 'Нексус', callsign: 'Нексус', login: 'nexus',
    avatar: 'https://i.pravatar.cc/150?img=8',
    rank: 'Курсант', lastMsg: 'Принято, буду на полигоне',
    time: 'Сб', unread: 0, online: false, lastSeen: 'вчера',
    bio: 'Курсант 3-го набора. Специализируюсь на радиосвязи и РЭБ. Фоторепортёр группы.',
    coverSeed: 'nexus-tech', rating: 4.2, missions: 8, role: 'Связист / фото', location: 'РЭБ-группа', joined: '2024', skills: ['Радиосвязь','РЭБ','Фото'], achievements: ['8 задач','Архивариус группы'],
  },
  {
    id: 8, name: 'Вега', callsign: 'Вега', login: 'vega',
    avatar: 'https://i.pravatar.cc/150?img=47',
    rank: 'Сержант', lastMsg: 'Завтра прогоняем связь на коротких дистанциях',
    time: '09:44', unread: 1, online: true, unit: 'РЭБ-группа',
    bio: 'Инструктор по связи, радиодисциплине и базовой РЭБ. Любит короткие чек-листы и чистый эфир.',
    coverSeed: 'vega-radio', rating: 4.6, missions: 18, role: 'Связь / РЭБ', location: 'Узел связи', joined: '2023', skills: ['Радиосеть','Шифрование','РЭБ'], achievements: ['18 задач','Чистый эфир'],
  },
  {
    id: 9, name: 'Атлас', callsign: 'Атлас', login: 'atlas',
    avatar: 'https://i.pravatar.cc/150?img=12',
    rank: 'Капитан', lastMsg: 'Скинул новый маршрут и точки контроля',
    time: '08:17', unread: 0, online: false, lastSeen: '20 минут назад', unit: 'Топография',
    bio: 'Навигация, карты, ориентирование и подготовка маршрутов. Делает сложные схемы понятными.',
    coverSeed: 'atlas-map', rating: 4.9, missions: 63, role: 'Навигатор', location: 'Картографический класс', joined: '2021', skills: ['Ориентирование','Маршруты','Карты'], achievements: ['63 маршрута','Лучший навигатор'],
  },
  {
    id: 10, name: 'Искра', callsign: 'Искра', login: 'iskra',
    avatar: 'https://i.pravatar.cc/150?img=44',
    rank: 'Лейтенант', lastMsg: 'Разбор после тренировки будет в 19:30',
    time: 'Вчера', unread: 3, online: true, unit: 'Аналитика',
    bio: 'Отвечает за видеоразборы, дневники прогресса и обратную связь после тренировок.',
    coverSeed: 'iskra-briefing', rating: 4.8, missions: 31, role: 'Аналитик курса', location: 'Класс разбора', joined: '2022', skills: ['Видеоразбор','Метрики','Планирование'], achievements: ['31 разбор','Точность'],
  },
  {
    id: 11, name: 'Гранит', callsign: 'Гранит', login: 'granit',
    avatar: 'https://i.pravatar.cc/150?img=68',
    rank: 'Старшина', lastMsg: 'Проверь экипировку по списку до выхода',
    time: 'Вт', unread: 0, online: false, lastSeen: 'вчера', unit: 'Снабжение',
    bio: 'Экипировка, склад, контроль комплектов и порядок перед выездом.',
    coverSeed: 'granit-gear', rating: 4.5, missions: 40, role: 'Снаряжение', location: 'Склад №2', joined: '2022', skills: ['Комплектация','Логистика','Контроль'], achievements: ['40 выдач','Без потерь'],
  },
  {
    id: 12, name: 'Группа Связь-12', callsign: 'Связь-12', avatar: '',
    lastMsg: 'Вега: канал резервный оставляем открытым до 18:00',
    time: 'Пн', unread: 5, online: false, isGroup: true, membersCount: 16,
  },
  {
    id: 13, name: 'Рубеж', callsign: 'Рубеж', login: 'rubezh',
    avatar: 'https://i.pravatar.cc/150?img=59',
    rank: 'Инструктор', lastMsg: 'Сегодня работаем спокойно: техника важнее скорости',
    time: 'Пн', unread: 0, online: false, lastSeen: '2 дня назад', unit: 'Полоса препятствий',
    bio: 'Физподготовка, полоса препятствий и восстановление после нагрузок.',
    coverSeed: 'rubezh-fitness', rating: 4.7, missions: 22, role: 'Физподготовка', location: 'Полоса №1', joined: '2023', skills: ['Выносливость','Полоса','Восстановление'], achievements: ['22 тренировки','Темп'],
  },
];

const VOICE_BARS = [3, 8, 14, 22, 18, 26, 20, 14, 8, 18, 24, 16, 10, 20, 28, 22, 16, 10, 8, 12, 20, 16, 10, 6];

const makeInitialMessages = (): Record<number, Message[]> => ({
  1: [
    { id: 1, from: 'them', text: 'Привет, боец. Как продвигается подготовка к следующим учениям?', time: '13:45', status: 'read', reactions: [] },
    { id: 2, from: 'me', text: 'Работаем по плану. Сегодня пробежал 5 км на время — 24 минуты.', time: '13:52', status: 'read', reactions: [{ emoji: '👍', count: 1, reacted: false }] },
    { id: 3, from: 'them', text: 'Неплохо. Цель — до 22 минут к концу месяца. Продолжай в том же духе.', time: '13:55', status: 'read', reactions: [] },
    { id: 4, from: 'me', text: 'Так точно. Также проработал тактику движения в городских условиях по записям с прошлого курса.', time: '14:10', status: 'read', reactions: [], attachment: { type: 'file', name: 'taktika_gorod.pdf', size: '2.4 МБ' } },
    { id: 5, from: 'them', text: 'Вот схема маршрутов для следующего упражнения.', time: '14:20', status: 'read', reactions: [], attachment: { type: 'image', url: 'https://picsum.photos/seed/tactic-map1/400/280', name: 'схема.jpg' } },
    { id: 6, from: 'me', text: 'Получил. Буду изучать.', time: '14:25', status: 'read', reactions: [] },
    { id: 7, from: 'them', text: 'Молодец. Жду тебя на следующем занятии, приходи пораньше.', time: '14:32', status: 'delivered', reactions: [], pinned: true },
  ],
  2: [
    { id: 1, from: 'them', text: 'Проверил домашнее задание по тактической медицине', time: '10:55', status: 'read', reactions: [] },
    { id: 2, from: 'me', text: 'Ждал с нетерпением. Как результат?', time: '11:02', status: 'read', reactions: [] },
    { id: 3, from: 'them', text: 'ДЗ принято, работа выполнена на отлично. Особенно понравилась схема тампонады.', time: '11:08', status: 'read', reactions: [{ emoji: '🔥', count: 1, reacted: true }] },
    { id: 4, from: 'me', text: 'Отлично, закрепил схему в конспекте.', time: '11:12', status: 'read', reactions: [{ emoji: '👍', count: 1, reacted: false }] },
    { id: 5, from: 'them', text: '', time: '11:13', status: 'read', reactions: [], attachment: { type: 'sticker', emoji: '🫡' } },
  ],
  4: [
    { id: 1, from: 'them', text: 'Кто едет в субботу на полигон? Нужно набрать минимум 8 человек.', time: '09:00', status: 'read', reactions: [] },
    { id: 2, from: 'me', text: 'Я буду. Выехать могу от метро Сокольники, готов взять двоих на борт.', time: '09:18', status: 'read', reactions: [] },
    { id: 3, from: 'them', text: 'Отлично, учитываем. Сбор в 08:00 у КПП.', time: '09:30', status: 'read', reactions: [] },
    { id: 4, from: 'them', text: '', time: '09:35', status: 'read', reactions: [], attachment: { type: 'image', url: 'https://picsum.photos/seed/polygon-range/400/260', name: 'полигон.jpg' } },
    { id: 5, from: 'me', text: '', time: '09:37', status: 'read', reactions: [], attachment: { type: 'sticker', emoji: '👍' } },
  ],
  3: [
    { id: 1, from: 'them', text: 'Снаряжение на складе. Проверь список перед выездом.', time: '16:20', status: 'read', reactions: [] },
    { id: 2, from: 'me', text: 'Принял. Заберу комплект завтра утром.', time: '16:27', status: 'read', reactions: [{ emoji: '👍', count: 1, reacted: true }] },
  ],
  5: [
    { id: 1, from: 'them', text: 'Посмотри видео: стойка стабильная, но работа спуском пока резкая.', time: '12:05', status: 'read', reactions: [] },
    { id: 2, from: 'me', text: 'Понял, сегодня отдельно отработаю плавный спуск.', time: '12:11', status: 'read', reactions: [] },
  ],
  6: [
    { id: 1, from: 'them', text: 'Следующее занятие 15 апреля в 09:00. Форма полевая, блокнот обязательно.', time: '18:40', status: 'read', reactions: [{ emoji: '🔥', count: 2, reacted: false }] },
  ],
  7: [
    { id: 1, from: 'them', text: 'Принято, буду на полигоне. Возьму камеру для отчёта.', time: '15:30', status: 'read', reactions: [] },
  ],
  8: [
    { id: 1, from: 'them', text: 'Завтра прогоняем связь на коротких дистанциях. Нужны гарнитура и запасной аккумулятор.', time: '09:44', status: 'delivered', reactions: [] },
  ],
  9: [
    { id: 1, from: 'them', text: 'Скинул новый маршрут и точки контроля.', time: '08:17', status: 'read', reactions: [], attachment: { type: 'image', url: 'https://picsum.photos/seed/atlas-route/400/260', name: 'route.jpg' } },
    { id: 2, from: 'me', text: 'Вижу. Отмечу сложные участки и вернусь с вопросами.', time: '08:25', status: 'read', reactions: [] },
  ],
  10: [
    { id: 1, from: 'them', text: 'Разбор после тренировки будет в 19:30. Возьми записи по таймингам.', time: '17:02', status: 'read', reactions: [] },
    { id: 2, from: 'me', text: 'Буду. Подготовлю три момента, где просел темп.', time: '17:05', status: 'read', reactions: [{ emoji: '👏', count: 1, reacted: false }] },
  ],
  11: [
    { id: 1, from: 'them', text: 'Проверь экипировку по списку до выхода: аптечка, фонарь, перчатки, вода.', time: '10:10', status: 'read', reactions: [] },
  ],
  12: [
    { id: 1, from: 'them', text: 'Канал резервный оставляем открытым до 18:00.', time: '13:00', status: 'read', reactions: [] },
    { id: 2, from: 'me', text: 'Понял, основной канал не трогаю.', time: '13:04', status: 'read', reactions: [] },
  ],
  13: [
    { id: 1, from: 'them', text: 'Сегодня работаем спокойно: техника важнее скорости.', time: '07:40', status: 'read', reactions: [] },
  ],
});

const stampDemoMessages = (base: Record<number, Message[]>) => {
  const loginByChat: Record<number, string> = { 1: 'tornado', 2: 'bek', 3: 'koba', 4: 'koba', 5: 'shooter', 6: 'shooter', 7: 'nexus', 8: 'vega', 9: 'atlas', 10: 'iskra', 11: 'granit', 12: 'vega', 13: 'rubezh' };
  return Object.fromEntries(
    Object.entries(base).map(([chatId, list]) => [
      chatId,
      list
        .map((msg) => ({
          ...msg,
          reactions: (msg.reactions || []).filter(r => QUICK_EMOJIS.includes(r.emoji)),
          senderLogin: msg.senderLogin || (msg.from === 'me' ? 'tornado' : loginByChat[Number(chatId)] || 'tornado'),
        })),
    ])
  ) as Record<number, Message[]>;
};

const loadDemoMessages = () => {
  if (typeof window === 'undefined') return makeInitialMessages();
  try {
    const saved = localStorage.getItem('voevoda_demo_messages_v4');
    return saved ? stampDemoMessages(JSON.parse(saved) as Record<number, Message[]>) : stampDemoMessages(makeInitialMessages());
  } catch {
    return stampDemoMessages(makeInitialMessages());
  }
};

/* ─── ICONS ─── */
function Ico({ d, size = 18, stroke = 'currentColor', sw = 1.6, fill = 'none' }: {
  d: string | string[]; size?: number; stroke?: string; sw?: number; fill?: string;
}) {
  const paths = Array.isArray(d) ? d : [d];
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}
      stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      {paths.map((p, i) => <path key={i} d={p} />)}
    </svg>
  );
}

function CheckDouble({ read }: { read: boolean }) {
  return (
    <svg width="16" height="10" viewBox="0 0 20 12" fill="none">
      <path d="M1 6L5.5 10.5L14 1" stroke={read ? '#93C5FD' : 'rgba(255,255,255,.5)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 6L11.5 10.5L20 1" stroke={read ? '#93C5FD' : 'rgba(255,255,255,.5)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ─── VOICE WAVEFORM ─── */
function VoiceMessage({ from, duration = 1, url, waveform }: { from: 'me' | 'them'; duration?: number; url?: string; waveform?: number[] }) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [realDuration, setRealDuration] = useState(duration || 1);
  const [error, setError] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const bars = waveform && waveform.length > 0 ? waveform : VOICE_BARS;

  const stopFakePlayback = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    setPlaying(false);
  };

  const toggle = () => {
    if (url && audioRef.current && !error) {
      if (playing) {
        audioRef.current.pause();
        setPlaying(false);
      } else {
        audioRef.current.play().catch(() => setError(true));
        setPlaying(true);
      }
      return;
    }

    // Fallback for demo voice messages that don't have a recorded blob URL.
    if (playing) stopFakePlayback();
    else {
      setPlaying(true);
      timerRef.current = setInterval(() => {
        setProgress(p => {
          if (p >= 100) { stopFakePlayback(); return 0; }
          return p + (100 / (Math.max(duration, 1) * 10));
        });
      }, 100);
    }
  };

  useEffect(() => () => stopFakePlayback(), []);

  const accent = from === 'me' ? 'rgba(255,255,255,.85)' : 'var(--accent)';
  const dim    = from === 'me' ? 'rgba(255,255,255,.3)' : 'var(--border-2)';
  const fmt = (s: number) => `${Math.floor(s/60)}:${String(Math.round(s%60)).padStart(2,'0')}`;

  return (
    <div className={`msg-voice${error?' error':''}`}>
      {url && (
        <audio
          ref={audioRef}
          src={url}
          preload="metadata"
          onLoadedMetadata={e => {
            const d = e.currentTarget.duration;
            if (Number.isFinite(d) && d > 0) setRealDuration(Math.round(d));
          }}
          onTimeUpdate={e => {
            const a = e.currentTarget;
            if (a.duration && Number.isFinite(a.duration)) setProgress((a.currentTime / a.duration) * 100);
          }}
          onEnded={() => { setPlaying(false); setProgress(0); }}
          onError={() => setError(true)}
        />
      )}
      <button onClick={toggle} disabled={error} style={{ width:36, height:36, borderRadius:'50%', border:'none', cursor:error?'not-allowed':'pointer', flexShrink:0, background: from==='me'?'rgba(255,255,255,.18)':'var(--accent-light)', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <Ico d={playing ? 'M10 9v6M14 9v6' : 'M5 3l14 9-14 9V3z'} size={16} stroke={from==='me'?'#fff':'var(--accent)'} sw={2} />
      </button>
      <div className="msg-voice-bars">
        {bars.map((h, i) => (
          <div key={i} className="msg-voice-bar" style={{ height:`${Math.min(h,28)}px`, background:(i/bars.length*100)<progress?accent:dim }} />
        ))}
      </div>
      <span style={{ fontSize:11, fontWeight:600, color:from==='me'?'rgba(255,255,255,.7)':'var(--text-muted)', flexShrink:0 }}>
        {error ? 'ошибка' : fmt(realDuration)}
      </span>
    </div>
  );
}

/* ─── EMOJI REACTION POPUP ─── */
function EmojiReactionPopup({ x, y, onReact, onClose }: {
  x: number; y: number; onReact: (emoji: string) => void; onClose: () => void;
}) {
  useEffect(() => {
    const h = (e: MouseEvent) => { if (!(e.target as Element).closest('.msg-emoji-popup')) onClose(); };
    setTimeout(() => window.addEventListener('mousedown', h), 100);
    return () => window.removeEventListener('mousedown', h);
  }, [onClose]);

  const width = 326;
  const left = Math.max(10, Math.min(x - 38, window.innerWidth - width - 10));
  const top  = Math.max(10, y - 58);

  return (
    <div className="msg-emoji-popup" style={{ left, top }}>
      {QUICK_EMOJIS.map(e => (
        <button key={e} className="msg-emoji-btn" onMouseDown={() => { onReact(e); onClose(); }} aria-label={`Реакция ${e}`}>{e}</button>
      ))}
      <div style={{ width:1, height:26, background:'#E6ECF3', margin:'0 5px' }} />
      <button className="msg-emoji-btn msg-emoji-more" onMouseDown={() => { onReact('👍'); onClose(); }} aria-label="Ещё реакции">
        <Ico d="M12 5v14M5 12h14" size={18} stroke="currentColor" sw={2.4} />
      </button>
    </div>
  );
}


/* ─── STICKER PANEL ─── */
function StickerPanel({ onSend, onClose }: { onSend: (emoji: string) => void; onClose: () => void; }) {
  const [packIdx, setPackIdx] = useState(0);
  const [query, setQuery] = useState('');
  const pack = STICKER_PACKS[packIdx];
  const stickers = pack.stickers.filter(s => !query.trim() || s.includes(query.trim()));

  useEffect(() => {
    const close = (e: MouseEvent) => { if (!(e.target as Element).closest('.msg-sticker-panel')) onClose(); };
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    setTimeout(() => window.addEventListener('mousedown', close), 100);
    window.addEventListener('keydown', esc);
    return () => { window.removeEventListener('mousedown', close); window.removeEventListener('keydown', esc); };
  }, [onClose]);

  return (
    <div className="msg-sticker-panel" onMouseDown={e => e.stopPropagation()}>
      <div className="msg-sticker-search">
        <Ico d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" size={15} stroke="#8B98A8" />
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Поиск стикеров"
          style={{ flex:1, border:'none', outline:'none', background:'transparent', fontSize:13, fontFamily:'var(--font)', color:'#526274', fontWeight:600 }} />
      </div>
      <div className="msg-sticker-title">
        <span>{pack.name}</span>
        <button onClick={onClose} style={{ border:'none', background:'transparent', cursor:'pointer', color:'#8B98A8', display:'flex', alignItems:'center' }} aria-label="Закрыть стикеры">
          <Ico d="M6 18L18 6M6 6l12 12" size={16} stroke="currentColor" sw={2} />
        </button>
      </div>
      <div className="msg-sticker-grid">
        {stickers.map((s, i) => (
          <button key={`${pack.id}-${s}-${i}`} className="msg-sticker-btn" onClick={() => { onSend(s); onClose(); }} aria-label={`Стикер ${s}`}>{s}</button>
        ))}
      </div>
      <div className="msg-sticker-tabs">
        {STICKER_PACKS.map((p, i) => (
          <button key={p.id} onClick={() => { setPackIdx(i); setQuery(''); }} className={`msg-sticker-tab${i===packIdx?' active':''}`} aria-label={p.name}>{p.icon}</button>
        ))}
      </div>
    </div>
  );
}

function getProfileMedia(user: ChatUser, count = 12) {
  const seed = user.coverSeed ?? String(user.id);
  return Array.from({ length: count }, (_, i) => {
    const suffix = ['alpha','bravo','charlie','delta','echo','foxtrot','golf','hotel','india','juliet','kilo','lima'][i] ?? String(i);
    return {
      id: `${user.id}-${suffix}`,
      name: `${user.name} · медиа ${i + 1}`,
      thumb: `https://picsum.photos/seed/${seed}-${suffix}/220/220`,
      url: `https://picsum.photos/seed/${seed}-${suffix}/1200/850`,
    };
  });
}

/* ─── PROFILE MODAL ─── */
function ProfileModal({ user, onClose, onCall, onMessage, onOpenMedia, onOpenGallery }: {
  user: ChatUser; onClose: () => void; onCall: (kind: CallKind) => void; onMessage: () => void;
  onOpenMedia: (url: string, name?: string) => void; onOpenGallery: () => void;
}) {
  const media = getProfileMedia(user, 12);
  const avatarUrl = `https://i.pravatar.cc/300?img=${user.avatar.includes('img=') ? user.avatar.split('img=')[1] : '33'}`;
  const coverUrl = `https://picsum.photos/seed/${user.coverSeed ?? user.id}/1200/420`;
  return (
    <div className="msg-profile-overlay" onClick={onClose}>
      <div className="msg-profile-modal" onClick={e => e.stopPropagation()}>
        {/* Cover */}
        <div style={{ position:'relative' }}>
          <img
            src={coverUrl}
            alt="" className="msg-profile-cover" onClick={() => onOpenMedia(coverUrl, `${user.name} · обложка`)} style={{ cursor:'zoom-in' }}
            onError={e => { const t = e.target as HTMLImageElement; t.style.background='linear-gradient(135deg,var(--navy-700),var(--navy-500))'; t.style.display='block'; }}
          />
          <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom, rgba(5,13,24,.08) 0%, rgba(5,13,24,.16) 38%, rgba(5,13,24,.82) 100%)', pointerEvents:'none' }} />
          <div style={{ position:'absolute', left:18, right:58, bottom:18, display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ minWidth:0, padding:'10px 12px', borderRadius:16, background:'rgba(5,13,24,.46)', border:'1px solid rgba(255,255,255,.14)', backdropFilter:'blur(12px)', boxShadow:'0 10px 28px rgba(0,0,0,.22)' }}>
              <div style={{ fontSize:22, fontWeight:900, color:'#fff', lineHeight:1.05, textShadow:'0 2px 10px rgba(0,0,0,.35)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user.name}</div>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:5, flexWrap:'wrap' }}>
                {user.login && <span style={{ fontSize:12, color:'rgba(255,255,255,.82)', fontWeight:700 }}>@{user.login}</span>}
                {user.rank && <span style={{ fontSize:12, color:'#BFD9FF', fontWeight:800 }}>{user.rank}</span>}
                <span style={{ fontSize:12, color: user.online ? '#60D394' : 'rgba(255,255,255,.68)', fontWeight:700 }}>{user.online ? '● в сети' : `был(а) ${user.lastSeen ?? 'давно'}`}</span>
              </div>
            </div>
          </div>
          {/* Close btn */}
          <button onClick={onClose} style={{ position:'absolute', top:12, right:12, width:34, height:34, borderRadius:12, background:'rgba(0,0,0,.38)', border:'1px solid rgba(255,255,255,.12)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', backdropFilter:'blur(10px)' }}>
            <Ico d="M6 18L18 6M6 6l12 12" size={16} stroke="#fff" sw={2.2} />
          </button>
        </div>

        {/* Avatar + info */}
        <div style={{ padding:'0 24px 0', position:'relative', zIndex:1 }}>
          <div style={{ display:'flex', alignItems:'center', gap:14, marginTop:-23, marginBottom:16, padding:'12px', borderRadius:20, background:'#fff', boxShadow:'0 14px 34px rgba(13,27,42,.12)', border:'1px solid rgba(221,227,238,.9)' }}>
            <div className="msg-profile-avatar" onClick={() => onOpenMedia(avatarUrl, `${user.name} · аватар`)} style={{ cursor:'zoom-in', flexShrink:0 }}>
              <img src={avatarUrl}
                alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}
                onError={e => { (e.target as HTMLImageElement).style.display='none'; }} />
            </div>
            <div style={{ minWidth:0 }}>
              <div style={{ fontSize:20, fontWeight:900, color:'var(--text-primary)', lineHeight:1.12, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user.name}</div>
              <div style={{ display:'flex', alignItems:'center', gap:6, flexWrap:'wrap', marginTop:4 }}>
                {user.login && <span style={{ fontSize:12, color:'var(--accent)', fontWeight:800 }}>@{user.login}</span>}
                {user.rank && <span style={{ fontSize:12, color:'var(--text-secondary)', fontWeight:700 }}>{user.rank}</span>}
              </div>
              <div style={{ fontSize:12, color: user.online ? 'var(--success)' : 'var(--text-muted)', marginTop:4, fontWeight:700 }}>
                {user.online ? '● В сети' : `Был(а) ${user.lastSeen ?? 'давно'}`}
              </div>
            </div>
          </div>

          {/* Bio */}
          {user.bio && (
            <p style={{ fontSize:13, color:'var(--text-secondary)', lineHeight:1.6, marginBottom:12 }}>{user.bio}</p>
          )}
          <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:16 }}>
            {user.role && <span className="msg-profile-chip">
              <Ico d="M12 2l7 7-7 13L5 9l7-7Zm0 4-3 7 7-4-4-3Z" size={13} stroke="currentColor" sw={1.8} />
              {user.role}
            </span>}
            {user.location && <span className="msg-profile-chip">{user.location}</span>}
            {user.joined && <span className="msg-profile-chip">с {user.joined}</span>}
          </div>

          {/* Stats */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:16 }}>
            {[
              { label:'Рейтинг', value: user.rating ? `${user.rating} ★` : '—' },
              { label:'Миссий', value: user.missions ?? '—' },
              { label:'Позывной', value: user.callsign },
            ].map((s, i) => (
              <div key={i} style={{ background:'var(--surface)', borderRadius:12, padding:'12px 10px', textAlign:'center' }}>
                <div style={{ fontSize:15, fontWeight:800, color:'var(--text-primary)' }}>{s.value}</div>
                <div style={{ fontSize:10, color:'var(--text-muted)', fontWeight:600, textTransform:'uppercase', letterSpacing:'.4px', marginTop:2 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Details */}
          {user.unit && (
            <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 0', borderTop:'1px solid var(--border)' }}>
              <Ico d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" size={16} stroke="var(--text-muted)" />
              <span style={{ fontSize:13, color:'var(--text-secondary)' }}>{user.unit}</span>
            </div>
          )}

          {user.skills && user.skills.length > 0 && (
            <div style={{ paddingTop:14, borderTop:'1px solid var(--border)', marginTop:8, marginBottom:14 }}>
              <div style={{ fontSize:12, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'.5px', marginBottom:8 }}>Навыки</div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                {user.skills.map(skill => <span key={skill} className="msg-profile-chip">{skill}</span>)}
              </div>
            </div>
          )}

          {/* Media grid */}
          <div style={{ paddingTop:16, borderTop:'1px solid var(--border)', marginTop:8 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
              <span style={{ fontSize:12, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'.5px' }}>Медиа</span>
              <button onClick={onOpenGallery} style={{ fontSize:12, color:'var(--accent)', fontWeight:700, cursor:'pointer', border:'none', background:'transparent', fontFamily:'var(--font)' }}>Все →</button>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:6, marginBottom:20 }}>
              {media.slice(0, 6).map((item, i) => (
                <button key={item.id} className="msg-media-thumb" onClick={() => onOpenMedia(item.url, item.name)} style={{ border:'none', padding:0 }}>
                  <img src={item.thumb} alt={item.name}
                    style={{ width:'100%', height:'100%', objectFit:'cover' }}
                    onError={e => { const t = e.currentTarget; t.style.background=`hsl(${210+i*12},30%,${86-i*3}%)`; t.style.display='block'; }} />
                </button>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display:'flex', gap:10, padding:'0 0 24px' }}>
            <button onClick={() => { onMessage(); onClose(); }} style={{ flex:1, padding:'12px', background:'var(--accent)', border:'none', borderRadius:14, color:'#fff', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'var(--font)', display:'flex', alignItems:'center', justifyContent:'center', gap:8, transition:'background .15s' }}
              onMouseEnter={e => (e.currentTarget.style.background='var(--accent-2)')}
              onMouseLeave={e => (e.currentTarget.style.background='var(--accent)')}>
              <Ico d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" size={16} stroke="#fff" />
              Написать
            </button>
            <button onClick={() => { onCall('audio'); onClose(); }} style={{ flex:1, padding:'12px', background:'var(--success-bg)', border:'1.5px solid var(--success)', borderRadius:14, color:'var(--success)', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'var(--font)', display:'flex', alignItems:'center', justifyContent:'center', gap:8, transition:'all .15s' }}
              onMouseEnter={e => { e.currentTarget.style.background='var(--success)'; e.currentTarget.style.color='#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.background='var(--success-bg)'; e.currentTarget.style.color='var(--success)'; }}>
              <Ico d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 014.69 13a19.79 19.79 0 01-3.07-8.67A2 2 0 013.6 2.22h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L7.91 9.91A16 16 0 0014.09 16l.95-.95a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" size={16} stroke="currentColor" />
              Аудио
            </button>
            <button onClick={() => { onCall('video'); onClose(); }} style={{ flex:1, padding:'12px', background:'var(--accent-light)', border:'1.5px solid var(--accent)', borderRadius:14, color:'var(--accent)', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'var(--font)', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
              <Ico d="M23 7l-7 5 7 5V7zM1 5h15v14H1z" size={16} stroke="currentColor" />
              Видео
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── IMAGE LIGHTBOX ─── */
function ImageLightbox({ url, name, onClose }: { url: string; name?: string; onClose: () => void; }) {
  const [scale, setScale] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [drag, setDrag] = useState<{ x: number; y: number; px: number; py: number } | null>(null);

  const clampScale = (v: number) => Math.min(5, Math.max(0.65, Number(v.toFixed(2))));
  const resetZoom = () => { setScale(1); setPos({ x: 0, y: 0 }); };
  const zoomBy = (delta: number) => setScale(v => clampScale(v + delta));

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '=')) { e.preventDefault(); zoomBy(.25); }
      if ((e.ctrlKey || e.metaKey) && e.key === '-') { e.preventDefault(); zoomBy(-.25); }
      if ((e.ctrlKey || e.metaKey) && e.key === '0') { e.preventDefault(); resetZoom(); }
    };
    window.addEventListener('keydown', h, { passive:false });
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const delta = e.deltaY < 0 ? 0.18 : -0.18;
    setScale(v => {
      const next = clampScale(v + delta);
      if (next <= 1) setPos({ x: 0, y: 0 });
      return next;
    });
  };

  const onPointerMove = (e: React.PointerEvent<HTMLImageElement>) => {
    if (!drag) return;
    e.preventDefault();
    setPos({ x: drag.px + e.clientX - drag.x, y: drag.py + e.clientY - drag.y });
  };

  return (
    <div className="msg-lightbox" onClick={onClose} onWheel={handleWheel} style={{ overscrollBehavior:'contain', touchAction:'none' }}>
      {/* Toolbar */}
      <div style={{ position:'fixed', top:0, left:0, right:0, padding:'16px 20px', display:'flex', justifyContent:'space-between', alignItems:'center', background:'linear-gradient(to bottom,rgba(0,0,0,.6),transparent)', zIndex:10 }}
        onClick={e => e.stopPropagation()} onWheel={handleWheel}>
        <div>
          <span style={{ fontSize:13, color:'rgba(255,255,255,.86)', fontFamily:'var(--font)', fontWeight:600 }}>{name ?? 'Изображение'}</span>
          <div style={{ fontSize:11, color:'rgba(255,255,255,.5)', marginTop:3 }}>Колесико / Ctrl+колесико — масштаб фото, перетаскивание — сдвиг</div>
        </div>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          <button onClick={() => zoomBy(-.25)} style={{ width:36, height:36, borderRadius:10, background:'rgba(255,255,255,.12)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff' }} title="Уменьшить фото">
            <Ico d="M21 21l-6-6m-2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" size={16} stroke="#fff" />
          </button>
          <button onClick={() => zoomBy(.25)} style={{ width:36, height:36, borderRadius:10, background:'rgba(255,255,255,.12)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff' }} title="Увеличить фото">
            <Ico d="M21 21l-6-6m-2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" size={16} stroke="#fff" />
          </button>
          <button onClick={resetZoom} style={{ minWidth:54, height:36, borderRadius:10, background:'rgba(255,255,255,.12)', border:'none', cursor:'pointer', color:'#fff', fontSize:12, fontWeight:800 }} title="Сбросить масштаб">
            {Math.round(scale * 100)}%
          </button>
          <button onClick={onClose} style={{ width:36, height:36, borderRadius:10, background:'rgba(255,255,255,.12)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff' }}>
            <Ico d="M6 18L18 6M6 6l12 12" size={18} stroke="#fff" sw={2} />
          </button>
        </div>
      </div>
      <img
        src={url}
        alt={name}
        draggable={false}
        onClick={e => { e.stopPropagation(); zoomBy(scale > 1 ? -.5 : .75); }}
        onPointerDown={e => { e.stopPropagation(); (e.currentTarget as HTMLImageElement).setPointerCapture(e.pointerId); setDrag({ x:e.clientX, y:e.clientY, px:pos.x, py:pos.y }); }}
        onPointerMove={onPointerMove}
        onPointerUp={e => { e.stopPropagation(); setDrag(null); }}
        onPointerCancel={() => setDrag(null)}
        style={{
          maxWidth:'88vw', maxHeight:'84vh', borderRadius: scale > 1 ? 4 : 12, objectFit:'contain',
          cursor: drag ? 'grabbing' : (scale > 1 ? 'grab' : 'zoom-in'),
          transform:`translate3d(${pos.x}px, ${pos.y}px, 0) scale(${scale})`,
          transformOrigin:'center center', transition: drag ? 'none' : 'transform .14s ease, border-radius .14s ease',
          willChange:'transform', userSelect:'none', touchAction:'none'
        }}
      />
    </div>
  );
}

function MediaGallery({ user, onClose, onOpenMedia }: { user: ChatUser; onClose: () => void; onOpenMedia: (url: string, name?: string) => void; }) {
  const media = getProfileMedia(user, 18);
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  return (
    <div className="msg-profile-overlay" onClick={onClose}>
      <div className="msg-forward-modal" onClick={e => e.stopPropagation()} style={{ maxWidth:760, maxHeight:'86vh' }}>
        <div style={{ padding:'18px 20px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, background:'#fff', zIndex:1 }}>
          <div>
            <div style={{ fontSize:16, fontWeight:800, color:'var(--text-primary)' }}>Все медиа</div>
            <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:2 }}>{user.name} · {media.length} фото</div>
          </div>
          <button onClick={onClose} className="msg-icon-btn" style={{ width:34, height:34 }}>
            <Ico d="M6 18L18 6M6 6l12 12" size={18} stroke="currentColor" sw={2} />
          </button>
        </div>
        <div style={{ padding:16, display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(120px, 1fr))', gap:10 }}>
          {media.map((item, i) => (
            <button key={item.id} onClick={() => onOpenMedia(item.url, item.name)} className="msg-media-thumb" style={{ width:'100%', height:128, border:'none', padding:0 }}>
              <img src={item.thumb} alt={item.name} style={{ width:'100%', height:'100%', objectFit:'cover' }}
                onError={e => { const t = e.currentTarget; t.style.background=`hsl(${210+i*9},30%,${88-(i%6)*3}%)`; t.style.display='block'; }} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── CONTEXT MENU ─── */
interface CtxItem { label: string; icon: string; action: () => void; danger?: boolean; divider?: boolean; }
function ContextMenu({ x, y, items, onClose }: { x: number; y: number; items: CtxItem[]; onClose: () => void; }) {
  useEffect(() => {
    const close = () => onClose();
    window.addEventListener('mousedown', close, true);
    return () => window.removeEventListener('mousedown', close, true);
  }, [onClose]);
  const adjusted = { left: Math.min(x, window.innerWidth-200), top: Math.min(y, window.innerHeight-(items.length*46)) };
  return (
    <div className="msg-context" style={{ left:adjusted.left, top:adjusted.top }}>
      {items.map((item, i) => (
        <div key={i}>
          {item.divider && <div style={{ height:1, background:'var(--border)', margin:'4px 0' }} />}
          <button className={`msg-context-item${item.danger?' danger':''}`}
            onMouseDown={e => { e.stopPropagation(); item.action(); onClose(); }}>
            <Ico d={item.icon} size={15} stroke="currentColor" />
            {item.label}
          </button>
        </div>
      ))}
    </div>
  );
}

/* ─── REAL WEBRTC CALL MODAL ─── */
function IncomingCallBanner({ call, onAccept, onDecline }: {
  call: IncomingCallState; onAccept: () => void; onDecline: () => void;
}) {
  return (
    <div className="msg-call-overlay" onClick={onDecline}>
      <div className="msg-call-modal" onClick={e => e.stopPropagation()}>
        {[0,.7,1.4].map((d, i) => <div key={i} className="msg-call-wave" style={{ width:200, height:200, top:'50%', left:'50%', transform:'translate(-50%,-50%)', animationDelay:`${d}s` }} />)}
        <div className="msg-call-avatar">
          {call.chat.isGroup ? <Ico d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" size={38} stroke="rgba(255,255,255,.72)" />
            : <img src={call.chat.avatar} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />}
        </div>
        <div style={{ fontSize:20, fontWeight:800, color:'#fff', marginBottom:4, position:'relative', zIndex:1 }}>{call.chat.name}</div>
        <div style={{ fontSize:13, color:'rgba(255,255,255,.62)', marginBottom:30, position:'relative', zIndex:1 }}>
          Входящий {call.kind === 'video' ? 'видео-звонок' : 'аудио-звонок'}
        </div>
        <div style={{ display:'flex', gap:18, justifyContent:'center', position:'relative', zIndex:1 }}>
          <button className="msg-call-btn end" onClick={e => { e.stopPropagation(); onDecline(); }} title="Отклонить">
            <Ico d="M16.72 11.06A10.94 10.94 0 0119 12.55M5 19l14-14m0 0L5 19m14-14l-4.73 4.73A10.89 10.89 0 0112.3 5c-3.92-.07-7.6 2-9.3 5.2L1 13" size={24} stroke="#fff" sw={1.8} />
          </button>
          <button className="msg-call-btn accept" onClick={onAccept} title="Принять">
            <Ico d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 014.69 13a19.79 19.79 0 01-3.07-8.67A2 2 0 013.6 2.22h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L7.91 9.91A16 16 0 0014.09 16l.95-.95a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" size={24} stroke="#fff" sw={1.8} />
          </button>
        </div>
      </div>
    </div>
  );
}

function CallModal({ chat, kind, mode, socket, selfUserId, remoteUserId, initialOffer, onClose }: {
  chat: ChatUser;
  kind: CallKind;
  mode: CallMode;
  socket: Socket | null;
  selfUserId: string;
  remoteUserId: string;
  initialOffer?: RTCSessionDescriptionInit;
  onClose: () => void;
}) {
  const [state, setState] = useState<'calling' | 'connected'>('calling');
  const [muted, setMuted] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [screenOn, setScreenOn] = useState(false);
  const [permissionError, setPermissionError] = useState('');
  const [callNotice, setCallNotice] = useState('');
  const [seconds, setSeconds] = useState(0);
  const [remoteStreamReady, setRemoteStreamReady] = useState(false);
  const [screenExpanded, setScreenExpanded] = useState(false);
  const [screenPipOn, setScreenPipOn] = useState(false);
  const [screenPreviewHidden, setScreenPreviewHidden] = useState(false);
  const [miniPos, setMiniPos] = useState({ x: 22, y: 112 });
  const [miniDragging, setMiniDragging] = useState(false);
  const [minimized, setMinimized] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const screenPreviewRef = useRef<HTMLVideoElement | null>(null);
  const screenExpandedVideoRef = useRef<HTMLVideoElement | null>(null);
  const screenFloatingVideoRef = useRef<HTMLVideoElement | null>(null);
  const screenPipVideoRef = useRef<HTMLVideoElement | null>(null);
  const expandedLocalVideoRef = useRef<HTMLVideoElement | null>(null);
  const expandedRemoteVideoRef = useRef<HTMLVideoElement | null>(null);

  const peerRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream>(new MediaStream());
  const remoteStreamRef = useRef<MediaStream>(new MediaStream());
  const screenStreamRef = useRef<MediaStream | null>(null);
  const cameraTrackRef = useRef<MediaStreamTrack | null>(null);
  const audioTrackRef = useRef<MediaStreamTrack | null>(null);
  const screenTrackRef = useRef<MediaStreamTrack | null>(null);
  const ownedStreamsRef = useRef<Set<MediaStream>>(new Set());
  const ownedTracksRef = useRef<Set<MediaStreamTrack>>(new Set());
  const screenIsCurrentTabRef = useRef(false);
  const screenOnRef = useRef(false);
  const cameraOnRef = useRef(false);
  const closedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedRef = useRef(false);
  const startupRunIdRef = useRef(0);
  const miniDragRef = useRef<{ startX: number; startY: number; startPosX: number; startPosY: number } | null>(null);

  const mediaDevices = typeof navigator !== 'undefined'
    ? (navigator as Navigator & { mediaDevices?: MediaDevices }).mediaDevices
    : undefined;
  const hasGetUserMedia = typeof mediaDevices?.getUserMedia === 'function';
  const hasGetDisplayMedia = typeof (mediaDevices as (MediaDevices & { getDisplayMedia?: unknown }) | undefined)?.getDisplayMedia === 'function';
  const hasPictureInPicture = typeof document !== 'undefined'
    && 'pictureInPictureEnabled' in document
    && Boolean((document as Document & { pictureInPictureEnabled?: boolean }).pictureInPictureEnabled)
    && typeof HTMLVideoElement !== 'undefined'
    && 'requestPictureInPicture' in HTMLVideoElement.prototype;

  const fmt = (s: number) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
  const avatarImg = chat.avatar || `https://i.pravatar.cc/200?img=33`;

  const setTemporaryError = (text: string) => {
    setPermissionError(text);
    window.setTimeout(() => setPermissionError(prev => prev === text ? '' : prev), 4200);
  };

  const registerStream = (stream: MediaStream | null) => {
    if (!stream) return stream;
    ownedStreamsRef.current.add(stream);
    stream.getTracks().forEach(track => ownedTracksRef.current.add(track));
    return stream;
  };

  const registerTrack = (track: MediaStreamTrack | null | undefined) => {
    if (track) ownedTracksRef.current.add(track);
    return track;
  };

  const stopTrackHard = (track: MediaStreamTrack | null | undefined) => {
    if (!track) return;
    try { track.enabled = false; } catch {}
    try { track.onended = null; } catch {}
    try { track.stop(); } catch {}
    ownedTracksRef.current.delete(track);
  };

  const stopStreamHard = (stream: MediaStream | null | undefined) => {
    if (!stream) return;
    stream.getTracks().forEach(stopTrackHard);
    ownedStreamsRef.current.delete(stream);
  };

  const clearVideo = (node: HTMLVideoElement | null) => {
    if (!node) return;
    try { node.pause(); } catch {}
    try { node.srcObject = null; } catch {}
    try { node.removeAttribute('src'); } catch {}
    try { node.load(); } catch {}
  };

  const bindVideos = () => {
    const local = localStreamRef.current;
    const remote = remoteStreamRef.current;
    const screen = screenStreamRef.current;
    if (localVideoRef.current) localVideoRef.current.srcObject = cameraTrackRef.current ? local : null;
    if (expandedLocalVideoRef.current) expandedLocalVideoRef.current.srcObject = cameraTrackRef.current ? local : null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remote;
    if (expandedRemoteVideoRef.current) expandedRemoteVideoRef.current.srcObject = remote;
    if (screenPreviewRef.current) screenPreviewRef.current.srcObject = screenIsCurrentTabRef.current ? null : screen;
    if (screenExpandedVideoRef.current) screenExpandedVideoRef.current.srcObject = screenIsCurrentTabRef.current ? null : screen;
    if (screenFloatingVideoRef.current) screenFloatingVideoRef.current.srcObject = screenIsCurrentTabRef.current ? null : screen;
    if (screenPipVideoRef.current) screenPipVideoRef.current.srcObject = screenIsCurrentTabRef.current ? null : screen;
  };

  const findVideoSender = () => {
    const peer = peerRef.current;
    if (!peer) return null;
    return peer.getSenders().find(s => s.track === screenTrackRef.current || s.track === cameraTrackRef.current || s.track?.kind === 'video' || s.track === null) ?? null;
  };

  const ensureVideoSender = () => {
    const peer = peerRef.current;
    if (!peer) return null;
    const existing = findVideoSender();
    if (existing) return existing;
    const transceiver = peer.addTransceiver('video', { direction: 'sendrecv' });
    return transceiver.sender;
  };

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
  };

  const createPeer = () => {
    const peer = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    });
    peer.onicecandidate = e => {
      if (e.candidate) socket?.emit('call:ice-candidate', { from: selfUserId, to: remoteUserId, candidate: e.candidate.toJSON() });
    };
    peer.ontrack = e => {
      e.streams[0]?.getTracks().forEach(track => {
        registerTrack(track);
        if (!remoteStreamRef.current.getTracks().some(t => t.id === track.id)) remoteStreamRef.current.addTrack(track);
      });
      setRemoteStreamReady(remoteStreamRef.current.getTracks().length > 0);
      setState('connected');
      bindVideos();
    };
    peer.onconnectionstatechange = () => {
      if (peer.connectionState === 'connected') { setState('connected'); startTimer(); }
      if (['failed','disconnected'].includes(peer.connectionState) && !closedRef.current) {
        setCallNotice('Связь с собеседником потеряна, но камера и демонстрация доступны локально.');
      }
    };
    peerRef.current = peer;
    return peer;
  };

  const cleanupCallMedia = () => {
    screenOnRef.current = false;
    cameraOnRef.current = false;

    try { peerRef.current?.getSenders().forEach(sender => { try { void sender.replaceTrack(null); } catch {}; }); } catch {}
    try { peerRef.current?.getTransceivers().forEach(t => { try { void t.sender.replaceTrack(null); } catch {}; try { t.stop(); } catch {}; }); } catch {}

    stopTrackHard(cameraTrackRef.current);
    stopTrackHard(audioTrackRef.current);
    stopTrackHard(screenTrackRef.current);
    stopStreamHard(screenStreamRef.current);
    stopStreamHard(localStreamRef.current);
    stopStreamHard(remoteStreamRef.current);
    ownedStreamsRef.current.forEach(stopStreamHard);
    ownedTracksRef.current.forEach(stopTrackHard);
    ownedStreamsRef.current.clear();
    ownedTracksRef.current.clear();

    cameraTrackRef.current = null;
    audioTrackRef.current = null;
    screenTrackRef.current = null;
    screenStreamRef.current = null;
    localStreamRef.current = new MediaStream();
    remoteStreamRef.current = new MediaStream();
    screenIsCurrentTabRef.current = false;

    clearVideo(localVideoRef.current);
    clearVideo(remoteVideoRef.current);
    void exitScreenPip();
    clearVideo(screenPreviewRef.current);
    clearVideo(screenExpandedVideoRef.current);
    clearVideo(screenFloatingVideoRef.current);
    clearVideo(screenPipVideoRef.current);
    clearVideo(expandedLocalVideoRef.current);
    clearVideo(expandedRemoteVideoRef.current);

    setCameraOn(false);
    setScreenOn(false);
    setScreenExpanded(false);
    setScreenPipOn(false);
    setScreenPreviewHidden(false);
    setRemoteStreamReady(false);
  };

  const minimizeCall = () => {
    setScreenExpanded(false);
    setMinimized(true);
    requestAnimationFrame(bindVideos);
  };

  const restoreCall = () => {
    setMinimized(false);
    requestAnimationFrame(bindVideos);
  };

  useEffect(() => {
    const h = () => restoreCall();
    window.addEventListener('messages:restore-active-call', h);
    return () => window.removeEventListener('messages:restore-active-call', h);
  }, []);

  const handleClose = (notify = true) => {
    if (closedRef.current) { onClose(); return; }
    closedRef.current = true;
    try { sounds.stopRinging(); } catch {}
    try { sounds.playCallEnd(); } catch {}
    try { if (notify) socket?.emit('call:end', { from: selfUserId, to: remoteUserId }); } catch {}
    try { if (timerRef.current) clearInterval(timerRef.current); } catch {}
    try { cleanupCallMedia(); } catch {}
    try { peerRef.current?.close(); } catch {}
    peerRef.current = null;
    onClose();
  };

  const attachAudioIfPossible = async () => {
    if (!hasGetUserMedia || !mediaDevices || audioTrackRef.current) return;
    try {
      const stream = registerStream(await mediaDevices.getUserMedia({ audio: true, video: false }))!;
      if (closedRef.current) { stopStreamHard(stream); return; }
      const track = registerTrack(stream.getAudioTracks()[0]);
      if (!track) return;
      track.enabled = !muted;
      audioTrackRef.current = track;
      localStreamRef.current.addTrack(track);
      const peer = peerRef.current;
      if (peer) peer.addTrack(track, localStreamRef.current);
    } catch {
      // Микрофон не должен ломать камеру и демонстрацию.
      setCallNotice('Микрофон недоступен или запрещён, но камера и демонстрация могут работать.');
    }
  };

  const startCamera = async () => {
    if (closedRef.current) return;
    setPermissionError('');
    if (!hasGetUserMedia || !mediaDevices) {
      setTemporaryError('Браузер не дал доступ к камере. Нужен HTTPS/localhost и разрешение камеры.');
      return;
    }
    try {
      const stream = registerStream(await mediaDevices.getUserMedia({ video: true, audio: false }))!;
      if (closedRef.current) { stopStreamHard(stream); return; }
      const track = registerTrack(stream.getVideoTracks()[0]);
      if (!track) throw new Error('no video track');
      stopTrackHard(cameraTrackRef.current);
      cameraTrackRef.current = track;
      localStreamRef.current.getVideoTracks().forEach(t => localStreamRef.current.removeTrack(t));
      localStreamRef.current.addTrack(track);
      cameraOnRef.current = true;
      setCameraOn(true);
      if (!screenOnRef.current) {
        const sender = ensureVideoSender();
        try { await sender?.replaceTrack(track); } catch {}
      }
      bindVideos();
    } catch {
      cameraOnRef.current = false;
      setCameraOn(false);
      setTemporaryError('Камера не включилась. Проверь разрешение камеры в браузере и что камера не занята другой программой.');
    }
  };

  const stopCamera = async () => {
    const track = cameraTrackRef.current;
    cameraTrackRef.current = null;
    cameraOnRef.current = false;
    setCameraOn(false);
    localStreamRef.current.getVideoTracks().forEach(t => {
      localStreamRef.current.removeTrack(t);
      if (t === track) stopTrackHard(t);
    });
    stopTrackHard(track);
    if (!screenOnRef.current) {
      try { await findVideoSender()?.replaceTrack(null); } catch {}
    }
    bindVideos();
  };

  const toggleCamera = async () => {
    if (cameraOnRef.current) await stopCamera();
    else await startCamera();
  };

  const stopScreenShare = async () => {
    const stream = screenStreamRef.current;
    const track = screenTrackRef.current;
    screenStreamRef.current = null;
    screenTrackRef.current = null;
    screenIsCurrentTabRef.current = false;
    screenOnRef.current = false;
    setScreenOn(false);
    setScreenExpanded(false);
    setScreenPipOn(false);
    setScreenPreviewHidden(false);
    await exitScreenPip();

    const sender = findVideoSender();
    try { await sender?.replaceTrack(cameraTrackRef.current ?? null); } catch {}
    stopTrackHard(track);
    stopStreamHard(stream);
    clearVideo(screenPreviewRef.current);
    clearVideo(screenExpandedVideoRef.current);
    clearVideo(screenFloatingVideoRef.current);
    clearVideo(screenPipVideoRef.current);
    bindVideos();
  };

  const startScreenShare = async () => {
    if (closedRef.current) return;
    setPermissionError('');
    if (!window.isSecureContext && window.location.hostname !== 'localhost') {
      setTemporaryError('Демонстрация экрана работает только на HTTPS или localhost.');
      return;
    }
    if (!hasGetDisplayMedia || !mediaDevices) {
      setTemporaryError('Этот браузер не поддерживает демонстрацию экрана.');
      return;
    }
    try {
      const getDisplayMedia = (mediaDevices as MediaDevices & { getDisplayMedia: (constraints?: DisplayMediaStreamOptions) => Promise<MediaStream> }).getDisplayMedia.bind(mediaDevices);
      const displayConstraints = {
        video: {
          displaySurface: 'monitor',
          cursor: 'always',
        },
        audio: false,
        preferCurrentTab: false,
        selfBrowserSurface: 'exclude',
        surfaceSwitching: 'include',
        monitorTypeSurfaces: 'include',
      } as DisplayMediaStreamOptions;
      const stream = registerStream(await getDisplayMedia(displayConstraints))!;
      if (closedRef.current) { stopStreamHard(stream); return; }
      const track = registerTrack(stream.getVideoTracks()[0]);
      if (!track) throw new Error('no screen track');
      await stopScreenShare();
      screenStreamRef.current = stream;
      screenTrackRef.current = track;
      const displaySurface = (track.getSettings?.() as MediaTrackSettings & { displaySurface?: string })?.displaySurface;
      screenIsCurrentTabRef.current = displaySurface === 'browser';
      screenOnRef.current = true;
      setScreenOn(true);
      setScreenPreviewHidden(false);
      setCallNotice('');
      const sender = ensureVideoSender();
      try { await sender?.replaceTrack(track); } catch {}
      track.addEventListener('ended', () => { if (!closedRef.current) void stopScreenShare(); }, { once:true });
      requestAnimationFrame(bindVideos);
    } catch {
      screenOnRef.current = false;
      setScreenOn(false);
      setTemporaryError('Демонстрация не включилась. Проверь разрешение браузера и попробуй выбрать окно или весь экран.');
    }
  };

  const toggleScreen = async () => {
    if (screenOnRef.current) await stopScreenShare();
    else await startScreenShare();
  };

  const openScreenFullscreen = () => {
    if (!screenOnRef.current) return;
    setScreenExpanded(true);
    requestAnimationFrame(bindVideos);
  };

  const exitScreenPip = async () => {
    try {
      const doc = document as Document & { pictureInPictureElement?: Element | null; exitPictureInPicture?: () => Promise<void> };
      if (doc.pictureInPictureElement && typeof doc.exitPictureInPicture === 'function') {
        await doc.exitPictureInPicture();
      }
    } catch {}
    setScreenPipOn(false);
  };

  const openScreenPip = async () => {
    const doc = document as Document & { pictureInPictureElement?: Element | null; exitPictureInPicture?: () => Promise<void> };

    // Повторное нажатие на ту же кнопку теперь работает как toggle:
    // если PiP уже открыт — закрываем его без сброса звонка и без остановки демонстрации.
    if (doc.pictureInPictureElement) {
      await exitScreenPip();
      setScreenPreviewHidden(false);
      setCallNotice('PiP закрыт. Встроенное превью снова доступно.');
      return;
    }

    if (!screenOnRef.current || !screenStreamRef.current) return;
    if (screenIsCurrentTabRef.current) {
      setTemporaryError('PiP скрыт для текущей вкладки, чтобы не создавать бесконечное зеркало. Выбери весь экран или отдельное окно.');
      return;
    }
    if (!hasPictureInPicture) {
      setTemporaryError('Этот браузер не поддерживает Picture-in-Picture для предпросмотра демонстрации.');
      return;
    }
    const node = screenPipVideoRef.current || screenFloatingVideoRef.current || screenPreviewRef.current;
    if (!node) return;
    try {
      node.srcObject = screenStreamRef.current;
      node.muted = true;
      node.playsInline = true;
      await node.play().catch(() => undefined);
      const video = node as HTMLVideoElement & { requestPictureInPicture?: () => Promise<unknown> };
      if (typeof video.requestPictureInPicture === 'function') {
        await video.requestPictureInPicture();
        setScreenPipOn(true);
        setScreenPreviewHidden(true);
        setCallNotice('PiP открыт. Встроенное превью скрыто, демонстрация продолжается.');
      }
    } catch {
      setTemporaryError('Не удалось открыть мини-окно. Нажми кнопку PiP ещё раз или проверь поддержку браузера.');
    }
  };

  const onMiniPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as Element).closest('button')) return;
    miniDragRef.current = { startX: e.clientX, startY: e.clientY, startPosX: miniPos.x, startPosY: miniPos.y };
    setMiniDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onMiniPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = miniDragRef.current;
    if (!drag) return;
    const nextX = Math.max(10, Math.min(window.innerWidth - 320, drag.startPosX - (e.clientX - drag.startX)));
    const nextY = Math.max(88, Math.min(window.innerHeight - 210, drag.startPosY - (e.clientY - drag.startY)));
    setMiniPos({ x: nextX, y: nextY });
  };

  const onMiniPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    miniDragRef.current = null;
    setMiniDragging(false);
    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch {}
  };

  useEffect(() => {
    // В React StrictMode эффект звонка в dev-сборке специально запускается,
    // сразу чистится и запускается повторно. Раньше из-за этого closedRef/startedRef
    // оставались в закрытом состоянии, поэтому кнопки камеры и экрана визуально
    // нажимались, но startCamera/startScreenShare мгновенно выходили по closedRef.
    const runId = startupRunIdRef.current + 1;
    startupRunIdRef.current = runId;
    closedRef.current = false;
    startedRef.current = true;
    sounds.startRinging();

    const isStale = () => closedRef.current || startupRunIdRef.current !== runId;

    const start = async () => {
      try {
        if (socket?.connected) {
          const peer = createPeer();
          ensureVideoSender();
          if (mode === 'incoming' && initialOffer) {
            await peer.setRemoteDescription(new RTCSessionDescription(initialOffer));
            if (isStale()) return;
            const answer = await peer.createAnswer();
            await peer.setLocalDescription(answer);
            if (isStale()) return;
            socket.emit('call:answer', { from: selfUserId, to: remoteUserId, answer });
          } else {
            const offer = await peer.createOffer();
            await peer.setLocalDescription(offer);
            if (isStale()) return;
            socket.emit('call:offer', { from: selfUserId, to: remoteUserId, kind, offer });
          }
        } else {
          if (isStale()) return;
          setCallNotice('Локальный режим: камера и демонстрация работают без signaling-сервера.');
        }
        if (isStale()) return;
        setState('connected');
        startTimer();
        void attachAudioIfPossible();
        if (kind === 'video') void startCamera();
      } catch {
        if (isStale()) return;
        setState('connected');
        startTimer();
        setCallNotice('Звонок открыт локально. Камеру и демонстрацию можно включить кнопками ниже.');
      } finally {
        if (!isStale()) sounds.stopRinging();
      }
    };
    void start();
    return () => {
      // Реальная размонтировка и dev-cleanup StrictMode должны гасить текущие tracks,
      // но не должны навсегда блокировать следующий запуск этого же компонента.
      closedRef.current = true;
      startedRef.current = false;
      sounds.stopRinging();
      if (timerRef.current) clearInterval(timerRef.current);
      cleanupCallMedia();
      try { peerRef.current?.close(); } catch {}
      peerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const cleanup = () => {
      try { cleanupCallMedia(); } catch {}
      try { peerRef.current?.close(); } catch {}
    };
    window.addEventListener('pagehide', cleanup);
    window.addEventListener('beforeunload', cleanup);
    return () => {
      window.removeEventListener('pagehide', cleanup);
      window.removeEventListener('beforeunload', cleanup);
    };
  }, []);

  useEffect(() => {
    if (!socket) return;
    const onAnswer = async (payload: CallSignalAnswer) => {
      if (payload.from !== remoteUserId || payload.to !== selfUserId) return;
      await peerRef.current?.setRemoteDescription(new RTCSessionDescription(payload.answer));
      setState('connected');
      startTimer();
      sounds.stopRinging();
    };
    const onIce = async (payload: CallSignalIce) => {
      if (payload.from !== remoteUserId || payload.to !== selfUserId || !payload.candidate) return;
      try { await peerRef.current?.addIceCandidate(new RTCIceCandidate(payload.candidate)); } catch {}
    };
    const onEnd = (payload: { from: string; to: string }) => {
      if (payload.from === remoteUserId && payload.to === selfUserId) handleClose(false);
    };
    socket.on('call:answer', onAnswer);
    socket.on('call:ice-candidate', onIce);
    socket.on('call:end', onEnd);
    return () => {
      socket.off('call:answer', onAnswer);
      socket.off('call:ice-candidate', onIce);
      socket.off('call:end', onEnd);
    };
  }, [socket, remoteUserId, selfUserId]);

  useEffect(() => {
    audioTrackRef.current && (audioTrackRef.current.enabled = !muted);
  }, [muted]);

  useEffect(() => {
    const node = screenPipVideoRef.current;
    if (!node) return;
    const enter = () => setScreenPipOn(true);
    const leave = () => { setScreenPipOn(false); setScreenPreviewHidden(false); };
    node.addEventListener('enterpictureinpicture', enter);
    node.addEventListener('leavepictureinpicture', leave);
    return () => {
      node.removeEventListener('enterpictureinpicture', enter);
      node.removeEventListener('leavepictureinpicture', leave);
    };
  }, [screenOn]);

  useEffect(() => { bindVideos(); }, [cameraOn, screenOn, screenExpanded, remoteStreamReady, screenPipOn, screenPreviewHidden, minimized]);

  const statusText = state === 'calling'
    ? (mode === 'incoming' ? 'Подключаемся' : 'Звоним')
    : `${kind === 'video' ? 'Видео-звонок' : 'Аудио-звонок'} · ${fmt(seconds)}`;

  if (minimized) {
    return (
      <>
        <video ref={screenPipVideoRef} className="msg-call-pip-hidden" autoPlay muted playsInline />
        {screenOn && !screenPipOn && !screenPreviewHidden && (
          <div
            className={`msg-call-share-preview${miniDragging ? ' dragging' : ''}`}
            style={{ right: miniPos.x, bottom: miniPos.y }}
            onPointerDown={onMiniPointerDown}
            onPointerMove={onMiniPointerMove}
            onPointerUp={onMiniPointerUp}
            onPointerCancel={onMiniPointerUp}
          >
            <div className="msg-call-share-preview-head">
              <span><i className="msg-call-live-dot" />Вы показываете экран</span>
              <div className="msg-call-share-preview-actions">
                <button className="msg-call-mini-btn" onClick={e => { e.stopPropagation(); void openScreenPip(); }}>{screenPipOn ? 'Закрыть PiP' : 'PiP'}</button>
                <button className="msg-call-mini-btn" onClick={e => { e.stopPropagation(); restoreCall(); openScreenFullscreen(); }}>Большой</button>
                <button className="msg-call-mini-btn" onClick={e => { e.stopPropagation(); setScreenPreviewHidden(true); }}>Скрыть</button>
                <button className="msg-call-mini-btn danger" onClick={e => { e.stopPropagation(); void stopScreenShare(); }}>Стоп</button>
              </div>
            </div>
            <div className="msg-call-share-preview-body" onDoubleClick={() => { restoreCall(); openScreenFullscreen(); }}>
              {screenIsCurrentTabRef.current ? (
                <div style={{ padding:14 }}>Предпросмотр скрыт для текущей вкладки, чтобы не было зеркала.</div>
              ) : (
                <video ref={screenFloatingVideoRef} autoPlay muted playsInline />
              )}
              {!screenIsCurrentTabRef.current && !screenPipOn && (
                <div className="msg-call-share-hint">PiP оставит превью поверх других вкладок и приложений</div>
              )}
            </div>
          </div>
        )}
        <div className="msg-active-call-pill">
          <button className="msg-active-call-main" onClick={restoreCall}>
            <span className="msg-active-call-dot" />
            <span>
              <b>{chat.name}</b>
              <small>{statusText}{screenOn ? ' · экран' : ''}</small>
            </span>
          </button>
          <button className={`msg-active-call-action${muted ? ' active' : ''}`} onClick={() => setMuted(m => !m)} title={muted?'Включить микрофон':'Выключить микрофон'}>
            <Ico d={muted ? 'M9 9v3a3 3 0 005.12 2.12M12 1a3 3 0 013 3M6.7 6.7L3 3m18 18l-3.88-3.88M19 10v2a7 7 0 01-.35 2.19M4.35 4.35A7 7 0 003 10v2' : 'M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3zM19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8'} size={18} stroke="currentColor" sw={1.9} />
          </button>
          <button className={`msg-active-call-action${cameraOn ? ' active' : ''}`} onClick={() => void toggleCamera()} title={cameraOn?'Выключить камеру':'Включить камеру'}>
            <Ico d="M23 7l-7 5 7 5V7zM1 5h15v14H1z" size={18} stroke="currentColor" sw={1.9} />
          </button>
          <button className={`msg-active-call-action${screenOn ? ' active' : ''}`} onClick={() => void toggleScreen()} title={screenOn?'Остановить экран':'Демонстрация экрана'}>
            <Ico d="M8 21h8M12 17v4M3 4h18v12H3z" size={18} stroke="currentColor" sw={1.9} />
          </button>
          {screenOn && <button className="msg-active-call-action pip" onClick={() => void openScreenPip()} title={screenPipOn ? "Закрыть PiP" : "Открыть PiP"}>
            <Ico d="M8 8h9a2 2 0 012 2v6M5 5h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2zM15 13h6v6h-6z" size={17} stroke="currentColor" sw={1.8} />
          </button>}
          {screenOn && screenPreviewHidden && !screenPipOn && <button className="msg-active-call-action" onClick={() => setScreenPreviewHidden(false)} title="Показать встроенное превью">
            <Ico d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7zM12 9a3 3 0 100 6 3 3 0 000-6z" size={17} stroke="currentColor" sw={1.8} />
          </button>}
          <button className="msg-active-call-action danger" onClick={() => handleClose()} title="Завершить звонок">
            <Ico d="M6 18L18 6M6 6l12 12" size={18} stroke="currentColor" sw={2.2} />
          </button>
        </div>
      </>
    );
  }

  return (
    <div className="msg-call-overlay" onClick={minimizeCall}>
      <div className="msg-call-modal wide" onClick={e => e.stopPropagation()} style={{ position:'relative' }}>
        <div className="msg-call-topbar">
          <div>
            <div style={{ fontSize:16, fontWeight:800 }}>{chat.name}</div>
            <div style={{ fontSize:12, color:'rgba(255,255,255,.55)', marginTop:2 }}>{statusText}</div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:12, color:'rgba(255,255,255,.65)' }}>
            {screenOn ? (screenPipOn ? 'Экран · PiP активно' : 'Экран демонстрируется') : socket?.connected ? 'Связь доступна' : 'Локальный режим'}
            <button className="msg-call-btn mute" onClick={e => { e.stopPropagation(); minimizeCall(); }} title="Свернуть звонок" style={{ width:36, height:36 }}>
              <Ico d="M6 18L18 6M6 6l12 12" size={18} stroke="#fff" sw={2} />
            </button>
          </div>
        </div>

        <video ref={screenPipVideoRef} className="msg-call-pip-hidden" autoPlay muted playsInline />

        {screenOn && !screenPipOn && !screenPreviewHidden && (
          <div
            className={`msg-call-share-preview${miniDragging ? ' dragging' : ''}`}
            style={{ right: miniPos.x, bottom: miniPos.y }}
            onPointerDown={onMiniPointerDown}
            onPointerMove={onMiniPointerMove}
            onPointerUp={onMiniPointerUp}
            onPointerCancel={onMiniPointerUp}
          >
            <div className="msg-call-share-preview-head">
              <span><i className="msg-call-live-dot" />Вы показываете экран</span>
              <div className="msg-call-share-preview-actions">
                <button className="msg-call-mini-btn" onClick={e => { e.stopPropagation(); void openScreenPip(); }} title="Открыть поверх вкладок и приложений">
                  {screenPipOn ? 'Закрыть PiP' : 'PiP'}
                </button>
                <button className="msg-call-mini-btn" onClick={e => { e.stopPropagation(); openScreenFullscreen(); }}>Большой</button>
                <button className="msg-call-mini-btn" onClick={e => { e.stopPropagation(); setScreenPreviewHidden(true); }}>Скрыть</button>
                <button className="msg-call-mini-btn danger" onClick={e => { e.stopPropagation(); void stopScreenShare(); }}>Стоп</button>
              </div>
            </div>
            <div className="msg-call-share-preview-body" onDoubleClick={openScreenFullscreen}>
              {screenIsCurrentTabRef.current ? (
                <div style={{ padding:14 }}>Предпросмотр скрыт для текущей вкладки, чтобы не было зеркала. Для нормального превью выбери весь экран или окно.</div>
              ) : (
                <video ref={screenFloatingVideoRef} autoPlay muted playsInline />
              )}
              {!screenIsCurrentTabRef.current && !screenPipOn && (
                <div className="msg-call-share-hint">Нажми PiP — мини-окно останется поверх других вкладок и приложений</div>
              )}
            </div>
          </div>
        )}

        {screenExpanded && (
          <div className="msg-call-expanded" onClick={e => e.stopPropagation()}>
            <div className="msg-call-expanded-head">
              <span>Демонстрация экрана</span>
              <div style={{ display:'flex', gap:8 }}>
                <button className="msg-call-tile-btn" onClick={e => { e.stopPropagation(); void openScreenPip(); }}>{screenPipOn ? 'Закрыть PiP' : 'Открыть PiP'}</button>
                <button className="msg-call-tile-btn" onClick={e => { e.stopPropagation(); void stopScreenShare(); }}>Отключить демонстрацию</button>
                <button className="msg-call-tile-btn" onClick={e => { e.stopPropagation(); setScreenExpanded(false); }}>Свернуть</button>
                <button className="msg-call-tile-btn" onClick={e => { e.stopPropagation(); handleClose(); }}>Завершить звонок</button>
              </div>
            </div>
            <div className="msg-call-expanded-body">
              <div className="msg-call-participants">
                <div className="msg-call-participant">
                  {cameraOn ? <video ref={expandedLocalVideoRef} autoPlay muted playsInline /> : <Ico d="M23 7l-7 5 7 5V7zM1 5h15v14H1zM4 4l16 16" size={26} stroke="rgba(255,255,255,.7)" />}
                  <span className="msg-call-participant-label">Вы</span>
                </div>
                <div className="msg-call-participant">
                  {remoteStreamReady ? <video ref={expandedRemoteVideoRef} autoPlay playsInline /> : (chat.isGroup ? <Ico d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" size={27} stroke="rgba(255,255,255,.72)" /> : <img src={avatarImg} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />)}
                  <span className="msg-call-participant-label">{chat.name}</span>
                </div>
              </div>
              {screenIsCurrentTabRef.current ? (
                <div className="msg-call-screen-safe">
                  <div>
                    <div style={{ fontSize:20, fontWeight:900, color:'#fff', marginBottom:8 }}>Предпросмотр скрыт</div>
                    <div>Выбрана текущая вкладка. Предпросмотр скрыт, чтобы не было бесконечного зеркала. Для нормального просмотра выбери отдельное окно или весь экран.</div>
                  </div>
                </div>
              ) : (
                <video ref={screenExpandedVideoRef} autoPlay muted playsInline />
              )}
            </div>
          </div>
        )}

        <div className="msg-call-stage">
          <div className="msg-video-tile">
            <video ref={remoteVideoRef} autoPlay playsInline style={{ display: remoteStreamReady ? 'block' : 'none' }} />
            {!remoteStreamReady && (
              <div style={{ textAlign:'center', color:'#fff' }}>
                <div className="msg-call-avatar" style={{ marginBottom:14 }}>
                  {chat.isGroup ? <Ico d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" size={38} stroke="rgba(255,255,255,.72)" /> : <img src={avatarImg} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />}
                </div>
                <div style={{ fontSize:18, fontWeight:800 }}>{chat.name}</div>
                <div style={{ fontSize:12, color:'rgba(255,255,255,.55)', marginTop:6 }}>{state === 'calling' ? 'Ожидаем ответ' : 'Локальный предпросмотр'}</div>
              </div>
            )}
            <div className="msg-video-badge">🎧 Собеседник</div>
          </div>

          <div className="msg-call-side">
            <div className="msg-video-tile" style={{ height:210 }}>
              {cameraOn ? <video ref={localVideoRef} autoPlay muted playsInline /> : (
                <div style={{ textAlign:'center', color:'rgba(255,255,255,.7)', fontSize:12 }}>
                  <Ico d="M23 7l-7 5 7 5V7zM1 5h15v14H1zM4 4l16 16" size={34} stroke="rgba(255,255,255,.45)" />
                  <div style={{ marginTop:10 }}>Камера выключена</div>
                </div>
              )}
              <div className="msg-video-badge">Вы</div>
            </div>
            <div className="msg-video-tile" style={{ height:150, cursor:screenOn?'zoom-in':'default' }} onDoubleClick={openScreenFullscreen}>
              {screenOn ? (
                <>
                  {screenIsCurrentTabRef.current ? (
                    <div className="msg-call-screen-safe" style={{ fontSize:11, borderRadius:0 }}>
                      Предпросмотр текущей вкладки скрыт, чтобы не было бесконечного зеркала.
                    </div>
                  ) : (
                    <video ref={screenPreviewRef} autoPlay muted playsInline />
                  )}
                  <div className="msg-call-tile-actions">
                    <button className="msg-call-tile-btn" onClick={e => { e.stopPropagation(); void openScreenPip(); }} title={screenPipOn ? "Закрыть PiP" : "Мини-окно поверх других окон"}>PiP</button>
                    <button className="msg-call-tile-btn" onClick={e => { e.stopPropagation(); openScreenFullscreen(); }} title="Развернуть демонстрацию">
                      <Ico d="M8 3H5a2 2 0 00-2 2v3M16 3h3a2 2 0 012 2v3M8 21H5a2 2 0 01-2-2v-3M16 21h3a2 2 0 002-2v-3" size={15} stroke="#fff" sw={2} />
                    </button>
                    <button className="msg-call-tile-btn" onClick={e => { e.stopPropagation(); void stopScreenShare(); }} title="Остановить демонстрацию">Стоп</button>
                  </div>
                </>
              ) : (
                <div className="msg-screen-tile" style={{ height:'100%', border:'none' }}>Демонстрация экрана выключена</div>
              )}
              <div className="msg-video-badge">Экран</div>
            </div>
          </div>
        </div>

        {permissionError && <div className="msg-call-permission">{permissionError}</div>}
        {!permissionError && callNotice && <div className="msg-call-permission" style={{ background:'rgba(26,86,219,.88)' }}>{callNotice}</div>}

        <div className="msg-call-controls">
          <button className={`msg-call-btn mute${muted?' active':''}`} onClick={e => { e.stopPropagation(); setMuted(m => !m); }} title={muted?'Включить микрофон':'Выключить микрофон'}>
            <Ico d={muted ? 'M9 9v3a3 3 0 005.12 2.12M12 1a3 3 0 013 3M6.7 6.7L3 3m18 18l-3.88-3.88M19 10v2a7 7 0 01-.35 2.19M4.35 4.35A7 7 0 003 10v2' : 'M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3zM19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8'} size={22} stroke="#fff" sw={1.8} />
          </button>
          <button className={`msg-call-btn mute${cameraOn?' active':''}`} onClick={e => { e.stopPropagation(); void toggleCamera(); }} title={cameraOn?'Выключить камеру':'Включить камеру'}>
            <Ico d="M23 7l-7 5 7 5V7zM1 5h15v14H1z" size={22} stroke="#fff" sw={1.8} />
          </button>
          <button className={`msg-call-btn mute${screenOn?' active':''}`} onClick={e => { e.stopPropagation(); void toggleScreen(); }} title={screenOn?'Остановить экран':'Демонстрация экрана'}>
            <Ico d="M8 21h8M12 17v4M3 4h18v12H3z" size={22} stroke="#fff" sw={1.8} />
          </button>
          <button className="msg-call-btn end" onClick={e => { e.stopPropagation(); handleClose(); }} title="Завершить">
            <Ico d="M16.72 11.06A10.94 10.94 0 0119 12.55M5 19l14-14m0 0L5 19m14-14l-4.73 4.73A10.89 10.89 0 0112.3 5c-3.92-.07-7.6 2-9.3 5.2L1 13" size={24} stroke="#fff" sw={1.8} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── FORWARD MODAL ─── */
function ForwardModal({ message, chats, onClose }: { message: Message; chats: ChatUser[]; onClose: () => void; }) {
  const [selected, setSelected] = useState<number[]>([]);
  const [done, setDone] = useState(false);
  const toggle = (id: number) => setSelected(s => s.includes(id) ? s.filter(x => x!==id) : [...s, id]);
  const send = () => { setDone(true); setTimeout(onClose, 1400); };
  return (
    <div className="msg-forward-overlay" onClick={onClose}>
      <div className="msg-forward-modal" onClick={e => e.stopPropagation()}>
        <div style={{ padding:'20px 20px 0', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span style={{ fontSize:16, fontWeight:700, color:'var(--text-primary)' }}>Переслать сообщение</span>
          <button onClick={onClose} style={{ width:32, height:32, borderRadius:8, background:'var(--surface)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text-muted)', fontSize:18 }}>×</button>
        </div>
        <div style={{ padding:'10px 0', maxHeight:'50vh', overflowY:'auto' }}>
          {chats.map(c => (
            <div key={c.id} onClick={() => toggle(c.id)} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 20px', cursor:'pointer', background:selected.includes(c.id)?'var(--accent-light)':'transparent', transition:'background .12s' }}>
              <div className={`msg-avatar${c.isGroup?' msg-avatar-group':''}`} style={{ width:40, height:40 }}>
                {c.isGroup ? <Ico d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" size={20} stroke="rgba(255,255,255,.7)" />
                  : <img src={c.avatar} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={e => { (e.target as HTMLImageElement).style.display='none'; }} />}
              </div>
              <span style={{ flex:1, fontSize:14, fontWeight:500, color:selected.includes(c.id)?'var(--accent)':'var(--text-primary)' }}>{c.name}</span>
              {selected.includes(c.id) && (
                <div style={{ width:22, height:22, borderRadius:'50%', background:'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <Ico d="M5 13l4 4L19 7" size={12} stroke="#fff" sw={2.5} />
                </div>
              )}
            </div>
          ))}
        </div>
        <div style={{ padding:'16px 20px', borderTop:'1px solid var(--border)' }}>
          {done
            ? <div style={{ textAlign:'center', color:'var(--success)', fontWeight:600, fontSize:14 }}>Переслано ✓</div>
            : <button disabled={selected.length===0} onClick={send} style={{ width:'100%', padding:13, background:selected.length>0?'var(--accent)':'var(--border)', border:'none', borderRadius:12, color:selected.length>0?'#fff':'var(--text-muted)', fontSize:14, fontWeight:600, cursor:selected.length>0?'pointer':'not-allowed', fontFamily:'var(--font)', transition:'all .15s' }}>
              Переслать{selected.length>0?` (${selected.length})`:''}
            </button>
          }
        </div>
      </div>
    </div>
  );
}

/* ─── MAIN COMPONENT ─── */
export function Messages() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const currentLogin = user?.login?.toLowerCase() || 'tornado';
  const isSelfChat = useCallback((chat: ChatUser) => Boolean(chat.login && chat.login === currentLogin && !chat.isGroup), [currentLogin]);
  const firstAvailableChat = useCallback(() => CHATS.find(c => !isSelfChat(c)) ?? CHATS[0], [isSelfChat]);
  const getInitialChat = () => {
    const queryId = Number(searchParams.get('chat'));
    const storedId = Number(localStorage.getItem('voevoda-active-chat') || 0);
    const preferredId = queryId || storedId || 4;
    const preferred = CHATS.find(c => c.id === preferredId);
    if (preferred && !isSelfChat(preferred)) return preferred;
    return firstAvailableChat();
  };
  const [activeChat, setActiveChat] = useState<ChatUser>(() => getInitialChat());
  const [messages, setMessages] = useState<Record<number, Message[]>>(loadDemoMessages);
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');
  const [msgSearch, setMsgSearch] = useState('');
  const [showMsgSearch, setShowMsgSearch] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; msg: Message } | null>(null);
  const [currentUserId] = useState(() => getCurrentUserId());
  const [socketReady, setSocketReady] = useState(false);
  const [incomingCall, setIncomingCall] = useState<IncomingCallState | null>(null);
  const [showCall, setShowCall] = useState<{ kind: CallKind; mode: CallMode; chat: ChatUser; remoteUserId: string; offer?: RTCSessionDescriptionInit } | null>(null);
  const [callStartedAt, setCallStartedAt] = useState<number | null>(null);
  const [callClock, setCallClock] = useState(() => Date.now());
  const [showInfo, setShowInfo] = useState(false);
  const [forwardMsg, setForwardMsg] = useState<Message | null>(null);
  const [selectedMsgs, setSelectedMsgs] = useState<number[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  const recordTimeRef = useRef(0);
  const [typing, setTyping] = useState(false);
  const [chats, setChats] = useState<ChatUser[]>(CHATS);
  const [hoveredMsgId, setHoveredMsgId] = useState<number | null>(null);
  const [reactionPicker, setReactionPicker] = useState<{ msgId: number; x: number; y: number } | null>(null);
  const [showStickers, setShowStickers] = useState(false);
  const [profileUser, setProfileUser] = useState<ChatUser | null>(null);
  const [lightbox, setLightbox] = useState<{ url: string; name?: string } | null>(null);
  const [galleryUser, setGalleryUser] = useState<ChatUser | null>(null);

  const recordIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordStreamRef = useRef<MediaStream | null>(null);
  const recordChunksRef = useRef<Blob[]>([]);
  const stopRecordIntentRef = useRef(false);
  const recordStartedAtRef = useRef(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesRef = useRef(messages);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    recordTimeRef.current = recordTime;
  }, [recordTime]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    try {
      localStorage.setItem('voevoda_demo_messages_v4', JSON.stringify(messages));
    } catch {}
  }, [messages]);

  useEffect(() => {
    const queryId = Number(searchParams.get('chat'));
    if (!queryId) return;
    const nextChat = chats.find(c => c.id === queryId);
    if (nextChat && isSelfChat(nextChat)) {
      const fallback = chats.find(c => !isSelfChat(c)) ?? chats[0];
      setActiveChat(fallback);
      navigate(`/messages?chat=${fallback.id}`, { replace: true });
      return;
    }
    if (nextChat && nextChat.id !== activeChat.id) {
      setActiveChat(nextChat);
      setChats(prev => prev.map(c => c.id===nextChat.id ? { ...c, unread:0 } : c));
    }
  }, [searchParams, chats, activeChat.id, isSelfChat, navigate]);

  useEffect(() => {
    if (!isSelfChat(activeChat)) return;
    const fallback = chats.find(c => !isSelfChat(c)) ?? chats[0];
    setActiveChat(fallback);
    navigate(`/messages?chat=${fallback.id}`, { replace: true });
  }, [activeChat, chats, isSelfChat, navigate]);

  useEffect(() => {
    localStorage.setItem('voevoda-active-chat', String(activeChat.id));
  }, [activeChat.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeChat.id, typing]);

  useEffect(() => {
    if (!showCall || !callStartedAt) return;
    setCallClock(Date.now());
    const id = setInterval(() => setCallClock(Date.now()), 1000);
    return () => clearInterval(id);
  }, [showCall, callStartedAt]);

  const formatActiveCallDuration = () => {
    if (!callStartedAt) return '00:00';
    const total = Math.max(0, Math.floor((callClock - callStartedAt) / 1000));
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const sec = total % 60;
    return h > 0
      ? `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
      : `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  useEffect(() => {
    const socket = io(SIGNALING_URL, { transports: ['websocket', 'polling'] });
    socketRef.current = socket;
    socket.on('connect', () => {
      setSocketReady(true);
      socket.emit('register', { userId: currentUserId });
    });
    socket.on('disconnect', () => setSocketReady(false));
    socket.on('call:offer', (payload: CallSignalOffer) => {
      if (payload.to !== currentUserId) return;
      const fromIdNumber = Number(payload.from);
      const found = chats.find(c => String(c.id) === payload.from) ?? {
        id: Number.isFinite(fromIdNumber) ? fromIdNumber : Date.now(),
        name: `Пользователь ${payload.from}`,
        callsign: payload.from,
        avatar: 'https://i.pravatar.cc/150?img=12',
        lastMsg: 'Входящий звонок',
        time: new Date().toLocaleTimeString('ru', { hour:'2-digit', minute:'2-digit' }),
        unread: 0,
        online: true,
      } satisfies ChatUser;
      sounds.startRinging();
      setIncomingCall({ chat: found, fromUserId: payload.from, kind: payload.kind, offer: payload.offer });
    });
    socket.on('call:end', (payload: { from: string; to: string }) => {
      if (payload.to !== currentUserId) return;
      sounds.stopRinging();
      setIncomingCall(prev => prev?.fromUserId === payload.from ? null : prev);
      setShowCall(prev => prev?.remoteUserId === payload.from ? null : prev);
      setCallStartedAt(null);
    });
    return () => {
      sounds.stopRinging();
      socket.disconnect();
      socketRef.current = null;
    };
  }, [currentUserId, chats]);

  const startRealCall = (chat: ChatUser, kind: CallKind) => {
    if (chat.isGroup) return;
    setCallStartedAt(Date.now());
    setShowCall({ kind, mode:'outgoing', chat, remoteUserId:String(chat.id) });
  };

  const acceptIncomingCall = () => {
    if (!incomingCall) return;
    sounds.stopRinging();
    setCallStartedAt(Date.now());
    setShowCall({
      kind: incomingCall.kind,
      mode:'incoming',
      chat: incomingCall.chat,
      remoteUserId: incomingCall.fromUserId,
      offer: incomingCall.offer,
    });
    setIncomingCall(null);
  };

  const declineIncomingCall = () => {
    if (incomingCall) socketRef.current?.emit('call:end', { from: currentUserId, to: incomingCall.fromUserId });
    sounds.stopRinging();
    setIncomingCall(null);
  };

  useEffect(() => () => {
    recordStreamRef.current?.getTracks().forEach(track => track.stop());
    (Object.values(messagesRef.current).flat() as Message[]).forEach(m => {
      const url = m.attachment?.type === 'voice' ? m.attachment.url : undefined;
      if (url?.startsWith('blob:')) URL.revokeObjectURL(url);
    });
  }, []);

  const sendMessage = useCallback((text: string, attachment?: Attachment) => {
    if (!text.trim() && !attachment) return;
    const msg: Message = {
      id: Date.now(), from: 'me', text: text.trim(),
      time: new Date().toLocaleTimeString('ru', { hour:'2-digit', minute:'2-digit' }),
      status: 'sent', reactions: [],
      replyTo: replyTo?.id, attachment, senderLogin: currentLogin,
    };
    setMessages(prev => ({ ...prev, [activeChat.id]: [...(prev[activeChat.id]||[]), msg] }));
    setInput('');
    setReplyTo(null);
    setShowStickers(false);
    sounds.playSent();
    setChats(prev => prev.map(c => c.id===activeChat.id ? { ...c, lastMsg: text.trim() || (attachment?.type==='voice' ? 'Голосовое сообщение' : attachment?.type==='sticker' ? 'Стикер' : attachment?'[Вложение]':''), time:msg.time, unread:0 } : c));
    setTimeout(() => setMessages(prev => ({ ...prev, [activeChat.id]: (prev[activeChat.id]||[]).map(m => m.id===msg.id ? { ...m, status:'delivered' } : m) })), 800);
    setTimeout(() => setMessages(prev => ({ ...prev, [activeChat.id]: (prev[activeChat.id]||[]).map(m => m.id===msg.id ? { ...m, status:'read' } : m) })), 2000);
  }, [activeChat.id, currentLogin, replyTo]);

  const sendSticker = useCallback((emoji: string) => {
    sendMessage('', { type: 'sticker', emoji });
  }, [sendMessage]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key==='Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  };

  const getRecordedSeconds = () => Math.max(1, Math.ceil((Date.now() - recordStartedAtRef.current) / 1000));

  const tickRecordingTime = () => {
    const next = getRecordedSeconds();
    recordTimeRef.current = next;
    setRecordTime(next);
  };

  const startRecording = async () => {
    if (isRecording) return;
    setRecordTime(0);
    recordTimeRef.current = 0;
    recordStartedAtRef.current = Date.now();
    recordChunksRef.current = [];
    stopRecordIntentRef.current = false;

    const beginTimer = () => {
      if (recordIntervalRef.current) clearInterval(recordIntervalRef.current);
      recordIntervalRef.current = setInterval(tickRecordingTime, 250);
      tickRecordingTime();
    };

    const mediaDevices = typeof navigator !== 'undefined'
      ? (navigator as Navigator & { mediaDevices?: MediaDevices }).mediaDevices
      : undefined;

    if (typeof mediaDevices?.getUserMedia !== 'function' || typeof MediaRecorder === 'undefined') {
      setIsRecording(true);
      beginTimer();
      return;
    }

    try {
      const stream = await mediaDevices.getUserMedia({ audio: true });
      recordStreamRef.current = stream;
      const preferredTypes = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus'];
      const mime = preferredTypes.find(t => MediaRecorder.isTypeSupported(t));
      const recorder = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      recorder.ondataavailable = e => {
        if (e.data && e.data.size > 0) recordChunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const shouldSend = stopRecordIntentRef.current;
        const chunks = [...recordChunksRef.current];
        const recordedSeconds = Math.max(recordTimeRef.current, getRecordedSeconds());
        const mimeType = recorder.mimeType || chunks[0]?.type || 'audio/webm';
        stream.getTracks().forEach(track => track.stop());
        recordStreamRef.current = null;
        mediaRecorderRef.current = null;
        recordChunksRef.current = [];

        if (shouldSend && chunks.length > 0) {
          const blob = new Blob(chunks, { type: mimeType });
          const url = URL.createObjectURL(blob);
          sendMessage('', {
            type:'voice',
            duration: recordedSeconds,
            url,
            mime: blob.type,
            size: `${Math.max(1, Math.round(blob.size / 1024))} КБ`,
            waveform: Array.from({ length: 24 }, (_, i) => 6 + Math.round(((i % 5) + 1) * 4 + Math.random() * 12)),
            createdAt: Date.now(),
          });
        }
      };
      recorder.start(200);
      setIsRecording(true);
      beginTimer();
    } catch {
      // Fallback keeps UI usable when mic permission is denied or the app is not on HTTPS/localhost.
      setIsRecording(true);
      beginTimer();
    }
  };

  const stopRecording = (send: boolean) => {
    stopRecordIntentRef.current = send;
    if (recordIntervalRef.current) clearInterval(recordIntervalRef.current);
    recordIntervalRef.current = null;
    const elapsed = Math.max(recordTimeRef.current, getRecordedSeconds());
    recordTimeRef.current = elapsed;
    setIsRecording(false);

    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      if (recorder.state === 'recording') recorder.requestData();
      recorder.stop();
    } else {
      recordStreamRef.current?.getTracks().forEach(track => track.stop());
      recordStreamRef.current = null;
      mediaRecorderRef.current = null;
      if (send) {
        sendMessage('', {
          type:'voice',
          duration: elapsed,
          waveform:VOICE_BARS,
          createdAt:Date.now(),
        });
      }
    }
    setRecordTime(0);
  };

  const toggleReaction = (msgId: number, emoji: string) => {
    setMessages(prev => {
      const msgs = (prev[activeChat.id]||[]).map(m => {
        if (m.id !== msgId) return m;
        const existing = m.reactions.find(r => r.emoji===emoji);
        if (existing) {
          return { ...m, reactions: m.reactions.map(r => r.emoji===emoji ? { ...r, reacted:!r.reacted, count:r.reacted?r.count-1:r.count+1 } : r).filter(r => r.count>0) };
        }
        return { ...m, reactions: [...m.reactions, { emoji, count:1, reacted:true }] };
      });
      return { ...prev, [activeChat.id]: msgs };
    });
    sounds.playReaction();
    setReactionPicker(null);
  };

  const deleteMessage = (msgId: number) => {
    setMessages(prev => ({
      ...prev,
      [activeChat.id]: (prev[activeChat.id]||[]).map(m => m.id===msgId ? { ...m, deleted:true, text:'Сообщение удалено', reactions:[] } : m),
    }));
  };

  const pinMessage = (msgId: number) => {
    setMessages(prev => ({
      ...prev,
      [activeChat.id]: (prev[activeChat.id]||[]).map(m => m.id===msgId ? { ...m, pinned:!m.pinned } : { ...m, pinned:false }),
    }));
  };

  const selectChat = (chat: ChatUser) => {
    setActiveChat(chat);
    localStorage.setItem('voevoda-active-chat', String(chat.id));
    navigate(`/messages?chat=${chat.id}`, { replace: true });
    setChats(prev => prev.map(c => c.id===chat.id ? { ...c, unread:0 } : c));
    setReplyTo(null); setSelectedMsgs([]); setShowMsgSearch(false); setShowInfo(false);
  };

  const handleContextMenu = (e: React.MouseEvent, msg: Message) => {
    if (msg.deleted) return;
    e.preventDefault();
    setContextMenu({ x:e.clientX, y:e.clientY, msg });
  };

  const getContextItems = (msg: Message): CtxItem[] => [
    { label:'Ответить', icon:'M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6', action:()=>setReplyTo(msg) },
    { label:'Переслать', icon:'M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z', action:()=>setForwardMsg(msg) },
    { label:msg.pinned?'Открепить':'Закрепить', icon:'M12 4V20M18 10l-6-6-6 6', action:()=>pinMessage(msg.id) },
    { label:msg.from==='me'?'Удалить':'Удалить у себя', icon:'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16', action:()=>deleteMessage(msg.id), danger:true, divider:true },
  ];

  const currentMsgs = messages[activeChat.id] || [];
  const pinnedMsg = currentMsgs.find(m => m.pinned && !m.deleted);
  const filteredChats = chats.filter(c =>
    !isSelfChat(c) &&
    (filter==='all' || c.unread>0) &&
    (search==='' || c.name.toLowerCase().includes(search.toLowerCase()) || c.callsign.toLowerCase().includes(search.toLowerCase()))
  );
  const searchedMsgs = msgSearch ? currentMsgs.filter(m => !m.deleted && m.text.toLowerCase().includes(msgSearch.toLowerCase())) : currentMsgs;
  const fmtRecord = (s: number) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

  return (
    <div className="msg-root" style={{ paddingTop:60, marginLeft:56, height:'100vh', background:'var(--surface)', display:'flex', flexDirection:'column' }}>
      <style>{CSS}</style>
      <div style={{ flex:1, display:'flex', overflow:'hidden' }}>

        {/* ═══ SIDEBAR ═══ */}
        <div style={{ width:300, background:'#fff', borderRight:'1px solid var(--border)', display:'flex', flexDirection:'column', flexShrink:0 }}>
          <div style={{ padding:'16px 16px 12px', borderBottom:'1px solid var(--border)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
              <div>
                <span style={{ fontSize:17, fontWeight:800, color:'var(--text-primary)', letterSpacing:'-.3px' }}>Сообщения</span>
                <div style={{ fontSize:10, marginTop:2, color:socketReady?'var(--success)':'var(--text-muted)', fontWeight:700 }}>Пользователь: {user?.callsign || 'Торнадо'} · звонки {socketReady?'доступны':'недоступны'}</div>
              </div>
              <button className="msg-icon-btn" onClick={() => navigate('/profile')} title="Профиль">
                <Ico d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" size={18} />
              </button>
            </div>
            <div style={{ position:'relative', marginBottom:10 }}>
              <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', display:'flex' }}>
                <Ico d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" size={15} stroke="var(--text-muted)" />
              </span>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Поиск..."
                style={{ width:'100%', padding:'9px 10px 9px 36px', borderRadius:12, border:'1.5px solid var(--border)', fontSize:13, outline:'none', fontFamily:'var(--font)', boxSizing:'border-box', transition:'border-color .15s' }}
                onFocus={e => (e.currentTarget.style.borderColor='var(--accent)')}
                onBlur={e => (e.currentTarget.style.borderColor='var(--border)')} />
            </div>
            <div style={{ display:'flex', gap:6 }}>
              {(['all','unread'] as const).map(f => (
                <button key={f} onClick={() => setFilter(f)} style={{ padding:'5px 14px', borderRadius:20, border:'1.5px solid', fontFamily:'var(--font)', cursor:'pointer', borderColor:filter===f?'var(--accent)':'var(--border)', background:filter===f?'var(--accent)':'#fff', color:filter===f?'#fff':'var(--text-secondary)', fontSize:12, fontWeight:filter===f?600:400, transition:'all .15s' }}>
                  {f==='all' ? 'Все' : `Непрочитанные (${chats.filter(c => !isSelfChat(c) && c.unread>0).length})`}
                </button>
              ))}
            </div>
          </div>
          <div style={{ flex:1, overflowY:'auto' }}>
            {filteredChats.length===0 && (
              <div style={{ padding:'40px 20px', textAlign:'center', color:'var(--text-muted)', fontSize:13 }}>Ничего не найдено</div>
            )}
            {filteredChats.map((chat, i) => (
              <div key={chat.id} className={`msg-chat-row${activeChat.id===chat.id?' active':''}`}
                onClick={() => selectChat(chat)} style={{ animationDelay:`${i*0.03}s` }}>
                <div className={`msg-avatar${chat.isGroup?' msg-avatar-group':''}`}>
                  {chat.isGroup
                    ? <Ico d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" size={20} stroke="rgba(255,255,255,.65)" />
                    : <>
                        <img src={chat.avatar} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={e => { (e.target as HTMLImageElement).style.display='none'; }} />
                        {chat.online && <div className="msg-online-dot" />}
                      </>
                  }
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:3 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:5, minWidth:0 }}>
                      <span style={{ fontSize:14, fontWeight:700, color:'var(--text-primary)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{chat.name}</span>
                      {chat.isGroup && <Ico d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" size={12} stroke="var(--text-muted)" />}
                    </div>
                    <span style={{ fontSize:11, color:'var(--text-muted)', flexShrink:0 }}>{chat.time}</span>
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <span style={{ fontSize:12, color:'var(--text-muted)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', flex:1 }}>{chat.lastMsg}</span>
                    {chat.unread>0 && <span className="msg-unread" style={{ marginLeft:6 }}>{chat.unread}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ═══ CHAT AREA ═══ */}
        <div style={{ flex:1, display:'flex', flexDirection:'column', background:'var(--surface)', position:'relative', minWidth:0 }}>
          {/* Selected bar */}
          {selectedMsgs.length>0 && (
            <div className="msg-selected-bar">
              <button className="msg-icon-btn" style={{ color:'#fff', background:'rgba(255,255,255,.15)' }} onClick={() => setSelectedMsgs([])}>
                <Ico d="M6 18L18 6M6 6l12 12" size={16} stroke="currentColor" sw={2} />
              </button>
              <span style={{ flex:1, fontSize:14, fontWeight:600, color:'#fff' }}>Выбрано: {selectedMsgs.length}</span>
              <button className="msg-icon-btn" style={{ color:'#fff', background:'rgba(255,255,255,.15)' }}
                onClick={() => { selectedMsgs.forEach(id => deleteMessage(id)); setSelectedMsgs([]); }}>
                <Ico d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" size={16} stroke="currentColor" />
              </button>
            </div>
          )}

          {/* Header */}
          {selectedMsgs.length===0 && (
            <div className="msg-chat-header">
              <div className={`msg-avatar${activeChat.isGroup?' msg-avatar-group':''}`} style={{ width:42, height:42, cursor: activeChat.isGroup ? 'default' : 'pointer' }}
                onClick={() => !activeChat.isGroup && setProfileUser(activeChat)}>
                {activeChat.isGroup
                  ? <Ico d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" size={20} stroke="rgba(255,255,255,.65)" />
                  : <img src={activeChat.avatar} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={e => { (e.target as HTMLImageElement).style.display='none'; }} />
                }
                {activeChat.online && !activeChat.isGroup && <div className="msg-online-dot" />}
              </div>
              <div style={{ flex:1, cursor: activeChat.isGroup ? 'default' : 'pointer' }} onClick={() => !activeChat.isGroup && setProfileUser(activeChat)}>
                <div style={{ fontSize:15, fontWeight:700, color:'var(--text-primary)', marginBottom:1 }}>{activeChat.name}</div>
                <div style={{ fontSize:12, color:activeChat.online?'var(--success)':'var(--text-muted)' }}>
                  {activeChat.isGroup ? `${activeChat.membersCount} участников` : activeChat.online ? 'В сети' : `Был(а) ${activeChat.lastSeen??'давно'}`}
                </div>
              </div>
              <div style={{ display:'flex', gap:4 }}>
                {!activeChat.isGroup && (
                  <>
                    <button className="msg-icon-btn" onClick={() => startRealCall(activeChat, 'audio')} title="Голосовой вызов">
                      <Ico d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 014.69 13a19.79 19.79 0 01-3.07-8.67A2 2 0 013.6 2.22h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L7.91 9.91A16 16 0 0014.09 16l.95-.95a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" size={18} />
                    </button>
                    <button className="msg-icon-btn" onClick={() => startRealCall(activeChat, 'video')} title="Видео-вызов">
                      <Ico d="M23 7l-7 5 7 5V7zM1 5h15v14H1z" size={18} />
                    </button>
                  </>
                )}
                <button className={`msg-icon-btn${showMsgSearch?' send':''}`} onClick={() => { setShowMsgSearch(s => !s); setMsgSearch(''); }} title="Поиск">
                  <Ico d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" size={18} stroke={showMsgSearch?'#fff':'currentColor'} />
                </button>
                <button className={`msg-icon-btn${showInfo?' send':''}`} onClick={() => setShowInfo(s => !s)} title="Информация">
                  <Ico d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" size={18} stroke={showInfo?'#fff':'currentColor'} />
                </button>
              </div>
            </div>
          )}

          {showCall && selectedMsgs.length===0 && (
            <button
              className="msg-chat-call-banner"
              onClick={() => {
                if (showCall.chat.id !== activeChat.id) {
                  setActiveChat(showCall.chat);
                  navigate(`/messages?chat=${showCall.chat.id}`);
                }
                window.dispatchEvent(new Event('messages:restore-active-call'));
              }}
              title="Вернуться в активный звонок"
            >
              <span className="msg-chat-call-live"><span className="msg-chat-call-live-dot" />В звонке</span>
              <span className="msg-chat-call-title">{showCall.chat.name}</span>
              <span className="msg-chat-call-time">{formatActiveCallDuration()}</span>
              <span className="msg-chat-call-return">Вернуться</span>
            </button>
          )}

          {/* Message search */}
          {showMsgSearch && (
            <div style={{ padding:'8px 18px', background:'#fff', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:10 }}>
              <Ico d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" size={16} stroke="var(--text-muted)" />
              <input autoFocus value={msgSearch} onChange={e => setMsgSearch(e.target.value)} placeholder="Поиск в переписке..."
                style={{ flex:1, border:'none', outline:'none', fontSize:14, fontFamily:'var(--font)', color:'var(--text-primary)' }} />
              {msgSearch && <button onClick={() => setMsgSearch('')} style={{ border:'none', background:'none', cursor:'pointer', color:'var(--text-muted)', fontSize:18 }}>×</button>}
              {msgSearch && <span style={{ fontSize:12, color:'var(--text-muted)', whiteSpace:'nowrap' }}>{searchedMsgs.length} совп.</span>}
            </div>
          )}

          {/* Pinned */}
          {pinnedMsg && (
            <div className="msg-pinned-bar">
              <Ico d="M12 4V20M18 10l-6-6-6 6" size={16} stroke="var(--warn)" sw={2} />
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:10, fontWeight:700, color:'var(--warn)', textTransform:'uppercase', letterSpacing:'.5px', marginBottom:1 }}>Закреплённое</div>
                <div style={{ fontSize:12, color:'var(--text-secondary)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{pinnedMsg.text}</div>
              </div>
              <button onClick={e => { e.stopPropagation(); pinMessage(pinnedMsg.id); }} style={{ border:'none', background:'none', cursor:'pointer', color:'var(--text-muted)', fontSize:18, padding:'0 4px' }}>×</button>
            </div>
          )}

          {/* Messages list */}
          <div style={{ flex:1, overflowY:'auto', padding:'16px 20px' }} onClick={() => { setReactionPicker(null); }}>
            {currentMsgs.length===0 && (
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%', color:'var(--text-muted)' }}>
                <div style={{ width:60, height:60, borderRadius:18, background:'var(--surface-3)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:14 }}>
                  <Ico d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" size={28} stroke="var(--border-2)" />
                </div>
                <div style={{ fontSize:14, fontWeight:600, marginBottom:4 }}>Начните диалог</div>
                <div style={{ fontSize:12 }}>Напишите первое сообщение</div>
              </div>
            )}
            {currentMsgs.length>0 && <div className="msg-date-divider">Сегодня</div>}

            {(msgSearch ? searchedMsgs : currentMsgs).map(msg => {
              const isMe = msg.senderLogin ? msg.senderLogin === currentLogin : msg.from==='me';
              const replyMsg = msg.replyTo ? currentMsgs.find(m => m.id===msg.replyTo) : null;
              const replyIsMe = replyMsg ? (replyMsg.senderLogin ? replyMsg.senderLogin === currentLogin : replyMsg.from === 'me') : false;
              const isSelected = selectedMsgs.includes(msg.id);
              const isSticker = msg.attachment?.type === 'sticker' && !!msg.attachment.emoji && !msg.deleted;

              return (
                <div key={msg.id}
                  className={`msg-hover-zone ${isMe?'msg-bubble-me':'msg-bubble-them'}`}
                  style={{ display:'flex', justifyContent:isMe?'flex-end':'flex-start', marginBottom:10, alignItems:'flex-end', gap:8, background:isSelected?'rgba(26,86,219,.07)':'transparent', borderRadius:12, padding:isSelected?'4px 8px':'0', margin:isSelected?'4px -8px':'0 0 10px' }}
                  onMouseEnter={() => !msg.deleted && setHoveredMsgId(msg.id)}
                  onMouseLeave={() => setHoveredMsgId(null)}
                  onContextMenu={e => handleContextMenu(e, msg)}
                  onClick={() => { if (selectedMsgs.length>0 && !msg.deleted) setSelectedMsgs(s => s.includes(msg.id)?s.filter(x=>x!==msg.id):[...s,msg.id]); }}
                >
                  {/* Avatar them */}
                  {!isMe && !activeChat.isGroup && (
                    <div className="msg-avatar" style={{ width:30, height:30, flexShrink:0, marginBottom:2, cursor:'pointer' }}
                      onClick={() => setProfileUser(activeChat)}>
                      <img src={activeChat.avatar} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={e => { (e.target as HTMLImageElement).style.display='none'; }} />
                    </div>
                  )}

                  <div style={{ position:'relative', maxWidth:'66%' }}>
                    {/* Group sender name */}
                    {!isMe && activeChat.isGroup && (
                      <div style={{ fontSize:11, fontWeight:700, color:'var(--accent)', marginBottom:4, paddingLeft:2 }}>{activeChat.callsign}</div>
                    )}

                    {/* Reaction trigger button (hover) */}
                    {!msg.deleted && hoveredMsgId===msg.id && (
                      <button className="msg-react-trigger" onClick={e => {
                        e.stopPropagation();
                        setReactionPicker({ msgId:msg.id, x:e.clientX, y:e.clientY });
                      }} style={{
                        position:'absolute', [isMe?'left':'right']:'-34px', bottom:8,
                        width:26, height:26, borderRadius:'50%', background:'#fff',
                        border:'1px solid var(--border)', cursor:'pointer', display:'flex',
                        alignItems:'center', justifyContent:'center', boxShadow:'var(--shadow)',
                        fontSize:14, zIndex:10, opacity:1,
                      }} title="Реакция">
                        <Ico d="M12 5v14M5 12h14" size={15} stroke="var(--accent)" sw={2.2} />
                      </button>
                    )}

                    {isSticker ? (
                      <div style={{ display:'flex', flexDirection:'column', alignItems:isMe?'flex-end':'flex-start' }}>
                        <div className="msg-sticker-message" title="Стикер">
                          {msg.attachment!.emoji}
                        </div>
                        <div className="msg-sticker-time" style={{ background:isMe?'rgba(36,129,204,.78)':'rgba(20,35,54,.34)' }}>
                          <span>{msg.time}</span>
                          {isMe && <CheckDouble read={msg.status==='read'} />}
                        </div>
                      </div>
                    ) : (
                      <>

                        {/* Reply */}
                        {replyMsg && !replyMsg.deleted && (
                          <div style={{ background:isMe?'rgba(255,255,255,.15)':'var(--surface)', borderRadius:'10px 10px 0 0', borderLeft:`3px solid ${isMe?'rgba(255,255,255,.6)':'var(--accent)'}`, padding:'7px 12px', marginBottom:2 }}>
                            <div style={{ fontSize:10, fontWeight:700, color:isMe?'rgba(255,255,255,.7)':'var(--accent)', marginBottom:2 }}>{replyIsMe?'Вы':activeChat.name}</div>
                            <div style={{ fontSize:12, color:isMe?'rgba(255,255,255,.65)':'var(--text-secondary)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                              {replyMsg.attachment?'[Вложение]':replyMsg.text}
                            </div>
                          </div>
                        )}

                        {/* Bubble */}
                        <div className={`msg-bubble-inner ${isMe?'me':'them'}${msg.deleted?' deleted':''}`}
                          style={{ borderTopLeftRadius:replyMsg?0:undefined, borderTopRightRadius:replyMsg&&isMe?0:undefined }}>

                          {/* Attachment */}
                          {msg.attachment && !msg.deleted && (
                            <>
                              {msg.attachment.type==='voice' && <VoiceMessage from={isMe ? 'me' : 'them'} duration={msg.attachment.duration} url={msg.attachment.url} waveform={msg.attachment.waveform} />}
                              {msg.attachment.type==='file' && (
                                <div className={`msg-attachment${!isMe?' them':''}`}>
                                  <div style={{ width:36, height:36, borderRadius:10, background:isMe?'rgba(255,255,255,.15)':'var(--accent-light)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                                    <Ico d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" size={18} stroke={isMe?'#fff':'var(--accent)'} />
                                  </div>
                                  <div>
                                    <div style={{ fontSize:13, fontWeight:600, color:isMe?'#fff':'var(--text-primary)' }}>{msg.attachment.name}</div>
                                    {msg.attachment.size && <div style={{ fontSize:11, color:isMe?'rgba(255,255,255,.6)':'var(--text-muted)' }}>{msg.attachment.size}</div>}
                                  </div>
                                </div>
                              )}
                              {msg.attachment.type==='image' && msg.attachment.url && (
                                <div style={{ borderRadius:10, overflow:'hidden', marginBottom:msg.text?8:0, cursor:'pointer' }}
                                  onClick={e => { e.stopPropagation(); setLightbox({ url:msg.attachment!.url!, name:msg.attachment!.name }); }}>
                                  <img src={msg.attachment.url} alt={msg.attachment.name}
                                    style={{ width:'100%', maxHeight:220, objectFit:'cover', display:'block' }}
                                    onError={e => { const t = e.currentTarget.parentElement!; t.style.background='var(--surface-3)'; t.style.height='160px'; e.currentTarget.style.display='none'; }} />
                                </div>
                              )}
                            </>
                          )}

                          {/* Text */}
                          {msg.text && (
                            <div style={{ fontFamily:'var(--font)' }}>
                              {msg.deleted ? <em style={{ opacity:.7 }}>{msg.text}</em> : msg.text}
                            </div>
                          )}

                          {/* Time + status */}
                          <div style={{ display:'flex', alignItems:'center', justifyContent:'flex-end', gap:4, marginTop:5 }}>
                            {msg.edited && !msg.deleted && <span style={{ fontSize:10, color:isMe?'rgba(255,255,255,.5)':'var(--text-muted)' }}>ред.</span>}
                            <span style={{ fontSize:11, color:isMe?'rgba(255,255,255,.6)':'var(--text-muted)' }}>{msg.time}</span>
                            {isMe && !msg.deleted && <CheckDouble read={msg.status==='read'} />}
                          </div>
                        </div>
                      </>
                    )}

                    {/* Reactions */}
                    {msg.reactions.length>0 && !msg.deleted && (
                      <div style={{ display:'flex', gap:4, flexWrap:'wrap', marginTop:5, justifyContent:isMe?'flex-end':'flex-start', position:'relative', zIndex:2 }}>
                        {msg.reactions.map((r, ri) => (
                          <button key={ri} className={`msg-reaction${r.reacted?' active':''}`}
                            onClick={() => toggleReaction(msg.id, r.emoji)} aria-label={`Реакция ${r.emoji}: ${r.count}`}>
                            <span>{r.emoji}</span>{r.count > 1 && <span className="msg-reaction-count">{r.count}</span>}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Typing */}
            {typing && (
              <div style={{ display:'flex', alignItems:'flex-end', gap:8, marginBottom:10 }} className="msg-bubble-them">
                <div className="msg-avatar" style={{ width:30, height:30, flexShrink:0 }}>
                  <img src={activeChat.avatar} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={e => { (e.target as HTMLImageElement).style.display='none'; }} />
                </div>
                <div className="msg-bubble-inner them" style={{ padding:'14px 18px' }}>
                  <div style={{ display:'flex', gap:5, alignItems:'center' }}>
                    <div className="typing-dot" /><div className="typing-dot" /><div className="typing-dot" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Reply strip */}
          {replyTo && (
            <div className="msg-reply-strip">
              <div style={{ width:3, background:'var(--accent)', borderRadius:2, flexShrink:0, alignSelf:'stretch' }} />
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:11, fontWeight:700, color:'var(--accent)', marginBottom:2 }}>{(replyTo.senderLogin ? replyTo.senderLogin === currentLogin : replyTo.from==='me')?'Вы':activeChat.name}</div>
                <div style={{ fontSize:12, color:'var(--text-secondary)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                  {replyTo.attachment?'[Вложение]':replyTo.text}
                </div>
              </div>
              <button onClick={() => setReplyTo(null)} style={{ border:'none', background:'none', cursor:'pointer', color:'var(--text-muted)', fontSize:20 }}>×</button>
            </div>
          )}

          {/* Sticker panel */}
          {showStickers && (
            <StickerPanel onSend={sendSticker} onClose={() => setShowStickers(false)} />
          )}

          {/* Input */}
          {isRecording ? (
            <div className="msg-input-wrap" style={{ justifyContent:'space-between', alignItems:'center' }}>
              <button className="msg-icon-btn danger" onClick={() => stopRecording(false)}>
                <Ico d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" size={18} stroke="#DC2626" />
              </button>
              <div style={{ flex:1, display:'flex', alignItems:'center', gap:12, padding:'0 16px' }}>
                <div style={{ width:10, height:10, borderRadius:'50%', background:'#DC2626', animation:'msg-record-pulse 1s ease infinite', flexShrink:0 }} />
                <div className="msg-voice-bars" style={{ flex:1, height:32 }}>
                  {VOICE_BARS.slice(0,20).map((h, i) => (
                    <div key={i} className="msg-voice-bar" style={{ height:`${h}px`, background:'#DC2626', opacity:.6+Math.random()*.4 }} />
                  ))}
                </div>
                <span style={{ fontSize:13, fontWeight:700, color:'#DC2626', minWidth:40 }}>{fmtRecord(recordTime)}</span>
              </div>
              <button className="msg-icon-btn send" onClick={() => stopRecording(true)}>
                <Ico d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" size={18} stroke="#fff" />
              </button>
            </div>
          ) : (
            <div className="msg-input-wrap">
              <button className="msg-icon-btn" title="Прикрепить файл"
                onClick={() => sendMessage('', { type:'file', name:'dokument.pdf', size:'1.2 МБ' })}>
                <Ico d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" size={18} />
              </button>
              <button className={`msg-icon-btn${showStickers?' send':''}`} title="Стикеры"
                onClick={() => setShowStickers(s => !s)}>
                <span style={{ fontSize:22, lineHeight:1 }}>😊</span>
              </button>
              <div className="msg-input-bg">
                <textarea ref={inputRef} className="msg-input" value={input}
                  onChange={handleInputChange} onKeyDown={handleKeyDown}
                  placeholder={`Сообщение для ${activeChat.callsign}...`} rows={1} style={{ lineHeight:1.6 }} />
              </div>
              {input.trim()
                ? <button className="msg-icon-btn send" onClick={() => sendMessage(input)}>
                    <Ico d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" size={18} stroke="#fff" />
                  </button>
                : <button className="msg-icon-btn" onMouseDown={() => void startRecording()} title="Голосовое">
                    <Ico d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3zM19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8" size={18} />
                  </button>
              }
            </div>
          )}
        </div>

        {/* ═══ INFO PANEL ═══ */}
        {showInfo && (
          <div className="msg-info-panel">
            <div style={{ padding:'0 0 16px', borderBottom:'1px solid var(--border)' }}>
              <div style={{ display:'flex', justifyContent:'space-between', padding:'16px 20px 0' }}>
                <span style={{ fontSize:14, fontWeight:700, color:'var(--text-primary)' }}>Информация</span>
                <button className="msg-icon-btn" style={{ width:28, height:28 }} onClick={() => setShowInfo(false)}>
                  <Ico d="M6 18L18 6M6 6l12 12" size={16} stroke="currentColor" sw={2} />
                </button>
              </div>
              <div style={{ textAlign:'center', padding:'16px 20px 0' }}>
                <div className={`msg-avatar${activeChat.isGroup?' msg-avatar-group':''}`}
                  style={{ width:70, height:70, margin:'0 auto 12px', cursor:activeChat.isGroup?'default':'pointer' }}
                  onClick={() => !activeChat.isGroup && setProfileUser(activeChat)}>
                  {activeChat.isGroup
                    ? <Ico d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" size={30} stroke="rgba(255,255,255,.65)" />
                    : <img src={activeChat.avatar} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={e => { (e.target as HTMLImageElement).style.display='none'; }} />
                  }
                  {activeChat.online && !activeChat.isGroup && <div className="msg-online-dot" style={{ width:14, height:14, border:'2.5px solid #fff' }} />}
                </div>
                <div style={{ fontSize:15, fontWeight:700, color:'var(--text-primary)', marginBottom:3 }}>{activeChat.name}</div>
                {activeChat.rank && <div style={{ fontSize:12, color:'var(--accent)', fontWeight:600, marginBottom:3 }}>{activeChat.rank}</div>}
                <div style={{ fontSize:12, color:activeChat.online?'var(--success)':'var(--text-muted)' }}>
                  {activeChat.isGroup ? `Группа · ${activeChat.membersCount} бойцов` : activeChat.online ? 'В сети' : `Был(а) ${activeChat.lastSeen??'давно'}`}
                </div>
              </div>
            </div>

            {!activeChat.isGroup && (
              <div className="msg-info-section">
                <div style={{ display:'flex', gap:10 }}>
                  <button onClick={() => { setProfileUser(activeChat); setShowInfo(false); }} style={{ flex:1, padding:'8px', border:'1.5px solid var(--border)', borderRadius:10, background:'#fff', display:'flex', alignItems:'center', justifyContent:'center', gap:6, cursor:'pointer', fontSize:11, fontWeight:600, color:'var(--text-secondary)', fontFamily:'var(--font)', transition:'all .15s' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor='var(--accent)'; e.currentTarget.style.color='var(--accent)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.color='var(--text-secondary)'; }}>
                    <Ico d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" size={14} stroke="currentColor" />
                    Профиль
                  </button>
                  <button onClick={() => startRealCall(activeChat, 'audio')} style={{ flex:1, padding:'8px', border:'1.5px solid var(--border)', borderRadius:10, background:'#fff', display:'flex', alignItems:'center', justifyContent:'center', gap:6, cursor:'pointer', fontSize:11, fontWeight:600, color:'var(--text-secondary)', fontFamily:'var(--font)', transition:'all .15s' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor='var(--success)'; e.currentTarget.style.color='var(--success)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.color='var(--text-secondary)'; }}>
                    <Ico d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 014.69 13a19.79 19.79 0 01-3.07-8.67A2 2 0 013.6 2.22h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L7.91 9.91A16 16 0 0014.09 16l.95-.95a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" size={14} stroke="currentColor" />
                    Вызов
                  </button>
                </div>
              </div>
            )}

            <div className="msg-info-section">
              <div style={{ fontSize:11, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'.5px', marginBottom:12 }}>Сведения</div>
              {[
                ...(activeChat.unit ? [{ label:'Подразделение', value:activeChat.unit }] : []),
                ...(activeChat.rank ? [{ label:'Звание', value:activeChat.rank }] : []),
                { label:'Позывной', value:activeChat.callsign },
                { label:'Сообщений', value:String(currentMsgs.length) },
              ].map((item, i) => (
                <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'7px 0', borderBottom:'1px solid var(--border)' }}>
                  <span style={{ fontSize:12, color:'var(--text-muted)' }}>{item.label}</span>
                  <span style={{ fontSize:12, fontWeight:600, color:'var(--text-primary)' }}>{item.value}</span>
                </div>
              ))}
            </div>

            <div className="msg-info-section" style={{ flex:1 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                <span style={{ fontSize:11, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'.5px' }}>Медиафайлы</span>
                <button onClick={() => setGalleryUser(activeChat)} style={{ fontSize:11, color:'var(--accent)', fontWeight:700, cursor:'pointer', border:'none', background:'transparent', fontFamily:'var(--font)' }}>Все</button>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:4 }}>
                {['alpha','bravo','charlie','delta','echo','foxtrot'].map((s, i) => (
                  <div key={i} className="msg-media-thumb"
                    onClick={() => setLightbox({ url:`https://picsum.photos/seed/${activeChat.id}-${s}/400/400`, name:`медиа_${i+1}.jpg` })}>
                    <img src={`https://picsum.photos/seed/${activeChat.id}-${s}/160/160`} alt=""
                      style={{ width:'100%', height:'100%', objectFit:'cover' }}
                      onError={e => { const t = e.currentTarget; t.style.background=`hsl(${210+i*12},30%,${86-i*3}%)`; t.style.display='block'; }} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ═══ OVERLAYS ═══ */}
      {contextMenu && (
        <ContextMenu x={contextMenu.x} y={contextMenu.y} items={getContextItems(contextMenu.msg)} onClose={() => setContextMenu(null)} />
      )}
      {reactionPicker && (
        <EmojiReactionPopup
          x={reactionPicker.x} y={reactionPicker.y}
          onReact={emoji => toggleReaction(reactionPicker.msgId, emoji)}
          onClose={() => setReactionPicker(null)}
        />
      )}
      {incomingCall && <IncomingCallBanner call={incomingCall} onAccept={acceptIncomingCall} onDecline={declineIncomingCall} />}
      {showCall && (
        <CallModal
          chat={showCall.chat}
          kind={showCall.kind}
          mode={showCall.mode}
          socket={socketRef.current}
          selfUserId={currentUserId}
          remoteUserId={showCall.remoteUserId}
          initialOffer={showCall.offer}
          onClose={() => { setShowCall(null); setCallStartedAt(null); }}
        />
      )}
      {forwardMsg && <ForwardModal message={forwardMsg} chats={CHATS} onClose={() => setForwardMsg(null)} />}
      {profileUser && (
        <ProfileModal
          user={profileUser}
          onClose={() => setProfileUser(null)}
          onCall={kind => startRealCall(profileUser, kind)}
          onMessage={() => { setActiveChat(profileUser); setProfileUser(null); setShowInfo(false); setTimeout(() => inputRef.current?.focus(), 0); }}
          onOpenMedia={(url, name) => setLightbox({ url, name })}
          onOpenGallery={() => setGalleryUser(profileUser)}
        />
      )}
      {galleryUser && <MediaGallery user={galleryUser} onClose={() => setGalleryUser(null)} onOpenMedia={(url, name) => setLightbox({ url, name })} />}
      {lightbox && <ImageLightbox url={lightbox.url} name={lightbox.name} onClose={() => setLightbox(null)} />}
    </div>
  );
}
