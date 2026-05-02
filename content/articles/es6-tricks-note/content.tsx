import {
  Prose,
  CodeBlock,
} from '@wjwang/ui/article';

export default function Content() {
  return (
    <Prose>
      <h2>ES6 Tricks</h2>

      <CodeBlock language="js">{`// Swap:
[a, b] = [b, a];

// Async/Await with Destructuring:
const [user, account] = await Promise.all([
  fetch('/user'),
  fetch('/account')
])

// Clone:
const obj = { ...oldObj }
const arr = [ ...oldArr ]

// Named parameters:
getStuffAwesome({ id: 150, force: true, verbose: true })`}</CodeBlock>

      <h2>Related Reading</h2>

      <p>
        <a href="https://hackernoon.com/javascript-hacks-for-es6-hipsters-67d633ce8ace">JavaScript hacks for ES6 hipsters</a> — HackerNoon article exploring additional ES6 coding techniques and patterns.
      </p>

      <p>原文發表於 <a href="https://wjwang.medium.com/es6-tricks-note-cfeef0cdc4f7">Medium</a></p>
    </Prose>
  );
}
