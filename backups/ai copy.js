function AI(gameBoard, checker) {
  this.grid = gameBoard.grid;
  this.checker = checker;

  this.playMove = new Promise((resolve, reject) => {
    let nextMove = { x: 0, y: 0 };
    for (let i = 0; i < this.grid.length; i++) {
      for (let j = 0; j < this.grid.length; j++) {
        if (this.grid[i][j].value == '') {
          this.checker.check(j, i);
          console.log(nextMove);
          setTimeout(() => {
            nextMove = this.checker.getLongestLine();
          }, 50);
        }
      }
    }
  }).then();

  this.setNextMove = function (move) {
    this.nextMove = { x: move.x, y: move.y };
  };
  this.playRandomMove = function (gameBoard) {
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
    markCell(x, y);
  };
}
