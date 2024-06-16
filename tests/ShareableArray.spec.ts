import { ShareableArray } from "../src/ShareableArray";
import { ShareableBase } from "../src/ShareableBase";

class Foo extends ShareableBase {
    constructor() {
        super("Foo");
    }
    destructor() {
        super.destructor();
    }
}

describe("ShareableArray", function () {
    it("new-release", function () {
        const map = new ShareableArray<Foo>();
        expect(map.isZombie()).toBe(false);
        map.release();
        expect(map.isZombie()).toBe(true);
    });
});
