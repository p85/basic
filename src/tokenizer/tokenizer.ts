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
      } else if (this.isNumeric(this.currentChar)) {
        return { token: TOKENS.INTEGER, line: this.currentLine, value: this.integer() };
      } else if (this.isToken(SYMBOLS.MOD)) {
        this.consumeToken(SYMBOLS.MOD);
        return { token: TOKENS.MOD, line: this.currentLine, value: SYMBOLS.MOD };
      }
      // Commands
      else if (this.isToken(SYMBOLS.PRINT)) {
        this.consumeToken(SYMBOLS.PRINT);
        return { token: TOKENS.PRINT, line: this.currentLine, value: SYMBOLS.PRINT };
      } else if (this.isToken(SYMBOLS.GOTO)) {
        this.consumeToken(SYMBOLS.GOTO);
        return { token: TOKENS.GOTO, line: this.currentLine, value: SYMBOLS.GOTO };
      } else if (this.isToken(SYMBOLS.ABS)) {
        this.consumeToken(SYMBOLS.ABS);
        return { token: TOKENS.ABS, line: this.currentLine, value: SYMBOLS.ABS };
      } else if (this.isToken(SYMBOLS.ATN)) {
        this.consumeToken(SYMBOLS.ATN);
        return { token: TOKENS.ATN, line: this.currentLine, value: SYMBOLS.ATN };
      } else if (this.isToken(SYMBOLS.BEEP)) {
        this.consumeToken(SYMBOLS.BEEP);
        return { token: TOKENS.BEEP, line: this.currentLine, value: SYMBOLS.BEEP };
      } else if (this.isToken(SYMBOLS.CHR$)) {
        this.consumeToken(SYMBOLS.CHR$);
        return { token: TOKENS.CHR$, line: this.currentLine, value: SYMBOLS.CHR$ };
      } else if (this.isToken(SYMBOLS.CINT)) {
        this.consumeToken(SYMBOLS.CINT);
        return { token: TOKENS.CINT, line: this.currentLine, value: SYMBOLS.CINT };
      } else if (this.isToken(SYMBOLS.CLEAR)) {
        this.consumeToken(SYMBOLS.CLEAR);
        return { token: TOKENS.CLEAR, line: this.currentLine, value: SYMBOLS.CLEAR };
      } else if (this.isToken(SYMBOLS.COS)) {
        this.consumeToken(SYMBOLS.COS);
        return { token: TOKENS.COS, line: this.currentLine, value: SYMBOLS.COS };
      } else if (this.isToken(SYMBOLS.END)) {
        this.consumeToken(SYMBOLS.END);
        return { token: TOKENS.END, line: this.currentLine, value: SYMBOLS.END };
      } else if (this.isToken(SYMBOLS.EXP)) {
        this.consumeToken(SYMBOLS.EXP);
        return { token: TOKENS.EXP, line: this.currentLine, value: SYMBOLS.EXP };
      } else if (this.isToken(SYMBOLS.HEX$)) {
        this.consumeToken(SYMBOLS.HEX$);
        return { token: TOKENS.HEX$, line: this.currentLine, value: SYMBOLS.HEX$ };
      } else if (this.isToken(SYMBOLS.INKEY$)) {
        this.consumeToken(SYMBOLS.INKEY$);
        return { token: TOKENS.INKEY$, line: this.currentLine, value: SYMBOLS.INKEY$ };
      } else if (this.isToken(SYMBOLS.COMMA)) {
        this.consumeToken(SYMBOLS.COMMA);
        return { token: TOKENS.COMMA, line: this.currentLine, value: SYMBOLS.COMMA };
      } else if (this.isToken(SYMBOLS.INPUT)) {
        this.consumeToken(SYMBOLS.INPUT);
        return { token: TOKENS.INPUT, line: this.currentLine, value: SYMBOLS.INPUT };
      } else if (this.isToken(SYMBOLS.GOSUB)) {
        this.consumeToken(SYMBOLS.GOSUB);
        return { token: TOKENS.GOSUB, line: this.currentLine, value: SYMBOLS.GOSUB };
      } else if (this.isToken(SYMBOLS.RETURN)) {
        this.consumeToken(SYMBOLS.RETURN);
        return { token: TOKENS.RETURN, line: this.currentLine, value: SYMBOLS.RETURN };
      } else if (this.isToken(SYMBOLS.INSTR)) {
        this.consumeToken(SYMBOLS.INSTR);
        return { token: TOKENS.INSTR, line: this.currentLine, value: SYMBOLS.INSTR };
      } else if (this.isToken(SYMBOLS.INT)) {
        this.consumeToken(SYMBOLS.INT);
        return { token: TOKENS.INT, line: this.currentLine, value: SYMBOLS.INT };
      } else if (this.isToken(SYMBOLS.LEFT$)) {
        this.consumeToken(SYMBOLS.LEFT$);
        return { token: TOKENS.LEFT$, line: this.currentLine, value: SYMBOLS.LEFT$ };
      } else if (this.isToken(SYMBOLS.LET)) {
        this.consumeToken(SYMBOLS.LET);
        return { token: TOKENS.LET, line: this.currentLine, value: SYMBOLS.LET };
      } else if (this.isToken(SYMBOLS.LOG)) {
        this.consumeToken(SYMBOLS.LOG);
        return { token: TOKENS.LOG, line: this.currentLine, value: SYMBOLS.LOG };
      } else if (this.isToken(SYMBOLS.MID$)) {
        this.consumeToken(SYMBOLS.MID$);
        return { token: TOKENS.MID$, line: this.currentLine, value: SYMBOLS.MID$ };
      } else if (this.isToken(SYMBOLS.LEN)) {
        this.consumeToken(SYMBOLS.LEN);
        return { token: TOKENS.LEN, line: this.currentLine, value: SYMBOLS.LEN };
      } else if (this.isToken(SYMBOLS.NINT)) {
        this.consumeToken(SYMBOLS.NINT);
        return { token: TOKENS.NINT, line: this.currentLine, value: SYMBOLS.NINT };
      } else if (this.isToken(SYMBOLS.OCT$)) {
        this.consumeToken(SYMBOLS.OCT$);
        return { token: TOKENS.OCT$, line: this.currentLine, value: SYMBOLS.OCT$ };
      } else if (this.isToken(SYMBOLS.R2D)) {
        this.consumeToken(SYMBOLS.R2D);
        return { token: TOKENS.R2D, line: this.currentLine, value: SYMBOLS.R2D };
      } else if (this.isToken(SYMBOLS.RIGHT$)) {
        this.consumeToken(SYMBOLS.RIGHT$);
        return { token: TOKENS.RIGHT$, line: this.currentLine, value: SYMBOLS.RIGHT$ };
      } else if (this.isToken(SYMBOLS.RND)) {
        this.consumeToken(SYMBOLS.RND);
        return { token: TOKENS.RND, line: this.currentLine, value: SYMBOLS.RND };
      } else if (this.isToken(SYMBOLS.SGN)) {
        this.consumeToken(SYMBOLS.SGN);
        return { token: TOKENS.SGN, line: this.currentLine, value: SYMBOLS.SGN };
      } else if (this.isToken(SYMBOLS.SIN)) {
        this.consumeToken(SYMBOLS.SIN);
        return { token: TOKENS.SIN, line: this.currentLine, value: SYMBOLS.SIN };
      } else if (this.isToken(SYMBOLS.SLEEP)) {
        this.consumeToken(SYMBOLS.SLEEP);
        return { token: TOKENS.SLEEP, line: this.currentLine, value: SYMBOLS.SLEEP };
      } else if (this.isToken(SYMBOLS.SQR)) {
        this.consumeToken(SYMBOLS.SQR);
        return { token: TOKENS.SQR, line: this.currentLine, value: SYMBOLS.SQR };
      } else if (this.isToken(SYMBOLS.STR$)) {
        this.consumeToken(SYMBOLS.STR$);
        return { token: TOKENS.STR$, line: this.currentLine, value: SYMBOLS.STR$ };
      } else if (this.isToken(SYMBOLS.TAN)) {
        this.consumeToken(SYMBOLS.TAN);
        return { token: TOKENS.TAN, line: this.currentLine, value: SYMBOLS.TAN };
      } else if (this.isToken(SYMBOLS.TIME$)) {
        this.consumeToken(SYMBOLS.TIME$);
        return { token: TOKENS.TIME$, line: this.currentLine, value: SYMBOLS.TIME$ };
      } else if (this.isToken(SYMBOLS.TIMER)) {
        this.consumeToken(SYMBOLS.TIMER);
        return { token: TOKENS.TIMER, line: this.currentLine, value: SYMBOLS.TIMER };
      } else if (this.isToken(SYMBOLS.WIDTH)) {
        this.consumeToken(SYMBOLS.WIDTH);
        return { token: TOKENS.WIDTH, line: this.currentLine, value: SYMBOLS.WIDTH };
      } else if (this.isToken(SYMBOLS.HEIGHT)) {
        this.consumeToken(SYMBOLS.HEIGHT);
        return { token: TOKENS.HEIGHT, line: this.currentLine, value: SYMBOLS.HEIGHT };
      } else if (this.isToken(SYMBOLS.VAL)) {
        this.consumeToken(SYMBOLS.VAL);
        return { token: TOKENS.VAL, line: this.currentLine, value: SYMBOLS.VAL };
      } else if (this.isToken(SYMBOLS.DATA)) {
        this.consumeToken(SYMBOLS.DATA);
        return { token: TOKENS.DATA, line: this.currentLine, value: SYMBOLS.DATA };
      } else if (this.isToken(SYMBOLS.READ)) {
        this.consumeToken(SYMBOLS.READ);
        return { token: TOKENS.READ, line: this.currentLine, value: SYMBOLS.READ };
      } else if (this.isToken(SYMBOLS.FOR)) {
        this.consumeToken(SYMBOLS.FOR);
        return { token: TOKENS.FOR, line: this.currentLine, value: SYMBOLS.FOR };
      } else if (this.isToken(SYMBOLS.TO)) {
        this.consumeToken(SYMBOLS.TO);
        return { token: TOKENS.TO, line: this.currentLine, value: SYMBOLS.TO };
      } else if (this.isToken(SYMBOLS.STEP)) {
        this.consumeToken(SYMBOLS.STEP);
        return { token: TOKENS.STEP, line: this.currentLine, value: SYMBOLS.STEP };
      } else if (this.isToken(SYMBOLS.NEXT)) {
        this.consumeToken(SYMBOLS.NEXT);
        return { token: TOKENS.NEXT, line: this.currentLine, value: SYMBOLS.NEXT };
      } else if (this.isToken(SYMBOLS.AND)) {
        this.consumeToken(SYMBOLS.AND);
        return { token: TOKENS.AND, line: this.currentLine, value: SYMBOLS.AND };
      } else if (this.isToken(SYMBOLS.OR)) {
        this.consumeToken(SYMBOLS.OR);
        return { token: TOKENS.OR, line: this.currentLine, value: SYMBOLS.OR };
      } else if (this.isToken(SYMBOLS.IF)) {
        this.consumeToken(SYMBOLS.IF);
        return { token: TOKENS.IF, line: this.currentLine, value: SYMBOLS.IF };
      } else if (this.isToken(SYMBOLS.THEN)) {
        this.consumeToken(SYMBOLS.THEN);
        return { token: TOKENS.THEN, line: this.currentLine, value: SYMBOLS.THEN };
      } else if (this.isToken(SYMBOLS.NOTEQUAL)) {
        this.consumeToken(SYMBOLS.NOTEQUAL);
        return { token: TOKENS.NOTEQUAL, line: this.currentLine, value: SYMBOLS.NOTEQUAL };
      } else if (this.isToken(SYMBOLS.GREATEREQUAL)) {
        this.consumeToken(SYMBOLS.GREATEREQUAL);
        return { token: TOKENS.GREATEREQUAL, line: this.currentLine, value: SYMBOLS.GREATEREQUAL };
      } else if (this.isToken(SYMBOLS.LOWEREQUAL)) {
        this.consumeToken(SYMBOLS.LOWEREQUAL);
        return { token: TOKENS.LOWEREQUAL, line: this.currentLine, value: SYMBOLS.LOWEREQUAL };
      } else if (this.isToken(SYMBOLS.GREATER)) {
        this.consumeToken(SYMBOLS.GREATER);
        return { token: TOKENS.GREATER, line: this.currentLine, value: SYMBOLS.GREATER };
      } else if (this.isToken(SYMBOLS.LOWER)) {
        this.consumeToken(SYMBOLS.LOWER);
        return { token: TOKENS.LOWER, line: this.currentLine, value: SYMBOLS.LOWER };
      } else if (this.isToken(SYMBOLS.EQUALS)) {
        this.consumeToken(SYMBOLS.EQUALS);
        return { token: TOKENS.EQUALS, line: this.currentLine, value: SYMBOLS.EQUALS };
      }
      // Commands end
      else if (this.isAlphaNumeric(this.currentChar)) {
        return { token: TOKENS.IDENTIFIER, line: this.currentLine, value: this._id() };
      } else if (this.isToken(SYMBOLS.DOUBLEQUOTE)) {
        this.consumeToken(SYMBOLS.DOUBLEQUOTE);
        return { token: TOKENS.STRING, line: this.currentLine, value: this.str() };
      } else if (this.isToken(SYMBOLS.PLUS)) {
        this.consumeToken(SYMBOLS.PLUS);
        return { token: TOKENS.PLUS, line: this.currentLine, value: SYMBOLS.PLUS };
      } else if (this.isToken(SYMBOLS.MINUS)) {
        this.consumeToken(SYMBOLS.MINUS);
        return { token: TOKENS.MINUS, line: this.currentLine, value: SYMBOLS.MINUS };
      } else if (this.isToken(SYMBOLS.MUL)) {
        this.consumeToken(SYMBOLS.MUL);
        return { token: TOKENS.MUL, line: this.currentLine, value: SYMBOLS.MUL };
      } else if (this.isToken(SYMBOLS.DIV)) {
        this.consumeToken(SYMBOLS.DIV);
        return { token: TOKENS.DIV, line: this.currentLine, value: SYMBOLS.DIV };
      } else if (this.isToken(SYMBOLS.LPAREN)) {
        this.consumeToken(SYMBOLS.LPAREN);
        return { token: TOKENS.LPAREN, line: this.currentLine, value: SYMBOLS.LPAREN };
      } else if (this.isToken(SYMBOLS.RPAREN)) {
        this.consumeToken(SYMBOLS.RPAREN);
        return { token: TOKENS.RPAREN, line: this.currentLine, value: SYMBOLS.RPAREN };
      } else if (this.currentChar.charCodeAt(0) === SYMBOLS.EOL.charCodeAt(0)) {
        this.consumeToken(SYMBOLS.EOL);
        const oldLine: number = this.currentLine;
        this.currentLine = this.integer();
        return { token: TOKENS.EOL, line: oldLine, value: SYMBOLS.EOL };
      } else {
        throw new Error('Parsing Error');
      }
    }
    return { token: TOKENS.EOF, line: this.currentLine, value: null };
  }

}