import { css, html, LitElement, PropertyValues } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { consume } from '@lit/context';
import {
  ColorIndicator,
  ColorIndicatorUpdateEventDetail,
} from './ColorIndicator.js';
import { color } from './color.js';
import { colorContext, ColorContext } from './context/color-context.js';

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

  @query('.indicator')
  private _indicator!: ColorIndicator;

  @consume({ context: colorContext, subscribe: true })
  @property({ attribute: false })
  private colorCtx: ColorContext | null = null;

  @state()
  private _indicatorPosition = { x: 0, y: 0 };

  // This component doesn't have its own color state,
  // because its indicator color is consistent with the color context.

  connectedCallback(): void {
    super.connectedCallback && super.connectedCallback();
    if (!this.colorCtx) {
      throw new Error('Color context is not provided');
    }
  }

  protected firstUpdated(): void {
    this._draw();
    this._drawIndicator();
  }

  protected updated(changedProperties: PropertyValues): void {
    if (changedProperties.has('colorCtx')) {
      const c = changedProperties.get('colorCtx') as ColorContext;
      if (c && this.colorCtx!.hue !== c.hue) {
        this._draw();
        this._drawIndicator();
      }
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
          `hsl(${this.colorCtx!.hue}, ${i}%, ${lightness}%)`,
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
    gradientHue.addColorStop(0, `hsl(${this.colorCtx!.hue} 100% 50% / 0)`);
    gradientHue.addColorStop(1, `hsl(${this.colorCtx!.hue} 100% 50% / 1)`);
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
    const { x, y } = this._indicatorPosition;
    const rect = this._indicator.getBoundingClientRect();
    this.colorCtx!.updateColor(
      color
        .hsv(
          this.colorCtx!.hue,
          (x / rect.width) * 100,
          (1 - y / rect.height) * 100,
        )
        .hex(),
    );
  }

  private indicatorUpdate(e: CustomEvent<ColorIndicatorUpdateEventDetail>) {
    this._indicatorPosition = { ...e.detail.position };
    this._drawIndicator();
  }

  render() {
    return html`
      <div class="color">
        <canvas width="240" height="240" class="color-panel"></canvas>
        <color-indicator
          @update="${this.indicatorUpdate}"
          color="${this.colorCtx!.color}"
          .position="${this._indicatorPosition}"
          class="indicator"
        ></color-indicator>
      </div>
    `;
  }
}
