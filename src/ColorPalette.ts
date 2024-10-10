import { css, html, LitElement, PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import colorsea from 'colorsea';
import { ColorIndicatorUpdateEventDetail } from './ColorIndicator.js';

const c = colorsea as unknown as typeof colorsea.default;

export interface ColorPaletteUpdateEventDetail {
  color: string;
}

@customElement('color-palette')
export class ColorPalette extends LitElement {
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

  @property({ type: Number })
  hue = 0;

  @state()
  private _currentColor = '#f00';

  @state()
  private _percentagePosition = { x: 0, y: 0 };

  protected firstUpdated(): void {
    this._draw();
    this._drawIndicator();
  }

  protected updated(changedProperties: PropertyValues): void {
    if (changedProperties.has('hue')) {
      this._draw();
      this._drawIndicator();
    }
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
          `hsl(${this.hue}, ${i}%, ${lightness}%)`,
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
    gradientHue.addColorStop(0, `hsl(${this.hue} 100% 50% / 0)`);
    gradientHue.addColorStop(1, `hsl(${this.hue} 100% 50% / 1)`);
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
    const { x, y } = this._percentagePosition;
    this._currentColor = c.hsv(this.hue, x * 100, (1 - y) * 100).hex();

    this.dispatchEvent(
      new CustomEvent<ColorPaletteUpdateEventDetail>('update', {
        detail: { color: this._currentColor },
      }),
    );
  }

  private indicatorUpdate(e: CustomEvent<ColorIndicatorUpdateEventDetail>) {
    this._percentagePosition = { ...e.detail.percentage };
    this._drawIndicator();
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
