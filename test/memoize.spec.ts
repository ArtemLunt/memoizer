import { MemoizationKeyNormalizers } from '../src/memoization-key-normalizers';
import { Memoizer } from '../src/memoizer.class';
import { MemoizedMethod } from '../src/types';
import { performance } from 'perf_hooks';

describe('memoize', () => {
    function sum(...numbers) {
        return numbers?.length === 1
            ? numbers[0]
            : numbers[0] + sum(numbers.slice(1));
    }

    function factorial(n) {
        return n === 1 || n === 0
            ? 1
            : n * factorial(n - 1);
    }

    it('should return the memoized function', () => {
        const memoizedSum = Memoizer.memoize(sum);

        expect(memoizedSum.clear).toBeTruthy();
        expect(memoizedSum instanceof Function).toBeTruthy();
    });

    it('should call original function only once for the same primitives arguments list', () => {
        const args = new Array(1000).fill(null).map((_, i) => i);
        const originalFnSpy = jest.fn(sum)
        const memoizedSum = Memoizer.memoize(originalFnSpy);

        memoizedSum(...args);
        memoizedSum(...args);
        memoizedSum(...args);

        expect(originalFnSpy.mock.calls.length).toEqual(1);
    });

    it('should call original function multiple times for the same non-primitive arguments list with default normalization', () => {
        const args = new Array(1000).fill(null).map((_, i) => ({id: i}));
        const getArgs = () => args.map((arg => ({...arg})));

        const originalFnSpy = jest.fn(sum)
        const memoizedSum = Memoizer.memoize(originalFnSpy);

        memoizedSum(...getArgs());
        memoizedSum(...getArgs());
        memoizedSum(...getArgs());

        expect(originalFnSpy.mock.calls.length).toEqual(3);
    });

    it('should call original function only once for the same non-primitive arguments list with deep normalization', () => {
        const args = new Array(1000).fill(null).map((_, i) => ({id: i}));
        const getArgs = () => args.map((arg => ({...arg})));

        const originalFnSpy = jest.fn(sum)
        const memoizedSum = jest.fn(Memoizer.memoize(originalFnSpy, {
            normalizer: MemoizationKeyNormalizers.Deep
        }) as any);

        memoizedSum(...getArgs());
        memoizedSum(...getArgs());
        memoizedSum(...getArgs());

        expect(originalFnSpy.mock.calls.length).toEqual(1);
    });

    it('should call original function only once for the same non-primitive arguments list with custom normalization', () => {
        const args = new Array(1000).fill(null).map((_, i) => ({id: i}));
        const getArgs = () => args.map((arg => ({...arg})));

        const originalFnSpy = jest.fn(sum)
        const memoizedSum = jest.fn(Memoizer.memoize(originalFnSpy, {
            normalizer: ({id}) => id
        }) as any);

        memoizedSum(...getArgs());
        memoizedSum(...getArgs());
        memoizedSum(...getArgs());

        expect(originalFnSpy.mock.calls.length).toEqual(1);
    });

    it('should produce a more performant function than original one', () => {
        const originalStart = performance.now();
        factorial(300);
        factorial(300);
        factorial(300);
        const originalTime = performance.now() - originalStart;

        const memoizedFn = Memoizer.memoize(factorial);
        const memoizedStart = performance.now();
        memoizedFn(300);
        memoizedFn(300);
        memoizedFn(300);
        const memoizedTime = performance.now() - memoizedStart;

        expect(memoizedTime).toBeLessThan(originalTime);
    });

    describe('clear', () => {
        it('should clear the cache', () => {
            const fn: Function = (num) => ({ num });
            const memoizedFn: MemoizedMethod = Memoizer.memoize(fn);

            const cachedResult = memoizedFn(1);

            // pre-condition: cached result should be equal to next results
            expect(cachedResult).toBe(memoizedFn(1));

            memoizedFn.clear();

            // condition: should return a new value after calling the clear method
            expect(cachedResult).not.toBe(memoizedFn(1));
        });
    })
});
