import { token, TOKENS, SYMBOLS } from '../types/interfaces';

export class Tokenizer {
  text: string;
  position: number;
  currentToken: token;
  currentChar: string;
  currentLine: number;

  constructor(text: string) {
    if (text.charCodeAt(text.length) !== 10) text += SYMBOLS.EOL;
    this.text = text;
    this.position = 0;
    this.currentToken = { token: TOKENS.NONE, line: null, value: null };
    this.currentChar = this.text.charAt(this.position);
    this.currentLine = this.integer();
  }

  protected isNumeric = (value: string): boolean => /^[\d\.]+$/.test(value);
  protected isSpace = (value: string): boolean => /^ +$/.test(value);
  protected isAlphaNumeric = (value: string): boolean => /^[a-zA-Z0-9$]+$/.test(value);

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
    return parseFloat(result);
  }
  protected str(): string {
    let result: string = '';
    while (this.currentChar !== SYMBOLS.DOUBLEQUOTE) {
      result += this.currentChar;
      this.advance();
    }
    if (this.currentChar === SYMBOLS.DOUBLEQUOTE) this.advance();
    return result;
  }

  protected _id(): string {
    let result = '';
    while (this.currentChar !== SYMBOLS.NONE && this.isAlphaNumeric(this.currentChar)) {
      result += this.currentChar;
      this.advance();
    }
    return result;
  }


  protected isToken(symbol: SYMBOLS): boolean {
    return this.text.substring(this.position, this.position + symbol.length) === symbol;
  }

  protected consumeToken(symbol: SYMBOLS): void {
    for (let i = 0; i < symbol.length; i++) {
      this.advance();
    }
  }

  public getNextToken(): token {
    while (this.currentChar !== SYMBOLS.NONE) {
      if (this.isSpace(this.currentChar)) {
        this.skipWhitespace();
        continue;
      }
      if (this.isNumeric(this.currentChar)) {
        return { token: TOKENS.INTEGER, line: this.currentLine, value: this.integer() };
      }
      if (this.isToken(SYMBOLS.MOD)) {
        this.consumeToken(SYMBOLS.MOD);
        return { token: TOKENS.MOD, line: this.currentLine, value: SYMBOLS.MOD };
      }
      // Commands
      if (this.isToken(SYMBOLS.PRINT)) {
        this.consumeToken(SYMBOLS.PRINT);
        return { token: TOKENS.PRINT, line: this.currentLine, value: SYMBOLS.PRINT };
      }
      if (this.isToken(SYMBOLS.GOTO)) {
        this.consumeToken(SYMBOLS.GOTO);
        return { token: TOKENS.GOTO, line: this.currentLine, value: SYMBOLS.GOTO };
      }
      if (this.isToken(SYMBOLS.ABS)) {
        this.consumeToken(SYMBOLS.ABS);
        return { token: TOKENS.ABS, line: this.currentLine, value: SYMBOLS.ABS };
      }
      if (this.isToken(SYMBOLS.ATN)) {
        this.consumeToken(SYMBOLS.ATN);
        return { token: TOKENS.ATN, line: this.currentLine, value: SYMBOLS.ATN };
      }
      if (this.isToken(SYMBOLS.BEEP)) {
        this.consumeToken(SYMBOLS.BEEP);
        return { token: TOKENS.BEEP, line: this.currentLine, value: SYMBOLS.BEEP };
      }
      if (this.isToken(SYMBOLS.CHR$)) {
        this.consumeToken(SYMBOLS.CHR$);
        return { token: TOKENS.CHR$, line: this.currentLine, value: SYMBOLS.CHR$ };
      }
      if (this.isToken(SYMBOLS.CINT)) {
        this.consumeToken(SYMBOLS.CINT);
        return { token: TOKENS.CINT, line: this.currentLine, value: SYMBOLS.CINT };
      }
      if (this.isToken(SYMBOLS.CLEAR)) {
        this.consumeToken(SYMBOLS.CLEAR);
        return { token: TOKENS.CLEAR, line: this.currentLine, value: SYMBOLS.CLEAR };
      }
      if (this.isToken(SYMBOLS.COS)) {
        this.consumeToken(SYMBOLS.COS);
        return { token: TOKENS.COS, line: this.currentLine, value: SYMBOLS.COS };
      }
      // Commands end
      if (this.isAlphaNumeric(this.currentChar)) {
        return { token: TOKENS.IDENTIFIER, line: this.currentLine, value: this._id() };
      }
      if (this.isToken(SYMBOLS.DOUBLEQUOTE)) {
        this.consumeToken(SYMBOLS.DOUBLEQUOTE);
        return { token: TOKENS.STRING, line: this.currentLine, value: this.str() };
      }
      if (this.isToken(SYMBOLS.ASSIGN)) {
        this.consumeToken(SYMBOLS.ASSIGN);
        return { token: TOKENS.ASSIGN, line: this.currentLine, value: SYMBOLS.ASSIGN };
      }
      if (this.isToken(SYMBOLS.PLUS)) {
        this.consumeToken(SYMBOLS.PLUS);
        return { token: TOKENS.PLUS, line: this.currentLine, value: SYMBOLS.PLUS };
      }
      if (this.isToken(SYMBOLS.MINUS)) {
        this.consumeToken(SYMBOLS.MINUS);
        return { token: TOKENS.MINUS, line: this.currentLine, value: SYMBOLS.MINUS };
      }
      if (this.isToken(SYMBOLS.MUL)) {
        this.consumeToken(SYMBOLS.MUL);
        return { token: TOKENS.MUL, line: this.currentLine, value: SYMBOLS.MUL };
      }
      if (this.isToken(SYMBOLS.DIV)) {
        this.consumeToken(SYMBOLS.DIV);
        return { token: TOKENS.DIV, line: this.currentLine, value: SYMBOLS.DIV };
      }
      if (this.isToken(SYMBOLS.LPAREN)) {
        this.consumeToken(SYMBOLS.LPAREN);
        return { token: TOKENS.LPAREN, line: this.currentLine, value: SYMBOLS.LPAREN };
      }
      if (this.isToken(SYMBOLS.RPAREN)) {
        this.consumeToken(SYMBOLS.RPAREN);
        return { token: TOKENS.RPAREN, line: this.currentLine, value: SYMBOLS.RPAREN };
      }
      if (this.currentChar.charCodeAt(0) === SYMBOLS.EOL.charCodeAt(0)) {
        this.consumeToken(SYMBOLS.EOL);
        const oldLine: number = this.currentLine;
        this.currentLine = this.integer();
        return { token: TOKENS.EOL, line: oldLine, value: SYMBOLS.EOL };
      }
      throw new Error('Parsing Error');
    }
    return { token: TOKENS.EOF, line: this.currentLine, value: null };
  }

}