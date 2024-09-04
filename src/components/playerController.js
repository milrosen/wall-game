import { getValidMoves, containsCoord } from "./game";

export default function setupPlayer(loc, subscribeClickEvents) {
    return {
        ...loc,
        move: (state) => {
            return new Promise((resolve, reject) => {
                subscribeClickEvents(moveLoc => {
                    if (containsCoord(getValidMoves(state, loc.x, loc.y), moveLoc)) {
                        resolve(setupPlayer({x: moveLoc[0], y: moveLoc[1]}, subscribeClickEvents))
                    }
                })
            });
        },

        wall: (state) => {
            return new Promise((resolve, reject) => {
                subscribeClickEvents(moveLoc => {
                    const validWalls = [[loc.x+1, loc.y], [loc.x-1, loc.y], [loc.x, loc.y+1], [loc.x, loc.y-1]]
                    if (containsCoord(validWalls, moveLoc)) {
                        let vertical = loc.y === moveLoc[1];
                        resolve({
                            vertical: vertical,
                            const: vertical ? loc.y : loc.x,
                            span: [Math.min(vertical ? loc.x : loc.y, vertical ? moveLoc[0] : moveLoc[1]),
                                   Math.max(vertical ? loc.x : loc.y, vertical ? moveLoc[0] : moveLoc[1])]
                        })
                    }
                })
            })
        }
    }
}

