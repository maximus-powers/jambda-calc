import * as esprima from 'esprima';
import * as ts from 'typescript';
import * as estree from 'estree';

type FunctionEntry = {
  type: 'function';
  declaration: estree.FunctionDeclaration;
};
type VariableEntry = {
  type: 'variable';
  value: string;
};
type GlobalScopeEntry = FunctionEntry | VariableEntry;

const CHURCH_NUMERALS: Record<number, string> = {};

// we should implement numbers over 100 with operations using church numbers
function generateChurchNumerals(max = 100): void {
  for (let i = 0; i <= max; i++) {
    let inner = 'x';
    for (let j = 0; j < i; j++) {
      inner = `f(${inner})`;
    }
    CHURCH_NUMERALS[i] = `(λf.λx.${inner})`;
  }
}

generateChurchNumerals();

/**
 * Main transpilation function that converts JS/TS to lambda calculus
 */
export function transpile(code: string): string {
  try {
    const isTypeScript = code.includes(':') || code.includes('interface') || code.includes('type ');
    const jsCode = isTypeScript
      ? ts.transpileModule(code, {
          // compile ts if needed
          compilerOptions: {
            module: ts.ModuleKind.CommonJS,
            target: ts.ScriptTarget.ES2015,
            removeComments: true,
          },
        }).outputText
      : code;

    // compile into js abstract syntax tree
    const ast = esprima.parseScript(jsCode);

    // find all function declarations
    const functionDeclarations = new Map<string, estree.FunctionDeclaration>();
    for (const node of ast.body) {
      if (node.type === 'FunctionDeclaration' && node.id) {
        functionDeclarations.set(node.id.name, node as estree.FunctionDeclaration);
      }
    }
    if (functionDeclarations.size === 0) {
      throw new Error('No function declarations found in input file');
    }

    // processing first function as the entry point
    const mainFuncName = [...functionDeclarations.keys()][0];
    const mainFunc = functionDeclarations.get(mainFuncName)!;

    // global scope for all funcs
    const globalScope = new Map<string, GlobalScopeEntry>();
    for (const [name, func] of functionDeclarations.entries()) {
      globalScope.set(name, {
        type: 'function',
        declaration: func,
      });
    }

    // process the main function with access to the other funcs (for if they're used in the main func)
    return processMainFunction(mainFunc, functionDeclarations, globalScope);
  } catch (error) {
    console.error(
      'Failed to transpile to lambda calculus:',
      error instanceof Error ? error.message : String(error)
    );
    throw error;
  }
}

/**
 * Process the main function and all its dependencies
 */
function processMainFunction(
  mainFunc: estree.FunctionDeclaration,
  allFunctions: Map<string, estree.FunctionDeclaration>,
  globalScope: Map<string, GlobalScopeEntry>
): string {
  // start with local scope
  const localScope = new Map<string, string>();

  // get vars
  const params = mainFunc.params.map((param) => {
    if (param.type === 'Identifier') {
      return (param as estree.Identifier).name;
    }
    throw new Error(`Unsupported parameter type: ${param.type}`);
  });

  // add vars to local scope
  params.forEach((param) => localScope.set(param, param));

  // process body
  const bodyExpr = processBlock(mainFunc.body, localScope, globalScope, allFunctions);

  // wrap in lambda abstraction for the main func
  const lambdaParams = params.map((param) => `λ${param}`).join('.');
  return `${lambdaParams}.${bodyExpr}`;
}

/**
 * Process a block of statements, handling variable declarations and the return statement
 */
