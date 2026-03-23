export default class InputHandler {
  constructor({ gridElement, onCellClick }) {
    this.gridElement = gridElement;
    this.onCellClick = onCellClick;
  }

  bind() {
    this.gridElement.addEventListener("click", (event) => {
      const cell = event.target.closest(".cell");
      if (!cell || !this.gridElement.contains(cell)) {
        return;
      }
      const row = Number(cell.dataset.row);
      const col = Number(cell.dataset.col);
      this.onCellClick(row, col);
    });
  }
}
