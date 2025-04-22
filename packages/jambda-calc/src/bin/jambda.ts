#!/usr/bin/env node
/**
 * Main command-line tool for jambda-calc - runs transpilation and/or visualization
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import { transpile } from '../lib/transpiler/index.js';
import { visualize, renderSVGAsASCII } from '../lib/visualizer/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const args = process.argv.slice(2);

let inputFile = '';
let outputPath: string | null = null;
let format = 'png';
let shouldTranspile = true;
let shouldVisualize = false;

function showHelp(): void {
  console.log('Usage: jambda-calc [options]\n');
  console.log('Commands:');
  console.log('  examples          Run built-in examples with explanations\n');
  console.log('Options:');
  console.log(
    '  --input, -i       Input file. JS/TS file for transpilation, or lambda calculus file for visualization.'
  );
  console.log(
    '  --transpile, -t   Only transpile the input to lambda expression (no visualization).'
  );
  console.log(
    '  --visualize, -v   Only visualize the input (treats input as lambda expression when used alone)'
  );
  console.log(
    '  --output, -o      Output path for all generated files (if not provided, displays in console)'
  );
  console.log('  --format, -f      Output format for diagrams: png (default), svg, or ascii');
  console.log('  --help, -h            Show this help message');
}

if (args.length === 1 && args[0] === 'examples') {
  try {
    const examplesScriptPath = path.resolve(__dirname, '../lib/scripts/run-examples.js');
    
    try {
      execSync(`node "${examplesScriptPath}"`, { stdio: 'inherit' });
      process.exit(0);
    } catch (error) {
      console.error(
        'Error running examples:',
        error instanceof Error ? error.message : String(error)
      );
      process.exit(1);
    }
  } catch (error) {
    console.error(
      'Error running examples:',
      error instanceof Error ? error.message : String(error)
    );
    process.exit(1);
  }
}

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--input' || args[i] === '-i') {
    if (i + 1 < args.length) {
      inputFile = args[i + 1];
      i++;
    }
  } else if (args[i] === '--output' || args[i] === '-o') {
    if (i + 1 < args.length) {
      outputPath = args[i + 1];
      i++;
    }
  } else if (args[i] === '--transpile' || args[i] === '-t') {
    shouldTranspile = true;
    shouldVisualize = false;
  } else if (args[i] === '--visualize' || args[i] === '-v') {
    shouldVisualize = true;
    shouldTranspile = false;
  } else if (args[i] === '--format' || args[i] === '-f') {
    if (i + 1 < args.length) {
      format = args[i + 1].toLowerCase();
      i++;
    }
  } else if (args[i] === '--help' || args[i] === '-h') {
    showHelp();
    process.exit(0);
  }
}

// process flags
if (
  !args.some(
    (arg) => arg === '--transpile' || arg === '-t' || arg === '--visualize' || arg === '-v'
  )
) {
  // if neither -t or -v, do both
  shouldTranspile = true;
  shouldVisualize = true;
} else if (
  args.some((arg) => arg === '--visualize' || arg === '-v') &&
  !args.some((arg) => arg === '--transpile' || arg === '-t')
) {
  // if only -v, treat input as lambda expression
  shouldTranspile = false;
  shouldVisualize = true;
}

// used in terminal outputs
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  purple: '\x1b[35m',
  yellow: '\x1b[33m',
  white: '\x1b[37m',
  gray: '\x1b[90m',
};

async function main(): Promise<void> {
  try {
    if (inputFile === '') return;
    const inputContent = fs.readFileSync(inputFile, 'utf-8');

    let lambdaExpression;
    //// 1. TRANSPILE (OR SKIP) ////
    if (!shouldTranspile && shouldVisualize) {
      // if only -v, treat input as lambda expression
      lambdaExpression = inputContent.trim();
      console.log(`${colors.gray}Using lambda expression from ${inputFile}${colors.reset}`);
    } else {
      // default transpile input
      lambdaExpression = transpile(inputContent);

      // save .txt of lambda expression if -o specified
      if (outputPath) {
        let lambdaOutputPath;
        if (path.extname(outputPath) === '') {
          lambdaOutputPath = path.join(
            outputPath,
            `${path.basename(inputFile, path.extname(inputFile))}.txt`
          );
        } else {
          // use current output path if extension already given
          lambdaOutputPath = outputPath;
        }
        if (!fs.existsSync(path.dirname(lambdaOutputPath))) {
          fs.mkdirSync(path.dirname(lambdaOutputPath), { recursive: true });
        }
        fs.writeFileSync(lambdaOutputPath, lambdaExpression, 'utf-8');
        console.log(
          `${colors.gray}Lambda calculus notation written to ${lambdaOutputPath}${colors.reset}`
        );
      }
    }

    // print to console if no -o
    if (!outputPath) {
      console.log(
        `\n${colors.bright}${colors.purple}λ Expression:\n${colors.reset} ${colors.purple}${lambdaExpression
          .replace(/\\/g, 'λ')
          .replace(/->/g, '.')
          .replace(/\(\(([^()]*)\)\)/g, '($1)')}${colors.reset}\n`
      );
    }

    //// 2: VISUALIZE (IF NEEDED) ////
    if (shouldVisualize) {
      const options = {
        unitSize: 12,
        lineWidth: 2,
        padding: 10,
        backgroundColor: '#282a36',
        preserveAspectRatio: true,
      };

      let svgContent;
      if (outputPath) {
        let visOutputPath;
        // handle cases where user adds an extension to the output
        if (path.extname(outputPath) === '') {
          visOutputPath = path.join(
            outputPath,
            `${path.basename(inputFile, path.extname(inputFile))}.${format}`
          );
        }
        const baseOutputPath = outputPath.replace(path.extname(outputPath), '');
        visOutputPath = `${baseOutputPath}.${format}`;
        if (!fs.existsSync(path.dirname(path.dirname(visOutputPath)))) {
          fs.mkdirSync(path.dirname(path.dirname(visOutputPath)), { recursive: true });
        }

        // run visualizer
        svgContent = visualize(lambdaExpression, options, visOutputPath, format);
        console.log(`${colors.gray}Generated diagram: ${visOutputPath}${colors.reset}`);
      } else {
        // if no -o, display in console
        svgContent = visualize(lambdaExpression, options);
        try {
          const asciiDiagram = renderSVGAsASCII(svgContent);
          console.log(`\n${colors.bright}${colors.white}Tromp Diagram${colors.reset}\n`);
          console.log(colors.white + asciiDiagram + colors.reset);
          console.log(
            `\n${colors.yellow}Note: Use --output (or -o) to save graphical SVG/PNG versions.${colors.reset}`
          );
        } catch (err) {
          console.error(`${colors.red}Error rendering ASCII diagram:${colors.reset}`, err);
          console.log(
            `${colors.yellow}Use --output to save a graphical SVG/PNG version.${colors.reset}`
          );
        }
      }
    }
  } catch (error) {
    console.error(
      `${colors.red}Error:${colors.reset}`,
      error instanceof Error ? error.message : String(error)
    );
    process.exit(1);
  }
}

main();
