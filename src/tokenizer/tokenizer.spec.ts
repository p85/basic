import { expect } from 'chai';
import 'mocha';

import { Tokenizer } from './tokenizer';

let tokenizer: Tokenizer;

describe('Tokenizer', () => {

  it('Single Digit: 3 + 7', () => {
    tokenizer = new Tokenizer('3 + 7');
    const result = tokenizer.expr();
    expect(result).to.equal(10);
  });

  it('Multiple Digit: 23 + 77', () => {
    tokenizer = new Tokenizer('23 + 77');
    const result = tokenizer.expr();
    expect(result).to.equal(100);
  });

  it('Multiple Digit: 15 - 90', () => {
    tokenizer = new Tokenizer('15 - 90');
    const result = tokenizer.expr();
    expect(result).to.equal(-75);
  });

  it('Multiple Signs: 7 - 3 + 2 - 1', () => {
    tokenizer = new Tokenizer('7 - 3 + 2 - 1');
    const result = tokenizer.expr();
    expect(result).to.equal(5);
  });

  it('Multiple Signs: 10 + 1 + 2 - 3 + 4 + 6 - 15', () => {
    tokenizer = new Tokenizer('10 + 1 + 2 - 3 + 4 + 6 - 15');
    const result = tokenizer.expr();
    expect(result).to.equal(5);
  });
});