import { Parser } from "../Parser/Parser";
import { TOKENS } from "../types/interfaces";
import { BinOP, Num, UnaryOP, Assign, Var } from "../ast/ast";


export class Interpreter {
  parser: Parser;
  tree;
  vars = {};
  constructor(parser: Parser) {
    this.parser = parser;
  }

  protected visit(node: Num | BinOP | UnaryOP | Var | Assign): number | void | string {
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
    } else {
      this.genericVisit(node);
    }
  }
  
  protected genericVisit(node: Num | BinOP | UnaryOP | Var | Assign): void {
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
    }
  }

  protected visitNum(node: Num): number {
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
      throw new Error('var not set: ' + node.token.token);
    } else {
      return val;
    }
  }

  public interpret() {
    this.tree = this.parser.parse();
    return this.visit(this.tree);
  }
}