function processBlock(
  block: estree.BlockStatement,
  localScope: Map<string, string>,
  globalScope: Map<string, GlobalScopeEntry>,
  allFunctions: Map<string, estree.FunctionDeclaration>
): string {
  // clone to avoid modifying og
  const blockScope = new Map(localScope);

  let returnExpr: string | null = null;
  // process each block
  for (const stmt of block.body) {
    if (stmt.type === 'VariableDeclaration') {
      for (const declarator of stmt.declarations) {
        if (declarator.id.type === 'Identifier' && declarator.init) {
          const varName = declarator.id.name;

          const varValue = processExpression(
            declarator.init as estree.Expression,
            blockScope,
            globalScope,
            allFunctions
          );
          blockScope.set(varName, varValue);
        }
      }
    } else if (stmt.type === 'ReturnStatement' && stmt.argument) {
      returnExpr = processExpression(stmt.argument, blockScope, globalScope, allFunctions);
      break;
    } else if (stmt.type === 'SwitchStatement') {
      const switchStmt = stmt;

      // process the value being switched on
      const discriminant = processExpression(
        switchStmt.discriminant,
        blockScope,
        globalScope,
        allFunctions
      );

      // find case clauses
      const cases = switchStmt.cases;

      if (cases.length > 0) {
        let resultExpr = null;
        let defaultCase = null;
        for (const caseClause of cases) {
          if (caseClause.test === null) {
            defaultCase = caseClause;
            break;
          }
        }

        // process in reverse to create nesting
        for (let i = cases.length - 1; i >= 0; i--) {
          const caseClause = cases[i];
          if (caseClause.test === null) {
            continue; // skip default (handle at end)
          }

          const caseTest = caseClause.test
            ? processExpression(caseClause.test, blockScope, globalScope, allFunctions)
            : CHURCH_NUMERALS[0];

          // look for a return in the body
          let caseResult = null;
          for (const stmt of caseClause.consequent) {
            if (stmt.type === 'ReturnStatement' && stmt.argument) {
              caseResult = processExpression(stmt.argument, blockScope, globalScope, allFunctions);
              break;
            }
          }

          if (caseResult === null) {
            continue;
          }

          // church conditional encoding
          const equalityTest = `((λm.λn.((m n) (λx.λy.y)) (λx.λy.x)) ${discriminant} ${caseTest})`;

          if (resultExpr === null) {
            resultExpr = defaultCase ? null : CHURCH_NUMERALS[0];
          }

          resultExpr =
            resultExpr === null
              ? caseResult
              : `((λp.λa.λb.p a b) ${equalityTest} ${caseResult} ${resultExpr})`;
        }

        // handle default case
        if (defaultCase) {
          let defaultResult = null;

          for (const stmt of defaultCase.consequent) {
            if (stmt.type === 'ReturnStatement' && stmt.argument) {
              defaultResult = processExpression(
                stmt.argument,
                blockScope,
                globalScope,
                allFunctions
              );
              break;
            }
          }

          if (defaultResult !== null) {
            resultExpr =
              resultExpr === null
                ? defaultResult
                : `((λp.λa.λb.p a b) (λx.λy.y) ${resultExpr} ${defaultResult})`;
          }
        }

        if (resultExpr !== null) {
          returnExpr = resultExpr;
          break;
        }
      }
    }
  }

  if (returnExpr === null) {
    throw new Error('No return statement found in function body');
  }

  return returnExpr;
}

/**
 * Process an expression to lambda calculus
 */
