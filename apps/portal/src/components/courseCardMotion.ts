export const COURSE_CARD_MOTION_CSS = `
  @keyframes courseCardLockReact {
    0%   { transform: rotate(0) scale(1); }
    18%  { transform: rotate(-8deg) scale(1.08); }
    38%  { transform: rotate(7deg) scale(1.1); }
    58%  { transform: rotate(-4deg) scale(1.06); }
    78%  { transform: rotate(3deg) scale(1.03); }
    100% { transform: rotate(0) scale(1); }
  }
  @keyframes courseCardLockGlow {
    0%   { box-shadow: 0 0 0 0 rgba(255,255,255,.42), inset 0 0 0 rgba(255,255,255,0); }
    50%  { box-shadow: 0 0 0 10px rgba(255,255,255,0), inset 0 0 16px rgba(255,255,255,.16); }
    100% { box-shadow: 0 0 0 0 rgba(255,255,255,0), inset 0 0 0 rgba(255,255,255,0); }
  }

  /* ── Shell ── */
  .course-card-shell,
  .c-mil-shell,
  .prof-card-shell {
    position: relative;
    z-index: 1;
    isolation: auto;
    display: flex;
    flex-direction: column;
  }
  .course-card-shell:hover,
  .c-mil-shell:hover,
  .prof-card-shell:hover {
    z-index: 1000;
    animation: none;
  }

  /* ── Card wrap — the actual visible box ── */
  .c-card-wrap {
    flex: 1;
    border: 1px solid #E5E7EB;
    border-radius: 16px;
    background: #fff;
    /* Leave: bottom border + radius return slowly with expand collapse */
    transition: border-top-color .28s ease, border-left-color .28s ease,
                border-right-color .28s ease, border-bottom-color .54s ease,
                border-bottom-left-radius .54s ease, border-bottom-right-radius .54s ease,
                box-shadow .42s ease;
  }
  /* Hover: border-bottom + radius change INSTANTLY */
  .c-mil-shell:hover .c-card-wrap,
  .prof-card-shell:hover .c-card-wrap,
  .course-card-shell:hover .c-card-wrap {
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
    border-bottom-color: transparent;
    transition: border-top-color .28s ease, border-left-color .28s ease,
                border-right-color .28s ease, box-shadow .42s ease;
  }
  .c-mil-shell:hover .c-card-wrap:not([data-locked]),
  .prof-card-shell:hover .c-card-wrap:not([data-locked]),
  .course-card-shell:hover .c-card-wrap:not([data-locked]) {
    border-color: #375DFB;
    border-bottom-color: transparent;
    box-shadow: 0 28px 64px rgba(17,24,39,.16), 0 10px 28px rgba(55,93,251,.2);
  }
  .c-mil-shell:hover .c-card-wrap[data-locked],
  .prof-card-shell:hover .c-card-wrap[data-locked],
  .course-card-shell:hover .c-card-wrap[data-locked] {
    border-color: #D1D5DB;
    border-bottom-color: transparent;
    box-shadow: 0 12px 40px rgba(0,0,0,.12);
  }

  /* ── Image zoom ── */
  .c-card-img,
  .c-img {
    overflow: hidden;
    border-radius: 16px 16px 0 0;
  }
  .c-card-img img,
  .c-img img {
    transform: scale(1);
    transform-origin: center;
    object-position: center top;
    transition: transform .72s cubic-bezier(.22,1,.36,1);
    will-change: transform;
  }
  .course-card-shell:hover .c-img img,
  .c-mil-shell:hover .c-card-img img,
  .prof-card-shell:hover .c-card-img img {
    transform: scale(1.075);
  }

  /* ── Image gradient overlay ── */
  .c-card-overlay {
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: linear-gradient(to top, rgba(17,24,39,.52) 0%, rgba(17,24,39,.08) 48%, transparent 72%);
    opacity: 0;
    transition: opacity .42s ease;
  }
  .course-card-shell:hover .c-card-overlay,
  .c-mil-shell:hover .c-card-overlay,
  .prof-card-shell:hover .c-card-overlay {
    opacity: 1;
  }

  /* ── Series badge text expand ── */
  .c-series-wrap,
  .c-mil-text-wrap,
  .pc-text-wrap {
    overflow: hidden;
    max-width: 0;
    border-radius: 0 8px 8px 0;
    transition: max-width .56s cubic-bezier(.22,1,.36,1);
  }
  .course-card-shell:hover .c-series-wrap,
  .c-mil-shell:hover .c-mil-text-wrap,
  .prof-card-shell:hover .pc-text-wrap {
    max-width: 320px;
  }
  .c-series-text,
  .c-mil-series-text,
  .pc-series-text {
    display: flex;
    align-items: center;
    white-space: nowrap;
    opacity: 0;
    transform: translateX(-12px);
    transition: opacity .3s .08s ease, transform .5s .05s cubic-bezier(.22,1,.36,1);
  }
  .course-card-shell:hover .c-series-text,
  .c-mil-shell:hover .c-mil-series-text,
  .prof-card-shell:hover .pc-series-text {
    opacity: 1;
    transform: translateX(0);
  }

  /* ── Lock icon wiggle ── */
  .c-lock-icon {
    transform-origin: 50% 45%;
  }
  .course-card-shell:hover .c-lock-icon,
  .c-mil-shell:hover .c-lock-icon,
  .prof-card-shell:hover .c-lock-icon {
    animation: courseCardLockReact .72s .12s cubic-bezier(.22,1,.36,1) both,
               courseCardLockGlow .8s .12s ease-out both;
  }

  /*
   * Expand wrap — выдвигается поверх карточек ниже, лейаут не сдвигается.
   */
  .c-expand-wrap {
    position: absolute;
    left: 0;
    right: 0;
    top: calc(100% - 1px);
    z-index: 2;
    visibility: hidden;
    opacity: 0;
    transform: translateY(-6px);
    pointer-events: none;
    transition: opacity .16s ease, transform .22s cubic-bezier(.22,1,.36,1),
                visibility 0s linear .22s, border-color .18s ease, box-shadow .18s ease;
    background: #fff;
    border: 1px solid transparent;
    border-top: none;
    border-radius: 0 0 16px 16px;
  }
  .c-mil-shell:hover .c-expand-wrap,
  .prof-card-shell:hover .c-expand-wrap,
  .course-card-shell:hover .c-expand-wrap {
    z-index: 1001;
    visibility: visible;
    opacity: 1;
    transform: translateY(0);
    pointer-events: auto;
    box-shadow: 0 22px 42px rgba(17,24,39,.18);
    transition: opacity .16s ease, transform .22s cubic-bezier(.22,1,.36,1),
                visibility 0s, border-color .18s ease, box-shadow .18s ease;
  }
  .c-mil-shell:hover .c-card-wrap:not([data-locked]) ~ .c-expand-wrap,
  .prof-card-shell:hover .c-card-wrap:not([data-locked]) ~ .c-expand-wrap,
  .course-card-shell:hover .c-card-wrap:not([data-locked]) ~ .c-expand-wrap {
    border-color: #375DFB;
  }
  .c-mil-shell:hover .c-card-wrap[data-locked] ~ .c-expand-wrap,
  .prof-card-shell:hover .c-card-wrap[data-locked] ~ .c-expand-wrap,
  .course-card-shell:hover .c-card-wrap[data-locked] ~ .c-expand-wrap {
    border-color: #D1D5DB;
  }
  .c-expand-inner {
    overflow: hidden;
    min-width: 0;
  }
  .c-expand-inner * {
    overflow-wrap: break-word;
    word-break: break-word;
  }

  /* ── Staggered items inside expand ── */
  .c-oi {
    opacity: 0;
    transform: translateY(12px);
    transition: opacity .1s ease, transform .16s ease;
  }
  .c-mil-shell:hover .c-oi,
  .prof-card-shell:hover .c-oi,
  .course-card-shell:hover .c-oi {
    opacity: 1;
    transform: translateY(0);
    transition: opacity .34s ease, transform .5s cubic-bezier(.22,1,.36,1);
  }
  .c-mil-shell:hover .c-oi-1,
  .prof-card-shell:hover .c-oi-1,
  .course-card-shell:hover .c-oi-1 { transition-delay: 80ms; }
  .c-mil-shell:hover .c-oi-2,
  .prof-card-shell:hover .c-oi-2,
  .course-card-shell:hover .c-oi-2 { transition-delay: 150ms; }
  .c-mil-shell:hover .c-oi-3,
  .prof-card-shell:hover .c-oi-3,
  .course-card-shell:hover .c-oi-3 { transition-delay: 220ms; }

  /* ── Buttons ── */
  .c-enroll-btn {
    transition: transform .18s ease, box-shadow .18s ease !important;
  }
  .c-enroll-btn:hover {
    transform: translateY(-2px) !important;
    box-shadow: 0 8px 20px rgba(55,93,251,.35) !important;
  }
  .c-fav-btn {
    transition: transform .15s ease;
  }
  .c-fav-btn:hover {
    transform: scale(1.28) !important;
  }

  @media (prefers-reduced-motion: reduce) {
    .course-card-shell,
    .c-mil-shell,
    .prof-card-shell,
    .c-card-wrap,
    .c-card-img img,
    .c-img img,
    .c-card-overlay,
    .c-series-wrap,
    .c-mil-text-wrap,
    .pc-text-wrap,
    .c-series-text,
    .c-mil-series-text,
    .pc-series-text,
    .c-expand-wrap,
    .c-oi {
      animation: none !important;
      transition: none !important;
    }
  }
`;
