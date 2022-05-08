import { caseInsensitiveCompare } from "../../src/shared/utils";

test("caseInsensitiveCompare", () => {
  const arr: string[] = ["1", "4", "alpha", "Bravo", "charlie", "3", "2"];
  expect(arr.sort(caseInsensitiveCompare())).toEqual([
    "1",
    "2",
    "3",
    "4",
    "alpha",
    "Bravo",
    "charlie",
  ]);
});
