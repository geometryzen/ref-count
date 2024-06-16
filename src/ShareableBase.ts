import { refChange } from "./refChange";
import { Shareable } from "./Shareable";

/**
 * Convenient base class for derived classes implementing <code>Shareable</code>.
 *
 *
 *     class MyShareableClass extends ShareableBase {
 *       constructor() {
 *         // First thing you do is call super to invoke constructors up the chain.
 *         super()
 *         // Setting the logging name is both a good practice and increments the tally
 *         // of constructors in the constructor chain. The runtime architecture will
 *         // verify that the number of destructor calls matches these logging name calls.
 *         this.setLoggingName('MyShareableClass')
 *         // Finally, your initialization code here.
 *         // addRef and shared resources, maybe create owned resources.
 *       }
 *       protected destructor(): void {
 *         // Firstly, your termination code here.
 *         // Release any shared resources and/or delete any owned resources.
 *         // Last thing you do is to call the super destructor.
 *         // The runtime architecture will verify that the destructor count matches the
 *         // constructor count.
 *         super.destructor()
 *       }
 *     }
 *
 */
export class ShareableBase implements Shareable {
    /**
     *
     */
    #refCount: number;
    /**
     * The unique identifier used for reference count monitoring.
     */
    readonly #uuid = `${Math.random()}`;
    /**
     * @param $moniker A human-readable name used for logging.
     * @param initialRefCount defaults to 1.
     */
    constructor(
        protected readonly $moniker = "ShareableBase",
        initialRefCount = 1
    ) {
        this.#refCount = initialRefCount;
        refChange(this.#uuid, this.$moniker, initialRefCount);
        refChange(this.#uuid, this.$moniker, +1);
    }

    /**
     * restore (a zombie) to life.
     */
    protected resurrector(grumble = false): void {
        if (grumble) {
            throw new Error(`'protected resurrector(): void' method should be implemented by '${this.$moniker}'.`);
        }
        // TODO: Is this correct now that the initial reference count may not be 1?
        this.#refCount = 1;
        refChange(this.#uuid, this.$moniker, +1);
    }

    /**
     * <p>
     * Outputs a warning to the console that this method should be implemented by the derived class.
     * </p>
     * <p>
     * <em>This method should be implemented by derived classes.</em>
     * </p>
     * <p>
     * <em>Not implementing this method in a derived class risks leaking resources allocated by the derived class.</em>
     * </p>
     */
    protected destructor(): void {
        refChange(this.#uuid, this.$moniker, -1);
    }

    /**
     * An object is a zombie if it has been released by all who have held references.
     * In some cases it may be possible to recycle a zombie.
     */
    public isZombie(): boolean {
        return typeof this.#refCount === "undefined";
    }

    public addRef(): void {
        if (this.isZombie()) {
            this.resurrector(true);
        } else {
            this.#refCount++;
            refChange(this.#uuid, this.$moniker, +1);
        }
    }

    public release(): void {
        this.#refCount--;
        refChange(this.#uuid, this.$moniker, -1);
        const refCount = this.#refCount;
        if (refCount === 0) {
            // The following will call the most derived class first, if such a destructor exists.
            this.destructor();
            // refCount is used to indicate zombie status so let that go to undefined.
            this.#refCount = void 0;
        }
    }
    protected get uuid(): string {
        return this.#uuid;
    }
}
