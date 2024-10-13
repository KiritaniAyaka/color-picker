import { createContext } from '@lit/context';

export type ColorContext = {
  hue: number;
  alpha: number;
  color: string;
  updateColor: (color: string) => void;
  updateHue: (hue: number) => void;
  updateAlpha: (alpha: number) => void;
};

export const colorContext = createContext<ColorContext>(Symbol('colorContext'));
