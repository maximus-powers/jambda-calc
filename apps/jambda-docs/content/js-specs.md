# JavaScript Input File Specifications

This page outlines the JavaScript features that jambda-calc can currently transpile to lambda calculus, as well as features that are not yet implemented.

## Input File Requirements

For successful transpilation:

1. The input file must contain at least one function declaration
2. The first function declaration is treated as the entry point
3. All functions should be pure (no side effects)
4. Functions should only use supported JS features listed below

---

## ✅ Supported Features

jambda-calc currently supports transpilation of the following JavaScript features:

### Arithmetic Operations

- Basic arithmetic: addition (`+`), subtraction (`-`), multiplication (`*`), division (`/`)
- Church numerals for integers from -100 to 100

### Comparison Operators

- Equality operators: `==`, `===`
- Inequality operators: `<`, `<=`, `>`, `>=`

### Boolean Values and Operators

- Boolean literals: `true` and `false` (as Church booleans)
- Logical NOT operator (`!`)
- Logical AND (`&&`) and OR (`||`) operators

### Control Flow

- Conditional expressions (ternary operator: `condition ? expr1 : expr2`)
- Return statements
- If statements and if-else constructs
- Switch statements with case clauses

### Functions

- Function declarations (`function name() {}`)
- Function expressions (`const func = function() {}`)
- Arrow functions (`const func = () => {}`)
- Nested functions (closures)
- Function calls
- Recursive function calls

### Variables

- Variable declarations and assignments
- Variable usage in expressions
- Lexical scoping

### Basic Array Methods

- Simple `.map()` and `.filter()` operations (abstracted)

### Basic Object Properties

- Simple object property access (`obj.property`)

---

## ❌ Unsupported Features

The following JavaScript features are not currently supported by the transpiler:

### Data Types and Operations

- Strings and string operations
- Regular expressions
- Floating-point operations (non-integers are rounded)
- Numbers outside the range of -100 to 100
- Complex data structures (full arrays, objects)
- Maps, Sets, and other collection types
- Compound assignment operators (`+=`, `-=`, `*=`, `/=`, `=+`, `=-`)

### Language Features

- Loops (`for`, `while`, `do-while`, `for...of`, `for...in`)
- `break` and `continue` statements
- Classes and object-oriented programming
- Prototypes and prototype inheritance
- Exception handling (`try`/`catch`/`finally`)
- Generators and iterators
- Destructuring assignments
- Spread and rest operators
- Default parameters
- Template literals

### Asynchronous Programming

- Promises
- Async/await
- Callbacks
- Event handling

### Module System

- Import/export statements
- Module.exports
- Require statements
- External dependencies

### Standard Library

- Most built-in JavaScript functions (`Math` methods, `Array` methods, etc.)
- DOM manipulation
- Browser APIs
- Node.js APIs

---

### Future Development

This is a new project and is still underdevleopment. We're working towards our goal of parsing any valid JS/TS, but if you have feature you'd like us to see implemented ASAP, or find an issue in the current implementation, please open an issue in our monorepo: [GitHub repository](https://github.com/maximuspowers/jambda-calc).
