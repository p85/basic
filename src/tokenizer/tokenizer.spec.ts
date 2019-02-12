import { expect } from 'chai';
import 'mocha';

import { Tokenizer, Interpreter } from './tokenizer';

let tokenizer: Tokenizer;
let interpreter: Interpreter;
describe('Tokenizer', () => {

  it('Single Digit: 3 + 7', () => {
    tokenizer = new Tokenizer('3 + 7');
    interpreter = new Interpreter(tokenizer);
    const result = interpreter.expr();
    expect(result).to.equal(10);
  });

  it('Multiple Digit: 23 + 77', () => {
    tokenizer = new Tokenizer('23 + 77');
    interpreter = new Interpreter(tokenizer);
    const result = interpreter.expr();
    expect(result).to.equal(100);
  });

  it('Multiple Digit: 15 - 90', () => {
    tokenizer = new Tokenizer('15 - 90');
    interpreter = new Interpreter(tokenizer);
    const result = interpreter.expr();
    expect(result).to.equal(-75);
  });

  it('Multiple Signs: 7 - 3 + 2 - 1', () => {
    tokenizer = new Tokenizer('7 - 3 + 2 - 1');
    interpreter = new Interpreter(tokenizer);
    const result = interpreter.expr();
    expect(result).to.equal(5);
  });

  it('Multiple Signs: 10 + 1 + 2 - 3 + 4 + 6 - 15', () => {
    tokenizer = new Tokenizer('10 + 1 + 2 - 3 + 4 + 6 - 15');
    interpreter = new Interpreter(tokenizer);
    const result = interpreter.expr();
    expect(result).to.equal(5);
  });

  it('MUL and DIV: 3 * 7', () => {
    tokenizer = new Tokenizer('3 * 7');
    interpreter = new Interpreter(tokenizer);
    const result = interpreter.expr();
    expect(result).to.equal(21);
  });

  it('MUL and DIV multiple: 3 * 7 / 2', () => {
    tokenizer = new Tokenizer('3 * 7 / 2');
    interpreter = new Interpreter(tokenizer);
    const result = interpreter.expr();
    expect(result).to.equal(10.5);
  });

});