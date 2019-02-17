import { Parser } from "../Parser/Parser";
import { TOKENS } from "../types/interfaces";
import { BinOP, Num, UnaryOP, Assign, Var, Str, Print } from "../ast/ast";


export class Interpreter {
  parser: Parser;
  tree;
  vars = {};
  constructor(parser: Parser) {
    this.parser = parser;
  }

  protected visit(node: Num | BinOP | UnaryOP | Var | Assign | Str | Print): number | void | string {
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

  public interpret(): any {
    const tree: (Num | BinOP | UnaryOP | Str)[] = this.parser.parse();
    const result = [];
    for (let i = 0; i < tree.length; i++) {
      result.push(this.visit(tree[i]));
    }
    return result;
  }
}