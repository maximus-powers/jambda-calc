import fs from 'fs';
import path from 'path';
import { TrompDiagramGenerator } from './tromp-diagram.js';
// import { renderSVGAsASCII } from './ascii-renderer.js';

export interface VisualizerOptions {
  outputDir?: string;
  unitSize?: number;
  lineWidth?: number;
  padding?: number;
  width?: number;
  height?: number;
  backgroundColor?: string;
  preserveAspectRatio?: boolean;
}

/**
 * Generate a tromp diagram from a lambda calculus expression
 * @param lambdaExpression - The lambda calculus expression to visualize
 * @param options - Visualization options
 * @param outputPath - The path where to save the diagram (optional)
 * @param format - The output format ('svg', 'png', or 'ascii')
 * @returns The path to the generated diagram, or SVG/ASCII string if no outputPath
 */
export function visualize(
  lambdaExpression: string,
  options: VisualizerOptions = {},
  outputPath?: string,
  format = 'svg'
): string {
  try {
    const diagramGenerator = new TrompDiagramGenerator(options);

    // if no output path is given, just return the ascii to be displayed in the console
    if (!outputPath) {
      const svgString = diagramGenerator.generateDiagram(lambdaExpression);
      return svgString;
    }

    if (!fs.existsSync(path.dirname(outputPath))) {
      fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    }

    if (format === 'svg') {
      return diagramGenerator.saveSVG(lambdaExpression, outputPath);
    } else if (format === 'png' || format === 'undefined') {
      return diagramGenerator.savePNG(lambdaExpression, outputPath);
    } else {
      throw new Error(`Unsupported format: ${format}`);
    }
  } catch (error) {
    console.error('Error generating diagram:', error);
    throw error;
  }
}

export { TrompDiagramGenerator } from './tromp-diagram.js';
export { renderSVGAsASCII } from './ascii-renderer.js';
