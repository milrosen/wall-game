/* eslint-disable react/no-array-index-key */
import React from 'react';
import PropTypes from 'prop-types';
import Square from './square';

function renderState({ players, walls, highlight }, width, height) {
  const squareTypes = [...Array(width * height)].fill('');

  players.forEach((player, i) => {
    const name = i === 0 ? ' PlayerA' : ' PlayerB';
    squareTypes[player.x + player.y * width] += name;
  });

  highlight.forEach(([x, y]) => {
    squareTypes[x + y * width] += ' Highlight';
  });

  walls.forEach(([[x1, y1], [x2, y2]]) => {
    if (x1 === x2) {
      squareTypes[x1 + y1 * width] += ' BWall';
    }
    if (y1 === y2) {
      squareTypes[x2 + y2 * width] += ' LWall';
    }
  });

  return squareTypes;
}

function Grid({ width = 10, height = 10, state }) {
  const render = renderState(state, width, height);
  return (
    <div
      className="Grid"
      style={{ gridTemplateColumns: `repeat(${width}, 1fr)`, gridTemplateRows: `repeat(${height}, 1fr)` }}
    >
      {render.map((type, i) => <Square key={i} type={type} gridIndex={i.toString()} />)}
    </div>
  );
}

Grid.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
  // eslint-disable-next-line react/forbid-prop-types
  state: PropTypes.any,
};

export default Grid;
