import {token, TOKENS} from './interfaces';
import {Tokenizer} from './tokenizer';

export class Interpreter {
  tokenizer: Tokenizer;
  currentToken: token;

  constructor(tokenizer: Tokenizer) {
    this.tokenizer = tokenizer;
    this.currentToken = this.tokenizer.getNextToken();
  }

  protected eat(token: TOKENS): void {
    if (this.currentToken.token === token) {
      this.currentToken = this.tokenizer.getNextToken();
      return;
    }
    throw new Error('Parsing Error, expected: ' + token + ' got: ' + this.currentToken.token);
  }

  protected factor(): number {
    const token = this.currentToken;
    this.eat(TOKENS.INTEGER);
    return <number>token.value;
  }

  public expr() {
    let result = this.factor();
    while (this.currentToken.token === TOKENS.MUL || this.currentToken.token === TOKENS.DIV || this.currentToken.token === TOKENS.PLUS || this.currentToken.token === TOKENS.MINUS) {
      const token = this.currentToken;
      if (token.token === TOKENS.MUL) {
        this.eat(TOKENS.MUL);
        result = result * this.factor();
      } else if (token.token === TOKENS.DIV) {
        this.eat(TOKENS.DIV);
        result = result / this.factor();
      } else if (token.token === TOKENS.PLUS) {
        this.eat(TOKENS.PLUS);
        result = <number>result + <number>this.factor();
      } else if (token.token === TOKENS.MINUS) {
        this.eat(TOKENS.MINUS);
        result = <number>result - <number>this.factor();
      }
    }
    return result;
  }

}