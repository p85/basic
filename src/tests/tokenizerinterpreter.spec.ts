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
  '10 290 MOD 7 + 3 * 8 / 2 - 5 MOD 2',
  '10 5 AND 39',
  '10 5 AND 39 + 5 * 5 + (512 * -3)',
  '10 312 OR 52',
  '10 312 OR 52 + 5 * 5 + (512 * -3)',
];

describe('calculus', () => {
  testValues.forEach(testExpr => {
    it(testExpr, () => {
      tokenizer = new Tokenizer(testExpr);
      parser = new Parser(tokenizer);
      interpreter = new Interpreter(parser);
      const result = interpreter.interpret();
      expect(result[0]).to.equal(eval(testExpr.replace(/MOD/g, '%').replace(/^[0-9]+ {1}/, '').replace(/AND/g, '&').replace(/OR/g, '|')));
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

  it('RIGHT$ with Literal', () => {
    tokenizer = new Tokenizer('10 VARX = "Hello World!"\n20 PRINT RIGHT$("Hello World!", 4)\n30 PRINT "FIN"');
    parser = new Parser(tokenizer);
    interpreter = new Interpreter(parser);
    const result = interpreter.interpret();
    expect(result).to.eql([undefined, undefined, 'rld!', 'FIN']);
  });

  it('RIGHT$ with Variable', () => {
    tokenizer = new Tokenizer('10 VARX = "Hello World!"\n15 AMNT = 4\n20 PRINT RIGHT$(VARX, AMNT)\n30 PRINT "FIN"');
    parser = new Parser(tokenizer);
    interpreter = new Interpreter(parser);
    const result = interpreter.interpret();
    expect(result).to.eql([undefined, undefined, undefined, undefined, 'rld!', 'FIN']);
  });

  it('RND should return a Number between 0 and 1', () => {
    tokenizer = new Tokenizer('10 VARX = "Hello World!"\n20 PRINT RND\n30 PRINT "FIN"');
    parser = new Parser(tokenizer);
    interpreter = new Interpreter(parser);
    const result = interpreter.interpret();
    expect(result[2]).to.be.greaterThan(0);
    expect(result[2]).to.be.below(1);
  });

  it('RND() should return a Number between 0 and 1', () => {
    tokenizer = new Tokenizer('10 VARX = "Hello World!"\n20 PRINT RND()\n30 PRINT "FIN"');
    parser = new Parser(tokenizer);
    interpreter = new Interpreter(parser);
    const result = interpreter.interpret();
    expect(result[2]).to.be.greaterThan(0);
    expect(result[2]).to.be.below(1);
  });

  it('RND(321) should return a Number between 0 and 1', () => {
    tokenizer = new Tokenizer('10 VARX = "Hello World!"\n20 PRINT RND(321)\n30 PRINT "FIN"');
    parser = new Parser(tokenizer);
    interpreter = new Interpreter(parser);
    const result = interpreter.interpret();
    expect(result[2]).to.be.greaterThan(0);
    expect(result[2]).to.be.below(1);
  });

  it('SGN(0) with Literal, should return 0', () => {
    tokenizer = new Tokenizer('10 VARX = "Hello World!"\n20 PRINT SGN(0)\n30 PRINT "FIN"');
    parser = new Parser(tokenizer);
    interpreter = new Interpreter(parser);
    const result = interpreter.interpret();
    expect(result).to.eql([undefined, undefined, 0, 'FIN']);
  });

  it('SGN(0) with Variable, should return 0', () => {
    tokenizer = new Tokenizer('10 VARX = 0\n20 PRINT SGN(VARX)\n30 PRINT "FIN"');
    parser = new Parser(tokenizer);
    interpreter = new Interpreter(parser);
    const result = interpreter.interpret();
    expect(result).to.eql([undefined, undefined, 0, 'FIN']);
  });

  it('SGN(1) with Literal, should return 1', () => {
    tokenizer = new Tokenizer('10 VARX = "Hello World!"\n20 PRINT SGN(1)\n30 PRINT "FIN"');
    parser = new Parser(tokenizer);
    interpreter = new Interpreter(parser);
    const result = interpreter.interpret();
    expect(result).to.eql([undefined, undefined, 1, 'FIN']);
  });

  it('SGN(1) with Variable, should return 1', () => {
    tokenizer = new Tokenizer('10 VARX = 1\n20 PRINT SGN(VARX)\n30 PRINT "FIN"');
    parser = new Parser(tokenizer);
    interpreter = new Interpreter(parser);
    const result = interpreter.interpret();
    expect(result).to.eql([undefined, undefined, 1, 'FIN']);
  });

  it('SGN(-1) with Literal, should return -1', () => {
    tokenizer = new Tokenizer('10 VARX = "Hello World!"\n20 PRINT SGN(-1)\n30 PRINT "FIN"');
    parser = new Parser(tokenizer);
    interpreter = new Interpreter(parser);
    const result = interpreter.interpret();
    expect(result).to.eql([undefined, undefined, -1, 'FIN']);
  });

  it('SGN(-1) with Variable, should return -1', () => {
    tokenizer = new Tokenizer('10 VARX = -1\n20 PRINT SGN(VARX)\n30 PRINT "FIN"');
    parser = new Parser(tokenizer);
    interpreter = new Interpreter(parser);
    const result = interpreter.interpret();
    expect(result).to.eql([undefined, undefined, -1, 'FIN']);
  });

  it('SIN(23) with Literal', () => {
    tokenizer = new Tokenizer('10 VARX = "Hello World!"\n20 PRINT SIN(23)\n30 PRINT "FIN"');
    parser = new Parser(tokenizer);
    interpreter = new Interpreter(parser);
    const result = interpreter.interpret();
    expect(result).to.eql([undefined, undefined, -0.8462204041751706, 'FIN']);
  });

  it('SIN(23) with Variable', () => {
    tokenizer = new Tokenizer('10 VARX = 23\n20 PRINT SIN(VARX)\n30 PRINT "FIN"');
    parser = new Parser(tokenizer);
    interpreter = new Interpreter(parser);
    const result = interpreter.interpret();
    expect(result).to.eql([undefined, undefined, -0.8462204041751706, 'FIN']);
  });

  // TODO: How to test SLEEP?
  // it('SLEEP(2) with Literal', () => {
  //   tokenizer = new Tokenizer('10 VARX = "Hello World!"\n20 SLEEP(2)\n30 PRINT "FIN"');
  //   parser = new Parser(tokenizer);
  //   interpreter = new Interpreter(parser);
  //   const result = interpreter.interpret();
  //   console.log(result);
  // });

  it('SQR(6) with Literal', () => {
    tokenizer = new Tokenizer('10 VARX = "Hello World!"\n20 PRINT SQR(6)\n30 PRINT "FIN"');
    parser = new Parser(tokenizer);
    interpreter = new Interpreter(parser);
    const result = interpreter.interpret();
    expect(result).to.eql([undefined, undefined, 2.449489742783178, 'FIN']);
  });

  it('SQR(6) with Variable', () => {
    tokenizer = new Tokenizer('10 VARX = 6\n20 PRINT SQR(VARX)\n30 PRINT "FIN"');
    parser = new Parser(tokenizer);
    interpreter = new Interpreter(parser);
    const result = interpreter.interpret();
    expect(result).to.eql([undefined, undefined, 2.449489742783178, 'FIN']);
  });

  it('STR$(612) with Literal', () => {
    tokenizer = new Tokenizer('10 VARX = "Hello World!"\n20 PRINT STR$(612)\n30 PRINT "FIN"');
    parser = new Parser(tokenizer);
    interpreter = new Interpreter(parser);
    const result = interpreter.interpret();
    expect(result).to.eql([undefined, undefined, '612', 'FIN']);
  });

  it('STR$(612) with Variable', () => {
    tokenizer = new Tokenizer('10 VARX = 612\n20 PRINT STR$(VARX)\n30 PRINT "FIN"');
    parser = new Parser(tokenizer);
    interpreter = new Interpreter(parser);
    const result = interpreter.interpret();
    expect(result).to.eql([undefined, undefined, '612', 'FIN']);
  });

  it('TAN(12) with Literal', () => {
    tokenizer = new Tokenizer('10 VARX = "Hello World!"\n20 PRINT TAN(12)\n30 PRINT "FIN"');
    parser = new Parser(tokenizer);
    interpreter = new Interpreter(parser);
    const result = interpreter.interpret();
    expect(result).to.eql([undefined, undefined, -0.6358599286615808, 'FIN']);
  });

  it('TAN(12) with Variable', () => {
    tokenizer = new Tokenizer('10 VARX = 12\n20 PRINT TAN(VARX)\n30 PRINT "FIN"');
    parser = new Parser(tokenizer);
    interpreter = new Interpreter(parser);
    const result = interpreter.interpret();
    expect(result).to.eql([undefined, undefined, -0.6358599286615808, 'FIN']);
  });

  it('TIME$', () => {
    tokenizer = new Tokenizer('10 VARX = "Hello World!"\n20 PRINT TIME$\n30 PRINT "FIN"');
    parser = new Parser(tokenizer);
    interpreter = new Interpreter(parser);
    const ctime = new Date().toLocaleTimeString();
    const result = interpreter.interpret();
    expect(result).to.eql([undefined, undefined, ctime, 'FIN']);
  });

  it('TIMER', () => {
    tokenizer = new Tokenizer('10 VARX = "Hello World!"\n20 PRINT TIMER\n30 PRINT "FIN"');
    parser = new Parser(tokenizer);
    interpreter = new Interpreter(parser);
    const secsSinceMidnight = Math['trunc']((<any>new Date() - new Date().setHours(0, 0, 0, 0)) / 1000);
    const result = interpreter.interpret();
    expect(result).to.eql([undefined, undefined, secsSinceMidnight, 'FIN']);
  });

  // it('WIDTH', () => { // WIDTH, HEIGHT not working in win7 :(
  //   tokenizer = new Tokenizer('10 VARX = "Hello World!"\n20 PRINT WIDTH\n30 PRINT "FIN"');
  //   parser = new Parser(tokenizer);
  //   interpreter = new Interpreter(parser);
  //   const secsSinceMidnight = Math['trunc']((<any>new Date() - new Date().setHours(0, 0, 0, 0)) / 1000);
  //   const result = interpreter.interpret();
  //   expect(result).to.eql([undefined, undefined, secsSinceMidnight, 'FIN']);
  // });

  // it('HEIGHT', () => {
  //   tokenizer = new Tokenizer('10 VARX = "Hello World!"\n20 PRINT HEIGHT\n30 PRINT "FIN"');
  //   parser = new Parser(tokenizer);
  //   interpreter = new Interpreter(parser);
  //   const secsSinceMidnight = Math['trunc']((<any>new Date() - new Date().setHours(0, 0, 0, 0)) / 1000);
  //   const result = interpreter.interpret();
  //   expect(result).to.eql([undefined, undefined, secsSinceMidnight, 'FIN']);
  // });

  it('VAL with Literal', () => {
    tokenizer = new Tokenizer('10 VARX = "Hello World!"\n20 PRINT VAL("12")\n30 PRINT "FIN"');
    parser = new Parser(tokenizer);
    interpreter = new Interpreter(parser);
    const result = interpreter.interpret();
    expect(result).to.eql([undefined, undefined, 12, 'FIN']);
  });

  it('VAL with Variable', () => {
    tokenizer = new Tokenizer('10 VARX = 12\n20 PRINT VAL(VARX)\n30 PRINT "FIN"');
    parser = new Parser(tokenizer);
    interpreter = new Interpreter(parser);
    const result = interpreter.interpret();
    expect(result).to.eql([undefined, undefined, 12, 'FIN']);
  });

  it('DATA with Literal Numbers', () => {
    tokenizer = new Tokenizer('10 VARX = "Hello World!"\n20 DATA 12, 356, 2\n30 PRINT "FIN"');
    parser = new Parser(tokenizer);
    interpreter = new Interpreter(parser);
    interpreter.interpret();
    expect(interpreter.data).to.eql([12, 356, 2]);
  });

  it('DATA with Literal Strings', () => {
    tokenizer = new Tokenizer('10 VARX = "Hello World!"\n20 DATA "He llo", "Wo Rld!", "."\n30 PRINT "FIN"');
    parser = new Parser(tokenizer);
    interpreter = new Interpreter(parser);
    interpreter.interpret();
    expect(interpreter.data).to.eql(['He llo', 'Wo Rld!', '.']);
  });

  it('DATA with Literal Strings/Numbers', () => {
    tokenizer = new Tokenizer('10 VARX = "Hello World!"\n20 DATA "He llo", 312, "Wo Rld!", 551, ".", 12\n30 PRINT "FIN"');
    parser = new Parser(tokenizer);
    interpreter = new Interpreter(parser);
    interpreter.interpret();
    expect(interpreter.data).to.eql(['He llo', 312, 'Wo Rld!', 551, '.', 12]);
  });

  it('DATA/READ with Literal Numbers', () => {
    tokenizer = new Tokenizer('10 VARX = "Hello World!"\n20 DATA 12, 356, 2\n25 READ AA, BB, CC\n30 PRINT "FIN"');
    parser = new Parser(tokenizer);
    interpreter = new Interpreter(parser);
    interpreter.interpret();
    expect(interpreter.vars['AA']).to.equal(12);
    expect(interpreter.vars['BB']).to.equal(356);
    expect(interpreter.vars['CC']).to.equal(2);
  });

  it('DATA/READ with Literal Strings', () => {
    tokenizer = new Tokenizer('10 VARX = "Hello World!"\n20 DATA "He llo", "Wo Rld!", "."\n25 READ AA, BB, CC\n30 PRINT "FIN"');
    parser = new Parser(tokenizer);
    interpreter = new Interpreter(parser);
    interpreter.interpret();
    expect(interpreter.vars['AA']).to.equal('He llo');
    expect(interpreter.vars['BB']).to.equal('Wo Rld!');
    expect(interpreter.vars['CC']).to.equal('.');
  });

  it('DATA/READ with Literal Strings/Numbers', () => {
    tokenizer = new Tokenizer('10 VARX = "Hello World!"\n20 DATA "He llo", 312, "Wo Rld!", 551, ".", 12\n25 READ AA, BB, CC, DD, EE, FF\n30 PRINT "FIN"');
    parser = new Parser(tokenizer);
    interpreter = new Interpreter(parser);
    interpreter.interpret();
    expect(interpreter.vars['AA']).to.equal('He llo');
    expect(interpreter.vars['BB']).to.equal(312);
    expect(interpreter.vars['CC']).to.equal('Wo Rld!');
    expect(interpreter.vars['DD']).to.equal(551);
    expect(interpreter.vars['EE']).to.equal('.');
    expect(interpreter.vars['FF']).to.equal(12);
  });

  it('FOR normal', () => {
    tokenizer = new Tokenizer('10 VARX = "Hello World!"\n20 FOR I = 0 TO 3 STEP 1\n30 PRINT I\n40 PRINT "LOOPY"\n50 NEXT I\n60 PRINT "FIN"');
    parser = new Parser(tokenizer);
    interpreter = new Interpreter(parser);
    const result = interpreter.interpret();
    expect(result).to.eql([undefined, undefined, undefined, 0, 'LOOPY', undefined, 1, 'LOOPY', undefined, 2, 'LOOPY', undefined, 3, 'LOOPY', undefined, undefined, 'FIN']);
  });

  it('FOR goto break out', () => {
    tokenizer = new Tokenizer('10 VARX = "Hello World!"\n20 FOR I = 0 TO 3 STEP 1\n30 PRINT I\n40 PRINT "LOOPY"\n44 GOTO 70\n50 NEXT I\n60 END\n70 PRINT "FIN"');
    parser = new Parser(tokenizer);
    interpreter = new Interpreter(parser);
    const result = interpreter.interpret();
    expect(result).to.eql([undefined, undefined, undefined, 0, 'LOOPY', undefined, 'FIN']);
    expect(interpreter.vars['I']).to.equal(0);
  });

  describe('IF', () => {
    describe('Truthy', () => {
      describe('Single Conditions', () => {
        describe('IF Single Condition String Equal', () => {
          it('IF Single Condition String Variable Equals Literal String', () => {
            tokenizer = new Tokenizer('10 VARX = "Hello World!"\n20 IF VARX = "Hello World!" THEN PRINT "OK"');
            parser = new Parser(tokenizer);
            interpreter = new Interpreter(parser);
            const result = interpreter.interpret();
            expect(result).to.eql([undefined, undefined, 'OK']);
          });
        
          it('IF Single Condition String Literal Equals Variable String', () => {
            tokenizer = new Tokenizer('10 VARX = "Hello World!"\n20 IF "Hello World!" = VARX THEN PRINT "OK"');
            parser = new Parser(tokenizer);
            interpreter = new Interpreter(parser);
            const result = interpreter.interpret();
            expect(result).to.eql([undefined, undefined, 'OK']);
          });
        
          it('IF Single Condition String Literal Equals Literal String', () => {
            tokenizer = new Tokenizer('10 VARX = "Hello World!"\n20 IF "Hello World!" = "Hello World!" THEN PRINT "OK"');
            parser = new Parser(tokenizer);
            interpreter = new Interpreter(parser);
            const result = interpreter.interpret();
            expect(result).to.eql([undefined, undefined, 'OK']);
          });
        
          it('IF Single Condition String Variable Equals Variable String', () => {
            tokenizer = new Tokenizer('10 VARX = "Hello World!"\n11 VARY = "Hello World!"\n20 IF VARX = VARY THEN PRINT "OK"');
            parser = new Parser(tokenizer);
            interpreter = new Interpreter(parser);
            const result = interpreter.interpret();
            expect(result).to.eql([undefined, undefined, undefined, undefined, 'OK']);
          });
        });
        describe('IF Single Condition String NotEqual', () => {
          it('IF Single Condition String Variable NotEquals Literal String', () => {
            tokenizer = new Tokenizer('10 VARX = "Hello World!"\n20 IF VARX <> "Hello World!x" THEN PRINT "OK"');
            parser = new Parser(tokenizer);
            interpreter = new Interpreter(parser);
            const result = interpreter.interpret();
            expect(result).to.eql([undefined, undefined, 'OK']);
          });
        
          it('IF Single Condition String Literal NotEquals Variable String', () => {
            tokenizer = new Tokenizer('10 VARX = "Hello World!"\n20 IF "Hello World!x" <> VARX THEN PRINT "OK"');
            parser = new Parser(tokenizer);
            interpreter = new Interpreter(parser);
            const result = interpreter.interpret();
            expect(result).to.eql([undefined, undefined, 'OK']);
          });
        
          it('IF Single Condition String Literal NotEquals Literal String', () => {
            tokenizer = new Tokenizer('10 VARX = "Hello World!"\n20 IF "Hello World!x" <> "Hello Wxorld!" THEN PRINT "OK"');
            parser = new Parser(tokenizer);
            interpreter = new Interpreter(parser);
            const result = interpreter.interpret();
            expect(result).to.eql([undefined, undefined, 'OK']);
          });
        
          it('IF Single Condition String Variable NotEquals Variable String', () => {
            tokenizer = new Tokenizer('10 VARX = "Hello Wxorld!"\n11 VARY = "Hellxo World!"\n20 IF VARX <> VARY THEN PRINT "OK"');
            parser = new Parser(tokenizer);
            interpreter = new Interpreter(parser);
            const result = interpreter.interpret();
            expect(result).to.eql([undefined, undefined, undefined, undefined, 'OK']);
          });
        });
        describe('IF Single Condition Number Equal', () => {
          it('IF Single Condition Number Variable Equals Literal Number', () => {
            tokenizer = new Tokenizer('10 VARX = 51\n20 IF VARX = 51 THEN PRINT "OK"');
            parser = new Parser(tokenizer);
            interpreter = new Interpreter(parser);
            const result = interpreter.interpret();
            expect(result).to.eql([undefined, undefined, 'OK']);
          });
        
          it('IF Single Condition Number Literal Equals Variable Number', () => {
            tokenizer = new Tokenizer('10 VARX = 51\n20 IF 51 = VARX THEN PRINT "OK"');
            parser = new Parser(tokenizer);
            interpreter = new Interpreter(parser);
            const result = interpreter.interpret();
            expect(result).to.eql([undefined, undefined, 'OK']);
          });
        
          it('IF Single Condition Number Literal Equals Literal Number', () => {
            tokenizer = new Tokenizer('10 VARX = "Hello World!"\n20 IF 51 = 51 THEN PRINT "OK"');
            parser = new Parser(tokenizer);
            interpreter = new Interpreter(parser);
            const result = interpreter.interpret();
            expect(result).to.eql([undefined, undefined, 'OK']);
          });
        
          it('IF Single Condition Number Variable Equals Variable Number', () => {
            tokenizer = new Tokenizer('10 VARX = 51\n11 VARY = 51\n20 IF VARX = VARY THEN PRINT "OK"');
            parser = new Parser(tokenizer);
            interpreter = new Interpreter(parser);
            const result = interpreter.interpret();
            expect(result).to.eql([undefined, undefined, undefined, undefined, 'OK']);
          });
        });
        describe('IF Single Condition Number NotEqual', () => {
          it('IF Single Condition Number Variable NotEqual Literal Number', () => {
            tokenizer = new Tokenizer('10 VARX = 51\n20 IF VARX <> 52 THEN PRINT "OK"');
            parser = new Parser(tokenizer);
            interpreter = new Interpreter(parser);
            const result = interpreter.interpret();
            expect(result).to.eql([undefined, undefined, 'OK']);
          });
        
          it('IF Single Condition Number Literal NotEqual Variable Number', () => {
            tokenizer = new Tokenizer('10 VARX = 51\n20 IF 52 <> VARX THEN PRINT "OK"');
            parser = new Parser(tokenizer);
            interpreter = new Interpreter(parser);
            const result = interpreter.interpret();
            expect(result).to.eql([undefined, undefined, 'OK']);
          });
        
          it('IF Single Condition Number Literal NotEqual Literal Number', () => {
            tokenizer = new Tokenizer('10 VARX = "Hello World!"\n20 IF 52 <> 51 THEN PRINT "OK"');
            parser = new Parser(tokenizer);
            interpreter = new Interpreter(parser);
            const result = interpreter.interpret();
            expect(result).to.eql([undefined, undefined, 'OK']);
          });
        
          it('IF Single Condition Number Variable NotEqual Variable Number', () => {
            tokenizer = new Tokenizer('10 VARX = 52\n11 VARY = 51\n20 IF VARX <> VARY THEN PRINT "OK"');
            parser = new Parser(tokenizer);
            interpreter = new Interpreter(parser);
            const result = interpreter.interpret();
            expect(result).to.eql([undefined, undefined, undefined, undefined, 'OK']);
          });
        });
        describe('IF Single Condition Number Greater', () => {
          it('IF Single Condition Number Variable Greater Literal Number', () => {
            tokenizer = new Tokenizer('10 VARX = 55\n20 IF VARX > 52 THEN PRINT "OK"');
            parser = new Parser(tokenizer);
            interpreter = new Interpreter(parser);
            const result = interpreter.interpret();
            expect(result).to.eql([undefined, undefined, 'OK']);
          });
        
          it('IF Single Condition Number Literal Greater Variable Number', () => {
            tokenizer = new Tokenizer('10 VARX = 50\n20 IF 52 > VARX THEN PRINT "OK"');
            parser = new Parser(tokenizer);
            interpreter = new Interpreter(parser);
            const result = interpreter.interpret();
            expect(result).to.eql([undefined, undefined, 'OK']);
          });
        
          it('IF Single Condition Number Literal Greater Literal Number', () => {
            tokenizer = new Tokenizer('10 VARX = "Hello World!"\n20 IF 52 > 51 THEN PRINT "OK"');
            parser = new Parser(tokenizer);
            interpreter = new Interpreter(parser);
            const result = interpreter.interpret();
            expect(result).to.eql([undefined, undefined, 'OK']);
          });
        
          it('IF Single Condition Number Variable Greater Variable Number', () => {
            tokenizer = new Tokenizer('10 VARX = 52\n11 VARY = 51\n20 IF VARX > VARY THEN PRINT "OK"');
            parser = new Parser(tokenizer);
            interpreter = new Interpreter(parser);
            const result = interpreter.interpret();
            expect(result).to.eql([undefined, undefined, undefined, undefined, 'OK']);
          });
        });
        describe('IF Single Condition Number Lower', () => {
          it('IF Single Condition Number Variable Lower Literal Number', () => {
            tokenizer = new Tokenizer('10 VARX = 50\n20 IF VARX < 52 THEN PRINT "OK"');
            parser = new Parser(tokenizer);
            interpreter = new Interpreter(parser);
            const result = interpreter.interpret();
            expect(result).to.eql([undefined, undefined, 'OK']);
          });
        
          it('IF Single Condition Number Literal Lower Variable Number', () => {
            tokenizer = new Tokenizer('10 VARX = 52\n20 IF 50 < VARX THEN PRINT "OK"');
            parser = new Parser(tokenizer);
            interpreter = new Interpreter(parser);
            const result = interpreter.interpret();
            expect(result).to.eql([undefined, undefined, 'OK']);
          });
        
          it('IF Single Condition Number Literal Lower Literal Number', () => {
            tokenizer = new Tokenizer('10 VARX = "Hello World!"\n20 IF 50 < 51 THEN PRINT "OK"');
            parser = new Parser(tokenizer);
            interpreter = new Interpreter(parser);
            const result = interpreter.interpret();
            expect(result).to.eql([undefined, undefined, 'OK']);
          });
        
          it('IF Single Condition Number Variable Lower Variable Number', () => {
            tokenizer = new Tokenizer('10 VARX = 50\n11 VARY = 51\n20 IF VARX < VARY THEN PRINT "OK"');
            parser = new Parser(tokenizer);
            interpreter = new Interpreter(parser);
            const result = interpreter.interpret();
            expect(result).to.eql([undefined, undefined, undefined, undefined, 'OK']);
          });
        });
        describe('IF Single Condition Number GreaterEqual', () => {
          describe('equal', () => {
            it('IF Single Condition Number Variable GreaterEqual Literal Number', () => {
              tokenizer = new Tokenizer('10 VARX = 50\n20 IF VARX >= 50 THEN PRINT "OK"');
              parser = new Parser(tokenizer);
              interpreter = new Interpreter(parser);
              const result = interpreter.interpret();
              expect(result).to.eql([undefined, undefined, 'OK']);
            });
          
            it('IF Single Condition Number Literal GreaterEqual Variable Number', () => {
              tokenizer = new Tokenizer('10 VARX = 50\n20 IF 50 >= VARX THEN PRINT "OK"');
              parser = new Parser(tokenizer);
              interpreter = new Interpreter(parser);
              const result = interpreter.interpret();
              expect(result).to.eql([undefined, undefined, 'OK']);
            });
          
            it('IF Single Condition Number Literal GreaterEqual Literal Number', () => {
              tokenizer = new Tokenizer('10 VARX = "Hello World!"\n20 IF 50 >= 50 THEN PRINT "OK"');
              parser = new Parser(tokenizer);
              interpreter = new Interpreter(parser);
              const result = interpreter.interpret();
              expect(result).to.eql([undefined, undefined, 'OK']);
            });
          
            it('IF Single Condition Number Variable GreaterEqual Variable Number', () => {
              tokenizer = new Tokenizer('10 VARX = 50\n11 VARY = 50\n20 IF VARX >= VARY THEN PRINT "OK"');
              parser = new Parser(tokenizer);
              interpreter = new Interpreter(parser);
              const result = interpreter.interpret();
              expect(result).to.eql([undefined, undefined, undefined, undefined, 'OK']);
            });
          });
          describe('greater', () => {
    
            it('IF Single Condition Number Variable GreaterEqual Literal Number', () => {
              tokenizer = new Tokenizer('10 VARX = 51\n20 IF VARX >= 50 THEN PRINT "OK"');
              parser = new Parser(tokenizer);
              interpreter = new Interpreter(parser);
              const result = interpreter.interpret();
              expect(result).to.eql([undefined, undefined, 'OK']);
            });
          
            it('IF Single Condition Number Literal Lower Variable Number', () => {
              tokenizer = new Tokenizer('10 VARX = 50\n20 IF 51 >= VARX THEN PRINT "OK"');
              parser = new Parser(tokenizer);
              interpreter = new Interpreter(parser);
              const result = interpreter.interpret();
              expect(result).to.eql([undefined, undefined, 'OK']);
            });
          
            it('IF Single Condition Number Literal Lower Literal Number', () => {
              tokenizer = new Tokenizer('10 VARX = "Hello World!"\n20 IF 51 >= 50 THEN PRINT "OK"');
              parser = new Parser(tokenizer);
              interpreter = new Interpreter(parser);
              const result = interpreter.interpret();
              expect(result).to.eql([undefined, undefined, 'OK']);
            });
          
            it('IF Single Condition Number Variable Lower Variable Number', () => {
              tokenizer = new Tokenizer('10 VARX = 51\n11 VARY = 50\n20 IF VARX >= VARY THEN PRINT "OK"');
              parser = new Parser(tokenizer);
              interpreter = new Interpreter(parser);
              const result = interpreter.interpret();
              expect(result).to.eql([undefined, undefined, undefined, undefined, 'OK']);
            });
          });
        });
        describe('IF Single Condition Number LowerThan', () => {
          describe('equal', () => {
            it('IF Single Condition Number Variable LowerEqual Literal Number', () => {
              tokenizer = new Tokenizer('10 VARX = 50\n20 IF VARX <= 50 THEN PRINT "OK"');
              parser = new Parser(tokenizer);
              interpreter = new Interpreter(parser);
              const result = interpreter.interpret();
              expect(result).to.eql([undefined, undefined, 'OK']);
            });
          
            it('IF Single Condition Number Literal LowerEqual Variable Number', () => {
              tokenizer = new Tokenizer('10 VARX = 50\n20 IF 50 <= VARX THEN PRINT "OK"');
              parser = new Parser(tokenizer);
              interpreter = new Interpreter(parser);
              const result = interpreter.interpret();
              expect(result).to.eql([undefined, undefined, 'OK']);
            });
          
            it('IF Single Condition Number Literal LowerEqual Literal Number', () => {
              tokenizer = new Tokenizer('10 VARX = "Hello World!"\n20 IF 50 <= 50 THEN PRINT "OK"');
              parser = new Parser(tokenizer);
              interpreter = new Interpreter(parser);
              const result = interpreter.interpret();
              expect(result).to.eql([undefined, undefined, 'OK']);
            });
          
            it('IF Single Condition Number Variable LowerEqual Variable Number', () => {
              tokenizer = new Tokenizer('10 VARX = 50\n11 VARY = 50\n20 IF VARX <= VARY THEN PRINT "OK"');
              parser = new Parser(tokenizer);
              interpreter = new Interpreter(parser);
              const result = interpreter.interpret();
              expect(result).to.eql([undefined, undefined, undefined, undefined, 'OK']);
            });
          });
          describe('lower', () => {
    
            it('IF Single Condition Number Variable LowerEqual Literal Number', () => {
              tokenizer = new Tokenizer('10 VARX = 40\n20 IF VARX <= 50 THEN PRINT "OK"');
              parser = new Parser(tokenizer);
              interpreter = new Interpreter(parser);
              const result = interpreter.interpret();
              expect(result).to.eql([undefined, undefined, 'OK']);
            });
          
            it('IF Single Condition Number Literal LowerEqual Variable Number', () => {
              tokenizer = new Tokenizer('10 VARX = 66\n20 IF 51 <= VARX THEN PRINT "OK"');
              parser = new Parser(tokenizer);
              interpreter = new Interpreter(parser);
              const result = interpreter.interpret();
              expect(result).to.eql([undefined, undefined, 'OK']);
            });
          
            it('IF Single Condition Number Literal LowerEqual Literal Number', () => {
              tokenizer = new Tokenizer('10 VARX = "Hello World!"\n20 IF 50 <= 55 THEN PRINT "OK"');
              parser = new Parser(tokenizer);
              interpreter = new Interpreter(parser);
              const result = interpreter.interpret();
              expect(result).to.eql([undefined, undefined, 'OK']);
            });
          
            it('IF Single Condition Number Variable LowerEqual Variable Number', () => {
              tokenizer = new Tokenizer('10 VARX = 40\n11 VARY = 50\n20 IF VARX <= VARY THEN PRINT "OK"');
              parser = new Parser(tokenizer);
              interpreter = new Interpreter(parser);
              const result = interpreter.interpret();
              expect(result).to.eql([undefined, undefined, undefined, undefined, 'OK']);
            });
          });
        });
      });
    });
    describe('Falsy', () => {
      describe('Single Condition', () => {
        describe('IF Single Condition String NotEqual', () => {
          it('IF Single Condition String Variable NotEquals Literal String', () => {
            tokenizer = new Tokenizer('10 VARX = "Hello World!"\n20 IF VARX <> "Hello World!" THEN PRINT "OK"');
            parser = new Parser(tokenizer);
            interpreter = new Interpreter(parser);
            const result = interpreter.interpret();
            expect(result).to.eql([undefined, undefined, undefined]);
          });
        
          it('IF Single Condition String Literal NotEquals Variable String', () => {
            tokenizer = new Tokenizer('10 VARX = "Hello World!"\n20 IF "Hello World!" <> VARX THEN PRINT "OK"');
            parser = new Parser(tokenizer);
            interpreter = new Interpreter(parser);
            const result = interpreter.interpret();
            expect(result).to.eql([undefined, undefined, undefined]);
          });
        
          it('IF Single Condition String Literal NotEquals Literal String', () => {
            tokenizer = new Tokenizer('10 VARX = "Hello World!"\n20 IF "Hello World!" <> "Hello World!" THEN PRINT "OK"');
            parser = new Parser(tokenizer);
            interpreter = new Interpreter(parser);
            const result = interpreter.interpret();
            expect(result).to.eql([undefined, undefined, undefined]);
          });
        
          it('IF Single Condition String Variable NotEquals Variable String', () => {
            tokenizer = new Tokenizer('10 VARX = "Hello Wxorld!"\n11 VARY = "Hellxo World!"\n20 IF VARX <> VARY THEN PRINT "OK"');
            parser = new Parser(tokenizer);
            interpreter = new Interpreter(parser);
            const result = interpreter.interpret();
            expect(result).to.eql([undefined, undefined, undefined, undefined, 'OK']);
          });
        });
        describe('IF Single Condition Number Equal', () => {
          it('IF Single Condition Number Variable Equals Literal Number', () => {
            tokenizer = new Tokenizer('10 VARX = 51\n20 IF VARX = 50 THEN PRINT "OK"');
            parser = new Parser(tokenizer);
            interpreter = new Interpreter(parser);
            const result = interpreter.interpret();
            expect(result).to.eql([undefined, undefined, undefined]);
          });
        
          it('IF Single Condition Number Literal Equals Variable Number', () => {
            tokenizer = new Tokenizer('10 VARX = 51\n20 IF 50 = VARX THEN PRINT "OK"');
            parser = new Parser(tokenizer);
            interpreter = new Interpreter(parser);
            const result = interpreter.interpret();
            expect(result).to.eql([undefined, undefined, undefined]);
          });
        
          it('IF Single Condition Number Literal Equals Literal Number', () => {
            tokenizer = new Tokenizer('10 VARX = "Hello World!"\n20 IF 51 = 50 THEN PRINT "OK"');
            parser = new Parser(tokenizer);
            interpreter = new Interpreter(parser);
            const result = interpreter.interpret();
            expect(result).to.eql([undefined, undefined, undefined]);
          });
        
          it('IF Single Condition Number Variable Equals Variable Number', () => {
            tokenizer = new Tokenizer('10 VARX = 51\n11 VARY = 50\n20 IF VARX = VARY THEN PRINT "OK"');
            parser = new Parser(tokenizer);
            interpreter = new Interpreter(parser);
            const result = interpreter.interpret();
            expect(result).to.eql([undefined, undefined, undefined, undefined, undefined]);
          });
        });
        describe('IF Single Condition Number NotEqual', () => {
          it('IF Single Condition Number Variable NotEqual Literal Number', () => {
            tokenizer = new Tokenizer('10 VARX = 52\n20 IF VARX <> 52 THEN PRINT "OK"');
            parser = new Parser(tokenizer);
            interpreter = new Interpreter(parser);
            const result = interpreter.interpret();
            expect(result).to.eql([undefined, undefined, undefined]);
          });
        
          it('IF Single Condition Number Literal NotEqual Variable Number', () => {
            tokenizer = new Tokenizer('10 VARX = 51\n20 IF 51 <> VARX THEN PRINT "OK"');
            parser = new Parser(tokenizer);
            interpreter = new Interpreter(parser);
            const result = interpreter.interpret();
            expect(result).to.eql([undefined, undefined, undefined]);
          });
        
          it('IF Single Condition Number Literal NotEqual Literal Number', () => {
            tokenizer = new Tokenizer('10 VARX = "Hello World!"\n20 IF 52 <> 52 THEN PRINT "OK"');
            parser = new Parser(tokenizer);
            interpreter = new Interpreter(parser);
            const result = interpreter.interpret();
            expect(result).to.eql([undefined, undefined, undefined]);
          });
        
          it('IF Single Condition Number Variable NotEqual Variable Number', () => {
            tokenizer = new Tokenizer('10 VARX = 51\n11 VARY = 51\n20 IF VARX <> VARY THEN PRINT "OK"');
            parser = new Parser(tokenizer);
            interpreter = new Interpreter(parser);
            const result = interpreter.interpret();
            expect(result).to.eql([undefined, undefined, undefined, undefined, undefined]);
          });
        });
        describe('IF Single Condition Number Greater', () => {
          it('IF Single Condition Number Variable Greater Literal Number', () => {
            tokenizer = new Tokenizer('10 VARX = 50\n20 IF VARX > 52 THEN PRINT "OK"');
            parser = new Parser(tokenizer);
            interpreter = new Interpreter(parser);
            const result = interpreter.interpret();
            expect(result).to.eql([undefined, undefined, undefined]);
          });
        
          it('IF Single Condition Number Literal Greater Variable Number', () => {
            tokenizer = new Tokenizer('10 VARX = 55\n20 IF 52 > VARX THEN PRINT "OK"');
            parser = new Parser(tokenizer);
            interpreter = new Interpreter(parser);
            const result = interpreter.interpret();
            expect(result).to.eql([undefined, undefined, undefined]);
          });
        
          it('IF Single Condition Number Literal Greater Literal Number', () => {
            tokenizer = new Tokenizer('10 VARX = "Hello World!"\n20 IF 52 > 55 THEN PRINT "OK"');
            parser = new Parser(tokenizer);
            interpreter = new Interpreter(parser);
            const result = interpreter.interpret();
            expect(result).to.eql([undefined, undefined, undefined]);
          });
        
          it('IF Single Condition Number Variable Greater Variable Number', () => {
            tokenizer = new Tokenizer('10 VARX = 50\n11 VARY = 51\n20 IF VARX > VARY THEN PRINT "OK"');
            parser = new Parser(tokenizer);
            interpreter = new Interpreter(parser);
            const result = interpreter.interpret();
            expect(result).to.eql([undefined, undefined, undefined, undefined, undefined]);
          });
        });
        describe('IF Single Condition Number Lower', () => {
          it('IF Single Condition Number Variable Lower Literal Number', () => {
            tokenizer = new Tokenizer('10 VARX = 55\n20 IF VARX < 52 THEN PRINT "OK"');
            parser = new Parser(tokenizer);
            interpreter = new Interpreter(parser);
            const result = interpreter.interpret();
            expect(result).to.eql([undefined, undefined, undefined]);
          });
        
          it('IF Single Condition Number Literal Lower Variable Number', () => {
            tokenizer = new Tokenizer('10 VARX = 50\n20 IF 66 < VARX THEN PRINT "OK"');
            parser = new Parser(tokenizer);
            interpreter = new Interpreter(parser);
            const result = interpreter.interpret();
            expect(result).to.eql([undefined, undefined, undefined]);
          });
        
          it('IF Single Condition Number Literal Lower Literal Number', () => {
            tokenizer = new Tokenizer('10 VARX = "Hello World!"\n20 IF 53 < 51 THEN PRINT "OK"');
            parser = new Parser(tokenizer);
            interpreter = new Interpreter(parser);
            const result = interpreter.interpret();
            expect(result).to.eql([undefined, undefined, undefined]);
          });
        
          it('IF Single Condition Number Variable Lower Variable Number', () => {
            tokenizer = new Tokenizer('10 VARX = 57\n11 VARY = 51\n20 IF VARX < VARY THEN PRINT "OK"');
            parser = new Parser(tokenizer);
            interpreter = new Interpreter(parser);
            const result = interpreter.interpret();
            expect(result).to.eql([undefined, undefined, undefined, undefined, undefined]);
          });
        });
        describe('IF Single Condition Number GreaterEqual', () => {
          describe('equal', () => {
            it('IF Single Condition Number Variable GreaterEqual Literal Number', () => {
              tokenizer = new Tokenizer('10 VARX = 40\n20 IF VARX >= 50 THEN PRINT "OK"');
              parser = new Parser(tokenizer);
              interpreter = new Interpreter(parser);
              const result = interpreter.interpret();
              expect(result).to.eql([undefined, undefined, undefined]);
            });
          
            it('IF Single Condition Number Literal GreaterEqual Variable Number', () => {
              tokenizer = new Tokenizer('10 VARX = 55\n20 IF 50 >= VARX THEN PRINT "OK"');
              parser = new Parser(tokenizer);
              interpreter = new Interpreter(parser);
              const result = interpreter.interpret();
              expect(result).to.eql([undefined, undefined, undefined]);
            });
          
            it('IF Single Condition Number Literal GreaterEqual Literal Number', () => {
              tokenizer = new Tokenizer('10 VARX = "Hello World!"\n20 IF 40 >= 50 THEN PRINT "OK"');
              parser = new Parser(tokenizer);
              interpreter = new Interpreter(parser);
              const result = interpreter.interpret();
              expect(result).to.eql([undefined, undefined, undefined]);
            });
          
            it('IF Single Condition Number Variable GreaterEqual Variable Number', () => {
              tokenizer = new Tokenizer('10 VARX = 40\n11 VARY = 50\n20 IF VARX >= VARY THEN PRINT "OK"');
              parser = new Parser(tokenizer);
              interpreter = new Interpreter(parser);
              const result = interpreter.interpret();
              expect(result).to.eql([undefined, undefined, undefined, undefined, undefined]);
            });
          });
        });
        describe('IF Single Condition Number LowerThan', () => {
          describe('equal', () => {
            it('IF Single Condition Number Variable LowerEqual Literal Number', () => {
              tokenizer = new Tokenizer('10 VARX = 55\n20 IF VARX <= 50 THEN PRINT "OK"');
              parser = new Parser(tokenizer);
              interpreter = new Interpreter(parser);
              const result = interpreter.interpret();
              expect(result).to.eql([undefined, undefined, undefined]);
            });
          
            it('IF Single Condition Number Literal LowerEqual Variable Number', () => {
              tokenizer = new Tokenizer('10 VARX = 50\n20 IF 55 <= VARX THEN PRINT "OK"');
              parser = new Parser(tokenizer);
              interpreter = new Interpreter(parser);
              const result = interpreter.interpret();
              expect(result).to.eql([undefined, undefined, undefined]);
            });
          
            it('IF Single Condition Number Literal LowerEqual Literal Number', () => {
              tokenizer = new Tokenizer('10 VARX = "Hello World!"\n20 IF 55 <= 50 THEN PRINT "OK"');
              parser = new Parser(tokenizer);
              interpreter = new Interpreter(parser);
              const result = interpreter.interpret();
              expect(result).to.eql([undefined, undefined, undefined]);
            });
          
            it('IF Single Condition Number Variable LowerEqual Variable Number', () => {
              tokenizer = new Tokenizer('10 VARX = 55\n11 VARY = 50\n20 IF VARX <= VARY THEN PRINT "OK"');
              parser = new Parser(tokenizer);
              interpreter = new Interpreter(parser);
              const result = interpreter.interpret();
              expect(result).to.eql([undefined, undefined, undefined, undefined, undefined]);
            });
          });
        });
      });
    });
  });

});