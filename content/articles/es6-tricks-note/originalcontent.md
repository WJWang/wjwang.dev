# ES6 Tricks Note

## ES6 Tricks

```javascript
// Swap:
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
getStuffAwesome({ id: 150, force: true, verbose: true })
```

## Related Reading

[JavaScript hacks for ES6 hipsters](https://hackernoon.com/javascript-hacks-for-es6-hipsters-67d633ce8ace) — HackerNoon article exploring additional ES6 coding techniques and patterns.
