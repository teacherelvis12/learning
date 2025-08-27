// Tic Tac Toe in Phaser 3 (tested on 3.60.0)

(() => {
  const GRID = 3;
  const CELL = 120; // adjust for bigger board
  const BOARD = GRID * CELL; // 360
  const HUD = 72;
  const WIDTH = BOARD;
  const HEIGHT = BOARD + HUD;

  let scene;
  let board;
  let currentPlayer;
  let gameOver;

  let gridGfx; // static grid
  let overlayGfx; // win line
  let marks = []; // texts we draw
  let statusText;
  let restartText;

  const config = {
    type: Phaser.AUTO,
    parent: "game",
    width: WIDTH,
    height: HEIGHT,
    backgroundColor: "#ffffff",
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    scene: { preload, create, update }
  };

  new Phaser.Game(config);

  function preload() {
    // no assets
  }

  function create() {
    scene = this;

    gridGfx = scene.add.graphics({ lineStyle: { width: 4, color: 0x000000 } });
    overlayGfx = scene.add.graphics();

    drawGrid();
    initGame();

    statusText = scene.add.text(WIDTH / 2, BOARD + 12, "Player X's turn", {
      fontSize: "20px",
      color: "#111",
      fontFamily: "Arial, Helvetica, sans-serif"
    }).setOrigin(0.5, 0);

    restartText = scene.add.text(WIDTH / 2, BOARD + 38, "Restart", {
      fontSize: "18px",
      color: "#2563eb",
      fontFamily: "Arial, Helvetica, sans-serif"
    }).setOrigin(0.5, 0).setInteractive({ useHandCursor: true });

    restartText.on("pointerup", hardReset);

    scene.input.on("pointerdown", onPointerDown, scene);
  }

  function update() {}

  function drawGrid() {
    // vertical lines
    gridGfx.strokeLineShape(new Phaser.Geom.Line(CELL, 0, CELL, BOARD));
    gridGfx.strokeLineShape(new Phaser.Geom.Line(CELL * 2, 0, CELL * 2, BOARD));
    // horizontal lines
    gridGfx.strokeLineShape(new Phaser.Geom.Line(0, CELL, BOARD, CELL));
    gridGfx.strokeLineShape(new Phaser.Geom.Line(0, CELL * 2, BOARD, CELL * 2));
  }

  function initGame() {
    board = Array.from({ length: GRID }, () => Array(GRID).fill(""));
    currentPlayer = "X";
    gameOver = false;
    overlayGfx.clear();
    // destroy any previous marks
    for (const t of marks) t.destroy();
    marks = [];
    setStatus("Player X's turn");
  }

  function hardReset() {
    initGame();
  }

  function setStatus(msg) {
    statusText && statusText.setText(msg);
  }

  function onPointerDown(pointer) {
    if (gameOver) return;
    if (pointer.y > BOARD) return; // ignore HUD clicks

    const col = Math.floor(pointer.x / CELL);
    const row = Math.floor(pointer.y / CELL);
    if (!inBounds(row, col)) return;
    if (board[row][col] !== "") return;

    placeMark(row, col, currentPlayer);

    const win = checkWin(board);
    if (win) {
      gameOver = true;
      drawWinLine(win);
      setStatus(`Player ${currentPlayer} wins!`);
      return;
    }

    if (isFull(board)) {
      gameOver = true;
      setStatus("Draw! No more moves.");
      return;
    }

    currentPlayer = currentPlayer === "X" ? "O" : "X";
    setStatus(`Player ${currentPlayer}'s turn`);
  }

  function inBounds(r, c) {
    return r >= 0 && r < GRID && c >= 0 && c < GRID;
  }

  function placeMark(row, col, player) {
    board[row][col] = player;
    const cx = col * CELL + CELL / 2;
    const cy = row * CELL + CELL / 2;
    const t = scene.add.text(cx, cy, player, {
      fontSize: Math.floor(CELL * 0.66) + "px",
      color: "#111111",
      fontFamily: "Arial, Helvetica, sans-serif"
    }).setOrigin(0.5);
    marks.push(t);
  }

  // returns object describing the winning line or null
  function checkWin(b) {
    // rows
    for (let r = 0; r < GRID; r++) {
      if (b[r][0] && b[r][0] === b[r][1] && b[r][1] === b[r][2]) {
        return { kind: "row", index: r };
      }
    }
    // cols
    for (let c = 0; c < GRID; c++) {
      if (b[0][c] && b[0][c] === b[1][c] && b[1][c] === b[2][c]) {
        return { kind: "col", index: c };
      }
    }
    // diag
    if (b[0][0] && b[0][0] === b[1][1] && b[1][1] === b[2][2]) {
      return { kind: "diag" };
    }
    // anti
    if (b[0][2] && b[0][2] === b[1][1] && b[1][1] === b[2][0]) {
      return { kind: "anti" };
    }
    return null;
  }

  function isFull(b) {
    for (let r = 0; r < GRID; r++) {
      for (let c = 0; c < GRID; c++) {
        if (b[r][c] === "") return false;
      }
    }
    return true;
  }

  function drawWinLine(res) {
    overlayGfx.clear();
    overlayGfx.lineStyle(6, 0xef4444, 1);
    const pad = 14;
    const half = CELL / 2;

    if (res.kind === "row") {
      const y = res.index * CELL + half;
      overlayGfx.strokeLineShape(new Phaser.Geom.Line(pad, y, BOARD - pad, y));
    } else if (res.kind === "col") {
      const x = res.index * CELL + half;
      overlayGfx.strokeLineShape(new Phaser.Geom.Line(x, pad, x, BOARD - pad));
    } else if (res.kind === "diag") {
      overlayGfx.strokeLineShape(new Phaser.Geom.Line(pad, pad, BOARD - pad, BOARD - pad));
    } else if (res.kind === "anti") {
      overlayGfx.strokeLineShape(new Phaser.Geom.Line(BOARD - pad, pad, pad, BOARD - pad));
    }
  }
})();