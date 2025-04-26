// jambda - js to lambda converter & visualizer

export * from './lib/transpiler/index.js';
export * from './lib/visualizer/index.js';

import { transpile } from './lib/transpiler/index.js';
import { visualize, VisualizerOptions } from './lib/visualizer/index.js';

// main api
export const jambda = {
  /**
   * Transpile JavaScript/TypeScript code to lambda calculus notation
   * @param code The JavaScript/TypeScript code to transpile
   * @returns Lambda calculus expression as a string
   */
  transpile(code: string): string {
    return transpile(code);
  },

  /**
   * Visualize a lambda calculus expression
   * @param expression The lambda calculus expression to visualize
   * @param options Visualization options
   * @param outputPath The output path for the visualization (optional)
   * @returns The path to the generated diagram or the SVG content if no outputPath is provided
   */
  visualize(
    expression: string,
    options: VisualizerOptions = {},
    outputPath?: string,
    format?: 'png' | 'svg' | 'ascii'
  ): string {
    return visualize(expression, options, outputPath, format);
  },
};

// for commonjs
export default jambda;
