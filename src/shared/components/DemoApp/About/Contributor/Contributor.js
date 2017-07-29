import React from 'react';
import PropTypes from 'prop-types';

function Contributor({ name, twitter }) {
  return (
    <a
      href={`https://twitter.com/${twitter}`}
      target="_blank"
      rel="noopener noreferrer"
    >
      {name}
    </a>
  );
}

Contributor.propTypes = {
  name: PropTypes.string.isRequired,
  twitter: PropTypes.string.isRequired,
};

export default Contributor;
