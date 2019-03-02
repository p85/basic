import { Parser } from "../Parser/Parser";
import { TOKENS, token } from "../types/interfaces";
import {
  nodes, BinOP, Num, UnaryOP, Assign, Var, Strng, Print, Goto, Abs, Atn, Beep, NOP, Chr, Cint, Clear, Cos, End, Exp, Hex, Inkey, Input, Gosub, Return,
  Instr, Int, Left, Log, Mid, Len, Nint, Oct, R2d, Right, Rnd, Sgn, Sin, Sleep, Sqr, Str, Tan, Time, Timer, Width, Height, Val, Data, Read, For, Next,
  If, IfCondition, And, Or
} from "../ast/ast";
import { readSync } from 'fs';


export class Interpreter {
  parser: Parser;
  tree: nodes[] = [];
  vars = {};
  gosubReturns: number[] = []; 
  data: (string | number)[] = [];
  currentLine: number = null;
  finished: boolean = false;
  constructor(parser: Parser) {
    this.parser = parser;
  }

  protected visit(node: nodes): number | void | string | any {
    if (node instanceof BinOP) {
      return this.visitBinOp(node);
    } else if (node instanceof Num) {
      return this.visitNum(node);
    } else if (node instanceof UnaryOP) {
      return this.visitUnaryOp(node);
    } else if (node instanceof Assign) {
      return this.visitAssign(node);
    } else if (node instanceof Var) {
      return this.visitVar(node);
    } else if (node instanceof Strng) {
      return this.visitStrng(node);
    } else if (node instanceof Print) {
      return this.visitPrint(node);
    } else if (node instanceof Goto) {
      return this.visitGoto(node);
    } else if (node instanceof Abs) {
      return this.visitAbs(node);
    } else if (node instanceof Atn) {
      return this.visitAtn(node);
    } else if (node instanceof NOP) {
      return;
    } else if (node instanceof Chr) {
      return this.visitChr(node);
    } else if (node instanceof Cint) {
      return this.visitCint(node);
    } else if (node instanceof Cos) {
      return this.visitCos(node);
    } else if (node instanceof End) {
      return this.visitEnd(node);
    } else if (node instanceof Exp) {
      return this.visitExp(node);
    } else if (node instanceof Hex) {
      return this.visitHex(node);
    } else if (node instanceof Inkey) {
      return this.visitInkey(node);
    } else if (node instanceof Input) {
      return this.visitInput(node);
    } else if (node instanceof Gosub) {
      return this.visitGosub(node);
    } else if (node instanceof Return) {
      return this.visitReturn(node);
    } else if (node instanceof Instr) {
      return this.visitInstr(node);
    } else if (node instanceof Int) {
      return this.visitInt(node);
    } else if (node instanceof Left) {
      return this.visitLeft(node);
    } else if (node instanceof Log) {
      return this.visitLog(node);
    } else if (node instanceof Mid) {
      return this.visitMid(node);
    } else if (node instanceof Len) {
      return this.visitLen(node);
    } else if (node instanceof Nint) {
      return this.visitNint(node);
    } else if (node instanceof Oct) {
      return this.visitOct(node);
    } else if (node instanceof R2d) {
      return this.visitR2d(node);
    } else if (node instanceof Right) {
      return this.visitRight(node);
    } else if (node instanceof Rnd) {
      return this.visitRnd(node);
    } else if (node instanceof Sgn) {
      return this.visitSgn(node);
    } else if (node instanceof Sin) {
      return this.visitSin(node);
    } else if (node instanceof Sleep) {
      return this.visitSleep(node);
    } else if (node instanceof Sqr) {
      return this.visitSqr(node);
    } else if (node instanceof Str) {
      return this.visitStr(node);
    } else if (node instanceof Tan) {
      return this.visitTan(node);
    } else if (node instanceof Time) {
      return this.visitTime(node);
    } else if (node instanceof Timer) {
      return this.visitTimer(node);
    } else if (node instanceof Width) {
      return this.visitWidth(node);
    } else if (node instanceof Height) {
      return this.visitHeight(node);
    } else if (node instanceof Val) {
      return this.visitVal(node);
    } else if (node instanceof Data) {
      return this.visitData(node);
    } else if (node instanceof Read) {
      return this.visitRead(node);
    } else if (node instanceof For) {
      return this.visitFor(node);
    } else if (node instanceof Next) {
      return this.visitNext(node);
    } else if (node instanceof If) {
      return this.visitIf(node);
    } else {
      this.genericVisit(node);
    }
  }

  protected genericVisit(node: any): void {
    throw new Error('No visit method: ' + node.token);
  }

  protected visitBinOp(node: BinOP): number {
    if (node.token === TOKENS.PLUS) {
      return <number>this.visit(node.left) + <number>this.visit(node.right);
    } else if (node.token === TOKENS.MINUS) {
      return <number>this.visit(node.left) - <number>this.visit(node.right);
    } else if (node.token === TOKENS.MUL) {
      return <number>this.visit(node.left) * <number>this.visit(node.right);
    } else if (node.token === TOKENS.DIV) {
      return <number>this.visit(node.left) / <number>this.visit(node.right);
    } else if (node.token === TOKENS.MOD) {
      return <number>this.visit(node.left) % <number>this.visit(node.right);
    } else if (node.token === TOKENS.AND) {
      return <number>this.visit(node.left) & <number>this.visit(node.right);
    } else if (node.token === TOKENS.OR) {
      return <number>this.visit(node.left) | <number>this.visit(node.right);
    } else {
      throw new Error('visitBinOP: Unknown token: ' + node.token);
    }
  }

