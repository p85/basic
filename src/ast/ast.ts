import { token, TOKENS } from "../types/interfaces";

export type nodes = Num | BinOP | UnaryOP;

class AST {}

export class BinOP extends AST {
  left: Num | BinOP | UnaryOP;
  token: TOKENS;
  right: Num | BinOP | UnaryOP;
  constructor(left: Num | BinOP | UnaryOP, op: TOKENS, right: Num | BinOP | UnaryOP) {
    super();
    this.left = left;
    this.token = op;
    this.right = right;
  }
}

export class UnaryOP extends AST {
  token: token;
  value: Num | BinOP | UnaryOP;
  constructor(token: token, value: Num | BinOP | UnaryOP) {
    super();
    this.token = token;
    this.value = value;
  }
}

export class Num extends AST {
  token: token;
  value: number;
  constructor(token: token) {
    super();
    this.token = token;
    this.value = <number>token.value;
  }
}