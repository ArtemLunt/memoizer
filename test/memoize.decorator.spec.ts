import { Memoize } from '../src/decorator';

describe('memoize decorator',  () => {
    class SomeClass {
        @Memoize()
        returnObj(arg) {
            return { num: Math.random() };
        }
    }

    let someObj;

    beforeEach(() => someObj = new SomeClass())
    afterEach( () => someObj = null);

    it('should memoize the decorated method', () => {
        const firstRes = someObj.returnObj(1);

        //
        expect(someObj.returnObj(1)).toBe(firstRes);
        expect(someObj.returnObj(1)).toBe(firstRes);
        expect(someObj.returnObj(1)).toBe(firstRes);
    });

    it('should has a MemoizedMethod#clear method', () => {
        expect(someObj.returnObj.clear instanceof Function).toEqual(true);
    });

});
