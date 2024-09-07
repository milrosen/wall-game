import React from 'react';
import PropTypes from 'prop-types';

function PlayerSelect({ validPlayers, handlePlayerChange }) {
  const boxes = [0, 1].map((i) => (
    <PlayerSelectBox
      key={i}
      validPlayers={Object.keys(validPlayers)}
      onChange={
        (e) => {
          const newPlayer = validPlayers[e.target.value];
          if (newPlayer === null) return;
          handlePlayerChange(newPlayer, i);
        }
      }
    />
  ));
  return (
    <div>
      Player one:
      {boxes[0]}
      , Player two:
      {boxes[1]}
    </div>
  );
}

PlayerSelect.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  validPlayers: PropTypes.object,
  handlePlayerChange: PropTypes.func,
};

function PlayerSelectBox({ validPlayers = ['Human', 'Random'], onChange, id }) {
  return (
    <label htmlFor={id}>
      <select onChange={onChange}>
        {validPlayers.map((p) => <option value={p} aria-label={p} key={p}>{p}</option>)}
      </select>
    </label>
  );
}

PlayerSelectBox.propTypes = {
  validPlayers: PropTypes.arrayOf(PropTypes.string),
  onChange: PropTypes.func,
  id: PropTypes.number,
};
export default PlayerSelect;
