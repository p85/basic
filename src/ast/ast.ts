import { token, TOKENS } from "../types/interfaces";

class AST {
  line: number;
  value;
}

export type nodes = BinOP | UnaryOP | Num | Str | Assign | Var | Print | Goto | Abs | Atn | Beep;

export class BinOP extends AST {
  left: Num | BinOP | UnaryOP | Assign | Var;
  token: TOKENS;
  right: Num | BinOP | UnaryOP | Assign | Var;
  value;
  constructor(left: Num | BinOP | UnaryOP | Assign | Var, op: TOKENS, right: Num | BinOP | UnaryOP | Assign | Var) {
    super();
    this.left = left;
    this.token = op;
    this.right = right;
  }
}

export class UnaryOP extends AST {
  token: token;
  value: Num | BinOP | UnaryOP | Assign | Var;
  constructor(token: token, value: Num | BinOP | UnaryOP | Assign | Var) {
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

export class Str extends AST {
  token: token;
  value: string;
  constructor(token: token) {
    super();
    this.token = token;
    this.value = <string>token.value;
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

export class Print extends AST {
  token: token;
  value: Str | BinOP | UnaryOP | Num | Var;
  constructor(token: token, value: Str | BinOP | UnaryOP | Num | Var) {
    super();
    this.token = token;
    this.value = value;
  }
}

export class Goto extends AST {
  token: token;
  value: Num;
  constructor(token: token, value: Num) {
    super();
    this.token = token;
    this.value = value;
  }
}

export class Abs extends AST {
  token: token;
  value: Num;
  constructor(token: token, value: Num) {
    super();
    this.token = token;
    this.value = value;
  }
}

export class Atn extends AST {
  token: token;
  value: Num;
  constructor(token: token, value: Num) {
    super();
    this.token = token;
    this.value = value;
  }
}

export class Beep extends AST {
  token: token;
  value;
  constructor(token: token) {
    super();
    this.token = token;
  }
}

export class NOP extends AST {
  token: token;
  constructor() {
    super();
  }
}