import { css, html, LitElement } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { Signal, SignalWatcher } from '@lit-labs/signals';
import { reaction } from 'signal-utils/subtle/reaction';
import { ColorIndicatorUpdateEventDetail } from './ColorIndicator.js';

@customElement('alpha-bar')
export class AlphaBar extends SignalWatcher(LitElement) {
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

  @property({ attribute: false })
  hue!: Signal.State<number>;

  @property({ attribute: false })
  alpha!: Signal.State<number>;

  @query('canvas.alpha-bar')
  private _alphaPicker!: HTMLCanvasElement;

  protected firstUpdated(): void {
    reaction(
      () => this.hue.get(),
      () => this._draw(),
    );
    this._draw();
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
    gradient.addColorStop(0, `hsl(${this.hue.get()}, 100%, 50%, 1)`);
    gradient.addColorStop(1, `hsl(${this.hue.get()}, 100%, 50%, 0)`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  private indicatorUpdate(e: CustomEvent<ColorIndicatorUpdateEventDetail>) {
    this.alpha.set(Math.max(0, Math.min(1, 1 - e.detail.percentage.x)));
  }

  render() {
    return html`
      <div class="alpha">
        <canvas width="240" height="12" class="alpha-bar"></canvas>
        <color-indicator
          @update="${this.indicatorUpdate}"
          color="hsl(${this.hue.get()}, 100%, 50%, ${this.alpha.get()})"
          direction="horizontal"
          class="indicator"
        ></color-indicator>
      </div>
    `;
  }
}
