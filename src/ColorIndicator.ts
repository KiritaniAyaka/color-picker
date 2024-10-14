import { css, html, LitElement, PropertyValues } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';

const MOUSE_LEFT_BUTTON = 1;

const AVALIABLE_DIRECTION = ['bidimension', 'horizontal', 'vertical'] as const;

export interface ColorIndicatorUpdateEventDetail {
  position: { x: number; y: number };
  percentage: { x: number; y: number };
}

@customElement('color-indicator')
export class ColorIndicator extends LitElement {
  static styles = css`
    :host {
      user-select: none;
      -webkit-user-drag: none;
    }

    .indicator {
      width: 10px;
      height: 10px;
      border: 3px solid white;
      border-radius: 50%;
      position: absolute;
      translate: -50% -50%;
      pointer-events: none; /* prevent the indicator from blocking the mouse event. */
      box-shadow: 0 3px 4px -1.5px rgb(0 0 0 / 0.67);
      z-index: 1;
    }

    :host {
      position: relative;
      width: 100%;
      height: 100%;
      inset: 0;
    }
  `;

  constructor() {
    super();
    this.addEventListener('mousemove', this.positionChange);
    this.addEventListener('mousedown', this.positionChange);
    this.addEventListener('mouseleave', this.positionChange);
    this.addEventListener('mouseup', this.positionChange);
  }

  @query('.indicator')
  private area!: HTMLDivElement;

  @property({ type: String })
  color = '#000';

  @property({ attribute: false })
  position = { x: 0, y: 0 };

  @state()
  private _style = {};

  @property({ type: String })
  direction = 'bidimension';

  @state()
  private _manipulating = false;

  protected firstUpdated() {
    this.updatePosition(0, 0);
  }

  private _restricPosition(position: { x: number; y: number }) {
    // calculating new position
    const areaRect = this.getBoundingClientRect();
    const newPosition = {
      x: Math.max(0, Math.min(areaRect.width, position.x)),
      y: Math.max(0, Math.min(areaRect.height, position.y)),
    };
    // limit according to the direction
    if (this.direction === 'horizontal') {
      newPosition.y = this.offsetHeight / 2;
    } else if (this.direction === 'vertical') {
      newPosition.x = this.offsetWidth / 2;
    }
    return newPosition;
  }

  protected willUpdate(changedProperties: PropertyValues): void {
    if (changedProperties.has('color')) {
      this._style = {
        ...this._style,
        background: `linear-gradient(to left, ${this.color}, ${this.color}), white`,
      };
    }
    if (changedProperties.has('position')) {
      this.applyPosition(this._restricPosition(this.position));
    }
    if (
      changedProperties.has('direction') &&
      !AVALIABLE_DIRECTION.includes(this.direction as any)
    ) {
      console.error(
        `Invalid direction: ${this.direction}. Avaliable direction has: ${AVALIABLE_DIRECTION.join(', ')}. Automatically fallback to ${AVALIABLE_DIRECTION[0]}`,
      );
      this.direction = AVALIABLE_DIRECTION[0];
    }
  }

  private positionChange(e: MouseEvent) {
    if ((e.buttons & MOUSE_LEFT_BUTTON) <= 0) return;
    const el = e.target as HTMLElement; // this variable must be here otherwise the event target will be null

    if (e.type === 'mouseleave') {
      if (this._manipulating) {
        const mouseMoveOnOwner = (ownerEvent: MouseEvent) => {
          const rect = el.getBoundingClientRect();
          this.updatePosition(
            ownerEvent.clientX - rect.left,
            ownerEvent.clientY - rect.top,
          );
        };

        const owner: Document = (e.target! as any).ownerDocument;

        const mouseUpOnOwner = () => {
          this._manipulating = false;
          owner.removeEventListener('mousemove', mouseMoveOnOwner);
          owner.removeEventListener('mouseup', mouseUpOnOwner);
        };

        owner.addEventListener('mousemove', mouseMoveOnOwner);
        owner.addEventListener('mouseup', mouseUpOnOwner);
      } else {
        return;
      }
    }

    if (e.type === 'mousedown') {
      this._manipulating = true;
    } else if (e.type === 'mouseup') {
      this._manipulating = false;
    } else if (e.type === 'mousemove' && !this._manipulating) {
      return;
    }

    this.updatePosition(e.offsetX, e.offsetY);
  }

  private updatePosition(x: number, y: number) {
    const newPosition = this._restricPosition({ x, y });

    this.position = newPosition;
    this.applyPosition(newPosition);

    this.dispatchEvent(
      new CustomEvent<ColorIndicatorUpdateEventDetail>('update', {
        bubbles: true,
        detail: {
          position: newPosition,
          percentage: {
            x: newPosition.x / this.offsetWidth,
            y: newPosition.y / this.offsetHeight,
          },
        },
      }),
    );
  }

  private applyPosition(position: { x: number; y: number }) {
    this._style = {
      ...this._style,
      left: `${position.x}px`,
      top: `${position.y}px`,
    };
  }

  protected render() {
    return html` <div class="indicator" style=${styleMap(this._style)}></div> `;
  }
}
