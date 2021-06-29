export function isPrimitive(arg: any): boolean {
    return typeof arg !== 'object'
        && typeof arg !== 'function';
}
