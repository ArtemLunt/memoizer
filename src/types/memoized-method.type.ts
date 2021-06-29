export type MemoizedMethod = Function & {
    /**
     * @description cleans up the cache
     */
    clear(): void;
}
