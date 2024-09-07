import { getValidMoves, getAdjacent, toWall } from './gameRules';

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

const RandomController = {
  name: 'random',
  move: (state) => new Promise((resolve) => {
    const [x, y] = state.players[state.currentTurn];
    const validMoves = getValidMoves(state, x, y);
    resolve(validMoves[getRandomInt(validMoves.length)]);
  }),
  wall: (state) => {
    const [x, y] = state.players[state.currentTurn];
    const validWallLocs = getAdjacent(state, x, y);
    const [x1, y1] = validWallLocs[getRandomInt(validWallLocs.length)];
    return toWall(x, y, x1, y1);
  },
};

export default RandomController;
