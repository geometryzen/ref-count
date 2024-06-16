/* eslint-disable quotes */
/* eslint-disable max-len */
import { refCommand } from "../src/refChange";
import { ShareableBase } from "../src/ShareableBase";

// Example of using ShareableBase as a base class in order to implement reference counting.
// When all references have been released, the destructor function is called.
class Recyclable extends ShareableBase {
    // This flag is used to check that the destructor has been called.
    public isCleanedUp = false;
    constructor() {
        super("Recyclable");
        // You may then allocate resources here or in methods.
    }
    /**
     * This looks similar to the constructor.
     */
    protected resurrector(): void {
        // The first thing you should do is call the base class resurrector, incrementing the level.
        super.resurrector();
        // You may then re-allocate resources here or in methods.
    }
    protected destructor(): void {
        this.isCleanedUp = true;
        // The last thing you should do is to call the base class destructor, incrementing the level.
        super.destructor();
    }
}

/**
 * A mortal does not have a resurrector method.
 * We expect addRef on the zombie to throw an exception.
 */
/*
class Mortal extends ShareableBase {
    // This flag is used to check that the destructor has been called.
    public isCleanedUp = false;
    constructor() {
        super('Mortal');
        // You may then allocate resources here or in methods.
    }
    protected destructor(): void {
        this.isCleanedUp = true;
        // The last thing you should do is to call the base class destructor, incrementing the level.
        super.destructor();
    }
}
*/

describe("ShareableBase", function () {
    describe("constructor", function () {
        it("destructor", function () {
            refCommand("quiet");
            refCommand("reset");
            refCommand("quiet");
            refCommand("start");
            const foo = new Recyclable();
            expect(foo.isCleanedUp).toBe(false);
            expect(foo.isZombie()).toBe(false);
            const refCount = foo.release();
            expect(refCount).toBe(0);
            expect(foo.isCleanedUp).toBe(true);
            expect(foo.isZombie()).toBe(true);
            refCommand("stop");
            const outstanding = refCommand("dump");
            expect(outstanding).toBe(0);
            refCommand("quiet");
            refCommand("reset");
        });
        /*
        it('resurrection of a Recyclable', function () {
            let refCount: number;
            let outstanding: number;
            refCommand('quiet');
            refCommand('reset');
            refCommand('quiet');
            refCommand('start');
            const foo = new Recyclable();
            expect(foo.isCleanedUp).toBe(false);
            expect(foo.isZombie()).toBe(false);
            refCount = foo.release();
            expect(refCount).toBe(0);
            expect(foo.isCleanedUp).toBe(true);
            expect(foo.isZombie()).toBe(true);
            refCommand('stop');
            outstanding = refCommand('dump');
            expect(outstanding).toBe(0);
            refCommand('quiet');
            refCommand('reset');
            // Here it comes...
            refCommand('quiet');
            refCommand('start');
            refCount = foo.addRef();
            expect(refCount).toBe(1);
            refCount = foo.release();
            expect(refCount).toBe(0);
            refCommand('stop');
            outstanding = refCommand('dump');
            expect(outstanding).toBe(0);
            refCommand('quiet');
            refCommand('reset');
        });
        it('resurrection of a Mortal', function () {
            let outstanding: number;
            refCommand('quiet');
            refCommand('reset');
            refCommand('quiet');
            refCommand('start');
            const foo = new Mortal();
            expect(foo.isCleanedUp).toBe(false);
            expect(foo.isZombie()).toBe(false);
            const refCount = foo.release();
            expect(refCount).toBe(0);
            expect(foo.isCleanedUp).toBe(true);
            expect(foo.isZombie()).toBe(true);
            refCommand('stop');
            outstanding = refCommand('dump');
            expect(outstanding).toBe(0);
            refCommand('quiet');
            refCommand('reset');
            // Here it comes...
            refCommand('quiet');
            refCommand('start');
            expect(function () {
                foo.addRef();
            }).toThrow(new Error("'protected resurrector(): void' method should be implemented by 'Mortal'."));
            refCommand('stop');
            outstanding = refCommand('dump');
            expect(outstanding).toBe(0);
            refCommand('quiet');
            refCommand('reset');
        });
        */
    });
});
