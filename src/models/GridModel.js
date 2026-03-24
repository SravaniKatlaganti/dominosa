export default class GridModel {
  constructor(config, values = null) {
    if (typeof config === "number") {
      this.rows = config;
      this.cols = config;
    } else {
      this.rows = config.rows ?? config.size ?? 7;
      this.cols = config.cols ?? config.size ?? 7;
    }

    this.size = Math.max(this.rows, this.cols);

    if (values) {
      this.values = values;
      return;
    }

    this.values = GridModel.generateSolvablePuzzle(this.rows, this.cols);
  }

  static generateSolvablePuzzle(rows, cols) {
    const dominoValues = [];
    for (let low = 0; low <= 6; low += 1) {
      for (let high = low; high <= 6; high += 1) {
        dominoValues.push([low, high]);
      }
    }

    for (let attempt = 0; attempt < 400; attempt += 1) {
      const layout = GridModel.generateRandomLayout(rows, cols);
      const shuffledValues = GridModel.shuffle(dominoValues);
      const values = GridModel.createMatrix(rows, cols, -1);

      layout.forEach(([firstCell, secondCell], index) => {
        let [firstValue, secondValue] = shuffledValues[index];
        if (Math.random() < 0.5) {
          [firstValue, secondValue] = [secondValue, firstValue];
        }

        values[firstCell.row][firstCell.col] = firstValue;
        values[secondCell.row][secondCell.col] = secondValue;
      });

      const count = GridModel.countSolutions(values, rows, cols, 2);
      if (count === 1) {
        return values;
      }
    }

    throw new Error("Failed to generate a unique Dominosa puzzle.");
  }

  static generateRandomLayout(rows, cols) {
    const occupied = GridModel.createMatrix(rows, cols, false);
    const layout = [];

    const backtrack = () => {
      const nextCell = GridModel.findFirstOpenCell(occupied, rows, cols);
      if (!nextCell) {
        return true;
      }

      const neighbors = GridModel.shuffle(
        GridModel.getNeighborCoords(nextCell.row, nextCell.col, rows, cols).filter(
          ({ row, col }) => !occupied[row][col],
        ),
      );

      for (const neighbor of neighbors) {
        occupied[nextCell.row][nextCell.col] = true;
        occupied[neighbor.row][neighbor.col] = true;
        layout.push([nextCell, neighbor]);

        if (backtrack()) {
          return true;
        }

        layout.pop();
        occupied[nextCell.row][nextCell.col] = false;
        occupied[neighbor.row][neighbor.col] = false;
      }

      return false;
    };

    if (!backtrack()) {
      throw new Error("Failed to generate a domino layout.");
    }

    return layout;
  }

  static countSolutions(values, rows, cols, limit = 2) {
    const covered = GridModel.createMatrix(rows, cols, false);
    const usedPairs = new Set();

    let count = 0;

    const search = () => {
      if (count >= limit) {
        return;
      }

      const nextChoice = GridModel.findMostConstrainedCell(values, covered, usedPairs, rows, cols);
      if (!nextChoice) {
        count += 1;
        return;
      }

      if (nextChoice.candidates.length === 0) {
        return;
      }

      for (const candidate of GridModel.shuffle(nextChoice.candidates)) {
        const { cell, neighbor, pairKey } = candidate;
        covered[cell.row][cell.col] = true;
        covered[neighbor.row][neighbor.col] = true;
        usedPairs.add(pairKey);

        search();

        usedPairs.delete(pairKey);
        covered[cell.row][cell.col] = false;
        covered[neighbor.row][neighbor.col] = false;
      }
    };

    search();

    return count;
  }

  static findMostConstrainedCell(values, covered, usedPairs, rows, cols) {
    let best = null;

    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < cols; col += 1) {
        if (covered[row][col]) {
          continue;
        }

        const candidates = GridModel.getCandidatesForCell(values, covered, usedPairs, rows, cols, row, col);
        if (!best || candidates.length < best.candidates.length) {
          best = {
            cell: { row, col },
            candidates,
          };
        }

        if (best && best.candidates.length <= 1) {
          return best;
        }
      }
    }

    return best;
  }

  static getCandidatesForCell(values, covered, usedPairs, rows, cols, row, col) {
    const candidates = [];

    GridModel.getNeighborCoords(row, col, rows, cols).forEach((neighbor) => {
      if (covered[neighbor.row][neighbor.col]) {
        return;
      }

      const pairKey = GridModel.getValuePairKey(
        values[row][col],
        values[neighbor.row][neighbor.col],
      );

      if (usedPairs.has(pairKey)) {
        return;
      }

      candidates.push({
        cell: { row, col },
        neighbor,
        pairKey,
      });
    });

    return candidates;
  }

  static getNeighborCoords(row, col, rows, cols) {
    return [
      { row: row - 1, col },
      { row: row + 1, col },
      { row, col: col - 1 },
      { row, col: col + 1 },
    ].filter(({ row: nextRow, col: nextCol }) => nextRow >= 0 && nextRow < rows && nextCol >= 0 && nextCol < cols);
  }

  static findFirstOpenCell(occupied, rows, cols) {
    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < cols; col += 1) {
        if (!occupied[row][col]) {
          return { row, col };
        }
      }
    }

    return null;
  }

  static createMatrix(rows, cols, initialValue) {
    return Array.from({ length: rows }, () => Array.from({ length: cols }, () => initialValue));
  }

  static getValuePairKey(firstValue, secondValue) {
    return [firstValue, secondValue].sort((a, b) => a - b).join("-");
  }

  static shuffle(arr) {
    const copy = arr.slice();
    for (let index = copy.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
    }
    return copy;
  }

  getValue(row, col) {
    return this.values[row][col];
  }

  forEachCell(callback) {
    this.values.forEach((rowValues, row) => {
      rowValues.forEach((value, col) => {
        callback({ row, col, value });
      });
    });
  }

  isWithinBounds(row, col) {
    return row >= 0 && row < this.rows && col >= 0 && col < this.cols;
  }
}
