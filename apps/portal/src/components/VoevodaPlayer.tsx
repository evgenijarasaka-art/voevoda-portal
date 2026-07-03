import { useCallback, useEffect, useRef, useState } from 'react';

/*
 * VoevodaPlayer — собственный плеер УТЦ «Воевода».
 * Видео берётся ЛОКАЛЬНО (файл из папки /public/video), без привязки к YouTube,
 * поэтому ролик грузится в любой стране и без VPN. Вся обвязка — наша:
 * кнопка play/pause, перемотка, время, громкость и полноэкранный режим.
 *
 * Чтобы поставить другой ролик — положите mp4 в /public/video и передайте
 * новый `src` (и при желании `poster`) там, где плеер вызывается.
 */

const VP_CSS = `
.vp-stage video{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;background:#000;border:0;display:block}
.vp-bar{transition:opacity .25s ease}
.vp-icon-btn{display:flex;align-items:center;justify-content:center;background:none;border:none;color:#fff;cursor:pointer;padding:6px;border-radius:8px;transition:background .15s,transform .15s}
.vp-icon-btn:hover{background:rgba(255,255,255,.16);transform:scale(1.06)}
.vp-range{-webkit-appearance:none;appearance:none;height:5px;border-radius:999px;cursor:pointer;outline:none;background:linear-gradient(to right,#F03A3A 0%,#F03A3A var(--vp-progress,0%),rgba(255,255,255,.34) var(--vp-progress,0%),rgba(255,255,255,.34) 100%);transition:height .14s ease}
.vp-range:hover,.vp-range:focus-visible{height:7px}
.vp-range::-webkit-slider-runnable-track{height:100%;border-radius:999px;background:transparent}
.vp-range::-webkit-slider-thumb{-webkit-appearance:none;width:14px;height:14px;margin-top:calc((5px - 14px)/2);border-radius:50%;background:#F03A3A;box-shadow:0 1px 5px rgba(0,0,0,.45);transform:scale(.72);transition:transform .14s ease}
.vp-range:hover::-webkit-slider-thumb,.vp-range:focus-visible::-webkit-slider-thumb{transform:scale(1)}
.vp-range::-moz-range-track{height:5px;border-radius:999px;background:rgba(255,255,255,.34)}
.vp-range::-moz-range-progress{height:5px;border-radius:999px;background:#F03A3A}
.vp-range::-moz-range-thumb{width:14px;height:14px;border:none;border-radius:50%;background:#F03A3A;box-shadow:0 1px 5px rgba(0,0,0,.45);transform:scale(.72);transition:transform .14s ease}
.vp-range:hover::-moz-range-thumb,.vp-range:focus-visible::-moz-range-thumb{transform:scale(1)}
.vp-big-play{transition:transform .18s ease,box-shadow .18s ease}
.vp-big-play:hover{transform:scale(1.08);box-shadow:0 12px 40px rgba(239,68,68,.6)}
`;
function injectVpCss() {
  if (typeof document === 'undefined' || document.getElementById('vp-css')) return;
  const s = document.createElement('style'); s.id = 'vp-css'; s.textContent = VP_CSS;
  document.head.appendChild(s);
}

