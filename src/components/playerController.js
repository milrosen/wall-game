// eslint-disable-next-line import/no-cycle
import { getValidMoves, containsCoord } from './game';

export default function setupPlayer(loc, subscribeClickEvents) {
  return {
    ...loc,
    move: (state) => new Promise((resolve) => {
      subscribeClickEvents((moveLoc) => {
        if (containsCoord(getValidMoves(state, loc.x, loc.y), moveLoc)) {
          resolve(setupPlayer({ x: moveLoc[0], y: moveLoc[1] }, subscribeClickEvents));
        }
      });
    }),

    wall: () => new Promise((resolve) => {
      subscribeClickEvents((moveLoc) => {
        const validWalls = [[loc.x + 1, loc.y],
          [loc.x - 1, loc.y],
          [loc.x, loc.y + 1],
          [loc.x, loc.y - 1]];
        if (containsCoord(validWalls, moveLoc)) {
          const [x, y] = moveLoc;
          resolve([[Math.min(loc.x, x), Math.min(loc.y, y)],
            [Math.max(loc.x, x), Math.max(loc.y, y)]]);
        }
      });
    }),
  };
}
