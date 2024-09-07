// eslint-disable-next-line import/no-cycle
import { getValidMoves, containsCoord, explore } from './game';

export default function setupHumanPlayer(subscribeClickEvents) {
  return {
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
        const validWallLocations = explore(state, x, y);
        if (containsCoord(validWallLocations, moveLoc)) {
          const [x1, y1] = moveLoc;
          resolve([[Math.min(x, x1), Math.min(y, y1)],
            [Math.max(x, x1), Math.max(y, y1)]]);
        }
      });
    }),
  };
}
