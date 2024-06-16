/**
 * Reference counting to manage lifetime of shared objects.
 */
export interface Shareable {
    /**
     * @returns The reference count after it has been incremented.
     */
    addRef(): number;
    /**
     * @returns The reference count after it has been decremented.
     */
    release(): number;
}
