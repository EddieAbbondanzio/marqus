import { loadJsonFile } from "../../src/main/json";
import fsp from "fs/promises";
import fs from "fs";
import { z, ZodSchema } from "zod";

jest.mock("fs");
jest.mock("fs/promises");

interface FooV1 {
  version: 1;
  foo: string;
}

interface FooV2 {
  version: 2;
  foo: string;
  bar: number;
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore ts-jest doesn't like running in strict mode for some reason?
const fooV1: z.Schema<FooV1> = z.object({
  version: z.literal(1),
  foo: z.string(),
});
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore ts-jest doesn't like running in strict mode for some reason?
const fooV2: z.Schema<FooV2> = z.preprocess(
  (obj) => {
    const foo = obj as FooV1 | FooV2;

    if (foo.version === 1) {
      return {
        ...foo,
        bar: 3,
      };
    }

    return foo;
  },
  z.object({
    version: z.literal(2),
    foo: z.string(),
    bar: z.number(),
  })
);

test("loadJsonFile throws if no migrations passed", async () => {
  await expect(async () => {
    await loadJsonFile("fake-file-path.json", {}, null!, {
      prettyPrint: false,
    });
  }).rejects.toThrow(/Expected at least 1 schema/);
});

test("loadJsonFile loads default content if no file found", async () => {
  (fs.existsSync as jest.Mock).mockReturnValueOnce(false);

  const { content } = await loadJsonFile<FooV2>(
    "fake-file-path.json",
    {
      1: fooV1,
      2: fooV2,
    },
    {
      version: 2,
      foo: "cat",
      bar: 42,
    },
    { prettyPrint: false }
  );
  expect(content).toEqual({
    version: 2,
    foo: "cat",
    bar: 42,
  });
});

test("loadJsonFile loads content and validates it", async () => {
  (fs.existsSync as jest.Mock).mockReturnValueOnce(true);
  (fsp.readFile as jest.Mock).mockResolvedValueOnce(
    `
    {
      "version": 2,
      "foo": "dog",
      "bar": 24
    }
  `
  );

  const schema1 = { parseAsync: jest.fn() } as unknown as ZodSchema;
  const schema2 = {
    parseAsync: jest.fn().mockResolvedValue({
      version: 2,
      foo: "dog",
      bar: 24,
    }),
  } as unknown as ZodSchema;

  const { content } = await loadJsonFile<FooV2>(
    "fake-file-path.json",
    {
      1: schema1,
      2: schema2,
    },
    {
      version: 2,
      foo: "cat",
      bar: 42,
    },
    { prettyPrint: false }
  );

  expect(content).toEqual({
    version: 2,
    foo: "dog",
    bar: 24,
  });
  expect(schema1.parseAsync).not.toBeCalled();
  expect(schema2.parseAsync).toBeCalled();
  expect(fsp.writeFile).not.toBeCalled();
});

test("loadJsonFile update validates content before saving to file.", async () => {
  (fs.existsSync as jest.Mock).mockReturnValueOnce(true);
  (fsp.readFile as jest.Mock).mockResolvedValueOnce(
    `
    {
      "version": 2,
      "foo": "dog",
      "bar": 24
    }
  `
  );

  const schema2 = {
    parseAsync: jest.fn().mockResolvedValue({
      version: 2,
      foo: "horse",
      bar: 24,
    }),
  } as unknown as ZodSchema;

  const fileHandler = await loadJsonFile<FooV2>(
    "fake-file-path.json",
    {
      1: fooV1,
      2: schema2,
    },
    {
      version: 2,
      foo: "cat",
      bar: 42,
    },
    { prettyPrint: false }
  );

  expect(fsp.writeFile).not.toBeCalled();

  await fileHandler.update({
    foo: "horse",
  });

  expect(fileHandler.content.foo).toBe("horse");
  expect(fsp.writeFile).toBeCalledWith(
    "fake-file-path.json",
    `{"version":2,"foo":"horse","bar":24}`,
    { encoding: "utf-8" }
  );
  expect(schema2.parseAsync).toBeCalledWith({
    version: 2,
    foo: "horse",
    bar: 24,
  });
});

test("loadJsonFile migrates when loading older content", async () => {
  (fs.existsSync as jest.Mock).mockReturnValueOnce(true);
  (fsp.readFile as jest.Mock).mockResolvedValueOnce(
    `{"version": 1,"foo": "dog"}`
  );

  const schema1 = {
    parseAsync: jest.fn().mockResolvedValue({
      version: 1,
      foo: "dog",
    }),
  } as unknown as ZodSchema;
  const schema2 = {
    parseAsync: jest.fn().mockResolvedValue({
      version: 2,
      foo: "dog",
      bar: 24,
    }),
  } as unknown as ZodSchema;

  const fileHandler = await loadJsonFile<FooV2>(
    "fake-file-path.json",
    {
      1: schema1,
      2: schema2,
    },
    {
      version: 2,
      foo: "cat",
      bar: 42,
    },
    { prettyPrint: false }
  );

  expect(fileHandler.content).toEqual({
    version: 2,
    foo: "dog",
    bar: 24,
  });
  expect(schema1.parseAsync).toBeCalled();
  expect(schema2.parseAsync).toBeCalled();
  expect(fsp.writeFile).toBeCalledWith(
    "fake-file-path.json",
    `{"version":2,"foo":"dog","bar":24}`,
    { encoding: "utf-8" }
  );
});
