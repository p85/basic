

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
  EOF = 'EOF',
  INTEGER = 'INTEGER'
}

export enum SYMBOLS {
  PLUS = '+',
  MINUS = '-',
  MUL = '*',
  DIV = '/',
  NONE = '',
}


export class Tokenizer {
  text: string;
  position: number;
  currentToken: token;
  currentChar: string;

  constructor(text: string) {
    this.text = text;
    this.position = 0;
    this.currentToken = { token: TOKENS.NONE, value: null };
    this.currentChar = this.text.charAt(this.position);
  }

  protected isNumeric = (value: string): boolean => /^\d+$/.test(value);
  protected isSpace = (value: string): boolean => /^ +$/.test(value);

  protected advance(): void {
    this.position += 1;
    if (this.position > this.text.length - 1) {
      this.currentChar = SYMBOLS.NONE;
    } else {
      this.currentChar = this.text.charAt(this.position);
    }
  }

  protected skipWhitespace(): void {
    while (this.currentChar !== SYMBOLS.NONE && this.isSpace(this.currentChar)) {
      this.advance();
    }
  }

  protected integer(): number {
    let result: string = '';
    while (this.currentChar !== SYMBOLS.NONE && this.isNumeric(this.currentChar)) {
      result += this.currentChar;
      this.advance();
    }
    return +result;
  }

  public getNextToken(): token {
    while (this.currentChar !== SYMBOLS.NONE) {
      if (this.isSpace(this.currentChar)) {
        this.skipWhitespace();
        continue;
      }
      if (this.isNumeric(this.currentChar)) {
        return { token: TOKENS.INTEGER, value: this.integer() };
      }
      if (this.currentChar === SYMBOLS.PLUS) {
        this.advance();
        return { token: TOKENS.PLUS, value: SYMBOLS.PLUS };
      }
      if (this.currentChar === SYMBOLS.MINUS) {
        this.advance();
        return { token: TOKENS.MINUS, value: SYMBOLS.MINUS };
      }
      if (this.currentChar === SYMBOLS.MUL) {
        this.advance();
        return { token: TOKENS.MUL, value: SYMBOLS.MUL };
      }
      if (this.currentChar === SYMBOLS.DIV) {
        this.advance();
        return { token: TOKENS.DIV, value: SYMBOLS.DIV };
      }
      throw new Error('Parsing Error');
    }
    return {token: TOKENS.EOF, value: null};
  }

}

export class Interpreter {
  tokenizer: Tokenizer;
  currentToken: token;

  constructor(tokenizer: Tokenizer) {
    this.tokenizer = tokenizer;
    this.currentToken = this.tokenizer.getNextToken();
  }

  protected eat(token: TOKENS): void {
    if (this.currentToken.token === token) {
      this.currentToken = this.tokenizer.getNextToken();
      return;
    }
    throw new Error('Parsing Error, expected: ' + token + ' got: ' + this.currentToken.token);
  }

  protected factor(): number {
    const token = this.currentToken;
    this.eat(TOKENS.INTEGER);
    return <number>token.value;
  }

  public expr() {
    let result = this.factor();
    while (this.currentToken.token === TOKENS.MUL || this.currentToken.token === TOKENS.DIV || this.currentToken.token === TOKENS.PLUS || this.currentToken.token === TOKENS.MINUS) {
      const token = this.currentToken;
      if (token.token === TOKENS.MUL) {
        this.eat(TOKENS.MUL);
        result = result * this.factor();
      } else if (token.token === TOKENS.DIV) {
        this.eat(TOKENS.DIV);
        result = result / this.factor();
      } else if (token.token === TOKENS.PLUS) {
        this.eat(TOKENS.PLUS);
        result = <number>result + <number>this.factor();
      } else if (token.token === TOKENS.MINUS) {
        this.eat(TOKENS.MINUS);
        result = <number>result - <number>this.factor();
      }
    }
    return result;
  }

}