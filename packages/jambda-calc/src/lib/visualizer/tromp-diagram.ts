// inspired Haskell project, which has more functionality: https://github.com/polux/lambda-diagrams/blob/master/src/Main.hs
import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';
import { Parser } from './parser.js';

export enum TermType {
  VAR = 'var',
  LAM = 'lam',
  APP = 'app',
}

// used for applications
interface TermData {
  func?: Term; // function being applied
  arg?: Term; // arg being input
}

export class Term {
  type: TermType;
  index?: number; // idx for De Bruijn
  body?: Term;
  func?: Term;
  arg?: Term;
  name?: string; // keeping track of these for adding labels in the future
  variable?: string;
  parent?: Term;
  binderId?: string;
  appId?: string;
  isChurchNumeral?: boolean;
  numValue?: number;
  operation?: string;
  churchParent?: Term;

  constructor(type: TermType, data?: number | Term | TermData) {
    this.type = type;

    // each type of term has some unique props
    if (type === TermType.VAR && typeof data === 'number') {
      this.index = data;
    } else if (type === TermType.LAM && data instanceof Term) {
      this.body = data;
    } else if (type === TermType.APP && typeof data === 'object' && data !== null) {
      const appData = data as TermData;
      this.func = appData.func;
      this.arg = appData.arg;
    }
  }

  /**
   * Calculate the size (number of nodes) of the term
   */
  size(): number {
    if (this.type === TermType.VAR) {
      return 1;
    } else if (this.type === TermType.LAM && this.body) {
      return 1 + this.body.size();
    } else if (this.type === TermType.APP && this.func && this.arg) {
      return this.func.size() + this.arg.size();
    }
    return 0;
  }
}

interface ParsedTerm {
  type: string;
  name?: string;
  body?: ParsedTerm;
  variable?: string; // TODO: remove this?
  left?: ParsedTerm;
  right?: ParsedTerm;
}

/**
 * Convert a parsed term to our internal representation.
 */
function convertParsedTerm(parsedTerm: ParsedTerm): Term {
  //// VARIABLES ////
  if (parsedTerm.type === 'variable') {
    const variable = new Term(TermType.VAR, 0); // defaults to 0 debrujin idx, will be updated
    variable.name = parsedTerm.name; // for labels
    // for number constants, convert to church numeral
    if (variable.name && !isNaN(Number(variable.name))) {
      const numValue = parseInt(variable.name);
      return createChurchNumeral(numValue);
    }
    return variable;

    //// LAMBDA ABSTRACTIONS ////
  } else if (parsedTerm.type === 'abstraction' && parsedTerm.body) {
    const body = convertParsedTerm(parsedTerm.body);
    const lambda = new Term(TermType.LAM, body);
    lambda.variable = parsedTerm.variable; // for labels
    const varName = lambda.variable || 'x';
    lambda.binderId = `lambda-${varName}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    body.parent = lambda;
    return lambda;
    //// APPLICATIONS ////
  } else if (parsedTerm.type === 'application' && parsedTerm.left && parsedTerm.right) {
    const func = convertParsedTerm(parsedTerm.left);
    const arg = convertParsedTerm(parsedTerm.right);
    const app = new Term(TermType.APP, { func, arg });
    func.parent = app;
    arg.parent = app;
    app.appId = `app-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    return app;
  } else {
    throw new Error(`Unknown term type: ${parsedTerm.type}`);
  }
}

/**
 * Create a Church numeral term representation for a number.
 * Church numeral n is λf.λx.f^n(x).
 */
