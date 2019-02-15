import { token, TOKENS } from "../types/interfaces";

class AST {}

export class BinOP extends AST {
  left: Num | BinOP | UnaryOP | Assign;
  token: TOKENS;
  right: Num | BinOP | UnaryOP | Assign;
  constructor(left: Num | BinOP | UnaryOP | Assign, op: TOKENS, right: Num | BinOP | UnaryOP | Assign) {
    super();
    this.left = left;
    this.token = op;
    this.right = right;
  }
}

export class UnaryOP extends AST {
  token: token;
  value: Num | BinOP | UnaryOP | Assign;
  constructor(token: token, value: Num | BinOP | UnaryOP | Assign) {
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

export class Assign extends AST {
  left;
  token: token;
  right;
  constructor(left, op: token, right) {
    super();
    this.left = left;
    this.token = op;
    this.right = right;
  }
}

export class Var extends AST {
  token: token;
  value;
  constructor(token: token) {
    super();
    this.token = token;
    this.value = token.value;
  }
}