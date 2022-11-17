let win = '';

let debugsteps = 0;

let winLength = 4;
let size = 10;

let debug = false;

if (window.screen.width < 600) {
  size = 10;
}
if (window.screen.width < 400) {
  size = 5;
  winLength = 3;
}

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

const gameBoard = (() => {
  const buildGrid = () => {
    let rows = [];
    for (let i = 0; i < size; i++) {
      let cells = [];
      for (let i = 0; i < size; i++) {
        cells.push('');
      }
      rows.push(cells);
    }
    document.documentElement.style.setProperty('--size', size);

    return rows;
  };

  let grid = buildGrid();

  const update = () => {
    grid = buildGrid();
  };

  return {
    grid,
    update,
  };
})();

const renderer = (() => {
  const renderRow = (row, rowId) => {
    let cells = [];
    let cellId = 0;
    row.forEach((cell) => {
      cells.push(
        `<li onclick="play(${rowId},${cellId})" value="${cell}" id='${rowId}-${cellId}' ></li>`
      );
      cellId++;
    });

    return `<ul>${cells.join('')}</ul>`;
  };

  const renderGameBoard = (parent, gameBoard) => {
    const rows = [];
    let rowId = 0;
    gameBoard.grid.forEach((element) => {
      rows.push(renderRow(element, rowId));
      rowId++;
    });
    parent.innerHTML = '';
    parent.innerHTML = rows.join('');
  };
  return {
    renderGameBoard,
  };
})();

let ourLine = 0;
let opponentsLine = 0;
let longestLine = { length: 0, x: 0, y: 0 };

const checker = (() => {
  const getLongestLine = () => {
    return longestLine;
  };

  const setLongestLine = (line) => {
    longestLine = line;
  };

  const clearLongestLine = () => {
    longestLine = { length: 0, x: 0, y: 0 };
  };

  ourLine = 0;
  opponentsLine = 0;

  const check = (x, y) => {
    const templateDirections = [
      { x: 1, y: 0 },
      { x: -1, y: 0 },
      { x: 1, y: 1 },
      { x: -1, y: -1 },
      { x: 0, y: 1 },
      { x: 0, y: -1 },
      { x: -1, y: 1 },
      { x: 1, y: -1 },
    ];

    let directions = templateDirections;
    do {
      if (directions.length > 0 && win == '') {
        checkLine(x, y, directions, 1, { x: x, y: y });
        directions.shift();

        checkLine(x, y, directions, -1, { x: x, y: y });
        directions.shift();

        if (ourLine >= winLength) {
          win = `${marker.markIs('x') ? 'AI' : 'PLAYER'} is the Winner`;
          document.getElementById('winText').innerText = win; //! Remove later
          console.log(ourLine);
          console.log({ board: gameBoard.grid });
          return;
        }

        ourLine = 0;
        opponentsLine = 0;

        ourLine > getLongestLine().length && ourLine > opponentsLine
          ? setLongestLine({ length: ourLine, x: x, y: y })
          : setLongestLine({ length: opponentsLine, x: x, y: y });
      } else {
        ourLine = 0;
        opponentsLine = 0;
        break;
      }
    } while (directions.length > 0);

    return true;
  };

  const checkLine = function (x, y, direction, opposite, original) {
    const nextCell = getElementAtNextLocation(x, y, direction);

    document.getElementById(`${y}-${x}`).style.border = '10px solid red';

    if (nextCell != undefined) {
      if (nextCell != '') {
        if (nextCell == marker.markerInverted()) {
          ourLine++;
        } else {
          opponentsLine++;
        }
        checkLine(x + direction[0].x, y + direction[0].y, direction, opposite, original);
        return { value: true, x: x + direction[0].x, y: y + direction[0].y };
      } else {
        return;
      }
    }
  };

  const getElementAtNextLocation = (xx, yy, directions) => {
    return getElementAtCoords(xx + directions[0].x, yy + directions[0].y);
  };

  const getElementAtCoords = (x, y) => {
    return y < 0 || x < 0 || y > size - 1 || x > size - 1 ? undefined : gameBoard.grid[y][x];
  };

  return { check, getLongestLine, clearLongestLine };
})();

renderer.renderGameBoard(document.getElementById('board'), gameBoard);

function play(rowId, cellId) {
  markCell(rowId, cellId);
  playAiMove();
}

function markCell(rowId, cellId) {
  if (gameBoard.grid[rowId][cellId] == '' && win == '') {
    gameBoard.grid[rowId][cellId] = marker.getMark();
    console.log('marked', rowId, cellId, marker.getMark());

    checker.check(rowId, cellId);

    marker.nextMarker();

    document.documentElement.style.setProperty(
      '--hoverColor',
      marker.markIs('o') ? '#ff8566' : '#61b0ff'
    );
  }
  renderer.renderGameBoard(document.getElementById('board'), gameBoard);
}

function playAiMove() {
  // !AI
  let nextMove = { x: 0, y: 0 };
  for (let i = 0; i < gameBoard.grid.length; i++) {
    for (let j = 0; j < gameBoard.grid.length; j++) {
      if (gameBoard.grid[j][i] == '') {
        checker.check(i, j);
        nextMove = longestLine;
      }
    }
  }
  if (nextMove.x == 0 && nextMove.y == 0) {
    let validMove = false;
    let x = 0;
    let y = 0;
    do {
      x = Math.floor(Math.random() * gameBoard.grid.length);
      y = Math.floor(Math.random() * gameBoard.grid[0].length);
      if (gameBoard.grid[x][y] == '') {
        validMove = true;
      }
    } while (validMove == false);
    markCell(y, x);
  } else {
    markCell(nextMove.y, nextMove.x);
  }
}