// TODO: handle church numerals over 100 by breaking them multiple numerals with an operator
function createChurchNumeral(n: number): Term {
  // special case for 0 - λf.λx.x
  if (n === 0) {
    const x = new Term(TermType.VAR, 0);
    x.name = 'x';
    const lambdaX = new Term(TermType.LAM, x);
    lambdaX.variable = 'x';
    const lambdaF = new Term(TermType.LAM, lambdaX);
    lambdaF.variable = 'f';
    return lambdaF;
  }

  // n > 0: λf.λx.f(f(...(f(x))...))
  // start with the innermost term
  let innerTerm = new Term(TermType.VAR, 0);
  innerTerm.name = 'x';

  // apply f n times
  for (let i = 0; i < n; i++) {
    const f = new Term(TermType.VAR, 1); // f is one level up from x
    f.name = 'f';

    // application of f to the inner term
    const app = new Term(TermType.APP, {
      func: f,
      arg: innerTerm,
    });

    // set parent references
    f.parent = app;
    innerTerm.parent = app;

    innerTerm = app;
  }

  // wrap in λx
  const lambdaX = new Term(TermType.LAM, innerTerm);
  lambdaX.variable = 'x';
  innerTerm.parent = lambdaX;

  // wrap in λf
  const lambdaF = new Term(TermType.LAM, lambdaX);
  lambdaF.variable = 'f';
  lambdaX.parent = lambdaF;

  // mark as church numeral
  lambdaF.isChurchNumeral = true;
  lambdaF.numValue = n;

  return lambdaF;
}

/**
 * Update variable indices to use De Bruijn notation to connect variables to their binding lambdas in the diagram.
 */
