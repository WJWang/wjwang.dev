# Regex Memo

## Simple Concept

"I have a book"
- `/a/` => I h**a**ve **a** book
- `/have/` => I **have** a book

Characters that need `\` as prefix: `$.|?*+()`

Example: "Mr.Wang" => `/Mr\./` => **Mr.**Wang

- `.` means any character
- `[]` represents multiple possible characters in one position
  - `[a-zA-Z]` means a through z, A through Z
  - `[^a]` means not 'a'
- `\d` — digit `[0-9]`
- `\w` — word `[A-Za-z0-9_]`
- `\s` — space `[ \n\r\t]`
- `\b` — word boundary
  - Example: "This is a book" => `/\bis\b/` => "This **is** a book"
- `\D` — non-digit `[^\d]`
- `\W` — non-word `[^\w]`
- `\S` — non-space `[^\s]`

**Quantifiers:**
- `*` - zero or more
- `+` - at least one
- `?` - zero or one
- `{times}`, `{min,max}`
  - Example: "Hello world", `/l{2}/` => "He**ll**o world"
  - Example: `/l{0,2}/` => "He**ll**o wor**l**d"

**Anchors and Operators:**
- `/^/` means start with
- `/$/` means end with
- `|` means OR

## Code Example

```javascript
var re = /(\w+)\s(\w+)/;
var str = "John Smith";
var newstr = str.replace(re, "$2, $1");
console.log(newstr) // Smith, John
```

## Reference

- https://developer.mozilla.org/zh-TW/docs/Web/JavaScript/Reference/Global_Objects/String/replace
