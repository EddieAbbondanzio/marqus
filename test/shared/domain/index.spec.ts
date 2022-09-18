import { isEqual, parseJSON } from "date-fns";
import { DATE_OR_STRING_SCHEMA, UUID_SCHEMA } from "../../../src/shared/domain";

test("UUID_SCHEMA", async () => {
  const uuid = "d3ZU8GmTG3";
  expect(await UUID_SCHEMA.parseAsync(uuid)).toBe("d3ZU8GmTG3");
});

test("DATE_OR_STRING_SCHEMA", async () => {
  // In the past we've had some deserialize bugs pop up because JSON stores dates
  // as strings. This test is just to help prevent regressions.

  const date = new Date("2020-01-01T20:37:21.765Z")
  const parsed = await DATE_OR_STRING_SCHEMA.parseAsync(date);
  expect(isEqual(date, parsed)).toBe(true);
  
  const serializedDate = "2022-09-09T20:37:21.765Z";
  const parsedSerializedDate = parseJSON(serializedDate);
  expect(isEqual(parsedSerializedDate, parsedSerializedDate)).toBe(true);
}
