import { expect } from 'chai';
import 'mocha';

import { Tokenizer } from '../tokenizer/tokenizer';
import { Interpreter } from '../interpreter/interpreter';

let tokenizer: Tokenizer;
let interpreter: Interpreter;
describe('Tokenizer', () => {

  it('Single Digit: 3 + 7', () => {
    tokenizer = new Tokenizer('3 + 7');
    interpreter = new Interpreter(tokenizer);
    const result = interpreter.expr();
    expect(result).to.equal(3 + 7);
  });

  it('Multiple Digit: 23 + 77', () => {
    tokenizer = new Tokenizer('23 + 77');
    interpreter = new Interpreter(tokenizer);
    const result = interpreter.expr();
    expect(result).to.equal(23 + 77);
  });

  it('Multiple Digit: 15 - 90', () => {
    tokenizer = new Tokenizer('15 - 90');
    interpreter = new Interpreter(tokenizer);
    const result = interpreter.expr();
    expect(result).to.equal(15 - 90);
  });

  it('Multiple Signs: 7 - 3 + 2 - 1', () => {
    tokenizer = new Tokenizer('7 - 3 + 2 - 1');
    interpreter = new Interpreter(tokenizer);
    const result = interpreter.expr();
    expect(result).to.equal(7 - 3 + 2 - 1);
  });

  it('Multiple Signs: 10 + 1 + 2 - 3 + 4 + 6 - 15', () => {
    tokenizer = new Tokenizer('10 + 1 + 2 - 3 + 4 + 6 - 15');
    interpreter = new Interpreter(tokenizer);
    const result = interpreter.expr();
    expect(result).to.equal(10 + 1 + 2 - 3 + 4 + 6 - 15);
  });

  it('MUL and DIV: 3 * 7', () => {
    tokenizer = new Tokenizer('3 * 7');
    interpreter = new Interpreter(tokenizer);
    const result = interpreter.expr();
    expect(result).to.equal(3 * 7);
  });

  it('MUL and DIV multiple: 3 * 7 / 2', () => {
    tokenizer = new Tokenizer('3 * 7 / 2');
    interpreter = new Interpreter(tokenizer);
    const result = interpreter.expr();
    expect(result).to.equal(3 * 7 / 2);
  });

  it('all ordered: 2 + 7 * 4', () => {
    tokenizer = new Tokenizer('2 + 7 * 4');
    interpreter = new Interpreter(tokenizer);
    const result = interpreter.expr();
    expect(result).to.equal(2 + 7 * 4)
  });

  it('all ordered: 14 + 2 * 3 - 6 / 2', () => {
    tokenizer = new Tokenizer('14 + 2 * 3 - 6 / 2');
    interpreter = new Interpreter(tokenizer);
    const result = interpreter.expr();
    expect(result).to.equal(14 + 2 * 3 - 6 / 2);
  });

});