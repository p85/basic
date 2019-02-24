import { expect } from 'chai';
import { eval } from 'mathjs';
import * as sinon from 'sinon';
import 'mocha';

import { Tokenizer } from '../tokenizer/tokenizer';
import { Parser } from '../Parser/Parser';
import { Interpreter } from '../Interpreter/Interpreter';


let tokenizer: Tokenizer;
let parser: Parser;
let interpreter: Interpreter;


const testValues: string[] = [
  '10 3 + 7',
  '10 23 + 77',
  '10 15 - 90',
  '10 7 - 3 + 2 - 1',
  '10 10 + 1 + 2 - 3 + 4 + 6 - 15',
  '10 3 * 7',
  '10 3 * 7 / 2',
  '10 2 + 7 * 4',
  '10 14 + 2 * 3 - 6 / 2',
  '10 7 + 3 * (10 / (12 / (3 + 1) - 1))',
  '10 7 + 3 * (10 / (12 / (3 + 1) - 1)) / (2 + 3) - 5 - 3 + (8)',
  '10 7 + (((3 + 2)))',
  '10 10 - 3',
  '10 10 + 3',
  '10 5 - - - + - 3',
  '10 5 - - - + - (3 + 4) - + 2',
  '10 290 MOD 7',
  '10 290 MOD 7 + 3 * 8 / 2 - 5 MOD 2'
];

describe('calculus', () => {
  testValues.forEach(testExpr => {
    it(testExpr, () => {
      tokenizer = new Tokenizer(testExpr);
      parser = new Parser(tokenizer);
      interpreter = new Interpreter(parser);
      const result = interpreter.interpret();
      expect(result[0]).to.equal(eval(testExpr.replace(/MOD/g, '%').replace(/^[0-9]+ {1}/, '')));
    })
  });
});

describe('Integer Variables', () => {
  it('set a variable', () => {
    tokenizer = new Tokenizer('10 foobar = 12345');
    parser = new Parser(tokenizer);
    interpreter = new Interpreter(parser);
    interpreter.interpret();
    expect(interpreter.vars).to.eql({ foobar: 12345 });
  });

  it('calculation using one existing variable and one set', () => {
    tokenizer = new Tokenizer('10 a = (b * 2 + 2) / 2');
    parser = new Parser(tokenizer);
    interpreter = new Interpreter(parser);
    interpreter.vars = { b: 6 };
    interpreter.interpret();
    expect(interpreter.vars).to.eql({ b: 6, a: 7 });
  });

  it('calculation using two existing variables', () => {
    tokenizer = new Tokenizer('10 a = b + c');
    parser = new Parser(tokenizer);
    interpreter = new Interpreter(parser);
    interpreter.vars = { b: 6, c: 1 };
    interpreter.interpret();
    expect(interpreter.vars).to.eql({ b: 6, c: 1, a: 7 });
  });

  it('calculation using two existing variables and one set with parentheses', () => {
    tokenizer = new Tokenizer('10 a = (b + c + 10) * 2');
    parser = new Parser(tokenizer);
    interpreter = new Interpreter(parser);
    interpreter.vars = { b: 6, c: 1 };
    interpreter.interpret();
    expect(interpreter.vars).to.eql({ b: 6, c: 1, a: 34 });
  });

});

