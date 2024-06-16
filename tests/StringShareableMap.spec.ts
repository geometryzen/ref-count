import { ShareableBase } from "../src/ShareableBase";
import { StringShareableMap } from "../src/StringShareableMap";

class Foo extends ShareableBase {
    constructor() {
        super("Foo");
    }
    protected destructor(): void {
        super.destructor();
    }
}

describe("StringShareableMap", function () {
    it("new-release", function () {
        const map = new StringShareableMap<Foo>();
        expect(map.isZombie()).toBe(false);
        map.release();
        expect(map.isZombie()).toBe(true);
    });
});
