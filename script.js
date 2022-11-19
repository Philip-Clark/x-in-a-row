let winLength = 5;
let gameOver = false;
let cellsLeft = 0;
let size = 10;
let blockFactor = 3;
let buildFactor = 1;
let resetLength = 5000;
let aiThinkTime = 200;

function help() {
  console.log(
    `
  Hello intrepid explorer. This function has been added to help brave ones modify the game.

  variables:
     size = 10            |  Size of the game board along one edge
     gameOver = false     |  Boolean storing the games state
     winLength = 5        | How long a line must be to win
     blockFactor = 3      | If the an human's line + 3 will win, block that line
     buildFactor = 1      | If an AI's line + 1 will win, complete that line
     resetLength = 2000   | How long to wait to reset the game on win
     aiThinkTime = 200    | The max time the ai will "think"



  Functions:
     refresh(rerender)             | Refresh the board and rerender it if desired, Must be called after board changing actions
     autoRound(60,logTime=false)   | Lets 2 ai battle it out with 60ms between each play, and logs time if set.

  `
  );
}

/**
 * A game board object
 * @param {int} size
 * @param {Array[][]} grid
 * @param {function} gridBuilder
 * @param {function} forCell
 * @param {function} getCellValue
 * @param {function} setCellValue
 *
 */
const gameBoard = (() => {
  const buildGrid = (size, initialValue) => {
    let columns = [];
    for (let i = 0; i < size; i++) {
      let cells = [];
      for (let i = 0; i < size; i++) {
        cells.push(initialValue);
      }
      columns.push(cells);
    }
    grid = columns;
    return columns;
  };

  let grid = [];
  /** **Game board grid with [x][y] format** */

  /**
   * USE
   * ```javascript
   * gameBoard.forCell((cell) => {
   *    console.log(cell.value,cell.x,cell.y);
   * });
   * ```
   */
  const forCell = (callBackFunction) => {
    grid.forEach((column, x) => {
      column.forEach((cell, y) => {
        callBackFunction({ value: cell, x: x, y: y });
      });
    });
  };

  const setCellValue = (value, x, y) => {
    grid[x][y] = value;
  };

  const getCellValue = (x, y) => {
    return grid[x][y];
  };

  return { buildGrid, grid, forCell, setCellValue, getCellValue };
})();

const checker = (() => {
  const getLineLengthInDirection = (origin, direction, value, length) => {
    let newOrigin = { x: origin.x + direction.x, y: origin.y + direction.y };
    if (newOrigin.x >= 0 && newOrigin.y >= 0 && newOrigin.x < size && newOrigin.y < size) {
      if (
        gameBoard.getCellValue(newOrigin.x, newOrigin.y) == '' ||
        gameBoard.getCellValue(newOrigin.x, newOrigin.y) != value
      ) {
        return length;
      } else {
        let newLength = length + 1;
        return getLineLengthInDirection(newOrigin, direction, value, newLength);
      }
    } else {
      return length;
    }
  };

  function checkDirection(origin, direction, value, validate = true) {
    let directionLineLength = 0;
    if ((gameBoard.getCellValue(origin.x, origin.y) == '') == validate) {
      directionLineLength += getLineLengthInDirection(origin, direction, value, 0);
      directionLineLength += getLineLengthInDirection(
        origin,
        reverseDirection(direction),
        value,
        0
      );
    }
    return directionLineLength;
  }

  const checkDirections = (origin, value, validate) => {
    let lengths = [];
    lengths.push(checkDirection(origin, { x: 1, y: 1 }, value, validate));
    lengths.push(checkDirection(origin, { x: 1, y: 0 }, value, validate));
    lengths.push(checkDirection(origin, { x: 1, y: -1 }, value, validate));
    lengths.push(checkDirection(origin, { x: 0, y: 1 }, value, validate));
    lengths = lengths.sort();
    // console.log(lengths[0]);
    return lengths.pop();
  };

  return { checkDirection, checkDirections };
})();

const createElement = (HTML) =>
  document.createRange().createContextualFragment(HTML).firstElementChild;

const renderer = (() => {
  const buildCell = ({ value, x, y }) => {
    const cell = createElement(
      `<div onclick="playRound(${x},${y})" value="${value}" id='${x}-${y}' class="cell"></div>`
    );
    return cell;
  };

  const createCell = ({ value, x, y }) => {
    document.getElementById(`board`).appendChild(buildCell({ value, x, y }));
  };

  const updateCell = (value, x, y) => {
    document.getElementById(`${x}-${y}`).setAttribute('value', value);
    document.getElementById(`${x}-${y}`).classList.add(value);
  };
  return { createCell, updateCell };
})();

