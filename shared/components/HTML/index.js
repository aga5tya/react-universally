/* eslint-disable react/no-danger */
/* eslint-disable jsx-a11y/html-has-lang */

import React from 'react';
import PropTypes from 'prop-types';

/**
 * The is the HTML shell for our React Application.
 */
function HTML(props) {
  const { htmlAttributes, headerElements, bodyElements, appBodyString, svgSpriteString } = props;

  return (
    <html {...htmlAttributes}>
      <head>
        {headerElements}
      </head>
      <body>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          xmlnsXlink="http://www.w3.org/1999/xlink"
          style={{ position: 'absolute', width: 0, height: 0 }}
          dangerouslySetInnerHTML={{ __html: svgSpriteString }}
        />
        <div id="app" dangerouslySetInnerHTML={{ __html: appBodyString }} />
        {bodyElements}
      </body>
    </html>
  );
}

HTML.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  htmlAttributes: PropTypes.object,
  headerElements: PropTypes.node,
  bodyElements: PropTypes.node,
  appBodyString: PropTypes.string,
};

HTML.defaultProps = {
  htmlAttributes: null,
  headerElements: null,
  bodyElements: null,
  appBodyString: '',
};

// EXPORT

export default HTML;
