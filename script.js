let marker = 'x';
let win = '';

let winLength = 5;
let size = 20;

if (window.screen.width < 600) {
  size = 10;
}
if (window.screen.width < 400) {
  size = 5;
  winLength = 3;
}

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
      { x: 1, y: 1 },
      { x: 0, y: 1 },
      { x: -1, y: 1 },
      { x: -1, y: 0 },
      { x: -1, y: -1 },
      { x: 0, y: -1 },
      { x: 1, y: -1 },
    ];

    let directions = templateDirections;

    const invterval = setInterval(() => {
      if (directions.length > 0 && win == '') {
        const cell = getElementAtNextLocation(x, y, directions);
        if (cell != undefined) {
          if (cell.getAttribute('value') == (marker == 'x' ? 'o' : 'x')) {
            cell.style.border = 'solid #00ff2fff 5px';
            checkLine(x, y, directions, 1, { x: x, y: y });
          }
        }
        directions.shift();
      } else {
        clearInterval(invterval);
      }
    }, 0);
  };

  const checkLine = (x, y, direction, opposite, original) => {
    const nextCell = getElementAtNextLocation(x, y, direction);

    if (nextCell != undefined) {
      if (nextCell.getAttribute('value') == (marker == 'x' ? 'o' : 'x')) {
        nextCell.style.border = 'solid #00ff2fff 5px';
        currentLine++;
        if (currentLine >= winLength) {
          win = `${marker == 'x' ? 'Yellow' : 'Pink'} is the Winner`;
          document.getElementById('winText').innerText = win; //! Remove later

          console.log(win);

          return;
        }
        checkLine(
          x + direction[0].x * opposite,
          y + direction[0].y * opposite,
          direction,
          opposite,
          original
        );
      }
    }
    if (opposite != -1) {
      opposite = -1;
      x = original.x;
      y = original.y;
      checkLine(
        x + direction[0].x * opposite,
        y + direction[0].y * opposite,
        direction,
        opposite,
        original
      );
    } else {
      currentLine = 0;
    }
  };

  const getElementAtNextLocation = (x, y, directions) => {
    return getElementAtCoords(x + directions[0].x, y + directions[0].y);
  };

  const getElementAtCoords = (x, y) => {
    return document.getElementById(`${y}-${x}`);
  };

  return { check };
})();

renderer.renderGameBoard(document.getElementById('board'), gameBoard);

function markCell(rowId, cellId) {
  if (gameBoard.grid[rowId][cellId] == '' && win == '') {
    gameBoard.grid[rowId][cellId] = marker;
    marker = marker == 'x' ? 'o' : 'x';

    checker.check(cellId, rowId);
    document.documentElement.style.setProperty(
      '--hoverColor',
      marker == 'o' ? '#ffd866' : '#ff6188'
    );
    renderer.renderGameBoard(document.getElementById('board'), gameBoard);
  }
}
