import { token, TOKENS, SYMBOLS } from '../types/interfaces';
import { Tokenizer } from '../tokenizer/tokenizer';
import { BinOP, Num, UnaryOP, Var, Assign, Str } from '../ast/ast';

export class Parser {
  tokenizer: Tokenizer;
  currentToken: token;

  constructor(tokenizer: Tokenizer) {
    this.tokenizer = tokenizer;
    this.currentToken = this.tokenizer.getNextToken();
  }

  protected assign(): Assign {
    const left: Var = this.variable();
    const token: token = this.currentToken;
    this.eat(TOKENS.ASSIGN);
    const right = this.expr();
    const node = new Assign(left, token, right);
    return node;
  }

  protected variable(): Var {
    const node = new Var(this.currentToken);
    this.eat(TOKENS.IDENTIFIER);
    return node;
  }

  protected eat(token: TOKENS): void {
    if (this.currentToken.token === token) {
      this.currentToken = this.tokenizer.getNextToken();
      return;
    }
    throw new Error('Parsing Error, expected: ' + token + ' got: ' + this.currentToken.token);
  }

  protected factor(): Num | BinOP | UnaryOP | Var | Assign {
    const token = this.currentToken;
    if (token.token === TOKENS.PLUS) {
      this.eat(TOKENS.PLUS);
      const node = new UnaryOP(token, this.factor());
      return node;
    } else if (token.token === TOKENS.STRING) {
      this.eat(TOKENS.STRING);
      const node = new Str(token);
      return node;
    } else if (token.token === TOKENS.MINUS) {
      this.eat(TOKENS.MINUS);
      const node = new UnaryOP(token, this.factor());
      return node;
    } else if (token.token === TOKENS.INTEGER) {
      this.eat(TOKENS.INTEGER);
      return new Num(token);
    } else if (token.token === TOKENS.LPAREN) {
      this.eat(TOKENS.LPAREN);
      const node = this.expr();
      this.eat(TOKENS.RPAREN);
      return node;
    } else if (token.token === TOKENS.IDENTIFIER && this.peek() === SYMBOLS.ASSIGN) {
      const node = this.assign();
      return node;
    } else {
      const node = this.variable();
      return node;
    }
  }

  protected peek(): string {
    const peekPos = this.tokenizer.position + 1;
    if (peekPos > this.tokenizer.text.length - 1) {
      return SYMBOLS.NONE;
    } else {
      return this.tokenizer.text.charAt(peekPos);
    }
  }

  protected term(): BinOP {
    let node: any = this.factor();
    while (this.currentToken.token === TOKENS.MUL || this.currentToken.token === TOKENS.DIV) {
      const token = this.currentToken;
      if (token.token === TOKENS.MUL) {
        this.eat(TOKENS.MUL);
      } else if (token.token === TOKENS.DIV) {
        this.eat(TOKENS.DIV);
      }
      node = new BinOP(node, token.token, this.factor());
    }
    return node;
  }

  protected expr(): Num | BinOP | UnaryOP {
    let node: Num | BinOP | UnaryOP = this.term();
    while (this.currentToken.token === TOKENS.PLUS || this.currentToken.token === TOKENS.MINUS) {
      const token = this.currentToken;
      if (token.token === TOKENS.PLUS) {
        this.eat(TOKENS.PLUS);
      } else if (token.token === TOKENS.MINUS) {
        this.eat(TOKENS.MINUS);
      }
      node = new BinOP(node, token.token, this.term());
    }
    return node;
  }

  public parse(): Num | BinOP | UnaryOP {
    return this.expr();
  }

}