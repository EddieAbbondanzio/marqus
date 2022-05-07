import { alphanumericSort } from "../../src/shared/utils";

test("alphanumeric", () => {
  const arr: string[] = ["1", "4", "alpha", "bravo", "charlie", "3", "2"];
  expect(arr.sort(alphanumericSort)).toEqual([
    "1",
    "2",
    "3",
    "4",
    "alpha",
    "bravo",
    "charlie",
  ]);
});
