export interface token {
  token: TOKENS,
  line: number,
  value: string | number | any,
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
  // Commands
  PRINT = 'PRINT',
  GOTO = 'GOTO',
  ABS = 'ABS',
  ATN = 'ATN',
  BEEP = 'BEEP',
  CHR$ = 'CHR$',
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
  SPACE = ' ',
  // Commands
  PRINT = 'PRINT',
  GOTO = 'GOTO',
  ABS = 'ABS',
  ATN = 'ATN',
  BEEP = 'BEEP',
  CHR$ = 'CHR$',
}
