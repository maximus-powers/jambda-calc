#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const examples = [
  {
    name: 'Example 1: Addition',
    file: 'examples/add.js',
    sourceOnly: false,
  },
  {
    name: 'Example 2: Celsius to Fahrenheit',
    file: 'examples/celsius-to-fahrenheit.js',
    sourceOnly: false,
  },
  {
    name: 'Example 3: Nested Functions',
    file: 'examples/nested-functions.js',
    sourceOnly: false,
  },
];

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  blue: '\x1b[34m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
};

function printSourceCode(filePath) {
  const source = fs.readFileSync(filePath, 'utf-8');
  console.log(`${colors.green}Source Code:${colors.reset}`);
  console.log(`${colors.cyan}${source}${colors.reset}`);
}

async function runExamples() {
  console.log(`\n${colors.bright}${colors.blue}==== JAMBDA EXAMPLES =====${colors.reset}\n`);
  for (const example of examples) {
    console.log(`\n${colors.bright}${colors.blue}==== ${example.name} =====${colors.reset}\n`);
    const exampleFile = path.join(__dirname, example.file);

    printSourceCode(exampleFile);

    try {
      const tempOutputDir = path.join(path.dirname(exampleFile), 'temp-output');

      if (!fs.existsSync(tempOutputDir)) {
        fs.mkdirSync(tempOutputDir, { recursive: true });
      }

      const currentScriptDir = __dirname;
      
      let mainBinPath;
      const possibleBinPaths = [
        path.resolve(currentScriptDir, '../../bin/jambda.js'),
        path.resolve(currentScriptDir, '../../../bin/jambda.js'),
        path.resolve(currentScriptDir, '../bin/jambda.js')
      ];
      
      for (const binPath of possibleBinPaths) {
        if (fs.existsSync(binPath)) {
          mainBinPath = binPath;
          break;
        }
      }
      if (!mainBinPath) {
        mainBinPath = path.resolve(currentScriptDir, '../../bin/jambda.js');
      }
      
      let cmd;
      if (process.env.npm_execpath && process.env.npm_execpath.includes('npm')) {
        cmd = `node "${mainBinPath}" --input "${exampleFile}"`;
      } else {
        cmd = `node "${mainBinPath}" --input "${exampleFile}"`;
      }

      console.log(`Running: ${cmd}`);

      execSync(cmd, {
        stdio: 'inherit',
      });
    } catch (error) {
      console.error(`Error running example: ${error.message}`);
    }
  }
  console.log(`\n${colors.bright}${colors.blue}==== COMPLETED =====${colors.reset}\n`);
}

runExamples().catch(console.error);