describe('String Variables', () => {
  it('Set a String Variable', () => {
    tokenizer = new Tokenizer('10 foobar = "foby"');
    parser = new Parser(tokenizer);
    interpreter = new Interpreter(parser);
    interpreter.interpret();
    expect(interpreter.vars).to.eql({ foobar: "foby" });
  });

  it('Read a string Variable', () => {
    tokenizer = new Tokenizer('10 varx\n');
    parser = new Parser(tokenizer);
    interpreter = new Interpreter(parser);
    interpreter.vars = { varx: 'foobar' }
    const result = interpreter.interpret();
    expect(result[0]).to.equal('foobar');
  });

  it('Concatenation: Num + Str', () => {
    tokenizer = new Tokenizer('10 a = 2 + varx');
    parser = new Parser(tokenizer);
    interpreter = new Interpreter(parser);
    interpreter.vars = { varx: 'foobar' }
    interpreter.interpret();
    expect(interpreter.vars).to.eql({ varx: 'foobar', a: '2foobar' });
  });

  it('Concatenation: Str + Num', () => {
    tokenizer = new Tokenizer('10 a = varx + 2');
    parser = new Parser(tokenizer);
    interpreter = new Interpreter(parser);
    interpreter.vars = { varx: 'foobar' }
    interpreter.interpret();
    expect(interpreter.vars).to.eql({ varx: 'foobar', a: 'foobar2' });
  });

  it('Concatenation: Str + NumVar + Num', () => {
    tokenizer = new Tokenizer('10 a = varx + b + 2');
    parser = new Parser(tokenizer);
    interpreter = new Interpreter(parser);
    interpreter.vars = { varx: 'foobar', b: 5 }
    interpreter.interpret();
    expect(interpreter.vars).to.eql({ varx: 'foobar', b: 5, a: 'foobar52' });
  });

  it('Concatenation: Str + NumVar + Num + Str', () => {
    tokenizer = new Tokenizer('10 a = varx + b + 2 + vary');
    parser = new Parser(tokenizer);
    interpreter = new Interpreter(parser);
    interpreter.vars = { varx: 'foobar', b: 5, vary: 'HELLO' }
    interpreter.interpret();
    expect(interpreter.vars).to.eql({ varx: 'foobar', b: 5, vary: 'HELLO', a: 'foobar52HELLO' });
  });
});

describe('other', () => {
  it('Multiple Statements with Line Numbers with LINEBREAK at End', () => {
    tokenizer = new Tokenizer('10 a = 56\n20 c = 1234\n30 xyz = "fooly"\n40newvar = xyz + c + a\n50 newvar\n');
    parser = new Parser(tokenizer);
    interpreter = new Interpreter(parser);
    const result = interpreter.interpret();
    expect(interpreter.vars).to.eql({ a: 56, c: 1234, xyz: 'fooly', newvar: 'fooly123456' });
    expect(result).to.eql([undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, 'fooly123456', undefined]);
  });

  it('Multiple Statements with Line Numbers without LINEBREAK at End', () => {
    tokenizer = new Tokenizer('10 a = 56\n20 c = 1234\n30 xyz = "fooly"\n40newvar = xyz + c + a\n50 newvar\n');
    parser = new Parser(tokenizer);
    interpreter = new Interpreter(parser);
    const result = interpreter.interpret();
    expect(interpreter.vars).to.eql({ a: 56, c: 1234, xyz: 'fooly', newvar: 'fooly123456' });
    expect(result).to.eql([undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, 'fooly123456', undefined]);
  });
});

