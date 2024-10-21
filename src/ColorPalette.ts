import { css, html, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import colorsea from 'colorsea';
import { Signal, signal, SignalWatcher } from '@lit-labs/signals';
import { reaction } from 'signal-utils/subtle/reaction';
import { ColorIndicatorUpdateEventDetail } from './ColorIndicator.js';

const c = colorsea as unknown as typeof colorsea.default;

export interface ColorPaletteUpdateEventDetail {
  color: string;
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

  @property({ attribute: false })
  hue!: Signal.State<number>;

  /**
   * Currently selected color, also the color of indicator.
   */
  @state()
  private _currentColor = '#f00';

  private _percentagePosition = signal({ x: 0, y: 0 });

  protected firstUpdated(): void {
    reaction(
      () => this.hue.get(),
      () => this._redraw(),
    );
    reaction(
      () => this._percentagePosition.get(),
      () => this._drawIndicator(),
    );
    this._redraw();
  }

  private _redraw() {
    this._draw();
    this._drawIndicator();
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

  private _draw() {
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

  private _drawIndicator() {
    const { x, y } = this._percentagePosition.get();
    this._currentColor = c
      .hsv(this.hue.get() ?? 0, x * 100, (1 - y) * 100)
      .hex();

    this.dispatchEvent(
      new CustomEvent<ColorPaletteUpdateEventDetail>('update', {
        detail: { color: this._currentColor },
      }),
    );
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
          color="${this._currentColor}"
          class="indicator"
        ></color-indicator>
      </div>
    `;
  }
}