  protected visitNum(node: Num): number {
    return node.value;
  }

  protected visitStrng(node: Strng): string {
    return node.value;
  }

  protected visitUnaryOp(node: UnaryOP): number {
    const type = node.token.token;
    if (type === TOKENS.PLUS) {
      return +this.visit(node.value);
    } else if (type === TOKENS.MINUS) {
      return -this.visit(node.value);
    }
  }

  protected visitAssign(node: Assign): void {
    const varName = node.left.value;
    this.vars[varName] = this.visit(node.right);
  }

  protected visitVar(node: Var): string | number {
    const varName = node.value;
    const val = this.vars[varName];
    if (val == null || val == undefined) {
      throw new Error('var not set: ' + varName);
    } else {
      return val;
    }
  }

  protected visitPrint(node: Print): void | string | number {
    const result = this.visit(node.value);
    console.log(result);
    return result;
  }

  protected visitGoto(node: Goto): void {
    const newLine = node.value.value;
    const newIndex = this.resolveLineToIndex(newLine);
    if (newIndex == null) throw new Error('visitGoto did not return a index number');
    this.currentLine = newIndex;
  }

  protected visitGosub(node: Gosub): void {
    this.gosubReturns.push(node.token.line); // next line
    const newLine = node.value.value;
    const newIndex = this.resolveLineToIndex(newLine);
    if (newIndex == null) throw new Error('visitGosub did not return a index number');
    this.currentLine = newIndex;
  }

  protected visitReturn(node: Return): void {
    if (this.gosubReturns.length === 0) throw new Error('RETURN without GOSUB');
    const newLine = this.gosubReturns.pop();
    const newIndex = this.resolveLineToIndex(newLine, true);
    this.currentLine = newIndex;
  }

  protected resolveLineToIndex(line: number, next?: boolean): number {
    let newIndex: number;
    let wasLast: boolean = false;
    for (let i = 0; i < this.tree.length; i++) {
      if (this.tree[i].token && this.tree[i].token.line && this.tree[i].token.line === line) {
        newIndex = i;
        wasLast = true;
        if (!next) break;
        continue;
      }
      if (next && wasLast) {
        newIndex = i;
        break;
      }
    }
    return newIndex;
  }

  protected goToLine(): number {
    const li = this.currentLine;
    this.currentLine = null;
    return li;
  }

  protected visitAbs(node: Abs): number {
    return Math.abs(<number>this.visit(node.value));
  }

  protected visitAtn(node: Atn): number {
    return Math.atan(<number>this.visit(node.value));
  }

  protected visitBeep(node: Beep): void {
    console.log(0x07);
  }

  protected visitChr(node: Chr): string {
    return String.fromCharCode(<number>this.visit(node.value));
  }

  protected visitCint(node: Cint): number {
    return Math.round(<number>this.visit(node.value));
  }

  protected visitClear(node: Clear): void {
    this.vars = {};
  }

  protected visitCos(node: Cos): number {
    return Math.cos(<number>this.visit(node.value));
  }

  protected visitEnd(node: End): void {
    //process.exit(0);
    this.finished = true;
  }

  protected visitExp(node: Exp): number {
    return Math.exp(<number>this.visit(node.value));
  }

  protected visitHex(node: Hex): string {
    return (<number>this.visit(node.value)).toString(16).toUpperCase();
  }

  protected visitInkey(node: Inkey): string { // TODO: How to read a single character?
    const buffer = new Buffer(8);
    readSync(process.stdin['fd'], buffer, 0, buffer.length, null);
    return buffer.toString();
  }

  protected visitInput(node: Input): string {
    const buffer = new Buffer(8);
    const prompt: string = String(this.visit(node.prompt));
    process.stdout.write(prompt);
    readSync(process.stdin['fd'], buffer, 0, buffer.length, null);
    const value = buffer.toString().trim();
    this.vars[node.variable.value] = value;
    return value;
  }

  protected visitInstr(node: Instr): number {
    const value = <string>this.visit(node.value);
    const findValue = <string>this.visit(node.findValue);
    const startPos = <number>this.visit(node.startPos);
    return value.indexOf(findValue, startPos || 0);
  }

  protected visitInt(node: Int): number {
    return <number>this.visit(node.value) | 0;
  }

  protected visitLeft(node: Left): string {
    const value = <string>this.visit(node.value);
    const howMany = <number>this.visit(node.amount);
    return value.substring(0, howMany);
  }

  protected visitLog(node: Log): number {
    const value = <number>this.visit(node.value);
    return Math.log(value);
  }

