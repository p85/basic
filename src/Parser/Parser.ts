import { token, TOKENS, SYMBOLS } from '../types/interfaces';
import { Tokenizer } from '../tokenizer/tokenizer';
import { BinOP, Num, UnaryOP, Var, Assign, Str, Print, Goto, Abs, Atn, Beep, nodes, NOP, Chr, Cint, Clear } from '../ast/ast';

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

  protected factor(): nodes {
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
    } else if (token.token === TOKENS.PRINT) { // Commands
      this.eat(TOKENS.PRINT);
      const values = this.expr();
      this.eat(TOKENS.EOL);
      const node = new Print(token, values);
      return node;
    } else if (token.token === TOKENS.GOTO) {
      this.eat(TOKENS.GOTO);
      const value = this.factor();
      if (!(value instanceof Num)) throw new Error('GOTO expects a number');
      const node = new Goto(token, <Num>value);
      return node;
    } else if (token.token === TOKENS.ABS) {
      this.eat(TOKENS.ABS);
      this.eat(TOKENS.LPAREN);
      const value = this.expr();
      if (!(value instanceof Num) && !(value instanceof Var) && !(value instanceof UnaryOP)) throw new Error('ABS expects a number/Variable');
      const node = new Abs(token, <Num>value);
      this.eat(TOKENS.RPAREN);
      return node;
    } else if (token.token === TOKENS.ATN) {
      this.eat(TOKENS.ATN);
      this.eat(TOKENS.LPAREN);
      const value = this.expr();
      if (!(value instanceof Num) && !(value instanceof Var) && !(value instanceof UnaryOP)) throw new Error('ATN expects a number/Variable');
      const node = new Atn(token, <Num>value);
      this.eat(TOKENS.RPAREN);
      return node;
    } else if (token.token === TOKENS.BEEP) {
      this.eat(TOKENS.BEEP);
      const node = new Beep(token);
      return node;
    } else if (token.token === TOKENS.CHR$) {
      this.eat(TOKENS.CHR$);
      this.eat(TOKENS.LPAREN);
      const value = this.expr();
      if (!(value instanceof Num) && !(value instanceof Var) && !(value instanceof BinOP) && !(value instanceof UnaryOP)) throw new Error('CHR$ expects a number/Variable');
      const node = new Chr(token, <Num>value);
      this.eat(TOKENS.RPAREN);
      return node;
    } else if (token.token === TOKENS.CINT) {
      this.eat(TOKENS.CINT);
      this.eat(TOKENS.LPAREN);
      const value = this.expr();
      if (!(value instanceof Num) && !(value instanceof Var) && !(value instanceof BinOP) && !(value instanceof UnaryOP)) throw new Error('CINT expects a number/Variable');
      const node = new Cint(token, value);
      this.eat(TOKENS.RPAREN);
      return node;
    } else if (token.token === TOKENS.CLEAR) {
      this.eat(TOKENS.CLEAR);
      const node = new Clear();
      this.eat(TOKENS.EOL);
      return node;
    } else if (token.token === TOKENS.EOL) { // Commands End
      this.eat(TOKENS.EOL);
      const node = new NOP();
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

  protected term(): nodes {
    let node: any = this.factor();
    while (this.currentToken.token === TOKENS.MUL || this.currentToken.token === TOKENS.DIV || this.currentToken.token === TOKENS.MOD) {
      const token = this.currentToken;
      if (token.token === TOKENS.MUL) {
        this.eat(TOKENS.MUL);
      } else if (token.token === TOKENS.DIV) {
        this.eat(TOKENS.DIV);
      } else if (token.token === TOKENS.MOD) {
        this.eat(TOKENS.MOD);
      }
      node = new BinOP(node, token.token, this.factor());
    }
    return node;
  }

  protected expr(): nodes {
    let node: nodes = this.term();
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

  public parse(): nodes[] {
    const asts: nodes[] = [];
    asts.push(this.expr());
    while (this.tokenizer.position !== this.tokenizer.text.length) {
      asts.push(this.expr());
    }
    return asts;
  }

}