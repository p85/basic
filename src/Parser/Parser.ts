import { token, TOKENS, SYMBOLS } from '../types/interfaces';
import { Tokenizer } from '../tokenizer/tokenizer';
import {
  BinOP, Num, UnaryOP, Var, Assign, Strng, Print, Goto, Abs, Atn, Beep, nodes, NOP, Chr, Cint, Clear, Cos, End, Exp, Hex, Inkey, Input, Gosub, Return,
  Instr, Int, Left, Log, Mid, Len, Nint, Oct, R2d, Right, Rnd, Sgn, Sin, Sleep, Sqr, Str, Tan, Time, Timer, Width, Height, Val, Data, Read, For, Next
} from '../ast/ast';

interface forData {
  startLineNr: number;
  variable: Assign;
  maxValue: Num | Var | BinOP | UnaryOP;
  step: Num | Var | BinOP | UnaryOP;
}

export class Parser {
  tokenizer: Tokenizer;
  currentToken: token;
  private forData: forData[];

  constructor(tokenizer: Tokenizer) {
    this.tokenizer = tokenizer;
    this.currentToken = this.tokenizer.getNextToken();
    this.forData = [];
  }

  protected assign(): Assign {
    const left: Var = this.variable();
    const token: token = this.currentToken;
    this.eat(TOKENS.ASSIGN);
    const right = this.precedence3();
    const node = new Assign(left, token, right);
    return node;
  }

  protected variable(): Var {
    const node = new Var(this.currentToken);
    this.eat(TOKENS.IDENTIFIER);
    return node;
  }

  protected data(): (string | number)[] {
    const dataArgs: (string | number)[] = [];
    while (this.currentToken.token !== TOKENS.EOL) {
      if (this.currentToken.token !== TOKENS.STRING && this.currentToken.token !== TOKENS.INTEGER) throw new Error('DATA only accepts strings/numbers');
      dataArgs.push(this.currentToken.value);
      this.currentToken = this.tokenizer.getNextToken();
      this.eat(TOKENS.COMMA, true);
    }
    return dataArgs;
  }

  protected read(): Var[] {
    const varList: Var[] = [];
    while (this.currentToken.token !== TOKENS.EOL) {
      if (this.currentToken.token !== TOKENS.IDENTIFIER) throw new Error('read only accepts identifiers aka variables');
      varList.push(this.variable());
      this.eat(TOKENS.COMMA, true);
    }
    return varList;
  }

