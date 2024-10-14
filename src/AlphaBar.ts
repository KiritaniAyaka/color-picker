import { css, html, LitElement, PropertyValues } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { consume } from '@lit/context';
import {
  ColorIndicator,
  ColorIndicatorUpdateEventDetail,
} from './ColorIndicator.js';
import { colorContext, ColorContext } from './context/color-context.js';

@customElement('alpha-bar')
export class AlphaBar extends LitElement {
  static styles = css`
    :host {
      user-select: none;
      -webkit-user-drag: none;
    }

    .alpha {
      border-radius: 50%;
      position: relative;
    }

    canvas {
      display: block;
      border-radius: 6px;
    }

    .indicator {
      position: absolute;
      inset: 0;
    }
  `;

  @consume({ context: colorContext, subscribe: true })
  @property({ attribute: false })
  private colorCtx: ColorContext | null = null;

  @query('canvas.alpha-bar')
  private _alphaPicker!: HTMLCanvasElement;

  @query('.indicator')
  private _indicator!: ColorIndicator;

  /**
   * Distinguish this state from the color context alpha value.
   * This state only for calculating the color of indicator, not the whole picker alpha value.
   *
   * The reason it exists is the indicator color possibly different from the picker.
   */
  @state()
  private _alpha = 0;

  connectedCallback(): void {
    super.connectedCallback && super.connectedCallback();
    if (!this.colorCtx) {
      throw new Error('Color context is not provided');
    }
  }

  protected firstUpdated(): void {
    this._draw();
  }

  protected updated(changedProperties: PropertyValues): void {
    if (changedProperties.has('colorCtx')) {
      const c = changedProperties.get('colorCtx') as ColorContext;
      if (c && c.hue !== this.colorCtx!.hue) {
        this._draw();
      }
    }
  }

  private _draw() {
    const canvas = this._alphaPicker;
    const ctx = canvas.getContext('2d')!;
    const gridSize = 6;
    const lightColor = '#f0f0f0';
    const darkColor = '#e0e0e0';

    for (let x = 0; x < canvas.width; x += gridSize) {
      for (let y = 0; y < canvas.height; y += gridSize) {
        const isEven =
          (Math.floor(x / gridSize) + Math.floor(y / gridSize)) % 2 === 0;
        ctx.fillStyle = isEven ? lightColor : darkColor;
        ctx.fillRect(x, y, gridSize, gridSize);
      }
    }

    const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    gradient.addColorStop(0, `hsl(${this.colorCtx!.hue}, 100%, 50%, 1)`);
    gradient.addColorStop(1, `hsl(${this.colorCtx!.hue}, 100%, 50%, 0)`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  private indicatorUpdate(e: CustomEvent<ColorIndicatorUpdateEventDetail>) {
    const { x } = e.detail.percentage;
    const alpha = Math.max(0, Math.min(1, 1 - x));
    this._alpha = alpha;
    this.colorCtx!.updateAlpha(alpha);
  }

  render() {
    const currentColor = `hsl(${this.colorCtx!.hue}, 100%, 50%, ${this._alpha})`;
    const position = { x: 0, y: 6 };
    if (this._indicator) {
      const { width, height } = this._indicator.getBoundingClientRect();
      position.x = (1 - this._alpha) * width;
      position.y = height / 2;
    }

    return html`
      <div class="alpha">
        <canvas width="240" height="12" class="alpha-bar"></canvas>
        <color-indicator
          @update="${this.indicatorUpdate}"
          color="${currentColor}"
          .position="${position}"
          direction="horizontal"
          class="indicator"
        ></color-indicator>
      </div>
    `;
  }
}
