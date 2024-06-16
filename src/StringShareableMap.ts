import { Shareable } from "./Shareable";
import { ShareableBase } from "./ShareableBase";

/**
 * A map from string to a parameterized type that is shareable.
 */
export class StringShareableMap<V extends Shareable> extends ShareableBase {
    private elements: { [key: string]: V };

    constructor($moniker = "StringShareableMap") {
        super($moniker);
        this.elements = {};
    }

    protected override destructor(): void {
        const elements = this.elements;
        this.forEach((key: string) => {
            const existing = elements[key];
            if (existing) {
                existing.release();
            }
        });
        this.elements = {};
        super.destructor();
    }

    /**
     * Determines whether the key exists in the map with a defined value.
     *
     * Throws an error if the key argument is not a string.
     */
    public exists(key: string): boolean {
        if (typeof key !== "string") {
            throw new Error("key must be a string");
        }
        const element = this.elements[key];
        return element ? true : false;
    }

    /**
     * Returns the element at the specified key.
     * The caller must release the element when the element reference is no longer needed.
     */
    public get(key: string): V {
        const element = this.elements[key];
        if (element) {
            element.addRef();
        }
        return element;
    }

    /**
     * Returns the element at the specified key, or undefined.
     * The returned reference has no additional reference counting.
     */
    public getWeakRef(key: string): V {
        return this.elements[key];
    }

    /**
     * Puts the value in the map at the specified key and increments the value reference count.
     */
    public put(key: string, value: V): void {
        if (value) {
            value.addRef();
        }
        this.putWeakRef(key, value);
    }

    /**
     *
     */
    public putWeakRef(key: string, value: V): void {
        const elements = this.elements;
        const existing = elements[key];
        if (existing) {
            existing.release();
        }
        elements[key] = value;
    }

    /**
     *
     */
    public forEach(callback: (key: string, value: V | undefined) => void): void {
        const keys: string[] = this.keys;
        for (let i = 0, iLength = keys.length; i < iLength; i++) {
            const key: string = keys[i];
            callback(key, this.elements[key]);
        }
    }

    /**
     *
     */
    get keys(): string[] {
        return Object.keys(this.elements);
    }

    /**
     *
     */
    get values(): V[] {
        const values: V[] = [];
        const keys: string[] = this.keys;
        for (let i = 0, iLength = keys.length; i < iLength; i++) {
            const key: string = keys[i];
            const value = this.elements[key];
            if (value) {
                values.push(value);
            }
        }
        return values;
    }

    /**
     * Removes the element at the specified key and returns it.
     * May return undefined if there is no element at the key specified.
     * TODO: That sounds like it should be an error.
     * The caller is responsible for the ownership of the returned element
     * and should release it when no longer needed.
     */
    public remove(key: string): V {
        const value = this.elements[key];
        delete this.elements[key];
        return value;
    }
}
