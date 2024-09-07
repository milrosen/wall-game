// eslint-disable-next-line import/no-cycle
import {
  getValidMoves, containsCoord, getAdjacent, toWall,
} from './gameRules';

export default function setupHumanPlayer(subscribeClickEvents) {
  return {
    name: 'human',
    move: (state) => new Promise((resolve) => {
      subscribeClickEvents((moveLoc) => {
        const [x, y] = state.players[state.currentTurn];
        if (containsCoord(getValidMoves(state, x, y), moveLoc)) {
          resolve(moveLoc);
        }
      });
    }),

    wall: (state) => new Promise((resolve) => {
      subscribeClickEvents((moveLoc) => {
        const [x, y] = state.players[state.currentTurn];
        const validWallLocations = getAdjacent(state, x, y);
        if (containsCoord(validWallLocations, moveLoc)) {
          const [x1, y1] = moveLoc;
          resolve(toWall(x, y, x1, y1));
        }
      });
    }),
  };
}
