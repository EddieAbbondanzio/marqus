import {
  fullyQualifyId,
  ID_LENGTH,
  isId,
  parseFullyQualifiedId,
  uuid,
} from "./utils";

test("uuid()", () => {
  const a = uuid();
  const b = uuid();
  expect(a).toHaveLength(ID_LENGTH);
  expect(b).toHaveLength(ID_LENGTH);
  expect(a).not.toEqual(b);
});

test("isId()", () => {
  const id = uuid();
  const notId = "12345##@6";
  expect(isId(id)).toBe(true);
  expect(isId(notId)).toBe(false);
});

test("fullyQualifyId()", () => {
  const id = uuid();
  const fullyQualified = fullyQualifyId("tag", id);
  expect(fullyQualified).toBe(`tag.${id}`);
});

test("parseFullyQualifiedId() works", () => {
  const id = uuid();
  const fullyQualified = fullyQualifyId("tag", id);
  const split = parseFullyQualifiedId(fullyQualified);

  expect(split).toHaveLength(2);
  expect(split[0]).toBe("tag");
  expect(split[1]).toBe(id);
});

test("parseFullyQualifiedId() throws on invalid type", () => {
  const id = uuid();
  const fq = `foo.${id}`;
  expect(() => {
    parseFullyQualifiedId(fq);
  }).toThrow();
});
