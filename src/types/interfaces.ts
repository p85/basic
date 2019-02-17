export interface token {
  token: TOKENS,
  line: number,
  value: string | number,
}

export enum TOKENS {
  NONE = 'NONE',
  PLUS = '+',
  MINUS = '-',
  MUL = '*',
  DIV = '/',
  MOD = 'MOD',
  LPAREN = '(',
  RPAREN = ')',
  EOF = 'EOF',
  INTEGER = 'INTEGER',
  IDENTIFIER = 'IDENTIFIER',
  ASSIGN = 'ASSIGN',
  EOL = 'EOL',
  DOUBLEQUOTE = 'DOUBLEQUOTE',
  STRING = 'STRING',
}

export enum SYMBOLS {
  PLUS = '+',
  MINUS = '-',
  MUL = '*',
  DIV = '/',
  MOD = 'MOD',
  LPAREN = '(',
  RPAREN = ')',
  NONE = '',
  ASSIGN = '=',
  EOL = '\n',
  DOUBLEQUOTE = '"',
}
