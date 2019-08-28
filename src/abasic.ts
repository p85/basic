import * as fs from 'fs';
import { Tokenizer } from './tokenizer/tokenizer';
import { Parser } from './Parser/Parser';
import { Interpreter } from './Interpreter/interpreter';
const argv = require('yargs')
    .usage('Usage: $0 -i <file.bas>')
    .option('i', {
      alias: 'input file',
      type: 'string',
    })
    .demandOption(['i'])
    .argv;

const filename = argv.i;
if (!fs.existsSync(filename)) {
  console.error(`File ${filename} not found!`);
  process.exit(1);
}

const fileContents: string = fs.readFileSync(filename).toString();

const tokenizer = new Tokenizer(fileContents);
const parser = new Parser(tokenizer);
const interpreter = new Interpreter(parser);
interpreter.interpret();