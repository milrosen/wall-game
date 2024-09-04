import React from 'react'
import Square from './square'

export default function Grid({width, height, state}) {
  var render = renderState(state, width, height)
  return (
    <div className='Grid' 
        style={{gridTemplateColumns: `repeat(${width}, 1fr)`, gridTemplateRows: `repeat(${height}, 1fr)`}}
    >
        {render.map((type, i) => <Square key={i} type={type} gridIndex={i}/>)}
    </div>
  )
}

function renderState({players, walls, highlight}, width, height) {
    let squareTypes = [...Array(width*height)].fill("");
    highlight.forEach(([x, y]) => squareTypes[x + y * width] += " Highlight")
    walls.forEach(wall => console.log(wall))

    players.map((player, i) => {
        let name = i === 0 ? "PlayerA" : "PlayerB";
        squareTypes[player.x + player.y * width] = name;
    });

    return squareTypes
}