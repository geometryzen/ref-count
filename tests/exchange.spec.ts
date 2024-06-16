import { exchange } from "../src/exchange";
import { Shareable } from "../src/Shareable";

class MockShareable implements Shareable {
    private $refCount = 0;
    constructor() {
        this.addRef();
    }
    addRef(): number {
        this.$refCount++;
        return this.$refCount;
    }
    release(): number {
        this.$refCount--;
        return this.$refCount;
    }
    public get refCount(): number {
        return this.$refCount;
    }
}

test("exchange(lhs, rhs)", () => {
    const lhs = new MockShareable();
    expect(lhs.refCount).toBe(1);
    const rhs = new MockShareable();
    expect(rhs.refCount).toBe(1);
    const out = exchange(lhs, rhs);
    expect(lhs.refCount).toBe(0);
    expect(rhs.refCount).toBe(2);
    expect(out.refCount).toBe(2);
    expect(out).toBe(rhs);
});

test("exchange(foo, foo)", () => {
    const foo = new MockShareable();
    expect(foo.refCount).toBe(1);
    const out = exchange(foo, foo);
    expect(foo.refCount).toBe(1);
    expect(out.refCount).toBe(1);
    expect(out).toBe(foo);
});

test("exchange(lhs, void 0)", () => {
    const lhs = new MockShareable();
    expect(lhs.refCount).toBe(1);
    const out = exchange(lhs, void 0);
    expect(lhs.refCount).toBe(0);
    expect(out).toBeUndefined();
});

test("exchange(void 0, rhs)", () => {
    const rhs = new MockShareable();
    expect(rhs.refCount).toBe(1);
    const out = exchange(void 0, rhs);
    expect(rhs.refCount).toBe(2);
    expect(out.refCount).toBe(2);
    expect(out).toBe(rhs);
});
