import React, {useState, useEffect} from 'react'
import Grid from './grid'
import setupPlayer from './playerController';

let clickObserver = {
    subscribers: [],
    subscribe: (fn) => {
        clickObserver.subscribers.push(fn)
    },
    observe: (e) => {
        if (e === null) return;
        clickObserver.subscribers.forEach(fn => fn(e))
    }
}

export default function Game({width=9, height=9}) {
  const [state, setState] = useState(init(width, height))
  useEffect(() => {
    gameLoop(state, setState)
  }, [])

  return (
    <div onClick={(e) => {
        let index = Number(e.target.getAttribute("gridindex"));
        clickObserver.observe([index % width, Math.floor(index / width)])
    }}>
        {state.message}
        <Grid width={width} height={height} state={state}/>
    </div>
  )
}

function init(width, height) {
    return {
        message: "player 1 move",
        width: width,
        height: height,
        players: [setupPlayer({x: 1, y: height-2}, clickObserver.subscribe), 
                  setupPlayer({x: width - 2, y: 1}, clickObserver.subscribe)],
        highlight: [],
        walls: [],
    }
}


async function gameLoop(state, setState) {
    while (true) {
        state = await loop(state, setState)
    }
}
async function loop(state, setState) {
    for (let [i, player] of state.players.entries()) {
        state = {
            ...state,
            highlight: getValidMoves(state, player.x, player.y)
        }
        setState(state)
        
        let newPlayer = await player.move(state);
        
        if (containsCoord(getValidMoves(state, player.x, player.y), [newPlayer.x, newPlayer.y])) {
            let newPlayers = state.players.slice();
            newPlayers[i] = newPlayer;
                
            state = {
                ...state,
                players: newPlayers
            }
        }
        setState(state)
        
        player = newPlayer;
        
        state = {
             ...state,
             message: `player ${i+1} build wall`,
             highlight: getAdjacent(player.x, player.y, state.width, state.height)
        };
        setState(state)
        
        let newWall = await player.wall(state);
        
        state = {
             ...state,
             walls: [...state.walls, newWall]
        }
        setState(state)

       let [gameover, winner] = checkWin(state)
        if (gameover) {
            state = init(state.width, state.height)
            state = {
                ...state,
                message: `player ${winner} winns!! good job!`
            }
            setState(state)
            return state
        }
    }
    return state
}

export function checkWin(state) {
    const [p1, p2] = state.players
    const p1s = bfs(state, p1.x, p1.y, p2.x, p2.y)
    const p2s = bfs(state, p2.x, p2.y, p1.x, p1.y)

    if (p1s === p2s && p1s === 0) return [false, 0]
    if (p1s > p2s) return [true, 1]
    return [true, 2]
}

function bfs(state, x1, y1, x2, y2) {
    let q = [[x1, y1]];
    let score = 0;
    let v = [];
 
    while (q.length !== 0) {
        const [xc, yc] = q.pop()
        v.push([xc, yc])
        if (xc === x2 && yc === y2) return 0
        let ns = explore(state, xc, yc)
        ns = ns.filter(coord => !containsCoord(v, coord))
        q = q.concat(ns)
        score++
    }
    return score
}

function explore(state, x, y) {
    let n = getAdjacent(x, y, state.width, state.height)
    n = n.map(([x1, y1]) => [[Math.min(x, x1), Math.min(y, y1)], [Math.max(x, x1), Math.max(y, y1)]])
    
    for (const [[x1, y1], [x2, y2]] of state.walls) {
        n = n.filter(([[x3, y3], [x4, y4]]) => !(x1 === x3 && x2 === x4 && y1 === y3 && y2 === y4))
    }

    n = n.map(([[x3, y3], [x4, y4]]) => {
        if (x3 === x && y3 === y) {
            return [x4, y4]
        } else {
            return [x3, y3]
        }  
    })
    return n
}

export function getValidMoves(state, x, y) {
    let adj = getAdjacentSquare(x, y, 2, state.width, state.height)
    let [p1, p2] = state.players;
    return adj.filter(coord => !(coordsEqual(coord, [p1.x, p1.y]) || coordsEqual(coord, [p2.x, p2.y])))
}

export function coordsEqual([x1, y1], [x2, y2]) {
    return x1 === x2 && y1 === y2;
}

export function containsCoord(list, coord) {
    for (let p of list) {
        if (coordsEqual(p, coord)) return true;
    }
    return false;
}

function getAdjacent(x,y,w,h) {
    let n = [];
    if (x-1 >= 0) n.push([x-1,y]);
    if (x+1 <  w) n.push([x+1,y]);
    if (y-1 >= 0) n.push([x,y-1]);
    if (y+1 <  h) n.push([x,y+1]);
    return n
}

function getAdjacentSquare(x, y, r, w, h) {
    // array large enough to store the max possible number of valid move positions
    let v = [...Array(Math.pow(r*2+1, 2))]
        // empty array to x y coords of adjacent squares
        .map((_, i) => [-r + (i%(r*2+1)) + x, -r + (Math.floor(i/(r*2+1))) + y])
        // remove coords to out of bounds squares
        .filter(([x_, y_]) => x_ >= 0 && y_ >= 0 && x_ < w && y_ < h && (y_ !== y || x_ !== x))
    return v
}


