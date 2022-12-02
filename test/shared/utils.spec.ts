import { arrayify, isBlank, sleep } from "../../src/shared/utils";

test("isBlank", () => {
  expect(isBlank(null)).toBe(true);
  expect(isBlank("")).toBe(true);
  expect(isBlank(" ")).toBe(true);
  expect(isBlank("  ")).toBe(true);
  expect(isBlank("foo")).toBe(false);
});

test("sleep", async () => {
  jest.useFakeTimers();

  const prom = sleep(100);

  jest.advanceTimersByTime(150);
  await expect(prom).resolves.toBe(undefined);

  jest.useRealTimers();
});

test("arrayify", () => {
  expect(arrayify(1)).toEqual([1]);
  expect(arrayify([1])).toEqual([1]);
  expect(arrayify(["foo", "bar"])).toEqual(["foo", "bar"]);
});
