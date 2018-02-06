class Solver {
  constructor() {
    // Map of squares to the coordinates they contain
    this.squareCoordMap = {1:[[0,0],[0,1],[0,2],[1,0],[1,1],[1,2],[2,0],[2,1],[2,2]],2:[[0,3],[0,4],[0,5],[1,3],[1,4],[1,5],[2,3],[2,4],[2,5]],3:[[0,6],[0,7],[0,8],[1,6],[1,7],[1,8],[2,6],[2,7],[2,8]],4:[[3,0],[3,1],[3,2],[4,0],[4,1],[4,2],[5,0],[5,1],[5,2]],5:[[3,3],[3,4],[3,5],[4,3],[4,4],[4,5],[5,3],[5,4],[5,5]],6:[[3,6],[3,7],[3,8],[4,6],[4,7],[4,8],[5,6],[5,7],[5,8]],7:[[6,0],[6,1],[6,2],[7,0],[7,1],[7,2],[8,0],[8,1],[8,2]],8:[[6,3],[6,4],[6,5],[7,3],[7,4],[7,5],[8,3],[8,4],[8,5]],9:[[6,6],[6,7],[6,8],[7,6],[7,7],[7,8],[8,6],[8,7],[8,8]]};
  }
  // Returns all of the values in the same row, column, and square of a given coordinate
  getAdjacentValues(state, coord) {
    const [y, x] = coord;
    const xVals = state[y];
    const yVals = state.map(row => row[x]);
    const squareVals = this.getValues(state, this.getSquareCoords(this.getSquare(y, x)));
    return {x: xVals, y: yVals, squareVals: squareVals};
  }

  // Returns all of the coordinates in the same row, column, and square of a given coordinate
  getAdjacentCoords(coord) {
    const [y, x] = coord;
    const xCoords = [0,1,2,3,4,5,6,7,8].map(y => [y, x]).filter(coord => coord[0] !== y);
    const yCoords = [0,1,2,3,4,5,6,7,8].map(x => [y, x]).filter(coord => coord[1] !== x);
    const squareCoords = this.getSquareCoords(this.getSquare(y, x))
        .filter(coord => coord[0] !== y || coord[1] !== x);
    return {x: xCoords, y: yCoords, squareCoords: squareCoords};
  }
  // Same as getAdjacentCoords but includes given coordinate
  getAdjacentCoordsInclusive(coord) {
    const [y, x] = coord;
    const xCoords = [0,1,2,3,4,5,6,7,8].map(y => [y, x]);
    const yCoords = [0,1,2,3,4,5,6,7,8].map(x => [y, x]);
    const squareCoords = this.getSquareCoords(this.getSquare(y, x));
    return {x: xCoords, y: yCoords, squareCoords: squareCoords};
  }

  // Attempt to find the solution for a given coord
  checkForSolution(state, coord) {
    const [y, x] = coord;
    if (state[y][x]) return state[y][x];
    const adjacentCoords = this.getAdjacentCoords(coord);
    const allowed = this.getAllowed(state, coord);
    const xAllowed = this.getXAllowed(state, coord);
    const yAllowed = this.getYAllowed(state, coord);
    const squareAllowed = this.getSquareAllowed(state, coord);
    if (xAllowed.length === 1) return xAllowed[0];
    if (yAllowed.length === 1) return yAllowed[0];
    if (squareAllowed.length === 1) return squareAllowed[0];

    const options = this.getOptions(state, coord);
    if (allowed.length === 1) {
      return allowed[0];
    }
    if (options.length === 1) {
      return options[0];
    }
    if (allowed.length === 0) {
      const err = new Error();
      err.data = {
        state: state,
        coords: [y, x],
      };
      throw err;  // If there are no options then there was an error earlier
    }

    // Check what OTHER adjacent nulls CAN'T be
      // For squares, x-line, and y-line
    const xNonOptions = this.getNonOptions(state, adjacentCoords.x);
    const yNonOptions = this.getNonOptions(state, adjacentCoords.y);
    const squareNonOptions = this.getNonOptions(state, adjacentCoords.squareCoords);

    if (xNonOptions.length === 1) return xNonOptions[0];
    if (yNonOptions.length === 1) return yNonOptions[0];
    if (squareNonOptions.length === 1) return squareNonOptions[0];

    // If no solution is found return null
    return null;
  }

  // Detect if multiple coords have the exact same options
  // Detect if the number of coords with the same options is the same as the number of values
  // Remove those values from all other coords
  // Check for x, y, and square coords and then intersect results?
  // Create metastate with new options in place of previous getOptions?
  // Otherwise modify getOptions to use do this automatically?

  // test = [
  //     {coord: [2,1], options: [1,2,7,8], mustBeOf: null},
  //     {coord: [5,1], options: [2,7,8], mustBeOf: null},
  //     {coord: [7,1], options: [1,2], mustBeOf: null},
  //     {coord: [8,1], options: [1,2], mustBeOf: null},
  // ];

  // If first array contains second array
  arrayContainsArray(containerArray, array) {
    return containerArray
        .filter((item) => {
          return (
              Array.isArray(item) &&
              this.arrayIntersect(item, array).length === array.length
          );
        })
        .length > 0;
  }

  arrayIntersect(...arrs) {
    return arrs.reduce((intersecting, arr) => {
      const set1 = new Set(intersecting), set2 = new Set(arr);
      return [...set1].filter(val => set2.has(val));
    }, arrs.pop());
  }

  getAllowed(state, coord) {
    const adjacent = this.getAdjacentValues(state, coord);
    const adjacentVals = [].concat(adjacent.x, adjacent.y, adjacent.squareVals);
    return [1,2,3,4,5,6,7,8,9].filter(num => {
      return !adjacentVals.includes(num);
    });
  }
  getXAllowed(state, coord) {
    const adjacent = this.getAdjacentValues(state, coord);
    return [1,2,3,4,5,6,7,8,9].filter(num => {
      return !adjacent.x.includes(num);
    });
  }
  getYAllowed(state, coord) {
    const adjacent = this.getAdjacentValues(state, coord);
    return [1,2,3,4,5,6,7,8,9].filter(num => {
      return !adjacent.y.includes(num);
    });
  }
  getSquareAllowed(state, coord) {
    const adjacent = this.getAdjacentValues(state, coord);
    return [1,2,3,4,5,6,7,8,9].filter(num => {
      return !adjacent.squareVals.includes(num);
    });
  }

  getOptions(state, coord) {
    let allowed = this.getAllowed(state, coord);
    const adjCoordsInc = this.getAdjacentCoordsInclusive(coord);  // Get adjacent coordinates, both num and null
    const xMatching = this.findMatching(state, adjCoordsInc.x);
    const yMatching = this.findMatching(state, adjCoordsInc.y);
    const squareMatching = this.findMatching(state, adjCoordsInc.squareCoords);

    [].concat(xMatching, yMatching, squareMatching).forEach(match => {
      if (!this.arraysAreIdentical(allowed, match)) {
        allowed = allowed.filter(val => !match.includes(val));
      }
    });
    return allowed;
  }

  findMatching(state, adjacent) {
    const xNullCoords = this.filterNullCoords(state, adjacent, true);  // Null adjacent coordinates
    const xExistingVals = this.getValues(state, this.filterNullCoords(state, adjacent));  // Non-null values
    const xNonExistingVals = [1,2,3,4,5,6,7,8,9].filter(num => !xExistingVals.includes(num));  // Vals not in X yet
    const xEval = xNullCoords.map(coord => ({
      coord: coord,
      available: xNonExistingVals,
      options: this.getAllowed(state, coord),  // Legal values for coord
    }));
    return xEval.reduce((matching, coord) => {
      // Get all OTHER coords with matching options
      const matchingOps = xEval
      .filter(otherCoord => {
        return this.arraysAreIdentical(coord.options, otherCoord.options) &&
            !this.arraysAreIdentical(coord.coord, otherCoord.coord);
      });

      if (matchingOps.length === coord.options.length - 1 &&
          !this.arrayContainsArray(matching, coord.options)) {
        return matching.concat([coord.options]);
      }
      return matching;
    }, []);
  }

  getNonOptions(state, coords) {
    // Get null coordinates
    const nullCoords = this.filterNullCoords(state, coords, true);
    const nonNullCoords = this.filterNullCoords(state, coords);
    // Get all values that the null coordinates cannot be,
    // and that aren't already in the other coordinates
    const nullCoordNonOptions = nullCoords
        .reduce((nonOptions, nullCoord) => {
          // Get all values that the coordinate COULD be
          const options = this.getOptions(state, nullCoord);
          // Add all values that aren't an option for the coordinate
          return nonOptions
              .concat([1,2,3,4,5,6,7,8,9]
              .filter(num => !options.includes(num)));
        }, [])
        .filter(option => !this.getValues(state, nonNullCoords).includes(option));
    // Get all values that are "non-options" for EVERY null coordinate given
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

  filterNullCoords(state, coords, onlyNulls = false) {
    if (onlyNulls) {
      return coords.filter(coord => this.getValue(state, coord) === null);
    }
    return coords.filter(coord => this.getValue(state, coord) !== null);
  }

  // Get the value of a given coordinate from the given puzzle state
  getValue(state, coordinate) {
    return state[coordinate[0]][coordinate[1]];
  }

  // Get the square (1 through 9) that contains the given coordinates
  // TODO: Consider caching square/coordinate maps to save performance
  getSquare(y, x) {
    return [1,2,3,4,5,6,7,8,9].find(square => {
      return this.getSquareCoords(square).some(coord => {
        return this.arraysAreIdentical(coord, [y, x]);
      });
    });
  }

  getSquares(coords) {
    return coords.reduce((squares, coord) => {
      const square = this.getSquare(coord[0], coord[1]);
      if (!squares.includes(square)) {
        return squares.concat(square);
      }
      return squares;
    }, []);
  }

  // Get the coordinates contained within in a given square (1 through 9)
  getSquareCoords(square) {
    // No reason to calculate this each time, stored data as a property
    return this.squareCoordMap[square];
    // const yMapper = {
    //   1: [0, 1, 2], 2: [0, 1, 2], 3: [0, 1, 2],
    //   4: [3, 4, 5], 5: [3, 4, 5], 6: [3, 4, 5],
    //   7: [6, 7, 8], 8: [6, 7, 8], 9: [6, 7, 8],
    // };
    // const xMapper = {
    //   1: [0, 1, 2], 2: [3, 4, 5], 3: [6, 7, 8],
    //   4: [0, 1, 2], 5: [3, 4, 5], 6: [6, 7, 8],
    //   7: [0, 1, 2], 8: [3, 4, 5], 9: [6, 7, 8],
    // };
    // const yVals = [].concat(yMapper[square], yMapper[square], yMapper[square]).sort();
    // const xVals = [].concat(xMapper[square], xMapper[square], xMapper[square]);
    // return yVals.map((val, index) => [val, xVals[index]]);
    //
    // // return yMapper[square].reduce((coords, y) => {
    // //   return coords.concat(xMapper[square].map(x => [y, x]));
    // // }, []);
  }

  getUniqueValues(array) {
    return Array.from(new Set(array));
  }

  arraysAreIdentical(arr1, arr2) {
    if (!Array.isArray(arr1) || !Array.isArray(arr2)) return undefined;
    if (arr1.length !== arr2.length) return false;

    for (let i = arr1.length; i--;) {
      if (Array.isArray(arr1[i]) || Array.isArray(arr2[i])) {
        if (!this.arraysAreIdentical(arr1[i], arr2[i])) {
          return false;
        }
      } else if (arr1[i] !== arr2[i]) {
        return false;
      }
    }
    return true;
  }

  isSolved(state) {
    return ![].concat(...state).includes(null);
  }

  solve(state, x = 0, y = 0, prevState = null) {
    try {
      state[y][x] = this.checkForSolution(state, [y, x]);
    } catch (error) {
      // console.log(error);
      // if (error.data) console.log(this.printState(error.data.state));
      return {solved: false, state: state, error: error};
    }

    if (x === 8 && y === 8) {
      if (this.isSolved(state)) {
        console.log(this.printState(state));
        console.log('Solved!');
        return {solved: true, state: state};
      }
      if (prevState !== null) {
        if (this.arraysAreIdentical(state, prevState)) {
          return {solved: false, state: state};  // Break out if no solution found. Prevents infinite recursion
        }
      }
      prevState = this.copyState(state);
      return this.solve(state, 0, 0, prevState);
    }

    if (x === 8) {
      return this.solve(state, 0, y + 1, prevState);
    }

    return this.solve(state, x + 1, y, prevState);
  }

  solveBruteForce(state) {
    const solveAttempt = this.solve(state);
    if (solveAttempt.solved === false) {
      state = this.copyState(solveAttempt.state);
      // Just gonna go ahead and do some heavy nested looping here
      // For each null cell, get it's possible values,
      // then try solving it with each one until a correct solution is found
      for (const [y, row] of state.entries()) {
        for (const [x, val] of row.entries()) {
          if (val === null) {
            for (const option of this.getOptions(state, [y, x])) {
              const testState = this.copyState(state);
              testState[y][x] = option;
              const result = this.solve(testState);
              if (result.solved === true) {
                return result.state;
              }
            }
          }
        }
      }
    }
    return solveAttempt;
  }

  copyState(state) {
    return state.map(arr => [...arr]);
  }

  printState(state) {
    return state.reduce((text, row, index) => {
      if (index === 3 || index === 6) {
        text = text.concat("\n");  // Add horizontal spacing
      }
      const rowString = row.reduce((rowText, val, rowIndex) => {
        val = val === null ? '_' : val;
        if (rowIndex === 3 || rowIndex === 6) {
          rowText = rowText.concat(' ');  // Add vertical spacing
        }
        return rowText.concat(' ' + val);
      }, '');
      return text.concat("|" + rowString + " |\n");
    }, '');
  }
}

const _ = null;
const initialState = [
  [2,4,3,9,_,8,_,_,_],
  [7,9,_,_,4,_,3,_,8],
  [_,_,5,7,6,_,2,9,_],
  [_,_,9,8,7,2,4,1,_],
  [_,_,7,_,_,_,6,_,_],
  [_,2,1,4,3,6,7,_,_],
  [_,5,4,_,2,7,8,_,_],
  [6,_,8,_,9,_,_,2,7],
  [_,_,_,6,_,5,9,4,3]
];

const challengingState = [
  [1,_,_,_,_,8,_,_,9],
  [_,_,2,_,_,_,_,_,8],
  [_,8,_,5,4,9,_,_,_],
  [_,4,_,2,_,_,9,_,_],
  [3,_,9,_,_,_,2,_,1],
  [_,_,1,_,_,5,_,4,_],
  [_,_,_,9,1,2,_,3,_],
  [7,_,_,_,_,_,1,_,_],
  [2,_,_,7,_,_,_,_,6]
];

const hardState = [
  [_,4,_,1,5,_,_,8,3],
  [_,3,_,_,6,_,5,_,_],
  [6,_,_,_,_,_,_,_,9],
  [_,5,_,_,_,_,_,_,_],
  [1,_,_,7,_,8,_,_,2],
  [_,_,_,_,_,_,_,6,_],
  [5,_,_,_,_,_,_,_,4],
  [_,_,4,_,8,_,_,7,_],
  [8,6,_,_,2,4,_,9,_]
];

const fiendishState = [
  [_,_,_,5,_,_,_,6,_],
  [8,_,9,_,_,_,_,1,_],
  [1,6,_,_,8,7,_,_,_],
  [3,_,_,_,2,6,_,_,_],
  [_,_,7,_,1,_,6,_,_],
  [_,_,_,8,5,_,_,_,3],
  [_,_,_,4,7,_,_,2,1],
  [_,4,_,_,_,_,9,_,8],
  [_,8,_,_,_,3,_,_,_]
];

const solver = new Solver();
console.log(solver.printState(fiendishState));
console.log(solver.solveBruteForce(fiendishState));

// const squareData = [1,2,3,4,5,6,7,8,9].map(square => {
//   return {[square]: solver.getSquareCoords(square)};
// });
// console.log(squareData);
// console.log(JSON.stringify(squareData));

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

const squareCoordMap = {
  "1": [
    [0, 0],
    [0, 1],
    [0, 2],
    [1, 0],
    [1, 1],
    [1, 2],
    [2, 0],
    [2, 1],
    [2, 2]
  ],
  "2": [
    [0, 3],
    [0, 4],
    [0, 5],
    [1, 3],
    [1, 4],
    [1, 5],
    [2, 3],
    [2, 4],
    [2, 5]
  ],
  "3": [
    [0, 6],
    [0, 7],
    [0, 8],
    [1, 6],
    [1, 7],
    [1, 8],
    [2, 6],
    [2, 7],
    [2, 8]
  ],
  "4": [
    [3, 0],
    [3, 1],
    [3, 2],
    [4, 0],
    [4, 1],
    [4, 2],
    [5, 0],
    [5, 1],
    [5, 2]
  ],
  "5": [
    [3, 3],
    [3, 4],
    [3, 5],
    [4, 3],
    [4, 4],
    [4, 5],
    [5, 3],
    [5, 4],
    [5, 5]
  ],
  "6": [
    [3, 6],
    [3, 7],
    [3, 8],
    [4, 6],
    [4, 7],
    [4, 8],
    [5, 6],
    [5, 7],
    [5, 8]
  ],
  "7": [
    [6, 0],
    [6, 1],
    [6, 2],
    [7, 0],
    [7, 1],
    [7, 2],
    [8, 0],
    [8, 1],
    [8, 2]
  ],
  "8": [
    [6, 3],
    [6, 4],
    [6, 5],
    [7, 3],
    [7, 4],
    [7, 5],
    [8, 3],
    [8, 4],
    [8, 5]
  ],
  "9": [
    [6, 6],
    [6, 7],
    [6, 8],
    [7, 6],
    [7, 7],
    [7, 8],
    [8, 6],
    [8, 7],
    [8, 8]
  ]
};

