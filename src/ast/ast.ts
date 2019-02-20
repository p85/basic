import { token, TOKENS } from "../types/interfaces";

class AST {
  line: number;
  value;
  token;
}

export class BinOP extends AST {
  left: Num | BinOP | UnaryOP | Assign | Var;
  right: Num | BinOP | UnaryOP | Assign | Var;
  constructor(left: Num | BinOP | UnaryOP | Assign | Var, op: TOKENS, right: Num | BinOP | UnaryOP | Assign | Var) {
    super();
    this.left = left;
    this.token = op;
    this.right = right;
  }
}

export class UnaryOP extends AST {
  constructor(token: token, value: Num | BinOP | UnaryOP | Assign | Var) {
    super();
    this.token = token;
    this.value = value;
  }
}

export class Num extends AST {
  constructor(token: token) {
    super();
    this.token = token;
    this.value = <number>token.value;
  }
}

export class Str extends AST {
  constructor(token: token) {
    super();
    this.token = token;
    this.value = <string>token.value;
  }
}

export class Assign extends AST {
  left;
  right;
  constructor(left, op: token, right) {
    super();
    this.left = left;
    this.token = op;
    this.right = right;
  }
}

export class Var extends AST {
  constructor(token: token) {
    super();
    this.token = token;
    this.value = token.value;
  }
}

export class Print extends AST {
  constructor(token: token, value: Str | BinOP | UnaryOP | Num | Var) {
    super();
    this.token = token;
    this.value = value;
  }
}

export class Goto extends AST {
  constructor(token: token, value: Num) {
    super();
    this.token = token;
    this.value = value;
  }
}

export class Abs extends AST {
  constructor(token: token, value: Num | Var | UnaryOP) {
    super();
    this.token = token;
    this.value = value;
  }
}

export class Atn extends AST {
  constructor(token: token, value: Num | Var | UnaryOP) {
    super();
    this.token = token;
    this.value = value;
  }
}

export class Beep extends AST {
  constructor(token: token) {
    super();
    this.token = token;
  }
}

export class NOP extends AST {
  constructor() {
    super();
  }
}

export class Chr extends AST {
  constructor(token: token, value: Num | Var) {
    super();
    this.token = token;
    this.value = value;
  }
}

export class Cint extends AST {
  constructor(token: token, value: Num | Var) {
    super();
    this.token = token;
    this.value = value;
  }
}

export class Clear extends AST {
  constructor() {
    super();
  }
}

export class Cos extends AST {
  constructor(token: token, value: Num | Var) {
    super();
    this.token = token;
    this.value = value;
  }
}

export type nodes = BinOP | UnaryOP | Num | Str | Assign | Var | Print | Goto | Abs | Atn | Beep | Cos;