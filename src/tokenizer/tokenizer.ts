export interface token {
  token: TOKENS,
  value: string | number,
}

export enum TOKENS {
  NONE,
  PLUS,
  MINUS,
  EOF,
  INTEGER
}

export enum SYMBOLS {
  PLUS = '+',
  MINUS = '-',
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

  protected getNextToken(): token {
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
      throw new Error('Parsing Error');
    }
    return {token: TOKENS.EOF, value: null};
  }

  protected eat(token: TOKENS): void {
    if (this.currentToken.token === token) {
      this.currentToken = this.getNextToken();
      return;
    }
    throw new Error('Parsing Error, expected: ' + token + ' got: ' + this.currentToken);
  }

  protected term(): string | number {
    const token = this.currentToken;
    this.eat(TOKENS.INTEGER);
    return token.value;
  }

  public expr() {
    this.currentToken = this.getNextToken();
    let result = this.term();
    while (this.currentToken.token === TOKENS.PLUS || this.currentToken.token === TOKENS.MINUS) {
      const token = this.currentToken;
      if (token.token === TOKENS.PLUS) {
        this.eat(TOKENS.PLUS);
        result = <number>result + <number>this.term();
      } else if (token.token === TOKENS.MINUS) {
        this.eat(TOKENS.MINUS);
        result = <number>result - <number>this.term();
      }
    }
    return result;
  }
}