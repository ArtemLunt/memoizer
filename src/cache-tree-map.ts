import { MemoizationKeyNormalizer } from '@memoizer/types/memoization-key-normalizer.type';
import { isPrimitive } from '@memoizer/utils';

/**
 * @description this map implementation mixes up the map for primitive arguments and weak map for objects
 */
export class CacheTreeMap<KeyType = any, ValueType = any> {

    /**
     * @description normalizer is a function which applying on any key when we're setting/getting a value
     *
     * motivation:
     * the purpose of that normalizer is to provide an ability to compare non-primitive keys
     * @see MemoizationKeyNormalizers.Deep -> compares the keys by the link only
     * @see MemoizationKeyNormalizers.Default -> compares the stringified version of the key
     */
    private readonly _keyNormalizer: MemoizationKeyNormalizer;

    private _argsBranch: WeakMap<any, ValueType> = new WeakMap()
    private _primitiveArgsBranch: Map<KeyType, ValueType> = new Map();

    constructor(keyNormalizer: MemoizationKeyNormalizer) {
        this._keyNormalizer = keyNormalizer;
    }

    has(key: KeyType): boolean {
        return !!this.get(key);
    }

    get(key: KeyType): ValueType {
        const normalizedKey = this._keyNormalizer(key);

        return isPrimitive(normalizedKey)
            ? this._primitiveArgsBranch.get(normalizedKey)
            : this._argsBranch.get(normalizedKey);
    }

    /**
     * @description returns the value or particular tree branch
     */
    resolveChain(...keys: KeyType[]): ValueType | CacheTreeMap {
        if (!keys?.length) {
            return null;
        }

        const normalizedKeys: any[] = keys.map(key => this._keyNormalizer(key));

        let currentLevel: CacheTreeMap | ValueType = this;

        for (const key of normalizedKeys) {
            if (!currentLevel) {
                return null;
            }

            currentLevel = (currentLevel as CacheTreeMap).get(key);
        }

        return currentLevel ?? null;
    }

    set(key: KeyType, value: ValueType): this {
        const normalizedKey = this._keyNormalizer(key);

        if (isPrimitive(normalizedKey)) {
            this._primitiveArgsBranch.set(normalizedKey, value);
            return
        }

        this._argsBranch.set(normalizedKey, value);

        return this;
    }

    setForChain(keys: KeyType[], value: ValueType): this {
        if (!keys?.length) {
            return this;
        }

        const normalizedKeys = keys.map(key => this._keyNormalizer(key));

        let currentLevel: CacheTreeMap = this;

        for (let i = 0; i < normalizedKeys.length - 1; ++i) {
            const key = normalizedKeys[i];

            if (!currentLevel.has(key)) {
                currentLevel.set(key, new CacheTreeMap(this._keyNormalizer));
            }

            currentLevel = currentLevel.get(key);
        }

        currentLevel.set(normalizedKeys[normalizedKeys.length - 1], value);

        return this;
    }

    clear(): void {
        this._primitiveArgsBranch.clear();
        this._argsBranch = new WeakMap<any, ValueType>();
    }
}
