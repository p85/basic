import {token, TOKENS} from '../types/interfaces';
import {Tokenizer} from '../tokenizer/tokenizer';

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
    if (token.token === TOKENS.INTEGER) {
      this.eat(TOKENS.INTEGER);
      return <number>token.value;
    } else if (token.token === TOKENS.LPAREN) {
      this.eat(TOKENS.LPAREN);
      const result = this.expr();
      this.eat(TOKENS.RPAREN);
      return result;
    }

  }

  protected term(): number {
    let result = this.factor();
    while (this.currentToken.token === TOKENS.MUL || this.currentToken.token === TOKENS.DIV) {
      const token = this.currentToken;
      if (token.token === TOKENS.MUL) {
        this.eat(TOKENS.MUL);
        result = result * this.factor();
      } else if (token.token === TOKENS.DIV) {
        this.eat(TOKENS.DIV);
        result = result / this.factor();
      }
    }
    return result;
  }

  public expr() {
    let result = this.term();
    while (this.currentToken.token === TOKENS.PLUS || this.currentToken.token === TOKENS.MINUS) {
      const token = this.currentToken;
      if (token.token === TOKENS.PLUS) {
        this.eat(TOKENS.PLUS);
        result = result + this.term();
      } else if (token.token === TOKENS.MINUS) {
        this.eat(TOKENS.MINUS);
        result = result - this.term();
      }
    }
    return result;
  }

}