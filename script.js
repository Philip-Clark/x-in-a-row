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
  const winLength = 3;

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
    if (newOrigin.x > 0 && newOrigin.y > 0 && newOrigin.x < size && newOrigin.y < size) {
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

  const checkDirection = (origin, direction, value) => {
    let directionLineLength = 0;
    if (gameBoard.getCellValue(origin.x, origin.y) == '') {
      directionLineLength += getLineLengthInDirection(origin, direction, value, 0);
      directionLineLength += getLineLengthInDirection(
        origin,
        reverseDirection(direction),
        value,
        0
      );
    }
    return directionLineLength;
  };

  const checkDirections = (origin, value) => {
    let lengths = [];
    lengths.push(checkDirection(origin, { x: 1, y: 1 }, value));
    lengths.push(checkDirection(origin, { x: 1, y: 0 }, value));
    lengths.push(checkDirection(origin, { x: 1, y: -1 }, value));
    lengths.push(checkDirection(origin, { x: 0, y: 1 }, value));
    lengths = lengths.sort();
    return lengths.pop();
  };

  return { checkDirection, checkDirections };
})();

const renderer = (() => {
  const buildCell = ({ value, x, y }) => {
    return `<div onclick="playRound(${x},${y})" value="${value}" id='${x}-${y}' class="cell"></div>`;
  };

  const createCell = ({ value, x, y }) => {
    document.getElementById(`board`).insertAdjacentHTML('beforeend', buildCell({ value, x, y }));
  };

  const updateCell = (value, x, y) => {
    document.getElementById(`${x}-${y}`).setAttribute('value', value);
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
  play(x, y);

  aiPlay();
}

function aiPlay() {
  let bestMove = { len: 0, x: 0, y: 0 };

  gameBoard.forCell((cell) => {
    if (cell.value == '') {
      let lineLength = checker.checkDirections({ x: cell.x, y: cell.y }, 'o');
      bestMove = lineLength > bestMove.len ? { len: lineLength, x: cell.x, y: cell.y } : bestMove;
      lineLength = checker.checkDirections({ x: cell.x, y: cell.y }, 'x');
      bestMove = lineLength > bestMove.len ? { len: lineLength, x: cell.x, y: cell.y } : bestMove;
    }
  });

  play(bestMove.x, bestMove.y);
}

function play(x, y) {
  gameBoard.setCellValue(marker.getMark(), x, y);
  renderer.updateCell(gameBoard.getCellValue(x, y), x, y);

  if (checker.checkDirections({ x: x, y: y }, marker.getMark()) > 5) {
    console.log('WINNER', marker.getMark());
  }

  marker.nextMarker();

  document.documentElement.style.setProperty(
    '--hoverColor',
    marker.markIs('o') ? '#ff8566' : '#61b0ff'
  );
}

function reverseDirection({ x, y }) {
  return { x: x * -1, y: y * -1 };
}

////////////////////////////////////////////////////////////////
const size = 10;
gameBoard.buildGrid(size, '');
document.documentElement.style.setProperty('--size', size);
gameBoard.forCell((cell) => {
  renderer.createCell(cell);
});