const marker = (() => {
  let mark = 'x';
  const nextMarker = () => {
    mark = mark == 'x' ? 'o' : 'x';
    return mark;
  };

  const markerInverted = () => {
    // return mark;
    return mark == 'x' ? 'o' : 'x';
  };

  const getMark = () => mark;
  const markIs = (inMark) => {
    return mark == inMark;
  };

  return {
    nextMarker,
    markerInverted,
    getMark,
    markIs,
  };
})();

function playRound(x, y) {
  if (marker.getMark() == 'x' && gameBoard.getCellValue(x, y) == '') {
    play(x, y);
    setTimeout(() => {
      if (!gameOver) {
        aiPlay();
      }
    }, Math.random() * aiThinkTime);
  }
}

function autoRound(time = 60, logTime = false) {
  refresh(true);
  if (Math.floor(Math.random() * 10) > 5) {
    console.log(marker.getMark());
    marker.nextMarker();
  }

  const interval = setInterval(() => {
    if (cellsLeft > 0 && !gameOver) {
      if (logTime) console.time('T');

      aiPlay();
      if (logTime) {
        console.timeLog('T');
        console.timeEnd('T');
      }
    } else {
      clearInterval(interval);
    }
  }, time);
}

function aiPlay(x = 0, y = 0, len = 0) {
  let bestMove = { len: len, x: x, y: y };
  let moves = [bestMove];
  gameBoard.forCell((cell) => {
    if (cell.value == '') {
      //   player = x ---  ai = 0
      let longestLineForMove = checker.checkDirections({ x: cell.x, y: cell.y }, 'x');
      let weightOfLine =
        longestLineForMove + blockFactor >= winLength
          ? longestLineForMove * 1000
          : longestLineForMove;

      let moveWeight = weightOfLine;

      longestLineForMove = checker.checkDirections({ x: cell.x, y: cell.y }, 'o');
      weightOfLine =
        longestLineForMove + buildFactor >= winLength
          ? longestLineForMove * 10000
          : longestLineForMove;

      moveWeight += weightOfLine;

      moves.push({ len: moveWeight, x: cell.x, y: cell.y });
    }
  });
  bestMove = moves.sort((a, b) => (a.len > b.len ? 1 : -1)).pop();

  play(bestMove.x, bestMove.y);
}

function play(x, y) {
  if (!gameOver) {
    gameBoard.setCellValue(marker.getMark(), x, y);
    renderer.updateCell(gameBoard.getCellValue(x, y), x, y);

    cellsLeft--;

    let line = checker.checkDirections({ x: x, y: y }, marker.getMark(), false);

    if (line + 1 >= winLength) {
      gameOver = true;
      let winner = marker.getMark() == 'x' ? 'Player' : 'AI';

      [...document.getElementsByClassName('cell')].forEach((cell) => {
        if (cell.classList.contains(marker.markerInverted())) {
          cell.classList.add('dim');
        } else {
          let coords = cell.id.split('-');
          if (
            checker.checkDirections(
              { x: parseInt(coords[0]), y: parseInt(coords[1]) },
              marker.getMark(),
              false
            ) +
              1 <
            winLength
          ) {
            cell.classList.add('dim');
          }
        }
      });
      document.getElementById('text').innerHTML = `${winner} won the game!`;
      setTimeout(() => {
        refresh(true);
      }, resetLength);
    } else if (cellsLeft == 0) {
      document.getElementById('text').innerHTML = `Draw game!`;
      gameOver = true;
      setTimeout(() => {
        refresh(true);
      }, resetLength);
    } else {
      marker.nextMarker();

      document.documentElement.style.setProperty(
        '--hoverColor',
        marker.markIs('o') ? '#ff856600' : '#61b0ff'
      );
    }
  }
}

function reverseDirection({ x, y }) {
  return { x: x * -1, y: y * -1 };
}

gameBoard.buildGrid(size, '');

refresh(true);

function refresh(rerender) {
  if (rerender) {
    gameOver = false;
    document.getElementById('text').innerHTML = `5 In a Row`;

    document.getElementById('board').innerHTML = '';
    gameBoard.buildGrid(size, '');
    document.documentElement.style.setProperty('--size', size);
    cellsLeft = size * size;
    gameBoard.forCell((cell) => {
      renderer.createCell(cell);
    });
    if (marker.getMark() == 'o') {
      aiPlay(Math.floor(Math.random() * size), Math.floor(Math.random() * size), 100);
    }
  }
}
