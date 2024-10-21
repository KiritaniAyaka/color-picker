import { css, html, LitElement } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { computed, Signal, signal, SignalWatcher } from '@lit-labs/signals';
import { reaction } from 'signal-utils/subtle/reaction';
import { effect } from 'signal-utils/subtle/microtask-effect';
import { hsl, hsl2hsv, hsv, hsv2hsl } from '@kiritaniayaka/surprise';
import {
  ColorIndicator,
  ColorIndicatorUpdateEventDetail,
} from './ColorIndicator.js';

export type ColorSpace = 'HSB' | 'HSL';

export interface ColorPaletteUpdateEventDetail {
  color: string;
  x: number;
  y: number;
  space: ColorSpace;
}

@customElement('color-palette')
export class ColorPalette extends SignalWatcher(LitElement) {
  static styles = css`
    :host {
      user-select: none;
      -webkit-user-drag: none;
    }

    .color {
      position: relative;
    }

    canvas {
      display: block;
    }

    .indicator {
      position: absolute;
      inset: 0;
    }
  `;

  @query('.indicator')
  private indicator!: ColorIndicator;

  @property({ attribute: false })
  hue!: Signal.State<number>;

  @property({ attribute: false })
  space!: Signal.State<string>;

  /**
   * Currently selected color, also the color of indicator.
   */
  private _color!: Signal.Computed<string>;

  private _percentagePosition = signal({ x: 0, y: 0 });

  protected firstUpdated(): void {
    this._color = computed(() => {
      const s = this.space.get();
      const { x, y } = this._percentagePosition.get();
      if (s === 'HSB') {
        return hsv(this.hue.get() ?? 0, x, 1 - y).hex();
      }
      return hsl(this.hue.get() ?? 0, x, 1 - y).hex();
    });

    reaction(
      () => [this._color.get()],
      () => {
        const { x, y } = this._percentagePosition.get();
        this.dispatchEvent(
          new CustomEvent<ColorPaletteUpdateEventDetail>('update', {
            detail: {
              color: this._color.get(),
              x,
              y,
              space: this.space.get() as ColorSpace,
            },
          }),
        );
      },
    );

    reaction(
      () => this.space.get(),
      current => {
        const { x, y } = this._percentagePosition.get();
        const converter = current === 'HSB' ? hsl2hsv : hsv2hsl;
        const [, s, bl] = converter(this.hue.get(), x, 1 - y);
        this._percentagePosition.set({ x: s, y: 1 - bl });
        this.indicator.setPosition(this._percentagePosition.get());
      },
    );

    effect(() => {
      if (this.space.get() === 'HSB') {
        this._drawHSB();
      } else {
        this._drawHSL();
      }
    });
  }

  private _drawHSL() {
    const canvas: HTMLCanvasElement =
      this.renderRoot.querySelector('canvas.color-panel')!;
    const ctx = canvas.getContext('2d')!;

    for (let height = 0; height <= canvas.height; height++) {
      const lightness = (1 - height / canvas.height) * 100;
      const saturationGradient = ctx.createLinearGradient(
        0,
        0,
        canvas.width,
        0,
      );
      for (let i = 0; i <= 100; i++) {
        saturationGradient.addColorStop(
          i / 100,
          `hsl(${this.hue.get()}, ${i}%, ${lightness}%)`,
        );
      }
      ctx.fillStyle = saturationGradient;
      ctx.fillRect(0, height, canvas.width, 1);
    }
  }

  private _drawHSB() {
    const canvas: HTMLCanvasElement =
      this.renderRoot.querySelector('canvas.color-panel')!;
    const ctx = canvas.getContext('2d')!;
    const gradientHue = ctx.createLinearGradient(0, 0, canvas.width, 0);
    gradientHue.addColorStop(0, `hsl(${this.hue.get()} 100% 50% / 0)`);
    gradientHue.addColorStop(1, `hsl(${this.hue.get()} 100% 50% / 1)`);
    const gradientGray = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradientGray.addColorStop(0, 'rgba(0, 0, 0, 0)');
    gradientGray.addColorStop(1, 'rgba(0, 0, 0, 1)');
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = gradientHue;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = gradientGray;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  private indicatorUpdate(e: CustomEvent<ColorIndicatorUpdateEventDetail>) {
    this._percentagePosition.set({
      x: e.detail.percentage.x,
      y: e.detail.percentage.y,
    });
  }

  render() {
    return html`
      <div class="color">
        <canvas width="240" height="240" class="color-panel"></canvas>
        <color-indicator
          @update="${this.indicatorUpdate}"
          color="${this._color?.get() ?? '#f00'}"
          class="indicator"
        ></color-indicator>
      </div>
    `;
  }
}
