import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Grid from './grid';
// eslint-disable-next-line import/no-cycle
import setupPlayer from './playerController';

const clickObserver = {
  subscribers: [],
  subscribe: (fn) => {
    clickObserver.subscribers.push(fn);
  },
  observe: (e) => {
    if (e === null) return;
    clickObserver.subscribers.forEach((fn) => fn(e));
  },
};

function getAdjacent(x, y, w, h) {
  const n = [];
  if (x - 1 >= 0) n.push([x - 1, y]);
  if (x + 1 < w) n.push([x + 1, y]);
  if (y - 1 >= 0) n.push([x, y - 1]);
  if (y + 1 < h) n.push([x, y + 1]);
  return n;
}

function getAdjacentSquare(x, y, r, w, h) {
  // array large enough to store the max possible number of valid move positions
  const v = [...Array((r * 2 + 1) ** 2)]
    // empty array to x y coords of adjacent squares
    .map((_, i) => [-r + (i % (r * 2 + 1)) + x, -r + (Math.floor(i / (r * 2 + 1))) + y])
    // remove coords to out of bounds squares
    .filter(([x_, y_]) => x_ >= 0 && y_ >= 0 && x_ < w && y_ < h && (y_ !== y || x_ !== x));
  return v;
}

export function coordsEqual([x1, y1], [x2, y2]) {
  return x1 === x2 && y1 === y2;
}

export function containsCoord(list, coord) {
  let contains = false;
  list.forEach((p) => {
    contains = contains || coordsEqual(p, coord);
  });
  return contains;
}

function init(width, height) {
  return {
    message: 'player 1 move',
    width,
    winner: false,
    gameActive: true,
    height,
    players: [setupPlayer({ x: 1, y: height - 2 }, clickObserver.subscribe),
      setupPlayer({ x: width - 2, y: 1 }, clickObserver.subscribe)],
    highlight: [],
    walls: [],
  };
}

function explore(state, x, y) {
  let n = getAdjacent(x, y, state.width, state.height);
  n = n.map(([x1, y1]) => [[Math.min(x, x1), Math.min(y, y1)], [Math.max(x, x1), Math.max(y, y1)]]);

  state.walls.forEach(([[x1, y1], [x2, y2]]) => {
    n = n.filter(([[x3, y3], [x4, y4]]) => !(x1 === x3 && x2 === x4 && y1 === y3 && y2 === y4));
  });

  n = n.map(([[x3, y3], [x4, y4]]) => {
    if (x3 === x && y3 === y) {
      return [x4, y4];
    }
    return [x3, y3];
  });
  return n;
}

function bfs(state, x1, y1, x2, y2) {
  let q = [[x1, y1]];
  let score = 0;
  const v = [];

  while (q.length !== 0) {
    const [xc, yc] = q.pop();
    v.push([xc, yc]);
    if (xc === x2 && yc === y2) return 0;
    let ns = explore(state, xc, yc);
    ns = ns.filter((coord) => !containsCoord(v, coord));
    q = q.concat(ns);
    score += 1;
  }
  return score;
}

export function checkWin(state) {
  const [p1, p2] = state.players;
  const p1s = bfs(state, p1.x, p1.y, p2.x, p2.y);
  const p2s = bfs(state, p2.x, p2.y, p1.x, p1.y);

  if (p1s === p2s && p1s === 0) return [false, 0];
  if (p1s > p2s) return [true, 1];
  return [true, 2];
}

export function getValidMoves(state, x, y) {
  const adj = getAdjacentSquare(x, y, 2, state.width, state.height);
  const [p1, p2] = state.players;
  return adj.filter((coord) => !(coordsEqual(coord, [p1.x, p1.y])
                              || coordsEqual(coord, [p2.x, p2.y])));
}

async function turn(state, setState) {
  // eslint-disable-next-line no-restricted-syntax, prefer-const
  for (let [i, player] of state.players.entries()) {
    state = {
      ...state,
      message: state.winner ? state.message : `player ${i + 1} move`,
      highlight: getValidMoves(state, player.x, player.y),
    };
    setState(state);

    const newPlayer = await player.move(state);

    if (containsCoord(getValidMoves(state, player.x, player.y), [newPlayer.x, newPlayer.y])) {
      const newPlayers = state.players.slice();
      newPlayers[i] = newPlayer;

      state = {
        ...state,
        players: newPlayers,
      };
    }
    setState(state);

    player = newPlayer;

    state = {
      ...state,
      message: `player ${i + 1} build wall`,
      highlight: getAdjacent(player.x, player.y, state.width, state.height),
    };
    setState(state);

    const newWall = await player.wall(state);

    state = {
      ...state,
      walls: [...state.walls, newWall],
    };
    setState(state);

    const [gameover, winner] = checkWin(state);

    if (gameover) {
      state = init(state.width, state.height);
      state = {
        ...state,
        winner: true,
        message: `player ${winner} wins!! good job!`,
        gameActive: false,
      };
      setState(state);
      return state;
    }
  }
  return state;
}
async function gameLoop(state, setState) {
  let newState = state;
  while (state.gameActive) {
    newState = await turn(newState, setState);
  }
}

function Game({ width = 9, height = 9 }) {
  const [state, setState] = useState(init(width, height));
  useEffect(() => {
    gameLoop(state, setState);
  }, []);

  return (
    // eslint-disable-next-line max-len
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div onClick={(e) => {
      const index = Number(e.target.dataset.gridIndex);
      clickObserver.observe([index % width, Math.floor(index / width)]);
    }}
    >
      <div className="playerSelect" />
      {state.message}
      <Grid width={width} height={height} state={state} />
    </div>
  );
}

Game.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
};

export default Game;
