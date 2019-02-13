import { token, TOKENS } from "../types/interfaces";

export type nodes = Num | BinOP;

class AST {}

export class BinOP extends AST {
  left: Num | BinOP;
  token: TOKENS;
  right: Num | BinOP;
  constructor(left: Num | BinOP, op: TOKENS, right: Num | BinOP) {
    super();
    this.left = left;
    this.token = op;
    this.right = right;
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