type SmoothWheelOptions = {
  ease?: number;
  speed?: number;
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const normalizedDelta = (event: WheelEvent) => {
  if (event.deltaMode === WheelEvent.DOM_DELTA_LINE) return event.deltaY * 18;
  if (event.deltaMode === WheelEvent.DOM_DELTA_PAGE) return event.deltaY * window.innerHeight;
  return event.deltaY;
};

export function bindSmoothPageWheel(element: HTMLElement, options: SmoothWheelOptions = {}) {
  const ease = options.ease ?? 0.18;
  const speed = options.speed ?? 0.92;
  let frame = 0;
  let targetY = window.scrollY;

  const maxScrollY = () => Math.max(0, document.documentElement.scrollHeight - window.innerHeight);

  const cancelAnimation = () => {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    targetY = window.scrollY;
  };

  const animate = () => {
    const currentY = window.scrollY;
    const nextY = currentY + (targetY - currentY) * ease;

    if (Math.abs(targetY - currentY) < 0.7) {
      window.scrollTo(window.scrollX, targetY);
      frame = 0;
      return;
    }

    window.scrollTo(window.scrollX, nextY);
    frame = requestAnimationFrame(animate);
  };

  const handleWheel = (event: WheelEvent) => {
    if (event.ctrlKey) return;
    event.preventDefault();

    targetY = clamp((frame ? targetY : window.scrollY) + normalizedDelta(event) * speed, 0, maxScrollY());
    if (!frame) frame = requestAnimationFrame(animate);
  };

  const handleOutsideWheel = (event: WheelEvent) => {
    if (!element.contains(event.target as Node)) cancelAnimation();
  };

  element.addEventListener('wheel', handleWheel, { passive: false });
  element.addEventListener('mouseleave', cancelAnimation);
  window.addEventListener('wheel', handleOutsideWheel, { capture: true, passive: true });

  return () => {
    element.removeEventListener('wheel', handleWheel);
    element.removeEventListener('mouseleave', cancelAnimation);
    window.removeEventListener('wheel', handleOutsideWheel, { capture: true });
    cancelAnimation();
  };
}
