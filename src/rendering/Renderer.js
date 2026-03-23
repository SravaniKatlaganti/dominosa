import GameLogic from "../core/GameLogic.js";

export default class Renderer {
  constructor({ gridElement, gameOverElement }) {
    this.gridElement = gridElement;
    this.gameOverElement = gameOverElement;
    this.gameOverSummaryElement = document.getElementById("game-over-summary");
    this.gameOverMovesElement = document.getElementById("game-over-moves");
    this.cellElements = new Map();
    this.dominoPairElements = new Map();
  }

  createGrid(gridModel) {
    this.gridElement.innerHTML = "";
    this.cellElements.clear();
    this.dominoPairElements.clear();

    gridModel.forEachCell(({ row, col, value }) => {
      const cell = document.createElement("button");
      cell.className = "cell";
      cell.type = "button";
      cell.dataset.row = row;
      cell.dataset.col = col;
      cell.setAttribute("role", "gridcell");

      const valueSpan = document.createElement("span");
      valueSpan.className = "cell__value";
      valueSpan.textContent = value;
      cell.appendChild(valueSpan);

      const overlay = document.createElement("span");
      overlay.className = "domino";
      cell.appendChild(overlay);

      this.gridElement.appendChild(cell);
      this.cellElements.set(GameLogic.toKey(row, col), cell);
    });
  }

  update({ gridModel, state }) {
    state.gridModel = gridModel;
    this.cellElements.forEach((cell, key) => {
      const isSelected = state.selectedCells.includes(key);
      cell.classList.toggle("is-selected", isSelected);

      const hasDomino = state.hasDomino(key);
      cell.classList.toggle("is-disabled", hasDomino);
      cell.classList.toggle("is-paired", hasDomino);

      const overlay = cell.querySelector(".domino");
      if (overlay) {
        overlay.classList.toggle("is-visible", hasDomino);
      }
    });

    this.renderDominoPairs(state);
    this.updateGameOverContent(state);

    const showGameOver = state.isComplete();
    this.gameOverElement.classList.toggle("is-visible", showGameOver);
    this.gameOverElement.setAttribute("aria-hidden", String(!showGameOver));
  }

  updateGameOverContent(state) {
    if (this.gameOverSummaryElement) {
      this.gameOverSummaryElement.textContent = "Start a new game.";
    }

    if (this.gameOverMovesElement) {
      this.gameOverMovesElement.textContent = `Moves: ${state.moves}`;
    }
  }

  renderDominoPairs(state) {
    const handled = new Set();

    state.dominoes.forEach((partner, key) => {
      if (handled.has(key) || handled.has(partner)) {
        return;
      }
      const pairKey = Renderer.toPairKey(key, partner);
      const element = this.dominoPairElements.get(pairKey) ?? this.createDominoPairElement(pairKey);
      this.positionDominoPair(element, key, partner);
      element.classList.add("is-visible");
      handled.add(key);
      handled.add(partner);
    });

    this.dominoPairElements.forEach((element, pairKey) => {
      if (!Renderer.pairExists(pairKey, handled)) {
        element.classList.remove("is-visible");
      }
    });
  }

  createDominoPairElement(pairKey) {
    const element = document.createElement("div");
    element.className = "domino-pair";
    element.dataset.pairKey = pairKey;

    const divider = document.createElement("span");
    divider.className = "domino-pair__divider";
    element.appendChild(divider);

    this.gridElement.appendChild(element);
    this.dominoPairElements.set(pairKey, element);
    return element;
  }

  positionDominoPair(element, keyA, keyB) {
    const cellA = this.cellElements.get(keyA);
    const cellB = this.cellElements.get(keyB);
    if (!cellA || !cellB) {
      return;
    }

    const gridBounds = this.gridElement.getBoundingClientRect();
    const rectA = cellA.getBoundingClientRect();
    const rectB = cellB.getBoundingClientRect();

    const left = Math.min(rectA.left, rectB.left) - gridBounds.left;
    const top = Math.min(rectA.top, rectB.top) - gridBounds.top;
    const right = Math.max(rectA.right, rectB.right) - gridBounds.left;
    const bottom = Math.max(rectA.bottom, rectB.bottom) - gridBounds.top;

    element.style.left = `${left}px`;
    element.style.top = `${top}px`;
    element.style.width = `${right - left}px`;
    element.style.height = `${bottom - top}px`;

    const isHorizontal = rectA.top === rectB.top;
    element.classList.toggle("is-horizontal", isHorizontal);
    element.classList.toggle("is-vertical", !isHorizontal);
  }

  static toPairKey(keyA, keyB) {
    return [keyA, keyB].sort().join("|");
  }

  static pairExists(pairKey, handled) {
    const [keyA, keyB] = pairKey.split("|");
    return handled.has(keyA) && handled.has(keyB);
  }

  showInvalidFeedback(row, col) {
    const key = GameLogic.toKey(row, col);
    const cell = this.cellElements.get(key);
    if (!cell) {
      return;
    }
    cell.classList.add("is-invalid");
    setTimeout(() => {
      cell.classList.remove("is-invalid");
    }, 400);
  }
}
