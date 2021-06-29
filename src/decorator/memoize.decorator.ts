import { MemoizationConfig, MemoizedMethod } from '@memoizer/types';
import { Memoizer } from '@memoizer/memoizer.class';

export function Memoize(config?: MemoizationConfig): MethodDecorator {
    return (target, propertyKey, descriptor) => {
        const originalFn: Function = descriptor.value as any;
        const memoizedFn = Memoizer.memoize(originalFn, config);

        descriptor.value = function (...args) {
            const res = memoizedFn.apply(this, args);
            return res;
        } as any;
        (descriptor.value as any as MemoizedMethod).clear = memoizedFn.clear;
    };
}
