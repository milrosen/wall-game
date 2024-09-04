import React from 'react'

export default function Square({type="", gridIndex}) {
  return (
    <div className={`Square ${type}`} gridindex={gridIndex}></div>
  )
}