function assignIndices(
  term: Term,
  depth = 0,
  env = new Map<string, number>(),
  binderIds = new Map<number, string>()
): Term {
  if (term.type === TermType.VAR) {
    //// VARIABLES ////

    const name = term.name || 'x';
    if (env.has(name)) {
      // idx is distance (in lambda abstractions) from the variable to its binder
      const envValue = env.get(name);
      if (envValue !== undefined) {
        term.index = depth - envValue - 1;
        // get binder id for this variable
        const bindingDepth = envValue;
        if (binderIds.has(bindingDepth)) {
          term.binderId = binderIds.get(bindingDepth);
        }
      }
    }
  } else if (term.type === TermType.LAM && term.body) {
    //// LAMBDA ABSTRACTIONS ////

    if (!term.binderId) {
      term.binderId = `lambda-${term.variable || 'x'}-${depth}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    }
    // create env and add var to it
    const newEnv = new Map(env);
    newEnv.set(term.variable || 'x', depth);
    // store the binder id so vars can ref it
    const newBinderIds = new Map(binderIds);
    newBinderIds.set(depth, term.binderId);
    // recursively process the lambda's body
    assignIndices(term.body, depth + 1, newEnv, newBinderIds);
  } else if (term.type === TermType.APP && term.func && term.arg) {
    //// APPLICATIONS ////

    // process both sides
    assignIndices(term.func, depth, env, binderIds);
    assignIndices(term.arg, depth, env, binderIds);
  }

  if (term.isChurchNumeral) {
    if (term.body && term.body.type === TermType.LAM) {
      // set ref in child terms so they can find parent
      term.body.churchParent = term;
    }
  }

  return term;
}

export interface VisualizerOptions {
  unitSize?: number;
  lineWidth?: number;
  padding?: number;
  backgroundColor?: string;
}

/**
 * Main tromp diagram generator class.
 */
export class TrompDiagramGenerator {
  options: Required<VisualizerOptions>;
  private seenOperations: Set<string>;
  private labelPositions: Array<{ x: number; y: number; label: string }>;

  constructor(options: VisualizerOptions = {}) {
    this.options = {
      unitSize: options.unitSize || 30,
      lineWidth: options.lineWidth || 3,
      padding: options.padding || 60,
      backgroundColor: options.backgroundColor || '#FFF',
    };
    this.seenOperations = new Set<string>();
    this.labelPositions = [];
  }

  /**
   * Generate diagram from a lambda expression string.
   */
  generateDiagram(lambdaExpression: string): string {
    this.seenOperations.clear();
    this.labelPositions = [];

    try {
      // process with our parser and convert to our representation
      const parser = new Parser(lambdaExpression);
      const parsedExpression = parser.parse();
      const expression = convertParsedTerm(parsedExpression);
      assignIndices(expression);

      // draw diagram lines
      const figure = this.drawTerm(expression);

      // calc dims
      const totalWidth = figure.width * this.options.unitSize + this.options.padding * 2;
      const totalHeight = figure.height * this.options.unitSize + this.options.padding * 2;

      let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="${totalHeight}" preserveAspectRatio="xMidYMid meet">`; // create svg container
      svg += `<rect width="100%" height="100%" fill="${this.options.backgroundColor}" />`; // add background

      const offsetX = this.options.padding;
      const offsetY = this.options.padding;
      svg += `<g transform="translate(${offsetX}, ${offsetY})">`; // container for the diagram itself
      svg += figure.svg;
      svg += '</g></svg>';
      return svg;
    } catch (error) {
      throw new Error(`Error drawing diagram:${error}`);
    }
  }

  /**
   * Converts parsed expression/term into svg lines
   * Returns { svg, height, width } object
   */
  drawTerm(term: Term): {
    svg: string;
    height: number;
    width: number;
  } {
    const horizontalGap = this.options.unitSize;

    if (term.type === TermType.VAR) {
      //// VARIABLES ////

      const h = 0;
      const w = 1;
      const varX = horizontalGap;
      const varY = 0;
      const varHeight = (term.index !== undefined ? term.index + 1 : 0) * this.options.unitSize; // de bruijn idx determines height

      let svg = `<line x1="${varX}" y1="${varY}" x2="${varX}" y2="${varY - varHeight}" 
                 stroke="#000000" stroke-width="${this.options.lineWidth}" stroke-linecap="round" />`;

      return { svg, height: h, width: w };
    } else if (term.type === TermType.LAM && term.body) {
      //// LAMBDA ABSTRACTIONS ////

      // draw body first
      const bodyResult = this.drawTerm(term.body);
      const h = bodyResult.height + 1;
      const w = bodyResult.width;
      const lineColor = '#000000'; // TODO: make this dynamic (assign colors to components and use it here)
      const binderWidth = w * this.options.unitSize; // shorten the width of each binder to show space between lambda abstractions
      const binderX = horizontalGap;
      const binderY = 0;
      // draw the lambda binder over the body
      let svg = `<line x1="${binderX}" y1="${binderY}" x2="${binderX + binderWidth}" y2="${binderY}" 
               stroke="${lineColor}" stroke-width="${this.options.lineWidth}" />`;
      const verticalSpacing = this.options.unitSize;
      const translatedBodySVG = this._translateSVG(bodyResult.svg, 0, verticalSpacing);
      svg += translatedBodySVG; // combine
      return { svg, height: h, width: w };
    }
    if (term.type === TermType.APP && term.func && term.arg) {
      //// APPLICATIONS ////
      // calling the left side function, right side argument for simplicity

      // first draw both sides of the app
      const func = this.drawTerm(term.func);
      const arg = this.drawTerm(term.arg);
      const h1 = func.height;
      const w1 = func.width;
      const h2 = arg.height;
      const w2 = arg.width;

      // calc dimensions of this app
      const h = Math.max(h1, h2) + 1;
      // Ensure consistent spacing between vertical lines
      const w = w1 + w2 + 1; // Adjusted to ensure even spacing between vertical lines
      const unitSize = this.options.unitSize;

      // draw svg
      let svg = '';
      const funcBottom = h1 * unitSize; // find bottom y coord (removing padding)
      const argBottom = h2 * unitSize; // find bottom y coord (removing padding)
      const barY = Math.max(funcBottom, argBottom);

      // v line for function side (if function is shorter than argument, usually the case)
      if (funcBottom < barY) {
        const funcVLineX = horizontalGap; // align with lambda (removing padding)
        const funcVLineY = funcBottom;
        const funcVLineHeight = barY - funcBottom;
        svg += `<line x1="${funcVLineX}" y1="${funcVLineY}" x2="${funcVLineX}" y2="${funcVLineY + funcVLineHeight}" 
              stroke="#000000" stroke-width="${this.options.lineWidth}" stroke-linecap="round" />`;
      }

      // v line for argument side (if argument is shorter than function)
      if (argBottom < barY) {
        // calc right side position with consistent spacing
        const argVXPos = horizontalGap + (w1 + 1) * unitSize; // Adjusted for even spacing (removing padding)
        const argVLineY = argBottom;
        const argVLineHeight = barY - argBottom;
        svg += `<line x1="${argVXPos}" y1="${argVLineY}" x2="${argVXPos}" y2="${argVLineY + argVLineHeight}" 
              stroke="#000000" stroke-width="${this.options.lineWidth}" stroke-linecap="round" />`;
      }

      // draw h connecting bar at the bottom-left corners with consistent spacing
      const barX = horizontalGap; // align with lambda (removing padding)
      const barWidth = (w1 + 1) * unitSize; // Adjusted for even spacing
      svg += `<line x1="${barX}" y1="${barY}" x2="${barX + barWidth}" y2="${barY}" 
            stroke="#000000" stroke-width="${this.options.lineWidth}" stroke-linecap="round" />`;

      // vertical bar from func to the arg (rarely needed)
      const funcConnectionX = barX; // left edge of hbar
      const funcConnectionY1 = barY; // top of hbar
      const funcConnectionY2 = Math.max(0, funcBottom - unitSize); // defaults to 0, or goes up to the bottom of the function (usually not the case)
      svg += `<line x1="${funcConnectionX}" y1="${funcConnectionY1}" x2="${funcConnectionX}" y2="${funcConnectionY2}" 
            stroke="#000000" stroke-width="${this.options.lineWidth}" stroke-linecap="round" />`;

      // right v connection from the app bar up to its argument
      const argConnectionX = barX + barWidth; // right edge of h bar
      const argConnectionY1 = barY; // top of hbar
      const argConnectionY2 = Math.max(0, argBottom - unitSize); // goes up to the bottom left of the argument
      svg += `<line x1="${argConnectionX}" y1="${argConnectionY1}" x2="${argConnectionX}" y2="${argConnectionY2}" 
            stroke="#000000" stroke-width="${this.options.lineWidth}" stroke-linecap="round" />`;

      // draw function side
      svg += func.svg;
      // draw argument side (shifted to the right with consistent spacing)
      const translatedArgSVG = this._translateSVG(arg.svg, (w1 + 1) * unitSize, 0); // Adjusted for even spacing
      svg += translatedArgSVG;

      return { svg, height: h, width: w };
    }

    return { svg: '', height: 0, width: 0 };
  }
  _translateSVG(svg: string, x: number, y: number): string {
    if (!svg) return '';
    return svg
      .replace(/(x1|x2|cx)="([^"]+)"/g, (match, attr, val) => {
        return `${attr}="${parseFloat(val) + x}"`;
      })
      .replace(/(y1|y2|cy)="([^"]+)"/g, (match, attr, val) => {
        return `${attr}="${parseFloat(val) + y}"`;
      });
  }

  /**
   * Save the SVG diagram to a file
   */
  saveSVG(lambdaExpression: string, filePath: string): string {
    const svg = this.generateDiagram(lambdaExpression);
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, svg);
    return filePath;
  }

  /**
   * Convert SVG to PNG using sharp library
   */
  savePNG(lambdaExpression: string, filePath: string): string {
    const svg = this.generateDiagram(lambdaExpression);
    const sharpFn = (sharp as unknown as { default?: typeof sharp }).default || sharp;
    sharpFn(Buffer.from(svg))
      .png()
      .toFile(filePath)
      .then(() => {})
      .catch((err: Error) => {
        console.error('Error converting SVG to PNG:', err);
      });
    return filePath;
  }
}
