import { css, html, LitElement } from 'lit';
import { customElement, query, state } from 'lit/decorators.js';
import { ColorIndicatorUpdateEventDetail } from './ColorIndicator.js';

export interface HueBarUpdateEventDetail {
  hue: number;
}

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

  @state()
  private _hue = 0;

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
    this._hue = Math.max(0, Math.min(360, hue));
    this.dispatchEvent(
      new CustomEvent<HueBarUpdateEventDetail>('update', {
        bubbles: true,
        detail: { hue: this._hue },
      }),
    );
  }

  render() {
    const currentColor = `hsl(${this._hue}, 100%, 50%)`;

    return html`
      <div class="hue">
        <canvas width="240" height="12" class="hue-bar"></canvas>
        <color-indicator
          @update="${this.onIndicatorUpdate}"
          color="${currentColor}"
          direction="horizontal"
          class="indicator"
        ></color-indicator>
      </div>
    `;
  }
}
