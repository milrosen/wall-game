import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Grid from './grid';
import PlayerSelect from './playerSelect';
import randomController from './randomController';
import {
  getValidMoves, containsCoord, checkWin, getAdjacent,
} from './gameRules';
import setupHumanPlayer from './humanController';

const clickObserver = {
  subscribers: [],
  subscribe: (fn) => {
    clickObserver.subscribers.push(fn);
  },
  observe: (e) => {
    if (e === null) return;
    clickObserver.subscribers.forEach((fn) => fn(e));
  },
};

function initState(width, height) {
  return {
    message: 'player 1 move',
    currentTurn: 0,
    width,
    winner: false,
    gameActive: true,
    height,
    players: [[1, height - 2], [width - 2, 1]],
    highlight: [],
    walls: [],
  };
}

async function turn(state, setState, currentPlayers) {
  // has to be done because array-operations dont wait for awaits
  // eslint-disable-next-line no-restricted-syntax, prefer-const
  for (let [i, [x, y]] of state.players.entries()) {
    state = {
      ...state,
      message: state.winner ? state.message : `player ${i + 1} move`,
      highlight: getValidMoves(state, x, y),
    };
    setState(state);

    const [x_, y_] = await currentPlayers[state.currentTurn].move(state);

    if (containsCoord(getValidMoves(state, x, y), [x_, y_])) {
      const newPlayers = state.players.slice();
      newPlayers[i] = [x_, y_];

      state = {
        ...state,
        players: newPlayers,
      };
    }
    setState(state);

    [x, y] = [x_, y_];

    state = {
      ...state,
      message: `player ${i + 1} build wall`,
      highlight: getAdjacent(state, x, y),
    };
    setState(state);

    const newWall = await currentPlayers[state.currentTurn].wall(state);

    state = {
      ...state,
      walls: [...state.walls, newWall],
    };
    setState(state);

    const [gameover, winner] = checkWin(state);

    if (gameover) {
      state = initState(state.width, state.height);
      state = {
        ...state,
        winner: true,
        message: `player ${winner} wins!! good job!`,
        gameActive: false,
      };
      setState(state);
      return state;
    }

    state = {
      ...state,
      currentTurn: (state.currentTurn + 1) % state.players.length,
    };
  }
  return state;
}
async function gameLoop(state, setState, currentPlayers) {
  let newState = state;
  while (state.gameActive) {
    newState = await turn(newState, setState, currentPlayers);
  }
}

function Game({ width = 9, height = 9 }) {
  const [state, setState] = useState(initState(width, height));
  const [validPlayers, setValidPlayers] = useState({
    human: setupHumanPlayer(clickObserver.subscribe),
    random: randomController,
  });
  const [currentPlayers, setCurrentPlayers] = useState(
    [validPlayers.human, validPlayers.human],
  );
  function handlePlayerChange(newPlayer, i) {
    setValidPlayers(validPlayers);
    setCurrentPlayers((prevPlayers) => {
      prevPlayers[i] = newPlayer;
      return prevPlayers;
    });
  }

  useEffect(() => {
    gameLoop(state, setState, currentPlayers);
  }, []);

  return (
    // eslint-disable-next-line max-len
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div onClick={(e) => {
      const index = Number(e.target.dataset.gridIndex);
      clickObserver.observe([index % width, Math.floor(index / width)]);
    }}
    >
      <PlayerSelect
        validPlayers={validPlayers}
        handlePlayerChange={(newPlayer, i) => handlePlayerChange(newPlayer, i)}
      />
      {state.message}
      <Grid width={width} height={height} state={state} />
    </div>
  );
}

Game.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
};

export default Game;
