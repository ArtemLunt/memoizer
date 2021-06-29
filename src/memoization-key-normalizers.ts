import { MemoizationKeyNormalizer } from '@memoizer/types';

export abstract class MemoizationKeyNormalizers {
    static readonly Default: MemoizationKeyNormalizer = obj => obj;
    static readonly Deep: MemoizationKeyNormalizer = obj => JSON.stringify(obj);
}
