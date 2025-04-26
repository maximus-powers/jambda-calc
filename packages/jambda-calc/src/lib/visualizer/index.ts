import fs from 'fs';
import path from 'path';
import { TrompDiagramGenerator, VisualizerOptions } from './tromp-diagram.js';
import { renderSVGAsASCII } from './ascii-renderer.js';

/**
 * Generate a tromp diagram from a lambda calculus expression
 * @param lambdaExpression - The lambda calculus expression to visualize
 * @param options - Visualization options
 * @param outputPath - The path where to save the diagram (optional)
 * @param format - The output format ('svg' or 'png'), defaults to svg
 * @returns The path to the generated diagram, or SVG/ASCII string if no outputPath
 */
export function visualize(
  lambdaExpression: string,
  options: VisualizerOptions = {},
  outputPath?: string,
  format: 'svg' | 'png' | 'ascii' = 'svg'
): string {
  try {
    const diagramGenerator = new TrompDiagramGenerator(options);

    // if no output path is given, just return the ascii to be displayed in the console
    if (!outputPath) {
      const svgString = diagramGenerator.generateDiagram(lambdaExpression);
      if (format === 'ascii') {
        return renderSVGAsASCII(svgString);
      } else {
        return svgString;
      }
    }

    outputPath = path.resolve(process.cwd(), outputPath);

    let outputDir: string;
    let outputFilename: string;

    const ext = path.extname(outputPath);
    if (ext) {
      outputDir = path.dirname(outputPath);
      outputFilename = path.basename(outputPath, ext);
    } else {
      outputDir = outputPath;
      outputFilename = 'output';
    }

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const fullFilePath = path.join(
      outputDir,
      `${outputFilename}.${format === 'png' ? 'png' : 'svg'}`
    );

    if (format === 'svg') {
      return diagramGenerator.saveSVG(lambdaExpression, fullFilePath);
    } else if (format === 'png') {
      return diagramGenerator.savePNG(lambdaExpression, fullFilePath);
    } else {
      throw new Error(`Unsupported format: ${format}`);
    }
  } catch (error) {
    console.error('Error generating diagram:', error);
    throw error;
  }
}

export { VisualizerOptions };