describe('Commands', () => {
  it('PRINT string with spaces and numeric expression', () => {
    tokenizer = new Tokenizer('10 PRINT "Hello World" + 3 + 5');
    parser = new Parser(tokenizer);
    interpreter = new Interpreter(parser);
    const result = interpreter.interpret();
    expect(result[0]).to.equal('Hello World35');
  });

  it('PRINT string with spaces and numeric expression CANNOT follow another PRINT', () => {
    tokenizer = new Tokenizer('10 PRINT "Hello World" PRINT "foo bar"');
    parser = new Parser(tokenizer);
    interpreter = new Interpreter(parser);
    expect(interpreter.interpret.bind(interpreter.interpret)).to.throw();
  });

  it('GOTO', () => {
    tokenizer = new Tokenizer('10 PRINT "Hello World!" + 7 + 3\n20 GOTO 40\n30 PRINT "UH-OH!"\n40 PRINT "FIN"');
    parser = new Parser(tokenizer);
    interpreter = new Interpreter(parser);
    const result = interpreter.interpret();
    expect(result).to.eql(["Hello World!73", undefined, "FIN"]);
  });

  it('ABS with positive Variable', () => {
    tokenizer = new Tokenizer('10 VARX = 10\n20 PRINT ABS(VARX)\n30 PRINT "FIN"');
    parser = new Parser(tokenizer);
    interpreter = new Interpreter(parser);
    const result = interpreter.interpret();
    expect(result[2]).to.equal(10);
  });

  it('ABS with positive Number', () => {
    tokenizer = new Tokenizer('10 VARX = 10\n20 PRINT ABS(13)\n30 PRINT "FIN"');
    parser = new Parser(tokenizer);
    interpreter = new Interpreter(parser);
    const result = interpreter.interpret();
    expect(result[2]).to.equal(13);
  });

  it('ABS with negative Variable', () => {
    tokenizer = new Tokenizer('10 VARX = -10\n20 PRINT ABS(VARX)\n30 PRINT "FIN"');
    parser = new Parser(tokenizer);
    interpreter = new Interpreter(parser);
    const result = interpreter.interpret();
    expect(result[2]).to.equal(10);
  });

  it('ABS with negative Number', () => {
    tokenizer = new Tokenizer('10 VARX = 10\n20 PRINT ABS(-13)\n30 PRINT "FIN"');
    parser = new Parser(tokenizer);
    interpreter = new Interpreter(parser);
    const result = interpreter.interpret();
    expect(result[2]).to.equal(13);
  });

  it('ABS with positive Number and Variable', () => {
    tokenizer = new Tokenizer('10 VARX = 10\n20 PRINT ABS(13) + ABS(VARX)\n30 PRINT "FIN"');
    parser = new Parser(tokenizer);
    interpreter = new Interpreter(parser);
    const result = interpreter.interpret();
    expect(result[2]).to.equal(23);
    console.log(result);
  });

  it('ATN with Number', () => {
    tokenizer = new Tokenizer('10 VARX = 10\n20 PRINT ATN(56)\n30 PRINT "FIN"');
    parser = new Parser(tokenizer);
    interpreter = new Interpreter(parser);
    const result = interpreter.interpret();
    expect(result[2]).to.equal(1.5529410816553442);
  });

  it('ATN with Variable', () => {
    tokenizer = new Tokenizer('10 VARX = 56\n20 PRINT ATN(VARX)\n30 PRINT "FIN"');
    parser = new Parser(tokenizer);
    interpreter = new Interpreter(parser);
    const result = interpreter.interpret();
    expect(result[2]).to.equal(1.5529410816553442);
  });


  it('ATN with Variable and Number', () => {
    tokenizer = new Tokenizer('10 VARX = 56\n20 PRINT ATN(VARX) + ATN(20)\n30 PRINT "FIN"');
    parser = new Parser(tokenizer);
    interpreter = new Interpreter(parser);
    const result = interpreter.interpret();
    expect(result[2]).to.equal(3.073779012728298);
  });

  it('CHR$ with Variable and Number', () => {
    tokenizer = new Tokenizer('10 VARX = 65\n20 PRINT CHR$(VARX) + CHR$(65)\n30 PRINT "FIN"');
    parser = new Parser(tokenizer);
    interpreter = new Interpreter(parser);
    const result = interpreter.interpret();
    expect(result[2]).to.equal('AA');
  });

  it('CHR$ with Number', () => {
    tokenizer = new Tokenizer('10 VARX = 65\n20 PRINT CHR$(65)\n30 PRINT "FIN"');
    parser = new Parser(tokenizer);
    interpreter = new Interpreter(parser);
    const result = interpreter.interpret();
    expect(result[2]).to.equal('A');
  });

  it('CHR$ with Variable', () => {
    tokenizer = new Tokenizer('10 VARX = 65\n20 PRINT CHR$(VARX)\n30 PRINT "FIN"');
    parser = new Parser(tokenizer);
    interpreter = new Interpreter(parser);
    const result = interpreter.interpret();
    expect(result[2]).to.equal('A');
  });

  it('CHR$ with Number Concat Variable', () => {
    tokenizer = new Tokenizer('10 VARX = 32.5\n20 PRINT CHR$(32.5 + VARX)\n30 PRINT "FIN"');
    parser = new Parser(tokenizer);
    interpreter = new Interpreter(parser);
    const result = interpreter.interpret();
    expect(result[2]).to.equal('A');
  });

  it('CINT with Variable, should floor', () => {
    tokenizer = new Tokenizer('10 VARX = 9.4\n20 PRINT CINT(VARX)\n30 PRINT "FIN"');
    parser = new Parser(tokenizer);
    interpreter = new Interpreter(parser);
    const result = interpreter.interpret();
    expect(result[2]).to.equal(9);
  });

  it('CINT with Variable, should Ceil', () => {
    tokenizer = new Tokenizer('10 VARX = 9.5\n20 PRINT CINT(VARX)\n30 PRINT "FIN"');
    parser = new Parser(tokenizer);
    interpreter = new Interpreter(parser);
    const result = interpreter.interpret();
    expect(result[2]).to.equal(10);
  });

  it('CINT with Number, should floor', () => {
    tokenizer = new Tokenizer('10 VARX = 9.4\n20 PRINT CINT(9.4)\n30 PRINT "FIN"');
    parser = new Parser(tokenizer);
    interpreter = new Interpreter(parser);
    const result = interpreter.interpret();
    expect(result[2]).to.equal(9);
  });

  it('CINT with Number, should Ceil', () => {
    tokenizer = new Tokenizer('10 VARX = 9.5\n20 PRINT CINT(9.5)\n30 PRINT "FIN"');
    parser = new Parser(tokenizer);
    interpreter = new Interpreter(parser);
    const result = interpreter.interpret();
    expect(result[2]).to.equal(10);
  });

  it('CINT with Number and Variable, should floor', () => {
    tokenizer = new Tokenizer('10 VARX = 4.7\n20 PRINT CINT(4.7 + VARX)\n30 PRINT "FIN"');
    parser = new Parser(tokenizer);
    interpreter = new Interpreter(parser);
    const result = interpreter.interpret();
    expect(result[2]).to.equal(9);
  });

  it('CINT with Number and Variable, should Ceil', () => {
    tokenizer = new Tokenizer('10 VARX = 4.8\n20 PRINT CINT(4.8 + VARX)\n30 PRINT "FIN"');
    parser = new Parser(tokenizer);
    interpreter = new Interpreter(parser);
    const result = interpreter.interpret();
    expect(result[2]).to.equal(10);
  });

  it('COS with Number', () => {
    tokenizer = new Tokenizer('10 VARX = 10\n20 PRINT COS(56)\n30 PRINT "FIN"');
    parser = new Parser(tokenizer);
    interpreter = new Interpreter(parser);
    const result = interpreter.interpret();
    expect(result[2]).to.equal(0.853220107722584);
  });

  it('COS with Variable', () => {
    tokenizer = new Tokenizer('10 VARX = 56\n20 PRINT COS(VARX)\n30 PRINT "FIN"');
    parser = new Parser(tokenizer);
    interpreter = new Interpreter(parser);
    const result = interpreter.interpret();
    expect(result[2]).to.equal(0.853220107722584);
  });

  it('COS with Variable and Number', () => {
    tokenizer = new Tokenizer('10 VARX = 56\n20 PRINT COS(VARX) + COS(20)\n30 PRINT "FIN"');
    parser = new Parser(tokenizer);
    interpreter = new Interpreter(parser);
    const result = interpreter.interpret();
    expect(result[2]).to.equal(1.261302169535976);
  });

  it('END', () => { // change later to process.exit(0)
    // sinon.stub(process, 'exit');
    // tokenizer = new Tokenizer('10 END');
    // parser = new Parser(tokenizer);
    // interpreter = new Interpreter(parser);
    // interpreter.interpret();
    // expect(process.exit['calledWith'](0)).to.equal(true);
    tokenizer = new Tokenizer('10 END');
    parser = new Parser(tokenizer);
    interpreter = new Interpreter(parser);
    const result = interpreter.interpret();
    expect(result).to.eql([undefined]);
  });

  it('EXP with Number', () => {
    tokenizer = new Tokenizer('10 VARX = 10\n20 PRINT EXP(56)\n30 PRINT "FIN"');
    parser = new Parser(tokenizer);
    interpreter = new Interpreter(parser);
    const result = interpreter.interpret();
    expect(result[2]).to.equal(2.091659496012996e+24);
  });

  it('EXP with Variable', () => {
    tokenizer = new Tokenizer('10 VARX = 56\n20 PRINT EXP(VARX)\n30 PRINT "FIN"');
    parser = new Parser(tokenizer);
    interpreter = new Interpreter(parser);
    const result = interpreter.interpret();
    expect(result[2]).to.equal(2.091659496012996e+24);
  });

  it('EXP with Variable and Number', () => {
    tokenizer = new Tokenizer('10 VARX = 5\n20 PRINT EXP(VARX) + EXP(2)\n30 PRINT "FIN"');
    parser = new Parser(tokenizer);
    interpreter = new Interpreter(parser);
    const result = interpreter.interpret();
    expect(result[2]).to.equal(155.80221520150724);
  });

  it('HEX$ with Number', () => {
    tokenizer = new Tokenizer('10 VARX = 5\n20 PRINT HEX$(2222222222222)\n30 PRINT "FIN"');
    parser = new Parser(tokenizer);
    interpreter = new Interpreter(parser);
    const result = interpreter.interpret();
    expect(result[2]).to.equal('20566C4238E');
  });


  it('HEX$ with Variable', () => {
    tokenizer = new Tokenizer('10 VARX = 23453467\n20 PRINT HEX$(VARX)\n30 PRINT "FIN"');
    parser = new Parser(tokenizer);
    interpreter = new Interpreter(parser);
    const result = interpreter.interpret();
    expect(result[2]).to.equal('165DF1B');
  });

  it('HEX$ with Variable and Number', () => {
    tokenizer = new Tokenizer('10 VARX = 23453467\n20 PRINT HEX$(VARX + 345121)\n30 PRINT "FIN"');
    parser = new Parser(tokenizer);
    interpreter = new Interpreter(parser);
    const result = interpreter.interpret();
    expect(result[2]).to.equal('16B233C');
  });

  // it('INKEY$', () => { // TODO: How to do without Pressing ENTER ? Mocking does not work
  //   tokenizer = new Tokenizer('10 VARX = INKEY$\n20 PRINT VARX\n30 PRINT "FIN"');
  //   parser = new Parser(tokenizer);
  //   interpreter = new Interpreter(parser);
  //   console.log('Press a key + enter');
  //   const result = interpreter.interpret();
  //   console.log(result);
  // }).timeout(60000);

  // it('INPUT', () => { // TODO: Mocking does not work
  //   tokenizer = new Tokenizer('10 VARX = 123\n20 INPUT "Foo Bar!", VXY\n30 PRINT "VXY"');
  //   parser = new Parser(tokenizer);
  //   interpreter = new Interpreter(parser);
  //   console.log('Press a key + enter');
  //   const result = interpreter.interpret();
  //   console.log(result);
  //   console.log(interpreter.vars);
  // }).timeout(60000);

  it('GOSUB / RETURN', () => {
    tokenizer = new Tokenizer('10 VARX = 23453467\n20 PRINT "BEFORE GOSUB"\n30 GOSUB 100\n40 PRINT "FIN"\n50 END\n100 PRINT "INTO GOSUB"\n110 RETURN');
    parser = new Parser(tokenizer);
    interpreter = new Interpreter(parser);
    const result = interpreter.interpret();
    expect(result).to.eql([undefined, undefined, 'BEFORE GOSUB', undefined, 'INTO GOSUB', undefined, 'FIN', undefined]);
  });

  it('INSTR with Literals, find second o', () => {
    tokenizer = new Tokenizer('10 VARX = "Hello World!"\n20 PRINT INSTR(VARX, "o", 6)\n30 PRINT "FIN"');
    parser = new Parser(tokenizer);
    interpreter = new Interpreter(parser);
    const result = interpreter.interpret();
    expect(result).to.eql([undefined, undefined, 7, 'FIN']);
  });

  it('INSTR with Literals, find first o', () => {
    tokenizer = new Tokenizer('10 VARX = "Hello World!"\n20 PRINT INSTR(VARX, "o", 0)\n30 PRINT "FIN"');
    parser = new Parser(tokenizer);
    interpreter = new Interpreter(parser);
    const result = interpreter.interpret();
    expect(result).to.eql([undefined, undefined, 4, 'FIN']);
  });

  // ---

  it('INSTR with Variables, find second o', () => {
    tokenizer = new Tokenizer('10 VARX = "Hello World!"\n21 FINDV = "o"\n22 POSI = 6\n20 PRINT INSTR(VARX, FINDV, POSI)\n30 PRINT "FIN"');
    parser = new Parser(tokenizer);
    interpreter = new Interpreter(parser);
    const result = interpreter.interpret();
    expect(result).to.eql([undefined, undefined, undefined, undefined, undefined, undefined, 7, 'FIN']);
  });

  it('INSTR with Variables, find first o', () => {
    tokenizer = new Tokenizer('10 VARX = "Hello World!"\n21 FINDV = "o"\n22 POSI = 0\n20 PRINT INSTR(VARX, FINDV, POSI)\n30 PRINT "FIN"');
    parser = new Parser(tokenizer);
    interpreter = new Interpreter(parser);
    const result = interpreter.interpret();
    expect(result).to.eql([undefined, undefined, undefined, undefined, undefined, undefined, 4, 'FIN']);
  });

  it('INT with Literal', () => {
    tokenizer = new Tokenizer('10 VARX = "Hello World!"\n20 PRINT INT(21.6)\n30 PRINT "FIN"');
    parser = new Parser(tokenizer);
    interpreter = new Interpreter(parser);
    const result = interpreter.interpret();
    expect(result).to.eql([undefined, undefined, 21, 'FIN']);
  });

  it('INT with Variable', () => {
    tokenizer = new Tokenizer('10 VARX = 2.1\n20 PRINT INT(VARX)\n30 PRINT "FIN"');
    parser = new Parser(tokenizer);
    interpreter = new Interpreter(parser);
    const result = interpreter.interpret();
    expect(result).to.eql([undefined, undefined, 2, 'FIN']);
  });

  it('LEFT$ with Literal', () => {
    tokenizer = new Tokenizer('10 VARX = "Hello World!"\n20 PRINT LEFT$("Hello World!", 3)\n30 PRINT "FIN"');
    parser = new Parser(tokenizer);
    interpreter = new Interpreter(parser);
    const result = interpreter.interpret();
    expect(result).to.eql([undefined, undefined, 'Hel', 'FIN']);
  });

  it('LEFT$ with Variables', () => {
    tokenizer = new Tokenizer('10 VARX = "Hello World!"\n15 HOWMANY = 3\n20 PRINT LEFT$(VARX, HOWMANY)\n30 PRINT "FIN"');
    parser = new Parser(tokenizer);
    interpreter = new Interpreter(parser);
    const result = interpreter.interpret();
    expect(result).to.eql([undefined, undefined, undefined, undefined, 'Hel', 'FIN']);
  });

  it('LET Assign a Number', () => {
    tokenizer = new Tokenizer('10 VARX = "Hello World!"\n15 LET NR = 31\n20 PRINT NR\n30 PRINT "FIN"');
    parser = new Parser(tokenizer);
    interpreter = new Interpreter(parser);
    const result = interpreter.interpret();
    expect(result).to.eql([undefined, undefined, undefined, undefined, 31, 'FIN']);
  });

  it('LET Assign a String', () => {
    tokenizer = new Tokenizer('10 VARX = "Hello World!"\n15 LET SOMESTR = "Hai World!"\n20 PRINT SOMESTR\n30 PRINT "FIN"');
    parser = new Parser(tokenizer);
    interpreter = new Interpreter(parser);
    const result = interpreter.interpret();
    expect(result).to.eql([undefined, undefined, undefined, undefined, 'Hai World!', 'FIN']);
  });

  it('LOG with Literal', () => {
    tokenizer = new Tokenizer('10 VARX = "Hello World!"\n20 PRINT LOG(5)\n30 PRINT "FIN"');
    parser = new Parser(tokenizer);
    interpreter = new Interpreter(parser);
    const result = interpreter.interpret();
    expect(result).to.eql([undefined, undefined, 1.6094379124341003, 'FIN']);
  });

  it('LOG with Variable', () => {
    tokenizer = new Tokenizer('10 VARX = 5\n20 PRINT LOG(VARX)\n30 PRINT "FIN"');
    parser = new Parser(tokenizer);
    interpreter = new Interpreter(parser);
    const result = interpreter.interpret();
    expect(result).to.eql([undefined, undefined, 1.6094379124341003, 'FIN']);
  });

  it('MID$ with Literal', () => {
    tokenizer = new Tokenizer('10 VARX = "Hello World!"\n20 PRINT MID$("Hello World!", 3, 4)\n30 PRINT "FIN"');
    parser = new Parser(tokenizer);
    interpreter = new Interpreter(parser);
    const result = interpreter.interpret();
    expect(result).to.eql([undefined, undefined, 'lo W', 'FIN']);
  });

  it('MID$ with Variables', () => {
    tokenizer = new Tokenizer('10 VARX = "Hello World!"\n15 HOWMANY = 3\n17 LNGT = 4\n20 PRINT MID$(VARX, HOWMANY, LNGT)\n30 PRINT "FIN"');
    parser = new Parser(tokenizer);
    interpreter = new Interpreter(parser);
    const result = interpreter.interpret();
    expect(result).to.eql([undefined, undefined, undefined, undefined, undefined, undefined, 'lo W', 'FIN']);
  });

  it('Combine multiple Commands in one Statement', () => {
    tokenizer = new Tokenizer('10 VARX = "Hello World!"\n20 PRINT LOG(5) + ABS(-3) + INT(5.9)\n30 PRINT "FIN"');
    parser = new Parser(tokenizer);
    interpreter = new Interpreter(parser);
    const result = interpreter.interpret();
    expect(result).to.eql([undefined, undefined, 9.6094379124341, 'FIN']);
  });

  it('LEN with Literal', () => {
    tokenizer = new Tokenizer('10 VARX = "Hello World!"\n20 PRINT LEN("Hello World!")\n30 PRINT "FIN"');
    parser = new Parser(tokenizer);
    interpreter = new Interpreter(parser);
    const result = interpreter.interpret();
    expect(result).to.eql([undefined, undefined, 12, 'FIN']);
  });

  it('LEN with Variable', () => {
    tokenizer = new Tokenizer('10 VARX = "Hello World!"\n20 PRINT LEN(VARX)\n30 PRINT "FIN"');
    parser = new Parser(tokenizer);
    interpreter = new Interpreter(parser);
    const result = interpreter.interpret();
    expect(result).to.eql([undefined, undefined, 12, 'FIN']);
  });

  it('NINT with Literal 9.5 should become 9', () => {
    tokenizer = new Tokenizer('10 VARX = "Hello World!"\n20 PRINT NINT(9.5)\n30 PRINT "FIN"');
    parser = new Parser(tokenizer);
    interpreter = new Interpreter(parser);
    const result = interpreter.interpret();
    expect(result).to.eql([undefined, undefined, 9, 'FIN']);
  });

  it('NINT with Literal 9.6 should become 10', () => {
    tokenizer = new Tokenizer('10 VARX = "Hello World!"\n20 PRINT NINT(9.6)\n30 PRINT "FIN"');
    parser = new Parser(tokenizer);
    interpreter = new Interpreter(parser);
    const result = interpreter.interpret();
    expect(result).to.eql([undefined, undefined, 10, 'FIN']);
  });

  it('NINT with Variable 9.5 should become 9', () => {
    tokenizer = new Tokenizer('10 VARX = 9.5\n20 PRINT NINT(VARX)\n30 PRINT "FIN"');
    parser = new Parser(tokenizer);
    interpreter = new Interpreter(parser);
    const result = interpreter.interpret();
    expect(result).to.eql([undefined, undefined, 9, 'FIN']);
  });

  it('NINT with Variable 9.6 should become 10', () => {
    tokenizer = new Tokenizer('10 VARX = 9.6\n20 PRINT NINT(VARX)\n30 PRINT "FIN"');
    parser = new Parser(tokenizer);
    interpreter = new Interpreter(parser);
    const result = interpreter.interpret();
    expect(result).to.eql([undefined, undefined, 10, 'FIN']);
  });

  it('OCT$ with Literal', () => {
    tokenizer = new Tokenizer('10 VARX = "Hello World!"\n20 PRINT OCT$(66)\n30 PRINT "FIN"');
    parser = new Parser(tokenizer);
    interpreter = new Interpreter(parser);
    const result = interpreter.interpret();
    expect(result).to.eql([undefined, undefined, 102, 'FIN']);
  });

  it('OCT$ with Variable', () => {
    tokenizer = new Tokenizer('10 VARX = 66\n20 PRINT OCT$(VARX)\n30 PRINT "FIN"');
    parser = new Parser(tokenizer);
    interpreter = new Interpreter(parser);
    const result = interpreter.interpret();
    expect(result).to.eql([undefined, undefined, 102, 'FIN']);
  });

  it('R2D with Literal', () => {
    tokenizer = new Tokenizer('10 VARX = "Hello World!"\n20 PRINT R2D(36)\n30 PRINT "FIN"');
    parser = new Parser(tokenizer);
    interpreter = new Interpreter(parser);
    const result = interpreter.interpret();
    expect(result).to.eql([undefined, undefined, 2062.648062470964, 'FIN']);
  });

  it('R2D with Variable', () => {
    tokenizer = new Tokenizer('10 VARX = 36\n20 PRINT R2D(VARX)\n30 PRINT "FIN"');
    parser = new Parser(tokenizer);
    interpreter = new Interpreter(parser);
    const result = interpreter.interpret();
    expect(result).to.eql([undefined, undefined, 2062.648062470964, 'FIN']);
  });
});