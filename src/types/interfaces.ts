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
  COMMA = 'COMMA',
  // Commands
  PRINT = 'PRINT',
  GOTO = 'GOTO',
  ABS = 'ABS',
  ATN = 'ATN',
  BEEP = 'BEEP',
  CHR$ = 'CHR$',
  CINT = 'CINT',
  CLEAR = 'CLEAR',
  COS = 'COS',
  END = 'END',
  EXP = 'EXP',
  HEX$ = 'HEX$',
  INKEY$ = 'INKEY$',
  INPUT = 'INPUT',
  GOSUB = 'GOSUB',
  RETURN = 'RETURN',
  INSTR = 'INSTR',
  INT = 'INT',
  LEFT$ = 'LEFT$',
  LET = 'LET',
  LOG = 'LOG',
  MID$ = 'MID$',
  LEN = 'LEN',
  NINT = 'NINT',
  OCT$ = 'OCT$',
  R2D = 'R2D',
  RIGHT$ = 'RIGHT$',
  RND = 'RND',
  SGN = 'SGN',
  SIN = 'SIN',
  SLEEP = 'SLEEP',
  SQR = 'SQR',
  SQRT = 'SQRT',
  STR$ = 'STR$',
  TAN = 'TAN',
  TIME$ = 'TIME$',
  TIMER = 'TIMER',
  WIDTH = 'WIDTH',
  HEIGHT = 'HEIGHT',
  VAL = 'VAL',
  DATA = 'DATA',
  READ = 'READ',
  FOR = 'FOR',
  TO = 'TO',
  STEP = 'STEP',
  NEXT = 'NEXT',
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
  COMMA = ',',
  // Commands
  PRINT = 'PRINT',
  GOTO = 'GOTO',
  ABS = 'ABS',
  ATN = 'ATN',
  BEEP = 'BEEP',
  CHR$ = 'CHR$',
  CINT = 'CINT',
  CLEAR = 'CLEAR',
  COS = 'COS',
  END = 'END',
  EXP = 'EXP',
  HEX$ = 'HEX$',
  INKEY$ = 'INKEY$',
  INPUT = 'INPUT',
  GOSUB = 'GOSUB',
  RETURN = 'RETURN',
  INSTR = 'INSTR',
  INT = 'INT',
  LEFT$ = 'LEFT$',
  LET = 'LET',
  LOG = 'LOG',
  MID$ = 'MID$',
  LEN = 'LEN',
  NINT = 'NINT',
  OCT$ = 'OCT$',
  R2D = 'R2D',
  RIGHT$ = 'RIGHT$',
  RND = 'RND',
  SGN = 'SGN',
  SIN = 'SIN',
  SLEEP = 'SLEEP',
  SQR = 'SQR',
  SQRT = 'SQRT',
  STR$ = 'STR$',
  TAN = 'TAN',
  TIME$ = 'TIME$',
  TIMER = 'TIMER',
  WIDTH = 'WIDTH',
  HEIGHT = 'HEIGHT',
  VAL = 'VAL',
  DATA = 'DATA',
  READ = 'READ',
  FOR = 'FOR',
  TO = 'TO',
  STEP = 'STEP',
  NEXT = 'NEXT',
}
