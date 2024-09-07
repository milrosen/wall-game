import React from 'react';
import PropTypes from 'prop-types';

function Square({ type = '', gridIndex }) {
  return (
    <div className={`Square ${type}`} data-grid-index={gridIndex} />
  );
}
Square.propTypes = {
  type: PropTypes.string,
  gridIndex: PropTypes.string,
};

export default Square;
