function getNearby(x, y, w, h) {
  const n = [];
  if (x - 1 >= 0) n.push([x - 1, y]);
  if (x + 1 < w) n.push([x + 1, y]);
  if (y - 1 >= 0) n.push([x, y - 1]);
  if (y + 1 < h) n.push([x, y + 1]);
  return n;
}

export function toWall(x1, y1, x2, y2) {
  return [[Math.min(x1, x2), Math.min(y1, y2)], [Math.max(x1, x2), Math.max(y1, y2)]];
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

export function getAdjacent(state, x, y) {
  let n = getNearby(x, y, state.width, state.height);
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
    let ns = getAdjacent(state, xc, yc);
    ns = ns.filter((coord) => !containsCoord(v, coord));
    q = q.concat(ns);
    score += 1;
  }
  return score;
}

export function checkWin(state) {
  const [[p1x, p1y], [p2x, p2y]] = state.players;
  const p1s = bfs(state, p1x, p1y, p2x, p2y);
  const p2s = bfs(state, p2x, p2y, p1x, p1y);

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
