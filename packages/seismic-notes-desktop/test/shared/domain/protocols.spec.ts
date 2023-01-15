import { isProtocolUrl } from "../../../src/shared/domain/protocols";

test("isProtocolUrl", () => {
  expect(isProtocolUrl("foo", null)).toBe(false);

  // No protocol
  expect(isProtocolUrl("foo", "lol.txt")).toBe(false);

  // Wrong protocol
  expect(isProtocolUrl("foo", "bar://lol.txt")).toBe(false);

  // Good
  expect(isProtocolUrl("foo", "foo://lol.txt")).toBe(true);
});
