export default class GameState {
  constructor(gridModel) {
    this.gridModel = gridModel;
    this.selectedCells = [];
    this.dominoes = new Map();
    this.usedValuePairs = new Set();
    this.moves = 0;
  }

  getValuePairKey(cellA, cellB) {
    const [rowA, colA] = cellA.split(":").map(Number);
    const [rowB, colB] = cellB.split(":").map(Number);
    const valueA = this.gridModel.getValue(rowA, colA);
    const valueB = this.gridModel.getValue(rowB, colB);
    const sorted = [valueA, valueB].sort((a, b) => a - b);
    return `${sorted[0]}-${sorted[1]}`;
  }

  isValuePairUsed(cellA, cellB) {
    return this.usedValuePairs.has(this.getValuePairKey(cellA, cellB));
  }

  addValuePair(cellA, cellB) {
    this.usedValuePairs.add(this.getValuePairKey(cellA, cellB));
  }

  removeValuePair(cellA, cellB) {
    this.usedValuePairs.delete(this.getValuePairKey(cellA, cellB));
  }

  resetSelection() {
    this.selectedCells = [];
  }

  selectCell(cellKey) {
    if (this.selectedCells.includes(cellKey)) {
      this.selectedCells = this.selectedCells.filter((key) => key !== cellKey);
      return;
    }

    if (this.selectedCells.length < 2) {
      this.selectedCells = [...this.selectedCells, cellKey];
    }
  }

  hasDomino(cellKey) {
    return this.dominoes.has(cellKey);
  }

  setDomino(cellA, cellB) {
    this.dominoes.set(cellA, cellB);
    this.dominoes.set(cellB, cellA);
    this.addValuePair(cellA, cellB);
    this.moves += 1;
  }

  removeDomino(cellKey) {
    const partner = this.dominoes.get(cellKey);
    if (!partner) {
      return;
    }
    this.dominoes.delete(cellKey);
    this.dominoes.delete(partner);
    this.removeValuePair(cellKey, partner);
  }

  isComplete() {
    return this.dominoes.size === this.gridModel.rows * this.gridModel.cols;
  }
}
