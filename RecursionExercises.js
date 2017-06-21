class RecursionExercises {
  getRange(x, y) {
    if (!Array.isArray(x)) {
      x = [x];
    }
    if ([...x].pop() === y) {
      return x;
    }
    return this.getRange(x.concat([...x].pop() + 1), y);
  }

  sumArray(array) {
    if (array.length === 1) {
      return array[0];
    }
    return array[0] + this.sumArray(array.slice(1));
  }

  select(array, func) {
    if (!array.length) {
      return array;
    }
    if (func(array[0])) {
      return array.slice(0,1).concat(
          this.select(array.slice(1), func)
      );
    }
    return this.select(array.slice(1), func);
  }

  dropWhile(array, func) {
    if (func(array[0])) {
      return this.dropWhile(array.slice(1), func);
    }
    return array;
  }

  reverseString(string) {
    if (!string.length) {
      return '';
    }
    return string[string.length -1].concat(this.reverseString(string.slice(0, -1)));
  }

  exponentiate(num, exp) {
    if (exp === 1) {
      return num;
    }
    return num * this.exponentiate(num, exp -1);
  }
}

const tester = new RecursionExercises();
isEven = (num) => num % 2 === 0;
lessThanSeven = (num) => num < 7;
// console.log(tester.getRange(1,5));
// console.log(tester.sumArray([1,2,3,4,5,6]));
// console.log(tester.select([1,2,3,4,5,6], isEven));
// console.log(tester.dropWhile([1,3,5,7,9,11], lessThanSeven));
// console.log(tester.reverseString('Hello World'));
// console.log(tester.exponentiate(4, 4));