import { MemoizationKeyNormalizers } from '@memoizer/memoization-key-normalizers';
import { MemoizationConfig, MemoizedMethod } from '@memoizer/types';
import { CacheTreeMap } from '@memoizer/cache-tree-map';

export abstract class Memoizer {

    static memoize(fn: Function, config?: MemoizationConfig): MemoizedMethod {
        let { normalizer } = config || {};

        if (!normalizer) {
            normalizer = MemoizationKeyNormalizers.Default;
        }

        const cache = new CacheTreeMap(normalizer);

        const memoizedFn = function (...args) {
            const cachedValue = cache.resolveChain(...args);

            if (cachedValue !== null) {
                return cachedValue;
            }

            const value = fn.apply(this, args);
            cache.setForChain(args, value);

            return value;
        };

        memoizedFn.clear = () => {
            cache.clear();
        };

        return memoizedFn;
    }

}
