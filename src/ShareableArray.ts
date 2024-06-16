import { Shareable } from "./Shareable";
import { ShareableBase } from "./ShareableBase";

/**
 * Essentially constructs the ShareableArray without incrementing the
 * reference count of the elements, and without creating zombies.
 */
function transferOwnership<T extends Shareable>(data: T[]): ShareableArray<T> {
    if (data) {
        const result = new ShareableArray<T>(data);
        // The result has now taken ownership of the elements, so we can release.
        for (let i = 0, iLength = data.length; i < iLength; i++) {
            const element = data[i];
            if (element && element.release) {
                element.release();
            }
        }
        return result;
    } else {
        return void 0;
    }
}

/**
 * <p>
 * Collection class for maintaining an array of types derived from Shareable.
 * </p>
 * <p>
 * Provides a safer way to maintain reference counts than a native array.
 * </p>
 */
export class ShareableArray<T extends Shareable> extends ShareableBase {
    /**
     *
     */
    private $elements: T[];

    /**
     *
     */
    constructor(elements: T[] = []) {
        super("ShareableArray");
        this.$elements = elements;
        for (let i = 0, l = this.$elements.length; i < l; i++) {
            const element = this.$elements[i];
            if (element.addRef) {
                element.addRef();
            }
        }
    }

    /**
     *
     */
    protected override destructor(): void {
        for (let i = 0, l = this.$elements.length; i < l; i++) {
            const element = this.$elements[i];
            if (element.release) {
                element.release();
            }
        }
        this.$elements = void 0;
        super.destructor();
    }

    /**
     *
     */
    find(match: (element: T) => boolean): ShareableArray<T> {
        const result = new ShareableArray<T>([]);
        const elements = this.$elements;
        const iLen = elements.length;
        for (let i = 0; i < iLen; i++) {
            const candidate = elements[i];
            if (match(candidate)) {
                result.push(candidate);
            }
        }
        return result;
    }

    /**
     *
     */
    findOne(match: (element: T) => boolean): T {
        const elements = this.$elements;
        for (let i = 0, iLength = elements.length; i < iLength; i++) {
            const candidate = elements[i];
            if (match(candidate)) {
                if (candidate.addRef) {
                    candidate.addRef();
                }
                return candidate;
            }
        }
        return void 0;
    }

    /**
     * Gets the element at the specified index, incrementing the reference count.
     */
    get(index: number): T {
        const element = this.getWeakRef(index);
        if (element) {
            if (element.addRef) {
                element.addRef();
            }
        }
        return element;
    }

    /**
     * Gets the element at the specified index, without incrementing the reference count.
     */
    getWeakRef(index: number): T {
        return this.$elements[index];
    }

    /**
     *
     */
    indexOf(searchElement: T, fromIndex?: number): number {
        return this.$elements.indexOf(searchElement, fromIndex);
    }

    /**
     *
     */
    get length(): number {
        if (this.$elements) {
            return this.$elements.length;
        } else {
            console.warn("ShareableArray is now a zombie, length is undefined");
            return void 0;
        }
    }

    /**
     * Removes the element at the specified index.
     * The removed reference must be released when no longer needed.
     */
    removeAt(index: number): T {
        const removed = this.$elements.splice(index, 1);
        if (removed.length === 1) {
            return removed[0];
        } else {
            return void 0;
        }
    }

    /**
     * The slice() method returns a shallow copy of a portion of an array into a new array object.
     *
     * It does not remove elements from the original array.
     */
    slice(begin?: number, end?: number): ShareableArray<T> {
        return new ShareableArray<T>(this.$elements.slice(begin, end));
    }
    /**
     * The splice() method changes the content of an array by removing existing elements and/or adding new elements.
     * The returned reference must be released when no longer needed.
     */
    splice(index: number, deleteCount: number): ShareableArray<T> {
        // The release burdon is on the caller now.
        return transferOwnership(this.$elements.splice(index, deleteCount));
    }

    /**
     *
     */
    shift(): T {
        // No need to addRef because ownership is being transferred to caller.
        return this.$elements.shift();
    }

    /**
     * Traverse without Reference Counting
     */
    forEach(callback: (value: T, index: number) => void): void {
        return this.$elements.forEach(callback);
    }
    /**
     * Pushes <code>element</code> onto the tail of the list and increments the element reference count.
     */
    push(element: T): number {
        if (element) {
            if (element.addRef) {
                element.addRef();
            }
        }
        return this.pushWeakRef(element);
    }

    /**
     * Pushes <code>element</code> onto the tail of the list <em>without</em> incrementing the <code>element</code> reference count.
     */
    pushWeakRef(element: T): number {
        return this.$elements.push(element);
    }

    /**
     *
     */
    pop(): T {
        // No need to addRef because ownership is being transferred to caller.
        return this.$elements.pop();
    }

    /**
     *
     */
    unshift(element: T): number {
        if (element.addRef) {
            element.addRef();
        }
        return this.unshiftWeakRef(element);
    }

    /**
     * <p>
     * <code>unshift</code> <em>without</em> incrementing the <code>element</code> reference count.
     * </p>
     */
    unshiftWeakRef(element: T): number {
        return this.$elements.unshift(element);
    }
}