const fmt = (sec: number) => {
  if (!isFinite(sec) || sec < 0) sec = 0;
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

export function VoevodaPlayer({ src, poster, height = 460 }: { src: string; poster?: string; height?: number }) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const rafRef = useRef<number | null>(null);

  const [started, setStarted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(100);
  const [cur, setCur] = useState(0);
  const [dur, setDur] = useState(0);
  const [fs, setFs] = useState(false);
  const [posterErr, setPosterErr] = useState(false);
  const seekProgress = dur > 0 ? Math.min(100, Math.max(0, (cur / dur) * 100)) : 0;
  const volumeProgress = muted ? 0 : volume;

  useEffect(() => { injectVpCss(); }, []);

  const tick = useCallback(() => {
    const v = videoRef.current;
    if (v) {
      setCur(v.currentTime || 0);
      if (v.duration && isFinite(v.duration)) setDur(v.duration);
    }
    rafRef.current = window.requestAnimationFrame(tick);
  }, []);

  const start = useCallback(() => {
    if (started) return;
    setStarted(true);
    const v = videoRef.current;
    if (v) { void v.play().catch(() => { /* проигрывание начнётся по клику */ }); }
    rafRef.current = window.requestAnimationFrame(tick);
  }, [started, tick]);

  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); }, []);

  useEffect(() => {
    const onFs = () => setFs(document.fullscreenElement === wrapRef.current);
    document.addEventListener('fullscreenchange', onFs);
    return () => document.removeEventListener('fullscreenchange', onFs);
  }, []);

  const togglePlay = () => {
    const v = videoRef.current; if (!v) return;
    if (v.paused) void v.play().catch(() => undefined); else v.pause();
  };
  const onSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setCur(val);
    if (videoRef.current) videoRef.current.currentTime = val;
  };
  const toggleMute = () => {
    const v = videoRef.current; if (!v) return;
    if (muted) { v.muted = false; setMuted(false); if (volume === 0) { setVolume(60); v.volume = 0.6; } }
    else { v.muted = true; setMuted(true); }
  };
  const onVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setVolume(val);
    const v = videoRef.current; if (!v) return;
    v.volume = val / 100;
    if (val === 0) { v.muted = true; setMuted(true); }
    else if (muted) { v.muted = false; setMuted(false); }
  };
  const toggleFs = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else wrapRef.current?.requestFullscreen?.();
  };

  return (
    <div
      ref={wrapRef}
      className="vp-stage"
      style={{ position: 'relative', width: '100%', height: fs ? '100%' : height, borderRadius: fs ? 0 : 18, overflow: 'hidden', background: '#000' }}
    >
      {/* Локальное видео из /public/video */}
      <video
        ref={videoRef}
        src={src}
        playsInline
        preload="metadata"
        poster={poster}
        onLoadedMetadata={e => setDur(e.currentTarget.duration || 0)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onTimeUpdate={e => setCur(e.currentTarget.currentTime || 0)}
      />

      {/* Постер + большая кнопка play (до старта) */}
      {!started && (
        <div
          onClick={start}
          style={{ position: 'absolute', inset: 0, cursor: 'pointer', background: '#0d1117' }}
        >
          {poster && !posterErr
            ? <img src={poster} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={() => setPosterErr(true)} />
            : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#1a1a2e,#2d3748)' }} />}
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.32)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="vp-big-play" style={{ width: 76, height: 76, borderRadius: '50%', background: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 32px rgba(239,68,68,.55)' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="#fff" stroke="none"><polygon points="6 4 20 12 6 20 6 4" /></svg>
            </div>
          </div>
          {/* Бренд-метка */}
          <div style={{ position: 'absolute', top: 16, left: 18, display: 'flex', alignItems: 'center', gap: 7, padding: '6px 12px', borderRadius: 20, background: 'rgba(0,0,0,.5)', backdropFilter: 'blur(6px)', border: '1px solid rgba(255,255,255,.14)' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#EF4444', display: 'inline-block' }} />
            <span style={{ color: '#fff', fontSize: 12, fontWeight: 800, letterSpacing: '.08em' }}>ПЛЕЕР ВОЕВОДА</span>
          </div>
        </div>
      )}

      {/* Кастомная панель управления (после старта) */}
      {started && (
        <>
          {/* Клик по видео = play/pause */}
          <div onClick={togglePlay} style={{ position: 'absolute', inset: 0, cursor: 'pointer' }} />
          <div
            className="vp-bar"
            style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '26px 16px 12px', background: 'linear-gradient(to top, rgba(0,0,0,.85), transparent)', display: 'flex', flexDirection: 'column', gap: 8 }}
          >
            {/* Прогресс */}
            <input
              className="vp-range"
              type="range"
              min={0}
              max={dur || 0}
              step={0.1}
              value={Math.min(cur, dur || 0)}
              onChange={onSeek}
              style={{ width: '100%', '--vp-progress': `${seekProgress}%` } as React.CSSProperties}
              aria-label="Перемотка"
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button className="vp-icon-btn" onClick={togglePlay} aria-label={playing ? 'Пауза' : 'Воспроизвести'}>
                {playing
                  ? <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff"><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></svg>
                  : <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff"><polygon points="6 4 20 12 6 20 6 4" /></svg>}
              </button>

              <button className="vp-icon-btn" onClick={toggleMute} aria-label={muted ? 'Включить звук' : 'Выключить звук'}>
                {muted || volume === 0
                  ? <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="#fff" stroke="#fff" /><line x1="22" y1="9" x2="16" y2="15" /><line x1="16" y1="9" x2="22" y2="15" /></svg>
                  : <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="#fff" stroke="#fff" /><path d="M15.54 8.46a5 5 0 0 1 0 7.07" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14" /></svg>}
              </button>
              <input className="vp-range" type="range" min={0} max={100} step={1} value={muted ? 0 : volume} onChange={onVolume} style={{ width: 80, '--vp-progress': `${volumeProgress}%` } as React.CSSProperties} aria-label="Громкость" />

              <span style={{ color: '#fff', fontSize: 12, fontWeight: 600, fontVariantNumeric: 'tabular-nums', marginLeft: 4 }}>
                {fmt(cur)} / {fmt(dur)}
              </span>

              <div style={{ flex: 1 }} />

              <span style={{ display: 'flex', alignItems: 'center', gap: 6, marginRight: 4 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#EF4444', display: 'inline-block' }} />
                <span style={{ color: 'rgba(255,255,255,.85)', fontSize: 11, fontWeight: 800, letterSpacing: '.08em' }}>ВОЕВОДА</span>
              </span>

              <button className="vp-icon-btn" onClick={toggleFs} aria-label="Полный экран">
                {fs
                  ? <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3M3 16h3a2 2 0 0 1 2 2v3m8 0v-3a2 2 0 0 1 2-2h3" /></svg>
                  : <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3m13-5v3a2 2 0 0 1-2 2h-3" /></svg>}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
