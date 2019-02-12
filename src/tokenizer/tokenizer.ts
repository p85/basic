import {token, TOKENS, SYMBOLS } from '../types/interfaces';

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
      if (this.currentChar === SYMBOLS.LPAREN) {
        this.advance();
        return { token: TOKENS.LPAREN, value: SYMBOLS.LPAREN };
      }
      if (this.currentChar === SYMBOLS.RPAREN) {
        this.advance();
        return { token: TOKENS.RPAREN, value: SYMBOLS.RPAREN };
      }
      throw new Error('Parsing Error');
    }
    return {token: TOKENS.EOF, value: null};
  }

}