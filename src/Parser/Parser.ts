import { token, TOKENS, SYMBOLS } from '../types/interfaces';
import { Tokenizer } from '../tokenizer/tokenizer';
import {
  BinOP, Num, UnaryOP, Var, Assign, Str, Print, Goto, Abs, Atn, Beep, nodes, NOP, Chr, Cint, Clear, Cos, End, Exp, Hex, Inkey, Input, Gosub, Return,
  Instr, Int, Left, Log, Mid, Len, Nint, Oct, R2d
} from '../ast/ast';

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
    } else if (token.token === TOKENS.COS) {
      this.eat(TOKENS.COS);
      this.eat(TOKENS.LPAREN);
      const value = this.expr();
      if (!(value instanceof Num) && !(value instanceof Var) && !(value instanceof UnaryOP)) throw new Error('COS expects a number/Variable');
      const node = new Cos(token, value);
      this.eat(TOKENS.RPAREN);
      return node;
    } else if (token.token === TOKENS.END) {
      this.eat(TOKENS.END);
      const node = new End();
      this.eat(TOKENS.EOL);
      return node;
    } else if (token.token === TOKENS.EXP) {
      this.eat(TOKENS.EXP);
      this.eat(TOKENS.LPAREN);
      const value = this.expr();
      if (!(value instanceof Num) && !(value instanceof Var) && !(value instanceof UnaryOP)) throw new Error('EXP expects a number/Variable');
      const node = new Exp(token, value);
      this.eat(TOKENS.RPAREN);
      return node;
    } else if (token.token === TOKENS.HEX$) {
      this.eat(TOKENS.HEX$);
      this.eat(TOKENS.LPAREN);
      const value = this.expr();
      if (!(value instanceof Num) && !(value instanceof Var) && !(value instanceof BinOP) && !(value instanceof UnaryOP)) throw new Error('HEX$ expects a number/Variable');
      const node = new Hex(token, <Num>value);
      this.eat(TOKENS.RPAREN);
      return node;
    } else if (token.token === TOKENS.INKEY$) {
      this.eat(TOKENS.INKEY$);
      const node = new Inkey();
      return node;
    } else if (token.token === TOKENS.INPUT) {
      this.eat(TOKENS.INPUT);
      const prompt: Str | Num = this.expr();
      if (!(prompt instanceof Str) && !(prompt instanceof Num)) throw new Error('INPUT expects as first Parameter a number/String');
      this.eat(TOKENS.COMMA);
      const variable: Var = this.variable();
      if (!(variable instanceof Var)) throw new Error('INPUT expects as second Parameter a Variable');
      this.eat(TOKENS.EOL);
      const node = new Input(prompt, variable);
      return node;
    } else if (token.token === TOKENS.GOSUB) {
      this.eat(TOKENS.GOSUB);
      const value = this.factor();
      if (!(value instanceof Num)) throw new Error('GOSUB expects a number');
      const node = new Gosub(token, <Num>value);
      this.eat(TOKENS.EOL);
      return node;
    } else if (token.token === TOKENS.RETURN) {
      this.eat(TOKENS.RETURN);
      this.eat(TOKENS.EOL);
      const node = new Return();
      return node;
    } else if (token.token === TOKENS.INSTR) {
      this.eat(TOKENS.INSTR);
      this.eat(TOKENS.LPAREN);
      const value = this.expr();
      if (!(value instanceof Str) && !(value instanceof Var)) throw new Error('INSTR expects as first Parameter a string/Variable');
      this.eat(TOKENS.COMMA);
      const findValue = this.expr();
      if (!(findValue instanceof Str) && !(findValue instanceof Var)) throw new Error('INSTR expects as second Parameter a string/Variable');
      this.eat(TOKENS.COMMA);
      const startPos = this.expr();
      if (!(startPos instanceof Num) && !(startPos instanceof Var)) throw new Error('INSTR expects as third Parameter a number/Variable');
      this.eat(TOKENS.RPAREN);
      const node = new Instr(token, value, findValue, startPos);
      return node;
    } else if (token.token === TOKENS.INT) {
      this.eat(TOKENS.INT);
      this.eat(TOKENS.LPAREN);
      const value = this.expr();
      if (!(value instanceof Num) && !(value instanceof Var)) throw new Error('INT expects as first Parameter a number/Variable');
      this.eat(TOKENS.RPAREN);
      const node = new Int(token, value);
      return node;
    } else if (token.token === TOKENS.LEFT$) {
      this.eat(TOKENS.LEFT$);
      this.eat(TOKENS.LPAREN);
      const value = this.expr();
      if (!(value instanceof Str) && !(value instanceof Var)) throw new Error('LEFT$ expects as first Parameter a string/Variable');
      this.eat(TOKENS.COMMA);
      const amount = this.expr();
      if (!(amount instanceof Num) && !(amount instanceof Var)) throw new Error('LEFT$ expects as first Parameter a number/Variable');
      this.eat(TOKENS.RPAREN);
      const node = new Left(token, value, amount);
      return node;
    } else if (token.token === TOKENS.LET) {
      this.eat(TOKENS.LET);
      const node = this.assign();
      return node;
    } else if (token.token === TOKENS.LOG) {
      this.eat(TOKENS.LOG);
      this.eat(TOKENS.LPAREN);
      const value = this.expr();
      if (!(value instanceof Num) && !(value instanceof Var)) throw new Error('LOG expects as first Parameter a number/Variable');
      this.eat(TOKENS.RPAREN);
      const node = new Log(token, value);
      return node;
    } else if (token.token === TOKENS.MID$) {
      this.eat(TOKENS.MID$);
      this.eat(TOKENS.LPAREN);
      const value = this.expr();
      if (!(value instanceof Str) && !(value instanceof Var)) throw new Error('MID$ expects as first Parameter a string/Variable');
      this.eat(TOKENS.COMMA);
      const startPos = this.expr();
      if (!(startPos instanceof Num) && !(startPos instanceof Var)) throw new Error('MID$ expects as second Parameter a number/Variable');
      this.eat(TOKENS.COMMA);
      const length = this.expr();
      if (!(length instanceof Num) && !(length instanceof Var)) throw new Error('MID$ expects as third Parameter a number/Variable');
      this.eat(TOKENS.RPAREN);
      const node = new Mid(token, value, startPos, length);
      return node;
    } else if (token.token === TOKENS.LEN) {
      this.eat(TOKENS.LEN);
      this.eat(TOKENS.LPAREN);
      const value = this.expr();
      if (!(value instanceof Str) && !(value instanceof Var)) throw new Error('LEN expects as first Parameter a string/Variable');
      this.eat(TOKENS.RPAREN);
      const node = new Len(token, value);
      return node;
    } else if (token.token === TOKENS.NINT) {
      this.eat(TOKENS.NINT);
      this.eat(TOKENS.LPAREN);
      const value = this.expr();
      if (!(value instanceof Num) && !(value instanceof Var)) throw new Error('NINT expects as first Parameter a number/Variable');
      this.eat(TOKENS.RPAREN);
      const node = new Nint(token, value);
      return node;
    } else if (token.token === TOKENS.OCT$) {
      this.eat(TOKENS.OCT$);
      this.eat(TOKENS.LPAREN);
      const value = this.expr();
      if (!(value instanceof Num) && !(value instanceof Var)) throw new Error('OCT$ expects as first Parameter a number/Variable');
      this.eat(TOKENS.RPAREN);
      const node = new Oct(token, value);
      return node;
    } else if (token.token === TOKENS.R2D) {
      this.eat(TOKENS.R2D);
      this.eat(TOKENS.LPAREN);
      const value = this.expr();
      if (!(value instanceof Num) && !(value instanceof Var)) throw new Error('R2D expects as first Parameter a number/Variable');
      this.eat(TOKENS.RPAREN);
      const node = new R2d(token, value);
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