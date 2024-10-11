// eslint-disable-next-line import/no-extraneous-dependencies
import React from 'react';
import { createComponent, EventName } from '@lit/react';
import {
  ColorPickerUpdateEventDetail,
  AykColorPicker as El,
} from '../AykColorPicker.js';

export const AykColorPicker = createComponent({
  tagName: 'ayk-color-picker',
  elementClass: El,
  react: React,
  events: {
    onUpdate: 'update' as EventName<CustomEvent<ColorPickerUpdateEventDetail>>,
  },
});
