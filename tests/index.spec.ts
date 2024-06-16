import { greeting } from "../src/index";

test("index", function () {
    expect(greeting("World")).toBe("Hello, World!");
});