  protected eat(token: TOKENS, isOptional?: boolean): void {
    if (this.currentToken.token === token) {
      this.currentToken = this.tokenizer.getNextToken();
      return;
    } else if (this.currentToken.token !== token && isOptional) {
      // discard it, if its optional
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
      const node = new Strng(token);
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
      const node = this.precedence3();
      this.eat(TOKENS.RPAREN);
      return node;
    } else if (token.token === TOKENS.IDENTIFIER && this.peek() === SYMBOLS.ASSIGN) {
      const node = this.assign();
      return node;
    } else if (token.token === TOKENS.PRINT) { // Commands
      this.eat(TOKENS.PRINT);
      const values = this.precedence3();
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
      const value = this.precedence3();
      if (!(value instanceof Num) && !(value instanceof Var) && !(value instanceof UnaryOP) && !(value instanceof BinOP)) throw new Error('ABS expects a number/Variable');
      const node = new Abs(token, <Num>value);
      this.eat(TOKENS.RPAREN);
      return node;
    } else if (token.token === TOKENS.ATN) {
      this.eat(TOKENS.ATN);
      this.eat(TOKENS.LPAREN);
      const value = this.precedence3();
      if (!(value instanceof Num) && !(value instanceof Var) && !(value instanceof UnaryOP) && !(value instanceof BinOP)) throw new Error('ATN expects a number/Variable');
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
      const value = this.precedence3();
      if (!(value instanceof Num) && !(value instanceof Var) && !(value instanceof BinOP) && !(value instanceof UnaryOP)) throw new Error('CHR$ expects a number/Variable');
      const node = new Chr(token, <Num>value);
      this.eat(TOKENS.RPAREN);
      return node;
    } else if (token.token === TOKENS.CINT) {
      this.eat(TOKENS.CINT);
      this.eat(TOKENS.LPAREN);
      const value = this.precedence3();
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
      const value = this.precedence3();
      if (!(value instanceof Num) && !(value instanceof Var) && !(value instanceof UnaryOP) && !(value instanceof BinOP)) throw new Error('COS expects a number/Variable');
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
      const value = this.precedence3();
      if (!(value instanceof Num) && !(value instanceof Var) && !(value instanceof UnaryOP) && !(value instanceof BinOP)) throw new Error('EXP expects a number/Variable');
      const node = new Exp(token, value);
      this.eat(TOKENS.RPAREN);
      return node;
    } else if (token.token === TOKENS.HEX$) {
      this.eat(TOKENS.HEX$);
      this.eat(TOKENS.LPAREN);
      const value = this.precedence3();
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
      const prompt: Strng | Num = this.precedence3();
      if (!(prompt instanceof Strng) && !(prompt instanceof Num)) throw new Error('INPUT expects as first Parameter a number/String');
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
      const value = this.precedence3();
      if (!(value instanceof Strng) && !(value instanceof Var)) throw new Error('INSTR expects as first Parameter a string/Variable');
      this.eat(TOKENS.COMMA);
      const findValue = this.precedence3();
      if (!(findValue instanceof Strng) && !(findValue instanceof Var)) throw new Error('INSTR expects as second Parameter a string/Variable');
      this.eat(TOKENS.COMMA);
      const startPos = this.precedence3();
      if (!(startPos instanceof Num) && !(startPos instanceof Var) && !(value instanceof UnaryOP) && !(value instanceof BinOP)) throw new Error('INSTR expects as third Parameter a number/Variable');
      this.eat(TOKENS.RPAREN);
      const node = new Instr(token, value, findValue, startPos);
      return node;
    } else if (token.token === TOKENS.INT) {
      this.eat(TOKENS.INT);
      this.eat(TOKENS.LPAREN);
      const value = this.precedence3();
      if (!(value instanceof Num) && !(value instanceof Var) && !(value instanceof UnaryOP) && !(value instanceof BinOP)) throw new Error('INT expects as first Parameter a number/Variable');
      this.eat(TOKENS.RPAREN);
      const node = new Int(token, value);
      return node;
    } else if (token.token === TOKENS.LEFT$) {
      this.eat(TOKENS.LEFT$);
      this.eat(TOKENS.LPAREN);
      const value = this.precedence3();
      if (!(value instanceof Strng) && !(value instanceof Var)) throw new Error('LEFT$ expects as first Parameter a string/Variable');
      this.eat(TOKENS.COMMA);
      const amount = this.precedence3();
      if (!(amount instanceof Num) && !(amount instanceof Var) && !(value instanceof UnaryOP) && !(value instanceof BinOP)) throw new Error('LEFT$ expects as first Parameter a number/Variable');
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
      const value = this.precedence3();
      if (!(value instanceof Num) && !(value instanceof Var) && !(value instanceof UnaryOP) && !(value instanceof BinOP)) throw new Error('LOG expects as first Parameter a number/Variable');
      this.eat(TOKENS.RPAREN);
      const node = new Log(token, value);
      return node;
    } else if (token.token === TOKENS.MID$) {
      this.eat(TOKENS.MID$);
      this.eat(TOKENS.LPAREN);
      const value = this.precedence3();
      if (!(value instanceof Strng) && !(value instanceof Var)) throw new Error('MID$ expects as first Parameter a string/Variable');
      this.eat(TOKENS.COMMA);
      const startPos = this.precedence3();
      if (!(startPos instanceof Num) && !(startPos instanceof Var) && !(value instanceof UnaryOP) && !(value instanceof BinOP)) throw new Error('MID$ expects as second Parameter a number/Variable');
      this.eat(TOKENS.COMMA);
      const length = this.precedence3();
      if (!(length instanceof Num) && !(length instanceof Var) && !(value instanceof UnaryOP) && !(value instanceof BinOP)) throw new Error('MID$ expects as third Parameter a number/Variable');
      this.eat(TOKENS.RPAREN);
      const node = new Mid(token, value, startPos, length);
      return node;
    } else if (token.token === TOKENS.LEN) {
      this.eat(TOKENS.LEN);
      this.eat(TOKENS.LPAREN);
      const value = this.precedence3();
      if (!(value instanceof Strng) && !(value instanceof Var) && !(value instanceof UnaryOP) && !(value instanceof BinOP)) throw new Error('LEN expects as first Parameter a string/Variable');
      this.eat(TOKENS.RPAREN);
      const node = new Len(token, value);
      return node;
    } else if (token.token === TOKENS.NINT) {
      this.eat(TOKENS.NINT);
      this.eat(TOKENS.LPAREN);
      const value = this.precedence3();
      if (!(value instanceof Num) && !(value instanceof Var) && !(value instanceof UnaryOP) && !(value instanceof BinOP)) throw new Error('NINT expects as first Parameter a number/Variable');
      this.eat(TOKENS.RPAREN);
      const node = new Nint(token, value);
      return node;
    } else if (token.token === TOKENS.OCT$) {
      this.eat(TOKENS.OCT$);
      this.eat(TOKENS.LPAREN);
      const value = this.precedence3();
      if (!(value instanceof Num) && !(value instanceof Var) && !(value instanceof UnaryOP) && !(value instanceof BinOP)) throw new Error('OCT$ expects as first Parameter a number/Variable');
      this.eat(TOKENS.RPAREN);
      const node = new Oct(token, value);
      return node;
    } else if (token.token === TOKENS.R2D) {
      this.eat(TOKENS.R2D);
      this.eat(TOKENS.LPAREN);
      const value = this.precedence3();
      if (!(value instanceof Num) && !(value instanceof Var) && !(value instanceof UnaryOP) && !(value instanceof BinOP)) throw new Error('R2D expects as first Parameter a number/Variable');
      this.eat(TOKENS.RPAREN);
      const node = new R2d(token, value);
      return node;
    } else if (token.token === TOKENS.RIGHT$) {
      this.eat(TOKENS.RIGHT$);
      this.eat(TOKENS.LPAREN);
      const value = this.precedence3();
      if (!(value instanceof Strng) && !(value instanceof Var)) throw new Error('RIGHT$ expects as first Parameter a string/Variable');
      this.eat(TOKENS.COMMA);
      const amount = this.precedence3();
      if (!(amount instanceof Num) && !(amount instanceof Var) && !(value instanceof UnaryOP) && !(value instanceof BinOP)) throw new Error('RIGHT$ expects as second Parameter a number/Variable');
      this.eat(TOKENS.RPAREN);
      const node = new Right(token, value, amount);
      return node;
    } else if (token.token === TOKENS.RND) {
      this.eat(TOKENS.RND);
      this.eat(TOKENS.LPAREN, true);
      this.eat(TOKENS.INTEGER, true);
      this.eat(TOKENS.RPAREN, true);
      const node = new Rnd();
      return node;
    } else if (token.token === TOKENS.SGN) {
      this.eat(TOKENS.SGN);
      this.eat(TOKENS.LPAREN);
      const value = this.precedence3();
      if (!(value instanceof Num) && !(value instanceof Var) && !(value instanceof UnaryOP) && !(value instanceof BinOP)) throw new Error('SGN expects as first Parameter a number/Variable');
      this.eat(TOKENS.RPAREN);
      const node = new Sgn(token, value);
      return node;
    } else if (token.token === TOKENS.SIN) {
      this.eat(TOKENS.SIN);
      this.eat(TOKENS.LPAREN);
      const value = this.precedence3();
      if (!(value instanceof Num) && !(value instanceof Var) && !(value instanceof UnaryOP) && !(value instanceof BinOP)) throw new Error('SIN expects as first Parameter a number/Variable');
      this.eat(TOKENS.RPAREN);
      const node = new Sin(token, value);
      return node;
    } else if (token.token === TOKENS.SLEEP) {
      this.eat(TOKENS.SLEEP);
      const value = this.precedence3();
      if (!(value instanceof Num) && !(value instanceof Var) && !(value instanceof UnaryOP) && !(value instanceof BinOP)) throw new Error('SLEEP expects as first Parameter a number/Variable');
      this.eat(TOKENS.EOL);
      const node = new Sleep(token, value);
      return node;
    } else if (token.token === TOKENS.SQR) {
      this.eat(TOKENS.SQR);
      this.eat(TOKENS.LPAREN);
      const value = this.precedence3();
      if (!(value instanceof Num) && !(value instanceof Var) && !(value instanceof UnaryOP) && !(value instanceof BinOP)) throw new Error('SQR expects as first Parameter a number/Variable');
      this.eat(TOKENS.RPAREN);
      const node = new Sqr(token, value);
      return node;
    } else if (token.token === TOKENS.STR$) {
      this.eat(TOKENS.STR$);
      this.eat(TOKENS.LPAREN);
      const value = this.precedence3();
      if (!(value instanceof Num) && !(value instanceof Var) && !(value instanceof UnaryOP) && !(value instanceof BinOP)) throw new Error('STR$ expects as first Parameter a number/Variable');
      this.eat(TOKENS.RPAREN);
      const node = new Str(token, value);
      return node;
    } else if (token.token === TOKENS.TAN) {
      this.eat(TOKENS.TAN);
      this.eat(TOKENS.LPAREN);
      const value = this.precedence3();
      if (!(value instanceof Num) && !(value instanceof Var) && !(value instanceof UnaryOP) && !(value instanceof BinOP)) throw new Error('SQR expects as first Parameter a number/Variable');
      this.eat(TOKENS.RPAREN);
      const node = new Tan(token, value);
      return node;
    } else if (token.token === TOKENS.TIME$) {
      this.eat(TOKENS.TIME$);
      const node = new Time();
      return node;
    } else if (token.token === TOKENS.TIMER) {
      this.eat(TOKENS.TIMER);
      const node = new Timer();
      return node;
    } else if (token.token === TOKENS.WIDTH) {
      this.eat(TOKENS.WIDTH);
      const node = new Width();
      return node;
    } else if (token.token === TOKENS.HEIGHT) {
      this.eat(TOKENS.HEIGHT);
      const node = new Height();
      return node;
    } else if (token.token === TOKENS.VAL) {
      this.eat(TOKENS.VAL);
      this.eat(TOKENS.LPAREN);
      const value = this.precedence3();
      if (!(value instanceof Strng) && !(value instanceof Var)) throw new Error('VAL expects as first Parameter a string/Variable');
      this.eat(TOKENS.RPAREN);
      const node = new Val(token, value);
      return node;
    } else if (token.token === TOKENS.DATA) {
      this.eat(TOKENS.DATA);
      const dataArgs = this.data();
      this.eat(TOKENS.EOL);
      const node = new Data(token, dataArgs);
      return node;
    } else if (token.token === TOKENS.READ) {
      this.eat(TOKENS.READ);
      const varList = this.read();
      this.eat(TOKENS.EOL);
      const node = new Read(token, varList);
      return node;
    } else if (token.token === TOKENS.FOR) {
      const forStartLineNr = token.line;
      this.eat(TOKENS.FOR);
      const variable: Assign = this.assign();
      this.eat(TOKENS.TO);
      const max = this.precedence3();
      if (!(max instanceof Num) && !(max instanceof Var) && !(max instanceof BinOP) && !(max instanceof UnaryOP)) throw new Error('FOR...TO n should be a number/variable');
      this.eat(TOKENS.STEP); // omit optional
      const step = this.precedence3();
      if (!(step instanceof Num) && !(step instanceof Var) && !(step instanceof BinOP) && !(step instanceof UnaryOP)) throw new Error('FOR STEP should be a number/variable');
      this.eat(TOKENS.EOL);
      this.forData.push({startLineNr: forStartLineNr, variable: variable, maxValue: max, step: step});
      const node = new For(token, variable);
      return node;
    } else if (token.token === TOKENS.NEXT) {
      this.eat(TOKENS.NEXT);
      const variable: Var = this.variable();
      if (this.forData.length === 0) throw new Error('NEXT without FOR');
      const forDat = this.forData.pop();
      const node = new Next(token, variable, forDat.startLineNr, forDat.maxValue, forDat.step);
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

  protected precedence1(): nodes {
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

  protected precedence2(): nodes {
    let node: nodes = this.precedence1();
    while (this.currentToken.token === TOKENS.PLUS || this.currentToken.token === TOKENS.MINUS) {
      const token = this.currentToken;
      if (token.token === TOKENS.PLUS) {
        this.eat(TOKENS.PLUS);
      } else if (token.token === TOKENS.MINUS) {
        this.eat(TOKENS.MINUS);
      }
      node = new BinOP(node, token.token, this.precedence1());
    }
    return node;
  }

  protected precedence3(): nodes {
    let node: nodes = this.precedence2();
    while (this.currentToken.token === TOKENS.AND || this.currentToken.token === TOKENS.OR) {
      const token = this.currentToken;
      if (token.token === TOKENS.AND) {
        this.eat(TOKENS.AND);
      } else if (token.token === TOKENS.OR) {
        this.eat(TOKENS.OR);
      }
      node = new BinOP(node, token.token, this.precedence2());
    }
    return node;
  }

  public parse(): nodes[] {
    const asts: nodes[] = [];
    asts.push(this.precedence3());
    while (this.tokenizer.position !== this.tokenizer.text.length) {
      asts.push(this.precedence3());
    }
    return asts;
  }

}