const initialState = [
  [2,4,3,9,null,9,null,null,null],
  [7,9,null,null,4,null,3,null,8],
  [null,null,5,7,6,null,2,9,null],
  [null,null,9,8,7,2,4,1,null],
  [null,null,7,null,null,null,6,null,null],
  [null,2,1,4,3,6,7,null,null],
  [null,5,3,null,2,7,8,null,null],
  [6,null,8,null,9,null,null,2,7],
  [null,null,null,6,null,5,9,4,3]
];

const nums = [1,2,3,4,5,6,7,8,9];
const squares = [1,2,3,4,5,6,7,8,9];

class Solver {
  getAdjacent(state, y, x) {
    const xVals = state[y];
    const yVals = state.map(row => row[x]);
    const squareVals = this.getSquareCoords(this.getSquare(y, x));
    return {x: xVals, y: yVals, squareVals: squareVals};
  }

  checkForSolution(state, y, x) {
    if (state[y][x] !== null) return null;
    const adjacent = this.getAdjacent(state, y, x);
    const options = nums.filter(num => {
      return [].concat(adjacent.x, adjacent.y, adjacent.squareVals).indexOf(num) === -1;
    });
    if (options.length === 1) {
      return options[0];
    }
    if (options.length === 0) {
      return 'Error';  // If there are no options there was an error earlier
    }
    return false;
  }

  getSquare(y, x) {
    return squares.filter(square => {
      return this.getSquareCoords(square).some(coord => {
        return JSON.stringify(coord) === JSON.stringify([y, x]);  // Stringify to compare arrays
      });
    });
  }

  getSquareCoords(square) {
    const yMapper = {
      1: [0, 1, 2], 2: [0, 1, 2], 3: [0, 1, 2],
      4: [3, 4, 5], 5: [3, 4, 5], 6: [3, 4, 5],
      7: [6, 7, 8], 8: [6, 7, 8], 9: [6, 7, 8],
    };
    const xMapper = {
      1: [0, 1, 2], 2: [3, 4, 5], 3: [6, 7, 8],
      4: [0, 1, 2], 5: [3, 4, 5], 6: [6, 7, 8],
      7: [0, 1, 2], 8: [3, 4, 5], 9: [6, 7, 8],
    };
    return yMapper[square].reduce((coords, y) => {
      return coords.concat(xMapper[square].map(x => [y, x]));
    }, []);
  }

  isSolved(state) {
    return [].concat(...state).indexOf(null) === -1;
  }

  solve(state, x = 0, y = 0) {
    state[y][x] = this.checkForSolution(state, y, x) || state[y][x];
    if (x === 8 && y === 8) {
      if (this.isSolved(state)) {
        return state;
      }
      return this.solve(state, 0, 0);
    }

    if (x === 8) {
      return this.solve(state, 0, y + 1);
    }

    return this.solve(state, x + 1, y);
  }
}

const solver = new Solver();
console.log(solver.solve(initialState));

const view = (O) => [
  [2,4,3, 9,O,9, O,O,O],
  [7,9,O, O,4,O, 3,O,8],
  [O,O,5, 7,6,O, 2,9,O],

  [O,O,9, 8,7,2, 4,1,O],
  [O,O,7, O,O,O, 6,O,O],
  [O,2,1, 4,3,6, 7,O,O],

  [O,5,3, O,2,7, 8,O,O],
  [6,O,8, O,9,O, O,2,7],
  [O,O,O, 6,O,5, 9,4,3]
];