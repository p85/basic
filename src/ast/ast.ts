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

export class Gosub extends AST {
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

export class End extends AST {
  constructor() {
    super();
  }
}

export class Exp extends AST {
  constructor(token: token, value: Num | Var) {
    super();
    this.token = token;
    this.value = value;
  }
}

export class Hex extends AST {
  constructor(token: token, value: Num | Var) {
    super();
    this.token = token;
    this.value = value;
  }
}

export class Inkey extends AST {
  constructor() {
    super();
  }
}

export class Input extends AST {
  prompt: Str | Num;
  variable: Var;
  constructor(prompt: Str | Num, variable: Var) {
    super();
    this.prompt = prompt;
    this.variable = variable;
  }
}

export class Return extends AST {
  constructor() {
    super();
  }
}

export class Instr extends AST {
  findValue: Str | Var;
  startPos: Num | Var;
  constructor(token: token, value: Str | Var, findValue: Str | Var, startPos: Num | Var) {
    super();
    this.token = token;
    this.value = value;
    this.findValue = findValue;
    this.startPos = startPos;
  }
}

export class Int extends AST {
  constructor(token: token, value: Num | Var) {
    super();
    this.token = token;
    this.value = value;
  }
}

export class Left extends AST {
  amount: Num | Var;
  constructor(token: token, value: Str | Var, amount: Num | Var) {
    super();
    this.token = token;
    this.value = value;
    this.amount = amount;
  }
}

export class Log extends AST {
  constructor(token: token, value: Num | Var) {
    super();
    this.token = token;
    this.value = value;
  }
}

export class Mid extends AST {
  startPos: Num | Var;
  length: Num | Var;
  constructor(token: token, value: Str | Var, startPos: Num | Var, length: Num | Var) {
    super();
    this.token = token;
    this.value = value;
    this.startPos = startPos;
    this.length = length;
  }
}

export class Len extends AST {
  constructor(token: token, value: Str | Var) {
    super();
    this.token = token;
    this.value = value;
  }
}

export class Nint extends AST {
  constructor(token: token, value: Num | Var) {
    super();
    this.token = token;
    this.value = value;
  }
}

export class Oct extends AST {
  constructor(token: token, value: Num | Var) {
    super();
    this.token = token;
    this.value = value;
  }
}

export class R2d extends AST {
  constructor(token: token, value: Num | Var) {
    super();
    this.token = token;
    this.value = value;
  }
}

export class Right extends AST {
  amount: Num | Var;
  constructor(token: token, value: Str | Var, amount: Num | Var) {
    super();
    this.token = token;
    this.value = value;
    this.amount = amount;
  }
}

export type nodes = BinOP | UnaryOP | Num | Str | Assign | Var | Print | Goto | Abs | Atn | Beep | NOP | Chr | Cos | Exp | Hex | Inkey | Input | Gosub | Return |
  Instr | Int | Left | Log | Mid | Len | Nint | Oct | R2d | Right;