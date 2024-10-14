import { css, html, LitElement } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { consume } from '@lit/context';
import {
  ColorIndicator,
  ColorIndicatorUpdateEventDetail,
} from './ColorIndicator.js';
import { ColorContext, colorContext } from './context/color-context.js';

@customElement('hue-bar')
export class HueBar extends LitElement {
  static styles = css`
    .hue {
      border-radius: 50%;
      position: relative;
    }

    canvas {
      border-radius: 6px;
      display: block;
    }

    .indicator {
      position: absolute;
      inset: 0;
    }
  `;

  @query('canvas.hue-bar')
  private _huePicker!: HTMLCanvasElement;

  @query('color-indicator')
  private _indicator!: ColorIndicator;

  @consume({ context: colorContext, subscribe: true })
  @property({ attribute: false })
  private colorCtx: ColorContext | null = null;

  /**
   * Distinguish this state from the color context hue value.
   * This state only for calculating the color of indicator, not the whole picker hue value.
   *
   * The reason it exists is the indicator color possibly different from the picker.
   */
  @state()
  private _hue = 0;

  connectedCallback(): void {
    super.connectedCallback && super.connectedCallback();
    if (!this.colorCtx) {
      throw new Error('Color context is not provided');
    }
  }

  protected firstUpdated(): void {
    this._draw();
  }

  private _draw() {
    const canvas = this._huePicker;
    const ctx = canvas.getContext('2d')!;
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    for (let i = 0; i <= 360; i++) {
      const hue = i;
      const color = `hsl(${hue}, 100%, 50%)`;
      gradient.addColorStop(i / 360, color);
    }
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  private onIndicatorUpdate(e: CustomEvent<ColorIndicatorUpdateEventDetail>) {
    const { x } = e.detail.percentage;
    const hue = Math.round(x * 360);
    this._hue = hue;
    this.colorCtx!.updateHue(Math.max(0, Math.min(360, hue)));
  }

  render() {
    const currentColor = `hsl(${this._hue}, 100%, 50%)`;
    const position = { x: 0, y: 6 };
    if (this._indicator) {
      const { width, height } = this._indicator.getBoundingClientRect();
      position.x = (this._hue / 360) * width;
      position.y = height / 2;
    }

    return html`
      <div class="hue">
        <canvas width="240" height="12" class="hue-bar"></canvas>
        <color-indicator
          @update="${this.onIndicatorUpdate}"
          color="${currentColor}"
          .position="${position}"
          direction="horizontal"
          class="indicator"
        ></color-indicator>
      </div>
    `;
  }
}
