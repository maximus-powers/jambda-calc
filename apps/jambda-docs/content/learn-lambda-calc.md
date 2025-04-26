# Introduction to λ Calculus

Lambda calculus is a formal system in mathematical logic for expressing computation based on function abstraction and application. It was introduced by Alonzo Church in the 1930s as part of his research on the foundations of mathematics.

## Core Concepts

Lambda calculus consists of three basic components:

1. **Variables**: Symbols that represent values (e.g., x, y, z)
2. **Abstraction**: Function definition (e.g., λx.M where x is a variable and M is a lambda term)
3. **Application**: Function application (e.g., M N where M and N are lambda terms)

### Syntax

The syntax of lambda calculus is remarkably simple:

\`\`\`
<expression> ::= <variable>
               | λ<variable>.<expression>
               | (<expression> <expression>)
\`\`\`

### Examples

Here are some examples of lambda expressions:

- Identity function: `λx.x`
- Constant function: `λx.λy.x`
- Self-application: `λx.x x`
- Boolean TRUE: `λx.λy.x`
- Boolean FALSE: `λx.λy.y`

## Beta Reduction

Beta reduction is the process of applying a function to an argument. It's written as:

(λx.M) N → M[x := N]

This means "substitute N for x in M".

### Example of Beta Reduction

Let's apply the identity function to a value:

(λx.x) y → y

Here's a more complex example:

(λx.λy.x y) z w → (λy.z y) w → z w

## Church Numerals

Church numerals are a way of representing natural numbers in lambda calculus:

- 0 = λf.λx.x
- 1 = λf.λx.f x
- 2 = λf.λx.f (f x)
- 3 = λf.λx.f (f (f x))

And so on. Each number n is represented as a function that applies its first argument n times to its second argument.

## Church Encoding

Beyond numbers, lambda calculus can encode various data structures and operations:

### Boolean Logic

- TRUE = λx.λy.x
- FALSE = λx.λy.y
- AND = λp.λq.p q p
- OR = λp.λq.p p q
- NOT = λp.p FALSE TRUE

### Pairs

- PAIR = λx.λy.λf.f x y
- FIRST = λp.p TRUE
- SECOND = λp.p FALSE

## Turing Completeness

Lambda calculus is Turing complete, meaning it can express any computation that a Turing machine can. This makes it a foundational model of computation, despite its minimalist nature.

## Connection to Programming Languages

Many programming language features have their roots in lambda calculus:

- Anonymous functions (lambdas) in JavaScript, Python, etc.
- Higher-order functions
- Closures
- Currying

## Why Lambda Calculus Matters for Jambda-Calc

Jambda-Calc uses lambda calculus as its target language because:

1. It's a universal model of computation
2. It has a simple, elegant structure
3. It makes the essence of computation visible
4. It allows for powerful visualizations through Tromp diagrams

By transpiling JavaScript/TypeScript to lambda calculus, Jambda-Calc helps you understand the fundamental nature of your code and visualize its structure in a new way.

## Further Reading

- [Introduction to Lambda Calculus](https://www.cse.chalmers.se/research/group/logic/TypesSS05/Extra/geuvers.pdf) by Henk Barendregt and Erik Barendsen
- [An Introduction to Functional Programming Through Lambda Calculus](https://www.amazon.com/Introduction-Functional-Programming-Calculus-Mathematics/dp/0486478831) by Greg Michaelson
- [The Lambda Calculus: Its Syntax and Semantics](https://www.amazon.com/Lambda-Calculus-Its-Syntax-Semantics/dp/1848900660) by Henk Barendregt
