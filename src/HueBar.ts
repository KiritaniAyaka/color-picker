import { css, html, LitElement } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { consume } from '@lit/context';
import { ColorIndicatorUpdateEventDetail } from './ColorIndicator.js';
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

  @consume({ context: colorContext, subscribe: true })
  @property({ attribute: false })
  private colorCtx: ColorContext | null = null;

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

  private indicatorUpdate(e: CustomEvent<ColorIndicatorUpdateEventDetail>) {
    const { x } = e.detail.percentage;
    const hue = Math.round(x * 360);
    this.colorCtx!.updateHue(Math.max(0, Math.min(360, hue)));
  }

  render() {
    const currentColor = `hsl(${this.colorCtx!.hue}, 100%, 50%)`;

    return html`
      <div class="hue">
        <canvas width="240" height="12" class="hue-bar"></canvas>
        <color-indicator
          @update="${this.indicatorUpdate}"
          color="${currentColor}"
          direction="horizontal"
          class="indicator"
        ></color-indicator>
      </div>
    `;
  }
}
