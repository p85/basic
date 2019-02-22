import { Parser } from "../Parser/Parser";
import { TOKENS } from "../types/interfaces";
import { nodes, BinOP, Num, UnaryOP, Assign, Var, Str, Print, Goto, Abs, Atn, Beep, NOP, Chr, Cint, Clear, Cos, End, Exp, Hex } from "../ast/ast";


export class Interpreter {
  parser: Parser;
  tree = [];
  vars = {};
  currentLine: number = null;
  constructor(parser: Parser) {
    this.parser = parser;
  }

  protected visit(node: nodes): number | void | string {
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
    } else if (node instanceof Str) {
      return this.visitStr(node);
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
    } else {
      this.genericVisit(node);
    }
  }

  protected genericVisit(node: any): void {
    throw new Error('No visit method: ' + node);
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
    }
  }

  protected visitNum(node: Num): number {
    return node.value;
  }

  protected visitStr(node: Str): string {
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
    if (!val) {
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

  protected resolveLineToIndex(line: number): number {
    let newIndex: number;
    for (let i = 0; i < this.tree.length; i++) {
      if (this.tree[i].token && this.tree[i].token.line && this.tree[i].token.line === line) {
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
    process.exit(0);
  }

  protected visitExp(node: Exp): number {
    return Math.exp(<number>this.visit(node.value));
  }

  protected visitHex(node: Hex): string {
    // return '0' + (<number>this.visit(node.value)).toString(16).slice(-2).toUpperCase();
    return (<number>this.visit(node.value)).toString(16).toUpperCase();
  }

  public interpret(): any {
    this.tree = this.parser.parse();
    const result = [];
    for (let i = 0; i < this.tree.length; i = this.currentLine == null ? i + 1 : this.goToLine()) {
      result.push(this.visit(this.tree[i]));
    }
    return result;
  }
}