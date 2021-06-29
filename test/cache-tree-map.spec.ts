import { MemoizationKeyNormalizers } from '../src/memoization-key-normalizers';
import { CacheTreeMap } from '../src/cache-tree-map';

describe('CacheTreeMap', () => {
    let map: CacheTreeMap;

    beforeEach(() => map = new CacheTreeMap(MemoizationKeyNormalizers.Default));
    afterEach(() => map = null);

    it('should call the normalizer for each operation with a key', () => {
        const normalizer = jest.fn(MemoizationKeyNormalizers.Default);
        map = new CacheTreeMap(normalizer);

        map.set(1, 2);
        map.get(1);
        map.has(1);

        expect(normalizer.mock.calls.length).toEqual(3);
    });

    describe('get', () => {
        it('should return an existing value', () => {
            map.set(1, 2);
            expect(map.get(1)).toEqual(2);
        });
    });

    describe('has', () => {
        it('should return the result of get method casted to boolean', () => {
            const getSpy = jest.spyOn(map, 'get').mockReturnValue(1);

            const res = map.has(1);
            expect(getSpy).toHaveBeenCalledWith(1);
            expect(res).toEqual(true);

            const sndRes = map.has(0);
            expect(getSpy).toHaveBeenCalledWith(0);
            expect(sndRes).toEqual(true);
        });
    });

    describe('setForChain', () => {
        it('should build a tree of maps for specified keys chain', () => {
            map.setForChain([1, 2], 3);

            expect(map.get(1) instanceof CacheTreeMap).toEqual(true);
            expect(map.get(1).get(2)).toEqual(3);
        });
    });

    describe('resolveChain', () => {
        it('should return null for empty arguments list', () => {
            expect(map.resolveChain()).toEqual(null);
        });

        it('should resolve a tree of maps for specified keys chain', () => {
            map.setForChain([1, 2], 3);
            expect(map.resolveChain(1, 2)).toEqual(3);
        });
    });

    describe('clear', () => {
        it('should clear all the entities', () => {
            const key1 = 1;
            const key2 = { num: 1 };

            map.set(key1, 1);
            map.set(key2, 1);

            // pre-condition
            expect(map.get(key1)).toEqual(1);
            expect(map.get(key2)).toEqual(1);

            map.clear();
            // expectations
            expect(map.get(key1)).toBeFalsy();
            expect(map.get(key2)).toBeFalsy();
        });
    });
});
