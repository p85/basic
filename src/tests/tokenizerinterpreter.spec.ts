import { expect } from 'chai';
import { eval } from 'mathjs';
import 'mocha';

import { Tokenizer } from '../tokenizer/tokenizer';
import { Parser } from '../Parser/Parser';
import { Interpreter } from '../Interpreter/Interpreter';

let tokenizer: Tokenizer;
let parser: Parser;
let interpreter: Interpreter;


const testValues: string[] = [
  '3 + 7',
  '23 + 77',
  '15 - 90',
  '7 - 3 + 2 - 1',
  '10 + 1 + 2 - 3 + 4 + 6 - 15',
  '3 * 7',
  '3 * 7 / 2',
  '2 + 7 * 4',
  '14 + 2 * 3 - 6 / 2',
  '7 + 3 * (10 / (12 / (3 + 1) - 1))',
  '7 + 3 * (10 / (12 / (3 + 1) - 1)) / (2 + 3) - 5 - 3 + (8)',
  '7 + (((3 + 2)))',
  '- 3',
  '+ 3',
  '5 - - - + - 3',
  '5 - - - + - (3 + 4) - +2'
];

describe('Tokenizer / Interpreter', () => {

  testValues.forEach((testExpr, index) => {
    it(testExpr, () => {
      tokenizer = new Tokenizer(testExpr);
      parser = new Parser(tokenizer);
      interpreter = new Interpreter(parser);
      const result = interpreter.interpret();
      expect(result).to.equal(eval(testExpr));
    })
  });

});