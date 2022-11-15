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
        `<li onclick="markCell(${rowId},${cellId})" value="${cell}" id='${rowId}-${cellId}' ></li>`
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

const checker = (() => {
  let currentLine = 0;
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
    let directionsOpposite = templateDirections;

    const invterval = setInterval(() => {
      // getElementAtCoords(x, y).style.border = '1px solid #ffdd00';
      if (directions.length > 0 && win == '') {
        let cell = getElementAtNextLocation(x, y, directions);
        if (debug) cell.style.border = 'solid #ff00ccff 1px';
        checkLine(x, y, directions, 1, { x: x, y: y });
        directions.shift();

        cell = getElementAtNextLocation(x, y, directions);
        if (debug) cell.style.border = 'solid #9900ffff 1px';
        checkLine(x, y, directions, -1, { x: x, y: y });
        directions.shift();

        if (currentLine + 1 >= winLength) {
          win = `${marker.markIs('x') ? 'Yellow' : 'Pink'} is the Winner`;
          document.getElementById('winText').innerText = win; //! Remove later

          return;
        } else {
          currentLine = 0;
        }
      } else {
        clearInterval(invterval);
      }
    }, 0);
  };

  const checkLine = (x, y, direction, opposite, original) => {
    const nextCell = getElementAtNextLocation(x, y, direction);

    if (nextCell != undefined) {
      if (nextCell.getAttribute('value') == marker.markerInverted()) {
        debugsteps++;
        if (debug)
          nextCell.style.border = opposite == 1 ? 'solid #aeff00ff 2px' : 'solid #00d9ffff 2px';
        currentLine++;
        checkLine(x + direction[0].x, y + direction[0].y, direction, opposite, original);
        return true;
      }
    }
  };

  const getElementAtNextLocation = (xx, yy, directions) => {
    return getElementAtCoords(xx + directions[0].x, yy + directions[0].y);
  };

  const getElementAtCoords = (x, y) => {
    return document.getElementById(`${y}-${x}`);
  };

  return { check };
})();

renderer.renderGameBoard(document.getElementById('board'), gameBoard);

function markCell(rowId, cellId) {
  if (gameBoard.grid[rowId][cellId] == '' && win == '') {
    gameBoard.grid[rowId][cellId] = marker.getMark();
    marker.nextMarker();

    checker.check(cellId, rowId);

    document.documentElement.style.setProperty(
      '--hoverColor',
      marker.markIs('o') ? '#ffd866' : '#ff6188'
    );
  }
  renderer.renderGameBoard(document.getElementById('board'), gameBoard);
}
