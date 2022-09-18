import { UUID_SCHEMA } from "../../../src/shared/domain";

test("uuidSchema", async () => {
  const uuid = "d3ZU8GmTG3";
  expect(await UUID_SCHEMA.parseAsync(uuid)).toBe("d3ZU8GmTG3");
});
