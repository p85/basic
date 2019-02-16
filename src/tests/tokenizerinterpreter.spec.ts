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
  '5 - - - + - (3 + 4) - +2',
  '290 MOD 7',
  '290 MOD 7 + 3 * 8 / 2 - 5 MOD 2'
];

describe('calculus', () => {
  testValues.forEach(testExpr => {
    it(testExpr, () => {
      tokenizer = new Tokenizer(testExpr);
      parser = new Parser(tokenizer);
      interpreter = new Interpreter(parser);
      const result = interpreter.interpret();
      expect(result[0]).to.equal(eval(testExpr.replace(/MOD/g, '%')));
    })
  });
});

describe('Integer Variables', () => {
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

describe('String Variables', () => {
  it('Set a String Variable', () => {
    tokenizer = new Tokenizer('foobar = "foby"');
    parser = new Parser(tokenizer);
    interpreter = new Interpreter(parser);
    interpreter.interpret();
    expect(interpreter.vars).to.eql({foobar: "foby"});
  });

  it('Read a string Variable', () => {
    tokenizer = new Tokenizer('varx');
    parser = new Parser(tokenizer);
    interpreter = new Interpreter(parser);
    interpreter.vars = {varx: 'foobar'}
    const result = interpreter.interpret();
    expect(result[0]).to.equal('foobar');
  });

  it('Concatenation: Num + Str', () => {
    tokenizer = new Tokenizer('a = 2 + varx');
    parser = new Parser(tokenizer);
    interpreter = new Interpreter(parser);
    interpreter.vars = {varx: 'foobar'}
    interpreter.interpret();
    expect(interpreter.vars).to.eql({varx: 'foobar', a: '2foobar'});
  });

  it('Concatenation: Str + Num', () => {
    tokenizer = new Tokenizer('a = varx + 2');
    parser = new Parser(tokenizer);
    interpreter = new Interpreter(parser);
    interpreter.vars = {varx: 'foobar'}
    interpreter.interpret();
    expect(interpreter.vars).to.eql({varx: 'foobar', a: 'foobar2'});
  });

  it('Concatenation: Str + NumVar + Num', () => {
    tokenizer = new Tokenizer('a = varx + b + 2');
    parser = new Parser(tokenizer);
    interpreter = new Interpreter(parser);
    interpreter.vars = {varx: 'foobar', b: 5}
    interpreter.interpret();
    expect(interpreter.vars).to.eql({varx: 'foobar', b:5, a: 'foobar52'});
  });

  it('Concatenation: Str + NumVar + Num + Str', () => {
    tokenizer = new Tokenizer('a = varx + b + 2 + vary');
    parser = new Parser(tokenizer);
    interpreter = new Interpreter(parser);
    interpreter.vars = {varx: 'foobar', b: 5, vary: 'HELLO'}
    interpreter.interpret();
    expect(interpreter.vars).to.eql({varx: 'foobar', b:5, vary: 'HELLO', a: 'foobar52HELLO'});
  });
});

describe('other', () => {
  it('Multiple Statements', () => {
    tokenizer = new Tokenizer('a = 56 c = 1234 xyz = "fooly" newvar = xyz + c + a');
    parser = new Parser(tokenizer);
    interpreter = new Interpreter(parser);
    interpreter.interpret();
    expect(interpreter.vars).to.eql({a: 56, c: 1234, xyz: 'fooly', newvar: 'fooly123456'});
  });
});