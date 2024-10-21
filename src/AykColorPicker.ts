import { html, css, LitElement } from 'lit';
import { property, state } from 'lit/decorators.js';

import './ColorIndicator.js';
import './ColorPalette.js';
import './HueBar.js';
import './AlphaBar.js';

import type { HueBarUpdateEventDetail } from './HueBar.js';
import type { AlphaBarUpdateEventDetail } from './AlphaBar.js';
import type { ColorPaletteUpdateEventDetail } from './ColorPalette.js';

export interface ColorPickerUpdateEventDetail {
  hue: number;
  alpha: number;
  color: string;
}

export class AykColorPicker extends LitElement {
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

  @state()
  private _hue = 0;

  @state()
  private _alpha = 1;

  @state()
  private _color = '#f00';

  private _dispatchUpdate() {
    this.dispatchEvent(
      new CustomEvent<ColorPickerUpdateEventDetail>('update', {
        detail: { hue: this._hue, alpha: this._alpha, color: this._color },
      }),
    );
  }

  private _hueUpdate(e: CustomEvent<HueBarUpdateEventDetail>) {
    this._hue = e.detail.hue;
    this._dispatchUpdate();
  }

  private _alphaUpdate(e: CustomEvent<AlphaBarUpdateEventDetail>) {
    this._alpha = e.detail.alpha;
    this._dispatchUpdate();
  }

  private _colorUpdate(e: CustomEvent<ColorPaletteUpdateEventDetail>) {
    this._color = e.detail.color;
    this._dispatchUpdate();
  }

  render() {
    return html`
      <color-palette
        @update="${this._colorUpdate}"
        hue="${this._hue}"
      ></color-palette>
      <hue-bar @update="${this._hueUpdate}"></hue-bar>
      <alpha-bar @update="${this._alphaUpdate}" hue="${this._hue}"></alpha-bar>
    `;
  }
}