  protected visitMid(node: Mid): string {
    const value = <string>this.visit(node.value);
    const startPos = <number>this.visit(node.startPos);
    const length = <number>this.visit(node.length) || value.length;
    return value.substring(startPos, startPos + length);
  }

  protected visitLen(node: Len): number {
    const value = <string>this.visit(node.value);
    return value.length;
  }

  protected visitNint(node: Nint): number {
    const value = <number>this.visit(node.value);
    // special case for nint
    if ((value % 1) > 0.5) {
      return Math.ceil(value);
    } else {
      return Math.floor(value);
    }
  }

  protected visitOct(node: Oct): number {
    const value = <number>this.visit(node.value);
    return parseInt(value.toString(8));
  }

  protected visitR2d(node: R2d): number {
    const value = <number>this.visit(node.value);
    return value * 180 / Math.PI;
  }

  protected visitRight(node: Right): string {
    const value = <string>this.visit(node.value);
    const amount = <number>this.visit(node.amount);
    return value.substring(value.length - amount, value.length);
  }

  protected visitRnd(node: Rnd): number {
    return Math.random();
  }

  protected visitSgn(node: Sgn): number {
    const value = <number>this.visit(node.value);
    return Math['sign'](value); // TODO: Mocha cannot find sign in Math
  }

  protected visitSin(node: Sin): number {
    const value = <number>this.visit(node.value);
    return Math.sin(value);
  }

  protected visitSleep(node: Sleep): void {
    const value = <number>this.visit(node.value);
    const wait = new Date(new Date().getTime() + value * 1000);
    while (wait > new Date()) { }
    return;
  }

  protected visitSqr(node: Sqr): number {
    const value = <number>this.visit(node.value);
    return Math.sqrt(value);
  }

  protected visitStr(node: Str): string {
    const value = <number>this.visit(node.value);
    return value.toString();
  }

  protected visitTan(node: Tan): number {
    const value = <number>this.visit(node.value);
    return Math.tan(value);
  }

  protected visitTime(node: Time): string {
    return new Date().toLocaleTimeString();
  }

  protected visitTimer(node: Timer): number {
    return Math['trunc']((<any>new Date() - new Date().setHours(0, 0, 0, 0)) / 1000);   // TODO: mocha breaks on math.trunc
  }

  protected visitWidth(node: Width): number {
    return process.stdout.columns;
  }

  protected visitHeight(node: Height): number {
    return process.stdout.rows;
  }

  protected visitVal(node: Val): number {
    const value = <string>this.visit(node.value);
    return parseFloat(value);
  }

  protected visitData(node: Data): void {
    this.data = this.data.concat(node.value);
  }

  protected visitRead(node: Read): void {
    node.value.forEach(v => {
      this.vars[v.value] = this.data.shift();
    });
  }

  protected visitFor(node: For): void {
    this.visit(node.variable);
  }

  protected visitNext(node: Next): void {
    const varName = node.variable.value;
    const mv = <number>this.visit(node.maxValue);
    const step = <number>this.visit(node.step);
    if (this.vars[varName] !== mv) {
      // loop
      const newIndex = this.resolveLineToIndex(node.startsOnLine, true);
      this.currentLine = newIndex;
      this.vars[varName] += step;
    } else {
      // fin, do nothing
    }
  }

  protected visitIf(node: If): string | number {
    if (node.conditions.length === 1 && node.conditions[0] instanceof IfCondition) {
      // only one single condition
      const condition: IfCondition = node.conditions[0];
      const isSimpleIfCondition = node.conditions.some(n => n instanceof IfCondition);
      if (!isSimpleIfCondition) throw new Error('visitIf: If Statement with Single Condition can not have AND/OR, should be Simple If Condition');
      const result = this.checkIfCondition(condition);
      if (result) {
        return this.visit(node.expr);
      }
    } else if (node.conditions.length > 1) {
      // have multiple conditions
      const hasOnlyAndOr = node.conditions.some(n => n instanceof And || n instanceof Or);
      if (!hasOnlyAndOr) throw new Error('visitIf: If Statement with Multiple Conditions can not have simple IfCondition, should have AND/OR');

    } else {
      throw new Error('visitIf: something went wrong');
    }
    return;
  }

  protected checkIfCondition(condition: IfCondition): boolean {
    const leftValue = this.visit(condition.left);
    const rightValue = this.visit(condition.right);
    switch (condition.token.token) {
      case TOKENS.EQUALS: return leftValue == rightValue;
      case TOKENS.NOTEQUAL: return leftValue != rightValue;
      case TOKENS.GREATER: return leftValue > rightValue;
      case TOKENS.LOWER: return leftValue < rightValue;
      case TOKENS.GREATEREQUAL: return leftValue >= rightValue;
      case TOKENS.LOWEREQUAL: return leftValue <= rightValue;
      default: throw new Error('checkIfCondition: Unknown Comparator: ' + condition.token);
    }
  }

  public interpret(): any {
    this.tree = this.parser.parse();
    const result = [];
    for (let i = 0; i < this.tree.length; i = this.currentLine == null ? i + 1 : this.goToLine()) {
      result.push(this.visit(this.tree[i]));
      if (this.finished) break;
    }
    return result;
  }
}