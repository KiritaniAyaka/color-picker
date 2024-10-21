import { css, html, LitElement } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { Signal, SignalWatcher, watch } from '@lit-labs/signals';
import { ColorIndicatorUpdateEventDetail } from './ColorIndicator.js';

@customElement('hue-bar')
export class HueBar extends SignalWatcher(LitElement) {
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

  @property({ attribute: false })
  hue!: Signal.State<number>;

  @query('canvas.hue-bar')
  private _huePicker!: HTMLCanvasElement;

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
    this.hue.set(Math.max(0, Math.min(360, Math.round(x * 360))));
  }

  render() {
    return html`
      <div class="hue">
        <canvas width="240" height="12" class="hue-bar"></canvas>
        <color-indicator
          @update="${this.onIndicatorUpdate}"
          color="hsl(${watch(this.hue)}, 100%, 50%)"
          direction="horizontal"
          class="indicator"
        ></color-indicator>
      </div>
    `;
  }
}
