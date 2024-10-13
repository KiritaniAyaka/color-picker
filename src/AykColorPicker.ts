import { html, css, LitElement, PropertyValues } from 'lit';
import { property } from 'lit/decorators.js';
import { provide } from '@lit/context';

import './ColorIndicator.js';
import './ColorPalette.js';
import './HueBar.js';
import './AlphaBar.js';

import { colorContext, ColorContext } from './context/color-context.js';

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

  @provide({ context: colorContext })
  @property({ attribute: false })
  colorCtx: ColorContext = {
    hue: 0,
    alpha: 1,
    color: '#f00',
    updateHue: hue => {
      this.colorCtx = { ...this.colorCtx, hue };
    },
    updateAlpha: alpha => {
      this.colorCtx = { ...this.colorCtx, alpha };
    },
    updateColor: color => {
      this.colorCtx = { ...this.colorCtx, color };
    },
  };

  protected willUpdate(changedProperties: PropertyValues): void {
    if (changedProperties.has('colorCtx')) {
      this.dispatchEvent(
        new CustomEvent<ColorPickerUpdateEventDetail>('update', {
          detail: {
            hue: this.colorCtx.hue,
            alpha: this.colorCtx.alpha,
            color: this.colorCtx.color,
          },
        }),
      );
    }
  }

  render() {
    return html`
      <color-palette></color-palette>
      <hue-bar></hue-bar>
      <alpha-bar></alpha-bar>
    `;
  }
}
