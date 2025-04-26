# Quick Start Guide

## Installation

Install jambda-calc using npm, pnpm, yarn, or bun:

\`\`\`node
pnpm install jambda-calc
\`\`\`

---

## Command Line Usage

### Running Examples

The easiest way to see jambda-calc in action is to run the built-in examples:

\`\`\`node
npx jambda-calc examples
\`\`\`

This will run three example functions through transpilation and visualization, showing you the output in the console.

### Transpiling a JavaScript File

To transpile a JavaScript file to lambda calculus:

\`\`\`node
npx jambda-calc -i path/to/your-file.js -t
\`\`\`

This will output the lambda calculus expression to the console.

### Visualizing a Lambda Expression

If you already have a lambda expression in a text file, you can visualize it:

\`\`\`node
npx jambda-calc -i path/to/expression.txt -v
\`\`\`

### Transpiling and Visualizing

To both transpile and visualize in one command:

\`\`\`node
npx jambda-calc -i path/to/your-file.js
\`\`\`

### Saving Output

To save the output to files instead of displaying in the console:

\`\`\`node
jambda-calc -i path/to/your-file.js -o output-directory
\`\`\`

This will save the lambda expression as a .txt file and the Tromp diagram as a .png file in the specified directory.

---

## Inline Usage

Import the functions from the jambda-calc package.

\`\`\`
import jambda from 'jambda-calc';
\`\`\`

### Transpile:

\`\`\`
const lambdaExpr = jambda.transpile( "function exampleFn(a) { return a + 1; };" );
\`\`\`

**Params**

- `code` (string): This is the input JS, converted to a string.

### Visualize:

\`\`\`
const trompDiagram = jambda.visualize(lambdaExpr); // returns svg string by default
\`\`\`

**Params**

- `lambdaExpression` (string): This should be formal [lambda calculus notation](https://opendsa.cs.vt.edu/ODSA/Books/PL/html/Syntax.html).
- `options?` (VisualizerOptions):

  - `backgroundColor?` (string): Standard or shorthand hex format (e.g. #FFFFFF, #FFF). Also supports hex with alpha for transparency (e.g. FF000080)/
  - `padding?` (number): Spacing to have around the diagram, defaults to 60.
  - `unitSize?` (number): Unit size used for plotting calculations, defaults to 30.
  - `lineWidth?` (number): Size of the line stroke, defaults to 3.

- `outputPath?` (string):
- `format?` (string):

---

## Troubleshooting

If you encounter any issues, please check your that your input file fits the latest [input file specifications](/js-specs).

For more help, check the [GitHub repository](https://github.com/maximuspowers/jambda-calc) or open an issue.
