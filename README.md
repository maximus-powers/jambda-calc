# jambda-calc Monorepo!

[![NPM Version](https://img.shields.io/npm/v/jambda-calc.svg)](https://www.npmjs.com/package/jambda-calc)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.9.5-blue.svg)](https://www.typescriptlang.org/)
[![Monorepo](https://img.shields.io/badge/Monorepo-Turborepo-blueviolet.svg)](https://turbo.build/docs)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/maximus-powers/jambda-calc/pulls)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](https://github.com/maximus-powers/jambda-calc)

## JavaScript -> λ Calculus (Transpiler + Visualizer)

_This is the entire codebase for the jambda-calc project, including the [package files](./packages/jambda-calc/) and a [docs/playground web app](./apps/web/). This monorepo is homebase for all development, for a guide on using the package itself, please visit [npmjs.com](https://www.npmjs.com/package/jambda-calc)._

**Vision:** As a Turing-complete language, any programatic code can be transpiled to lambda calculus. Our goal is to develop the **first package capable of parsing entire JS/TS into formal λ.** Ultimately, it'll be capable of ingesting entire JS/TS codebases and spitting out massive _sexy_ Tromp diagrams.

**Project Links:** 📖 Web app (docs and playground) | [⬇️ npm page](https://www.npmjs.com/package/jambda-calc)

---

## To Do

- Y Combinator Recursion
- Implement color coding to diagrams (each λ. term should have it's own color).
- Beta reduction animations

---

## Contributing

This project is and forever will be open-source. We'd love help developing new features, please just stick to our coding conventions to keep our code clean :).

#### Tech Stack

- Written in [TypeScript](https://www.typescriptlang.org/) for safer code, and simple installation and usage in JS/TS projects.
- **jambda-calc Package:** [Node.js](https://nodejs.org/en) runtime, clean and lightweight.
- **Docs App:** [NextJS] React meta-framework, [shadcn/ui](https://ui.shadcn.com/) components, [tailwindcss](https://tailwindcss.com/) styling.
- [Turborepo](https://turbo.build/docs) for monorepo management (allows for a single codebase managing the jambda-calc package, web app, and future components).
- [ESLint](https://eslint.org/) and [Prettier](https://prettier.io/): Linting and code formatting.

#### Getting Started

To start contributing, clone this repo with `git clone https://github.com/maximus-powers/jambda-calc.git`. If this is your first time using turbo repo, you should know that commands are run relative to your current working directory. For example, if you run pnpm lint in the monorepo root, it will lint all apps and packages, but running from within /packages/jambda-calc/ will only lint that package.

**Monorepo root cmds:**

- `pnpm install`: Run after cloning this repo, from the project root (install dependencies).
- `pnpm lint`: Run periodically when modifying files, and always before submitting a pull request to check if any of your changes create any errors.

**/jambda-calc dir cmds:**

- `pnpm format`: Format files with prettier, runs automatically on save in VSCode.
- `pnpm build` + `pnpm link`: When you're ready to test your changes, you can build a distribution of the package and link it to access it from the CLI. Run `pnpm unlink` to remove the link.
- `pnpm clean`: Removes /node_modules and /dist folder.

#### Project Structure

- `packages/`: This is where we can create internal packages for our codebase.
  - `jambda-calc` package, which is configured to be published to the npm registry.
  - `@jambda-mono/ui`, which is where we store shadcn components used in our app.
  - Packages should all have a package.json which is named "@jambda-mono/{package-name}". jambda-calc is the exception to this naming convention because it gets published.
- `apps/`: This directory is where we put our NextJS apps (currently just docs). You can import packages from the packages dir by adding it to the app's package.json like this "@jambda-mono/ui": "workspace:\*".
  - `docs`: This is our web app for docs on how to use our package, and where we run a demo.

---

## Resources for Learning the λ Calculus

- [2swap Video](https://www.youtube.com/watch?v=RcVA8Nj6HEo): A great video that covers λ calculus basics, and John Tromp diagrams. Jambda-calc was inspired by this video.
- [Tromp Diagrams](https://tromp.github.io/cl/diagrams.html): John Tromp developed diagrams for visualizing lamdba expressions, here are his official docs.
