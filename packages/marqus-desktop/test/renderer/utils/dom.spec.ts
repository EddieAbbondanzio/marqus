import { incrementScroll } from "../../../src/renderer/utils/dom";

test("incrementScroll", async () => {
  expect(incrementScroll(100, 50)).toBe(150);

  expect(incrementScroll(100, -50)).toBe(50);

  expect(incrementScroll(50, -100)).toBe(0);

  expect(incrementScroll(100, 50, { max: 125 })).toBe(125);

  expect(incrementScroll(100, 50, { roundBy: 20 })).toBe(140);
});
