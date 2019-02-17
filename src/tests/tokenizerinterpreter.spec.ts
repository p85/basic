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
  '10 3 + 7',
  '10 23 + 77',
  '10 15 - 90',
  '10 7 - 3 + 2 - 1',
  '10 10 + 1 + 2 - 3 + 4 + 6 - 15',
  '10 3 * 7',
  '10 3 * 7 / 2',
  '10 2 + 7 * 4',
  '10 14 + 2 * 3 - 6 / 2',
  '10 7 + 3 * (10 / (12 / (3 + 1) - 1))',
  '10 7 + 3 * (10 / (12 / (3 + 1) - 1)) / (2 + 3) - 5 - 3 + (8)',
  '10 7 + (((3 + 2)))',
  '10 10 - 3',
  '10 10 + 3',
  '10 5 - - - + - 3',
  '10 5 - - - + - (3 + 4) - + 2',
  '10 290 MOD 7',
  '10 290 MOD 7 + 3 * 8 / 2 - 5 MOD 2'
];

describe('calculus', () => {
  testValues.forEach(testExpr => {
    it(testExpr, () => {
      tokenizer = new Tokenizer(testExpr);
      parser = new Parser(tokenizer);
      interpreter = new Interpreter(parser);
      const result = interpreter.interpret();
      expect(result[0]).to.equal(eval(testExpr.replace(/MOD/g, '%').replace(/^[0-9]+ {1}/, '')));
    })
  });
});

describe('Integer Variables', () => {
  it('set a variable', () => {
    tokenizer = new Tokenizer('10 foobar = 12345');
    parser = new Parser(tokenizer);
    interpreter = new Interpreter(parser);
    interpreter.interpret();
    expect(interpreter.vars).to.eql({foobar: 12345});
  });

  it('calculation using one existing variable and one set', () => {
    tokenizer = new Tokenizer('10 a = (b * 2 + 2) / 2');
    parser = new Parser(tokenizer);
    interpreter = new Interpreter(parser);
    interpreter.vars = {b: 6};
    interpreter.interpret();
    expect(interpreter.vars).to.eql({b: 6, a: 7});
  });

  it('calculation using two existing variables', () => {
    tokenizer = new Tokenizer('10 a = b + c');
    parser = new Parser(tokenizer);
    interpreter = new Interpreter(parser);
    interpreter.vars = {b: 6, c: 1};
    interpreter.interpret();
    expect(interpreter.vars).to.eql({b: 6, c: 1, a: 7});
  });

  it('calculation using two existing variables and one set with parentheses', () => {
    tokenizer = new Tokenizer('10 a = (b + c + 10) * 2');
    parser = new Parser(tokenizer);
    interpreter = new Interpreter(parser);
    interpreter.vars = {b: 6, c: 1};
    interpreter.interpret();
    expect(interpreter.vars).to.eql({b: 6, c: 1, a: 34});
  });

});

describe('String Variables', () => {
  it('Set a String Variable', () => {
    tokenizer = new Tokenizer('10 foobar = "foby"');
    parser = new Parser(tokenizer);
    interpreter = new Interpreter(parser);
    interpreter.interpret();
    expect(interpreter.vars).to.eql({foobar: "foby"});
  });

  it('Read a string Variable', () => {
    tokenizer = new Tokenizer('10 varx\n');
    parser = new Parser(tokenizer);
    interpreter = new Interpreter(parser);
    interpreter.vars = {varx: 'foobar'}
    const result = interpreter.interpret();
    expect(result[0]).to.equal('foobar');
  });

  it('Concatenation: Num + Str', () => {
    tokenizer = new Tokenizer('10 a = 2 + varx');
    parser = new Parser(tokenizer);
    interpreter = new Interpreter(parser);
    interpreter.vars = {varx: 'foobar'}
    interpreter.interpret();
    expect(interpreter.vars).to.eql({varx: 'foobar', a: '2foobar'});
  });

  it('Concatenation: Str + Num', () => {
    tokenizer = new Tokenizer('10 a = varx + 2');
    parser = new Parser(tokenizer);
    interpreter = new Interpreter(parser);
    interpreter.vars = {varx: 'foobar'}
    interpreter.interpret();
    expect(interpreter.vars).to.eql({varx: 'foobar', a: 'foobar2'});
  });

  it('Concatenation: Str + NumVar + Num', () => {
    tokenizer = new Tokenizer('10 a = varx + b + 2');
    parser = new Parser(tokenizer);
    interpreter = new Interpreter(parser);
    interpreter.vars = {varx: 'foobar', b: 5}
    interpreter.interpret();
    expect(interpreter.vars).to.eql({varx: 'foobar', b:5, a: 'foobar52'});
  });

  it('Concatenation: Str + NumVar + Num + Str', () => {
    tokenizer = new Tokenizer('10 a = varx + b + 2 + vary');
    parser = new Parser(tokenizer);
    interpreter = new Interpreter(parser);
    interpreter.vars = {varx: 'foobar', b: 5, vary: 'HELLO'}
    interpreter.interpret();
    expect(interpreter.vars).to.eql({varx: 'foobar', b:5, vary: 'HELLO', a: 'foobar52HELLO'});
  });
});

describe('other', () => {
  it('Multiple Statements with Line Numbers with LINEBREAK at End', () => {
    tokenizer = new Tokenizer('10 a = 56\n20 c = 1234\n30 xyz = "fooly"\n40newvar = xyz + c + a\n50 newvar\n');
    parser = new Parser(tokenizer);
    interpreter = new Interpreter(parser);
    const result = interpreter.interpret();
    expect(interpreter.vars).to.eql({a: 56, c: 1234, xyz: 'fooly', newvar: 'fooly123456'});
    expect(result).to.eql([undefined, undefined, undefined, undefined, 'fooly123456']);
  });

  it('Multiple Statements with Line Numbers without LINEBREAK at End', () => {
    tokenizer = new Tokenizer('10 a = 56\n20 c = 1234\n30 xyz = "fooly"\n40newvar = xyz + c + a\n50 newvar\n');
    parser = new Parser(tokenizer);
    interpreter = new Interpreter(parser);
    const result = interpreter.interpret();
    expect(interpreter.vars).to.eql({a: 56, c: 1234, xyz: 'fooly', newvar: 'fooly123456'});
    expect(result).to.eql([undefined, undefined, undefined, undefined, 'fooly123456']);
  });
});

describe('Commands', () => {
  it('PRINT string with spaces and numeric expression', () => {
    tokenizer = new Tokenizer('10 PRINT "Hello World" + 3 + 5');
    parser = new Parser(tokenizer);
    interpreter = new Interpreter(parser);
    const result = interpreter.interpret();
    expect(result[0]).to.equal('Hello World35');
  });

  it('GOTO', () => {
    tokenizer = new Tokenizer('10 PRINT "Hello World!" + 7 + 3\n20 GOTO 40\n30 PRINT "UH-OH!"\n40 PRINT "FIN"');
    parser = new Parser(tokenizer);
    interpreter = new Interpreter(parser);
    const result = interpreter.interpret();
    expect(result).to.eql(["Hello World!73", undefined, "FIN"]);
  });
});