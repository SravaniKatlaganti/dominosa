import GameLogic from "./core/GameLogic.js";
import Renderer from "./rendering/Renderer.js";
import InputHandler from "./input/InputHandler.js";

const GRID_CONFIG = { rows: 8, cols: 7 };

const gridElement = document.getElementById("grid");
const gameOverElement = document.getElementById("game-over");
const newGameButton = document.getElementById("new-game-button");
const newGameButtonOverlay = document.getElementById("new-game-button-overlay");

const movesDisplay = document.getElementById("moves-display");

const game = new GameLogic(GRID_CONFIG);
const renderer = new Renderer({ gridElement, gameOverElement });
const inputHandler = new InputHandler({
  gridElement,
  onCellClick: (row, col) => {
    const result = game.toggleCell(row, col);
    renderer.update({ gridModel: game.getGridModel(), state: game.getState() });
    if (result.invalid) {
      renderer.showInvalidFeedback(row, col);
    }
    updateMoves();
  },
});

const updateMoves = () => {
  if (movesDisplay) {
    movesDisplay.textContent = `Moves: ${game.getState().moves}`;
  }
};

const startNewGame = () => {
  game.newGame();
  renderer.createGrid(game.getGridModel());
  renderer.update({ gridModel: game.getGridModel(), state: game.getState() });
  updateMoves();
};

inputHandler.bind();
newGameButton.addEventListener("click", startNewGame);
newGameButtonOverlay.addEventListener("click", startNewGame);

renderer.createGrid(game.getGridModel());
renderer.update({ gridModel: game.getGridModel(), state: game.getState() });
updateMoves();
