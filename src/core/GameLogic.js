import GridModel from "../models/GridModel.js";
import GameState from "./GameState.js";

export default class GameLogic {
  constructor({ rows = 7, cols = 7, size } = {}) {
    const config = size ? size : { rows, cols };
    this.gridModel = new GridModel(config);
    this.state = new GameState(this.gridModel);
  }

  newGame() {
    const config = { rows: this.gridModel.rows, cols: this.gridModel.cols };
    this.gridModel = new GridModel(config);
    this.state = new GameState(this.gridModel);
  }

  getGridModel() {
    return this.gridModel;
  }

  getState() {
    return this.state;
  }

  toggleCell(row, col) {
    const cellKey = GameLogic.toKey(row, col);

    if (this.state.hasDomino(cellKey)) {
      this.state.removeDomino(cellKey);
      this.state.resetSelection();
      return { placed: false, removed: true, invalid: false };
    }

    this.state.selectCell(cellKey);

    if (this.state.selectedCells.length === 2) {
      const [first, second] = this.state.selectedCells;
      if (GameLogic.areAdjacent(first, second)) {
        if (this.state.isValuePairUsed(first, second)) {
          this.state.selectedCells = [cellKey];
          return { placed: false, removed: false, invalid: true };
        }

        this.state.setDomino(first, second);
        this.state.resetSelection();
        return { placed: true, removed: false, invalid: false };
      }

      this.state.selectedCells = [cellKey];
    }

    return { placed: false, removed: false, invalid: false };
  }

  static areAdjacent(cellA, cellB) {
    const [rowA, colA] = cellA.split(":").map(Number);
    const [rowB, colB] = cellB.split(":").map(Number);
    const rowDiff = Math.abs(rowA - rowB);
    const colDiff = Math.abs(colA - colB);
    return rowDiff + colDiff === 1;
  }

  static toKey(row, col) {
    return `${row}:${col}`;
  }
}
