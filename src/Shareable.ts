/**
 * Reference counting to manage lifetime of shared objects.
 */
export interface Shareable {
    /**
     * Increments the reference count. Upon construction, an object has a reference count of one.
     */
    addRef(): void;
    /**
     * Decrements the reference count. When the count reaches zero, the object is destroyed.
     */
    release(): void;
}
