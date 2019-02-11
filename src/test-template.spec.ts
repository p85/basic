import {expect} from 'chai';
import 'mocha';

export const hello = () => 'Hello World';

describe('test', () => {
    it('should return Hello World', () => {
        expect(hello()).to.equal('Hello World');
    })
});