import React from 'react';

export default ({ glyph }) => (
  <svg
    viewBox={`${glyph.viewBox}`}
    style={{
      color: 'inherit',
      fill: 'currentColor',
      width: 'inherit',
      height: 'inherit',
    }}
  >
    <use xlinkHref={`#${glyph.id}`} />
  </svg>
);
