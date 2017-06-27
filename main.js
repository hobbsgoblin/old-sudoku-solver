const initialState = [
  [2,4,3,9,null,8,null,null,null],
  [7,9,null,null,4,null,3,null,8],
  [null,null,5,7,6,null,2,9,null],
  [null,null,9,8,7,2,4,1,null],
  [null,null,7,null,null,null,6,null,null],
  [null,2,1,4,3,6,7,null,null],
  [null,5,4,null,2,7,8,null,null],
  [6,null,8,null,9,null,null,2,7],
  [null,null,null,6,null,5,9,4,3]
];

const mediumState = [
  [1,null,null,null,null,8,null,null,9],
  [null,null,2,null,null,null,null,null,8],
  [null,8,null,5,4,9,null,null,null],
  [null,4,null,2,null,null,9,null,null],
  [3,null,9,null,null,null,2,null,1],
  [null,null,1,null,null,5,null,4,null],
  [null,null,null,9,1,2,null,3,null],
  [7,null,null,null,null,null,1,null,null],
  [2,null,null,7,null,null,null,null,6]
];

class Solver {
  getAdjacentValues(state, y, x) {
    const xVals = state[y];
    const yVals = state.map(row => row[x]);
    const squareVals = this.getValues(state, this.getSquareCoords(this.getSquare(y, x)));
    return {x: xVals, y: yVals, squareVals: squareVals};
  }

  getAdjacentCoordinates(y, x) {
    const xCoords = [0,1,2,3,4,5,6,7,8].map(y => [y, x]).filter(coord => coord[0] !== y);
    const yCoords = [0,1,2,3,4,5,6,7,8].map(x => [y, x]).filter(coord => coord[1] !== x);
    const squareCoords = this.getSquareCoords(this.getSquare(y, x))
        .filter(coord => coord[0] !== y || coord[1] !== x);
    return {x: xCoords, y: yCoords, squareCoords: squareCoords};
  }

  checkForSolution(state, y, x) {
    if (state[y][x] !== null) return null;
    const adjacent = this.getAdjacentValues(state, y, x);
    const options = this.getOptions(adjacent);
    if (options.length === 1) {
      return options[0];
    }
    if (options.length === 0) {
      const err = new Error();
      err.data = {
        state: state,
        coords: [y, x],
      };
      throw err;  // If there are no options then there was an error earlier
    }

    // Check what adjacent nulls CAN'T be
      // For squares, x-line, and y-line
    const xNonOptions = this.getNonOptions(state, this.getAdjacentCoordinates(y, x).x);
    const yNonOptions = this.getNonOptions(state, this.getAdjacentCoordinates(y, x).y);
    const squareNonOptions = this.getNonOptions(state, this.getAdjacentCoordinates(y, x).squareCoords);

    if (xNonOptions.length === 1) {
      return xNonOptions[0];
    }
    if (yNonOptions.length === 1) {
      return yNonOptions[0];
    }
    if (squareNonOptions.length === 1) {
      return squareNonOptions[0];
    }

    return false;
  }

  getOptions(adjacent) {
    return [1,2,3,4,5,6,7,8,9].filter(num => {
      return [].concat(adjacent.x, adjacent.y, adjacent.squareVals).indexOf(num) === -1;
    });
  }

  getNonOptions(state, coords) {
    // Get null coordinates
    const nullCoords = coords.filter(coord => this.getValue(state, coord) === null);
    const nonNullCoords = coords.filter(coord => this.getValue(state, coord) !== null);
    // Get all values that the null coordinates cannot be,
    // and that aren't already in the other coordinates
    const nullCoordNonOptions = nullCoords
        .reduce((nonOptions, nullCoord) => {
          // Get all values that the coordinate COULD be
          const options = this.getOptions(this.getAdjacentValues(state, nullCoord[0], nullCoord[1]));
          // Add all values that aren't an option for the coordinate
          return nonOptions
              .concat([1,2,3,4,5,6,7,8,9]
              .filter(num => options.indexOf(num) === -1));
        }, [])
        .filter(option => this.getValues(state, nonNullCoords).indexOf(option) === -1);
    // Get all values that are "non-options" for every null coordinate given
    const remainingNonOptions = nullCoordNonOptions.reduce((nonOptions, option, index, arr) => {
        if (arr.filter(op => op === option).length === nullCoords.length) {
          return nonOptions.concat(option);
        }
        return nonOptions;
      }, []);
    // Return unique values from
    return Array.from(new Set(remainingNonOptions));
  }

  getValues(state, coordinates) {
    return coordinates.map(coord => this.getValue(state, coord));
  }

  getValue(state, coordinate) {
    return state[coordinate[0]][coordinate[1]];
  }

  getSquare(y, x) {
    return [1,2,3,4,5,6,7,8,9].filter(square => {
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
    try {
      state[y][x] = this.checkForSolution(state, y, x) || state[y][x];
    } catch (error) {
      console.log(error.data);
      console.log(this.printState(error.data.state));
      return 'Error';
    }
    if (x === 8 && y === 8) {
      if (this.isSolved(state)) {
        console.log('Solved: ');
        console.log(this.printState(state));
        return state;
      }
      console.log(this.printState(state));
      return this.solve(state, 0, 0);
    }

    if (x === 8) {
      return this.solve(state, 0, y + 1);
    }

    return this.solve(state, x + 1, y);
  }

  printState(state) {
    return state.reduce((text, row, index) => {
      if (index === 3 || index === 6) {
        text = text.concat("\n");
      }
      row = row.reduce((rowText, val, rowIndex) => {
        val = val === null ? '_' : val;
        if (rowIndex === 3 || rowIndex === 6) {
          rowText = rowText.concat(' ');
        }
        return rowText.concat(' ' + val);
      }, '');
      return text.concat("|" + row + "|\n");
    }, '');
  }
}

const solver = new Solver();
console.log(solver.printState(mediumState));
console.log(solver.solve(mediumState));



const sampleState = [
  [null,null,null,null,null,null,null,null,null],
  [null,null,null,null,null,null,null,null,null],
  [null,null,null,null,null,null,null,null,null],
  [null,null,null,null,null,null,null,null,null],
  [null,null,null,null,null,null,null,null,null],
  [null,null,null,null,null,null,null,null,null],
  [null,null,null,null,null,null,null,null,null],
  [null,null,null,null,null,null,null,null,null],
  [null,null,null,null,null,null,null,null,null]
];