function processExpression(
  expr: estree.Expression | estree.SpreadElement,
  localScope: Map<string, string>,
  globalScope: Map<string, GlobalScopeEntry>,
  allFunctions: Map<string, estree.FunctionDeclaration>
): string {
  switch (expr.type) {
    case 'Literal': {
      const literal = expr as estree.Literal;
      const value = literal.value;

      // number literals become church numerals
      if (typeof value === 'number') {
        if (value >= 0 && value <= 100) {
          const approxInt = Math.round(value); // non ints are currently rounded
          return CHURCH_NUMERALS[approxInt];
        }
        // TODO: to handle numbers larger than 100 we'd need to process them into a expression involving two smaller numbers
        // we could have some cool logic for finding the fewest possible operations
      }

      // bools: true = λx.λy.x, false = λx.λy.y
      if (typeof value === 'boolean') {
        return value ? '(λx.λy.x)' : '(λx.λy.y)';
      }

      // string literals
      if (typeof value === 'string') {
        // TODO: handle these as variables. we're currently only processing aritmetic operations so it's not implemented
      }

      return CHURCH_NUMERALS[0]; // defaulting to 0 church numeral
    }

    case 'Identifier': {
      const id = expr as estree.Identifier;
      const name = id.name;

      // check if identifier is an input var or local var
      if (localScope.has(name)) {
        return localScope.get(name)!;
      }

      // check if it's a function in the global scope
      if (globalScope.has(name)) {
        const entry = globalScope.get(name)!;

        // process the function
        if (entry.type === 'function') {
          const funcEntry = entry as FunctionEntry;
          const func = funcEntry.declaration;

          const params = func.params.map((param: estree.Pattern) => {
            if (param.type === 'Identifier') {
              return (param as estree.Identifier).name;
            }
            throw new Error(`Unsupported parameter type: ${param.type}`);
          });

          // create new scope for func
          const funcScope = new Map<string, string>();
          params.forEach((param: string) => funcScope.set(param, param));

          // process the body
          const bodyExpr = processBlock(func.body, funcScope, globalScope, allFunctions);

          const lambdaStr = `(${params.map((p: string) => `λ${p}`).join('.')}.${bodyExpr})`;

          // add to global scope as a variable
          globalScope.set(name, { type: 'variable', value: lambdaStr });

          return lambdaStr;
        } else if (entry.type === 'variable') {
          const varEntry = entry as VariableEntry;
          return varEntry.value;
        }
      }

      // if it's not found anywhere, treat as a free variable. although this isn't allowed in pure lambda calc
      return name;
    }

    case 'BinaryExpression': {
      const binExpr = expr as estree.BinaryExpression;

      // process the left and right expressions
      const left = processExpression(
        binExpr.left as estree.Expression,
        localScope,
        globalScope,
        allFunctions
      );
      const right = processExpression(
        binExpr.right as estree.Expression,
        localScope,
        globalScope,
        allFunctions
      );

      // construct lambda expression using church operator lambda
      switch (binExpr.operator) {
        case '+':
          return `((λm.λn.λf.λx.m f (n f x)) ${left} ${right})`;
        case '-':
          return `((λm.λn.λf.λx.n (λg.λh.h (g f)) (λu.x) (λu.u) m) ${left} ${right})`;
        case '*':
          return `((λm.λn.λf.λx.m (n f) x) ${left} ${right})`;
        case '/':
          return `((λm.λn.n (λf.λx.m (λg.f (g x)) (λx.x)) (λf.λx.x)) ${left} ${right})`;
        case '==':
        case '===':
          return `((λm.λn.((m n) (λx.λy.y)) (λx.λy.x)) ${left} ${right})`;
        case '<':
          return `((λm.λn.(n (λx.λy.y)) ((m (λx.λy.x)) (λx.λy.y))) ${left} ${right})`;
        case '<=':
          return `((λm.λn.(λp.λa.λb.p b a) ((λm.λn.(n (λx.λy.y)) ((m (λx.λy.x)) (λx.λy.y))) n m)) ${left} ${right})`;
        case '>':
          return `((λm.λn.(n (λx.λy.y)) ((m (λx.λy.x)) (λx.λy.y))) ${right} ${left})`;
        case '>=':
          return `((λm.λn.(λp.λa.λb.p b a) ((λm.λn.(n (λx.λy.y)) ((m (λx.λy.x)) (λx.λy.y))) m n)) ${left} ${right})`;

        default:
          throw new Error(`Unsupported binary operator: ${binExpr.operator}`);
      }
    }

    case 'UnaryExpression': {
      const unaryExpr = expr as estree.UnaryExpression;
      const argument = processExpression(unaryExpr.argument, localScope, globalScope, allFunctions);
      switch (unaryExpr.operator) {
        case '!':
          return `((λp.λa.λb.p b a) ${argument})`; // church not
        case '-':
          return `((λm.λn.λf.λx.n (λg.λh.h (g f)) (λu.x) (λu.u) m) ${CHURCH_NUMERALS[0]} ${argument})`; // church negative
        default:
          throw new Error(`Unsupported unary operator: ${unaryExpr.operator}`);
      }
    }

    case 'CallExpression': {
      const callExpr = expr as estree.CallExpression;

      // func calls to global funcs
      if (callExpr.callee.type === 'Identifier') {
        const funcName = callExpr.callee.name;

        // inline it if it's defined in globals
        if (globalScope.has(funcName)) {
          const entry = globalScope.get(funcName)!;

          if (entry.type === 'function') {
            const funcEntry = entry as FunctionEntry;
            const funcDecl = funcEntry.declaration;

            const args = callExpr.arguments.map((arg) =>
              processExpression(arg as estree.Expression, localScope, globalScope, allFunctions)
            );

            // new scope for func
            const funcScope = new Map<string, string>();

            funcDecl.params.forEach((param: estree.Pattern, i: number) => {
              if (param.type === 'Identifier') {
                const paramName = (param as estree.Identifier).name;
                funcScope.set(paramName, args[i] || CHURCH_NUMERALS[0]); // 0 for missing vars
              } else {
                throw new Error(`Unsupported parameter type: ${param.type}`);
              }
            });

            // process body with the vars applied
            return processBlock(funcDecl.body, funcScope, globalScope, allFunctions);
          }
        }
      }

      // process cases where it's calling something not defined globally
      // TODO: handle this better, we should have some kind of abstraction logic if it's unknown
      const callee = processExpression(
        callExpr.callee as estree.Expression,
        localScope,
        globalScope,
        allFunctions
      );
      const args = callExpr.arguments.map((arg) =>
        processExpression(arg as estree.Expression, localScope, globalScope, allFunctions)
      );

      // wrap application in parens
      let result = `(${callee}`;
      for (const arg of args) {
        result += ` ${arg}`;
      }
      result += ')';

      return result;
    }

    case 'ConditionalExpression': {
      const condExpr = expr as estree.ConditionalExpression;
      const test = processExpression(condExpr.test, localScope, globalScope, allFunctions);
      const consequent = processExpression(
        condExpr.consequent,
        localScope,
        globalScope,
        allFunctions
      );
      const alternate = processExpression(
        condExpr.alternate,
        localScope,
        globalScope,
        allFunctions
      );

      return `((λp.λa.λb.p a b) ${test} ${consequent} ${alternate})`; // church if-then-else
    }

    case 'ArrowFunctionExpression':
    case 'FunctionExpression': {
      const funcExpr = expr as estree.ArrowFunctionExpression | estree.FunctionExpression;

      // extract param names
      const params = funcExpr.params.map((param) => {
        if (param.type === 'Identifier') {
          return (param as estree.Identifier).name;
        }
        throw new Error(`Unsupported parameter type: ${param.type}`);
      });

      // create a new scope for the func
      const funcScope = new Map(localScope);

      // add vars to scope
      params.forEach((param) => funcScope.set(param, param));

      // process body
      let bodyExpr: string;
      if (
        funcExpr.type === 'ArrowFunctionExpression' &&
        funcExpr.expression &&
        funcExpr.body.type !== 'BlockStatement'
      ) {
        // arrow function with expression body: x => x + 1
        bodyExpr = processExpression(
          funcExpr.body as estree.Expression,
          funcScope,
          globalScope,
          allFunctions
        );
      } else {
        // func with block body
        const body = funcExpr.body as estree.BlockStatement;
        bodyExpr = processBlock(body, funcScope, globalScope, allFunctions);
      }

      // construct the lambda abstraction
      const paramStr = params.map((param) => `λ${param}`).join('.');
      return `(${paramStr}.${bodyExpr})`;
    }

    case 'MemberExpression': {
      const memberExpr = expr as estree.MemberExpression;
      const object = processExpression(
        memberExpr.object as estree.Expression,
        localScope,
        globalScope,
        allFunctions
      );

      // common array methods
      if (memberExpr.property.type === 'Identifier') {
        const propName = memberExpr.property.name;
        // using higher order functions for calls we don't have lambda expressions for... might need improvements
        switch (propName) {
          case 'map':
            return `((λarr.λf.arr f) ${object})`;
          case 'filter':
            return `((λarr.λpred.arr (λx.pred x)) ${object})`;
          default:
            return `((λobj.λprop.obj prop) ${object} (λx.x))`;
        }
      }

      // process the property if it's a computed property
      if (memberExpr.computed && memberExpr.property.type) {
        const prop = processExpression(
          memberExpr.property as estree.Expression,
          localScope,
          globalScope,
          allFunctions
        );
        return `((λobj.λprop.obj prop) ${object} ${prop})`;
      }

      throw new Error('Unsupported member expression property type');
    }

    default:
      throw new Error(`Unsupported expression type: ${expr.type}`);
  }
}
