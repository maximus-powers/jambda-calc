# λ Welcome to jambda-calc

## A JavaScript package for transpiling JS/TS into the λ Calculus, and visualizing expressions with [Tromp Diagrams](https://tromp.github.io/cl/diagrams.html).

---

### The λ Calculus

As a Turing-complete language, any software can be written as a lambda expression. There is no distinction between numbers, operators, or data structures, only encodings that represent all constructs as functions.

### What is jambda-calc?

`jambda-calc` is a package for converting JS into λ expressions, and visualizing the code with Tromp diagrams.

Theory is one thing, but enabling full transpilation is another. We're bridging the gap for the JS/TS ecosystem.

\`\`\`node
pnpm install jambda-calc
\`\`\`

---

## How it Works

IMAGE WILL GO HERE

### 1. Transpilation

Transpiling JavaScript to λ calculus is inherently challenging, because Alonzo Church (who developed the λ calculus) designed it under the functional programming paradigm, which he also spawned. JS on the other hand, is a high level language that combines functional programming with imperitive programming (spawned by his PhD student, Alan Turing).

**Abstract Syntax Tree:** It begins with converting the JS/TS into an abstract syntax tree (AST), using [esprima](https://github.com/jquery/esprima). This converts the JS constructs into a tree of nodes, compatible with [estree](https://hexdocs.pm/estree/ESTree.html) (a common format for JS ASTs). If the input file is .ts, it will be transpiled to TS before parsing into an AST.

**AST Parsing:** Next we walk through the syntax tree's first function declaration node. Multiple floating functions isn't implement yet, though functions used in the input file's first function will be parsed (provided they are also defined in the main file).

Each step we take brings us to a new node within that function, and we convert it to λ notation based on the estree node type and preset λ templates/Church encodings. For example, if we encounter a number literal we will convert it to it's Church numeral.

As we traverse the tree, we add λ params and bodies to a cumulative λ expression. This is ultimately what get's returned when running the transpile() function.

### 2. Visualization

**Parsing the Expression**:
The parser tokenizes the lambda expression, identifying lambdas (λ), variables, dots, and parentheses. It builds an internal abstract syntax tree with nodes for abstractions (λx.body), applications (func arg), and variables, following standard lambda calculus grammar rules, handling nested expressions and precedence.

**Generating the Diagram**:

De Bruijn indices are assigned to connect variables with their binding lambdas.

The diagram is drawn recursively:

- Variables: Drawn as vertical lines whose height corresponds to their De Bruijn index.
- Lambda abstractions: Drawn as horizontal bars with their body underneath.
- Applications: Drawn with connected components for function and argument parts, connecting the bottom left corners of the terms being applied.

**Rendering as SVG or ASCII**:

For every visualization, the internal representation is converted to SVG line elements with proper coordinates. To save a PNG, the SVG is rendered to a bitmap image using the [Sharp](https://sharp.pixelplumbing.com/) library.

- ASCII: For terminal display, the SVG is converted to ASCII characters where vertical lines become `│`, horizontal lines become `─`, intersections become `┼`.

This visualization approach was developed by [John Tromp](https://tromp.github.io/cl/diagrams.html), and offers an intuitive way to understand lambda expressions structurally rather than symbolically.
