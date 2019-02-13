import { Parser } from "../Parser/Parser";
import { TOKENS } from "../types/interfaces";
import { BinOP, Num, nodes } from "../ast/ast";


export class Interpreter {
  parser: Parser;
  tree;
  constructor(parser: Parser) {
    this.parser = parser;
  }

  protected visit(node: nodes): number {
    if (node instanceof BinOP) {
      return this.visitBinOp(node);
    } else if (node instanceof Num) {
      return this.visitNum(node);
    } else {
      this.genericVisit(node);
    }
  }
  
  protected genericVisit(node: nodes): void {
    throw new Error('No visit method: ' + node);
  }

  protected visitBinOp(node: BinOP): number {
    if (node.token === TOKENS.PLUS) {
      return this.visit(node.left) + this.visit(node.right);
    } else if (node.token === TOKENS.MINUS) {
      return this.visit(node.left) - this.visit(node.right);
    } else if (node.token === TOKENS.MUL) {
      return this.visit(node.left) * this.visit(node.right);
    } else if (node.token === TOKENS.DIV) {
      return this.visit(node.left) / this.visit(node.right);
    }
  }

  protected visitNum(node: Num): number {
    return node.value;
  }

  public interpret() {
    this.tree = this.parser.parse();
    return this.visit(this.tree);
  }
}