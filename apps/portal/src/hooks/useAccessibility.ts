import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type FontSize = 'normal' | 'large' | 'xlarge';
type Contrast = 'normal' | 'high';

interface A11yState {
  enabled: boolean;
  fontSize: FontSize;
  contrast: Contrast;
  toggle: () => void;
  setFontSize: (v: FontSize) => void;
  setContrast: (v: Contrast) => void;
}

export const useAccessibility = create<A11yState>()(
  persist(
    (set, get) => ({
      enabled: false,
      fontSize: 'normal',
      contrast: 'normal',
      toggle: () => {
        const next = !get().enabled;
        set({ enabled: next });
        document.documentElement.setAttribute('data-a11y', next ? '1' : '0');
      },
      setFontSize: (v) => set({ fontSize: v }),
      setContrast: (v) => set({ contrast: v }),
    }),
    { name: 'voevoda_a11y' }
  )
);

export const A11Y_CSS = `
  [data-a11y="1"] { filter: contrast(1.2); }
  [data-contrast="high"] { filter: contrast(1.5) !important; }
`;