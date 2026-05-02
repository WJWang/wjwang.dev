import {
  Prose,
  CodeBlock,
} from '@wjwang/ui/article';

export default function Content() {
  return (
    <Prose>
      <h2>curry, compose</h2>

      <p>Some basic usage of ramdajs.</p>

      <h3>curry : (* → a) → (* → a)</h3>

      <CodeBlock language="js">{`const { curry } = require('ramda');

// Example for map
const map = curry((f, xs) => xs.map(f));
const square = x => x * x;
const squareList = map(square);

map(square, [1, 3, 5, 7]); // [1, 9, 25, 49]
squareList([1, 3, 5, 7]); // [1, 9, 25, 49]

// Example for reduce
const reduce = curry((f, init, xs) => xs.reduce(f, init));
const keepHighest = (x, y) => x >= y ? x : y;
const keepLowest = (x, y) => x >= y ? y : x;

const max = reduce(keepHighest, -Infinity);
const min = reduce(keepLowest, Infinity);

max([1, 3, 5, 6]); // 6
min([1, 3, 5, 6]); // 1

// Example for filter
const filter = curry((f, xs) => xs.filter(f));
const isEven = num => !(num % 2);
const evenListFilter = filter(isEven);

filter(isEven, [1, 3, 4, 5, 7, 2, 10]) // [4, 2, 10]
evenListFilter([1, 3, 4, 5, 7, 2, 10]) // [4, 2, 10]`}</CodeBlock>

      <h3>compose</h3>

      <CodeBlock language="js">{`const { compose } = require('ramda');

/* compose = (...fns) => (...args) => fns.reduceRight(
  (res, fn) => [fn.call(null, ...res)], args
)[0];
*/

const evenSquare = compose(squareList, evenList);
evenSquare([1, 3, 5, 4, 9, 10, 22]); // [16, 100, 484]`}</CodeBlock>

      <h3>compose : associativity =&gt; f・g(h(x)) = f(g(x)) ・h</h3>

      <CodeBlock language="js">{`compose(f, compose(g, h)) === compose(compose(f, g), h);`}</CodeBlock>

      <CodeBlock language="js">{`const isEven = x => !(x % 2);
const square = x => x * x;
const double = x => 2 * x;

const squareList = map(square);
const evenList = filter(isEven);
const doubleList = map(double);

const composeA = compose(doubleList, compose(squareList, evenList));
const composeB = compose(compose(doubleList, squareList), evenList);

composeA([2, 3, 4]); // [2, 3, 4, 5] => [2, 4] => [4, 16] => [8, 32]
composeB([2, 3, 4]); // [2, 3, 4, 5] => [2, 4] => [4, 16] => [8, 32]`}</CodeBlock>

      <p>原文發表於 <a href="https://wjwang.medium.com/ramda-basics-3d497d63f682">Medium</a></p>
    </Prose>
  );
}
