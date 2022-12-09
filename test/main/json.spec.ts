import { loadJsonFile, runSchemas } from "../../src/main/json";
import { z, ZodSchema } from "zod";
import mockFS from "mock-fs";

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
  obj => {
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
  }),
);

afterEach(() => {
  mockFS.restore();
});

test("loadJsonFile throws if no migrations passed", async () => {
  await expect(async () => {
    await loadJsonFile(
      "fake-file-path.json",
      {},
      { defaultContent: { version: 1, foo: 1 } },
    );
  }).rejects.toThrow(/Expected at least 1 schema/);
});

test("loadJsonFile loads default content if no file found", async () => {
  mockFS({
    // Empty on purpose.
  });

  const { content } = await loadJsonFile<FooV2>(
    "fake-file-path.json",
    {
      1: fooV1,
      2: fooV2,
    },

    {
      defaultContent: {
        version: 2,
        foo: "cat",
        bar: 42,
      },
    },
  );
  expect(content).toEqual({
    version: 2,
    foo: "cat",
    bar: 42,
  });
});

test("loadJsonFile loads content and validates it", async () => {
  mockFS({
    "fake-file-path.json": JSON.stringify({
      version: 2,
      foo: "dog",
      bar: 24,
    }),
  });

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
      defaultContent: {
        version: 2,
        foo: "cat",
        bar: 42,
      },
    },
  );

  expect(content).toEqual({
    version: 2,
    foo: "dog",
    bar: 24,
  });
  expect(schema1.parseAsync).not.toBeCalled();
  expect(schema2.parseAsync).toBeCalled();
});

test("runSchemas applies changes", async () => {
  const schemas = {
    1: z.object({
      version: z.literal(1),
      foo: z.string().default("bar"),
    }),
    2: z.preprocess(
      (obj: any) => {
        if (obj.version === 1) {
          return {
            ...obj,
            version: 2,
          };
        }
      },
      z.object({
        version: z.literal(2),
        foo: z.string(),
        bar: z.number().default(2),
      }),
    ),
  };

  await expect(runSchemas(schemas, { version: 3 })).rejects.toThrow(
    /Content had newer version \(3\) than latest schema \(2\)/,
  );
});

test("runSchemas applies changes", async () => {
  const schemas = {
    1: z.object({
      version: z.literal(1),
      foo: z.string().default("bar"),
    }),
    2: z.preprocess(
      (obj: any) => {
        if (obj.version === 1) {
          return {
            ...obj,
            version: 2,
          };
        }
      },
      z.object({
        version: z.literal(2),
        foo: z.string(),
        bar: z.number().default(2),
      }),
    ),
  };

  const migrated = await runSchemas(schemas, { version: 1 });
  const content = migrated.content as {
    version: number;
    foo: string;
    bar: number;
  };

  expect(content.version).toBe(2);
  expect(content.foo).toBe("bar");
  expect(content.bar).toBe(2);
});
