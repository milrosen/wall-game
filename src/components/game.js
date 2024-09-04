import React, {useState, useEffect} from 'react'
import Grid from './grid'
import setupPlayer from './playerController';
import { getSuggestedQuery } from '@testing-library/react';

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

export default function Game({width=15, height=10}) {
  const [state, setState] = useState(init(width, height))
  useEffect(() => {
    gameLoop(state, setState);
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
        message: "player one move",
        width: width,
        height: height,
        players: [setupPlayer({x: 1, y: height-2}, clickObserver.subscribe), 
                  setupPlayer({x: width - 2, y: 1}, clickObserver.subscribe)],
        highlight: [],
        walls: [],
    }
}

async function gameLoop(state, setState) {
    for (let [i, player] of state.players.entries()) {
        setState(prevState => ({
            ...prevState,
             highlight: getValidMoves(state, player.x, player.y)
        }))

        let newPlayer = await player.move(state);

        if (containsCoord(getValidMoves(state, player.x, player.y), [newPlayer.x, newPlayer.y])) {
            setState(prevState => {
                let newPlayers = prevState.players.slice();
                newPlayers[i] = newPlayer;
                return {
                    ...prevState,
                    players: newPlayers
                }
            })
       }

       player = newPlayer;

       setState(prevState => ({
            ...prevState,
            highlight: [[player.x + 1, player.y], [player.x - 1, player.y], [player.x, player.y + 1], [player.x, player.y - 1]]
       }));

       let newWall = await player.wall(state);

       setState(prevState => ({
            ...prevState,
            walls: [...prevState.walls, newWall]
       }))
    }
}

export function getValidMoves(state, x, y) {
    return getAdjacent(x, y, 2, state.width, state.height)
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


function getAdjacent(x, y, r, w, h) {
    // array large enough to store the max possible number of valid move positions
    let v = [...Array(Math.pow(r*2+1, 2))]
        // empty array to x y coords of adjacent squares
        .map((_, i) => [-r + (i%(r*2+1)) + x, -r + (Math.floor(i/(r*2+1))) + y])
        // remove coords to out of bounds squares
        .filter(([x_, y_]) => x_ >= 0 && y_ >= 0 && x_ < w && y_ < h && (y_ !== y || x_ !== x))
    return v
}


