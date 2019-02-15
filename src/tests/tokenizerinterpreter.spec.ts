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

describe('calculus', () => {
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

describe('Variables', () => {
  it('set a variable', () => {
    tokenizer = new Tokenizer('foobar = 12345');
    parser = new Parser(tokenizer);
    interpreter = new Interpreter(parser);
    interpreter.interpret();
    expect(interpreter.vars).to.eql({foobar: 12345});
  });

  it('calculation using one existing variable and one set', () => {
    tokenizer = new Tokenizer('a = (b * 2 + 2) / 2');
    parser = new Parser(tokenizer);
    interpreter = new Interpreter(parser);
    interpreter.vars = {b: 6};
    interpreter.interpret();
    expect(interpreter.vars).to.eql({b: 6, a: 7});
  });

  it('calculation using two existing variables', () => {
    tokenizer = new Tokenizer('a = b + c');
    parser = new Parser(tokenizer);
    interpreter = new Interpreter(parser);
    interpreter.vars = {b: 6, c: 1};
    interpreter.interpret();
    expect(interpreter.vars).to.eql({b: 6, c: 1, a: 7});
  });

  it('calculation using two existing variables and one set with parentheses', () => {
    tokenizer = new Tokenizer('a = (b + c + 10) * 2');
    parser = new Parser(tokenizer);
    interpreter = new Interpreter(parser);
    interpreter.vars = {b: 6, c: 1};
    interpreter.interpret();
    expect(interpreter.vars).to.eql({b: 6, c: 1, a: 34});
  });

});