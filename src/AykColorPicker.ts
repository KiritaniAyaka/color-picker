import { html, css, LitElement, PropertyValues } from 'lit';
import { property, state } from 'lit/decorators.js';
import { signal, SignalWatcher } from '@lit-labs/signals';
import { reaction } from 'signal-utils/subtle/reaction';

import './ColorIndicator.js';
import './ColorPalette.js';
import './HueBar.js';
import './AlphaBar.js';

import type { ColorPaletteUpdateEventDetail } from './ColorPalette.js';

export interface ColorPickerUpdateEventDetail {
  hue: number;
  alpha: number;
  color: string;
}

export class AykColorPicker extends SignalWatcher(LitElement) {
  static styles = css`
    :host {
      position: relative;
      width: 240px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
  `;

  @property({ type: String })
  model = 'RGB';

  private _hue = signal(0);

  private _alpha = signal(1);

  @state()
  private _color = '#f00';

  @property({ type: String })
  colorSpace = 'HSB';

  space = signal('HSB');

  protected willUpdate(_changedProperties: PropertyValues): void {
    if (_changedProperties.has('colorSpace')) {
      if (this.colorSpace !== 'HSB' && this.colorSpace !== 'HSL') {
        throw new Error('Invalid color space');
      }
      this.space.set(this.colorSpace);
    }
  }

  protected firstUpdated(): void {
    reaction(
      () => [this._hue.get(), this._alpha.get()],
      () => this._dispatchUpdate(),
    );
  }

  private _dispatchUpdate() {
    this.dispatchEvent(
      new CustomEvent<ColorPickerUpdateEventDetail>('update', {
        detail: {
          hue: this._hue.get(),
          alpha: this._alpha.get(),
          color: this._color,
        },
      }),
    );
  }

  private _colorUpdate(e: CustomEvent<ColorPaletteUpdateEventDetail>) {
    this._color = e.detail.color;
    this._dispatchUpdate();
  }

  render() {
    return html`
      <color-palette
        @update="${this._colorUpdate}"
        .space="${this.space}"
        .hue="${this._hue}"
      ></color-palette>
      <hue-bar .hue="${this._hue}"></hue-bar>
      <alpha-bar .alpha="${this._alpha}" .hue="${this._hue}"></alpha-bar>
    `;
  }
}
