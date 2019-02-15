export interface token {
  token: TOKENS,
  value: string | number,
}

export enum TOKENS {
  NONE = 'NONE',
  PLUS = '+',
  MINUS = '-',
  MUL = '*',
  DIV = '/',
  LPAREN = '(',
  RPAREN = ')',
  EOF = 'EOF',
  INTEGER = 'INTEGER',
  IDENTIFIER = 'IDENTIFIER',
  ASSIGN = 'ASSIGN',
}

export enum SYMBOLS {
  PLUS = '+',
  MINUS = '-',
  MUL = '*',
  DIV = '/',
  LPAREN = '(',
  RPAREN = ')',
  NONE = '',
  ASSIGN = '=',
}
