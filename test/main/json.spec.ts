import { JsonMigration, loadJsonFile } from "../../src/main/json";
import { z } from "zod";
import fsp from "fs/promises";
import fs from "fs";

const mockSchema = z.object({
  version: z.number(),
  name: z.string(),
  age: z.number(),
});

const readFile = jest.fn();
jest.spyOn(fsp, "readFile").mockImplementation(readFile);

test("loadAndMigrateJson throws on duplicate version numbers", async () => {
  expect(() =>
    loadJsonFile("foo.json", mockSchema, [
      { version: 1 } as JsonMigration<never, never>,
      { version: 1 } as JsonMigration<never, never>,
    ])
  ).rejects.toThrow(/Duplicate migration numbers detected for foo.json/);
});

test("loadAndMigrateJson throws if migrations are out of order", async () => {
  expect(() =>
    loadJsonFile("foo.json", mockSchema, [
      { version: 2 } as JsonMigration<never, never>,
      { version: 1 } as JsonMigration<never, never>,
    ])
  ).rejects.toThrow(
    /Migration versions are out of order for foo.json. 2 comes before 1/
  );
});

test("loadAndMigrateJson throws if content has newer version than latest migration", async () => {
  jest.spyOn(fs, "existsSync").mockReturnValue(true);
  readFile.mockReturnValueOnce('{ "version": 10 }');

  expect(() =>
    loadJsonFile("foo.json", mockSchema, [
      { version: 1 } as JsonMigration<never, never>,
      { version: 2 } as JsonMigration<never, never>,
    ])
  ).rejects.toThrow(/Input version 10 is higher than latest migration 2/);
});

test("loadAndMigrateJson handles null value", async () => {
  const migrations = [new InitialDefinition(), new AddAge()];

  readFile.mockReturnValue(null);

  const foo = await loadJsonFile<FooV2>("foo.json", mockSchema, migrations);

  expect(foo.content.version).toBe(2);
  expect(foo.content.name).toBe("name");
  expect(foo.content.age).toBe(42);
});

const fooV1 = z.object({
  version: z.literal(1),
  name: z.string().default("name"),
});
type FooV1 = z.infer<typeof fooV1>;

const fooV2 = z.object({
  version: z.literal(2),
  name: z.string().default("name"),
  age: z.number().default(42),
});
type FooV2 = z.infer<typeof fooV2> & { version: number };

class InitialDefinition extends JsonMigration<unknown, FooV1> {
  version = 1;

  async validateInput(input: unknown): Promise<FooV1> {
    return await fooV1.parseAsync(input);
  }

  protected async migrate(input: FooV1): Promise<FooV1> {
    return {
      version: 1,
      name: input.name,
    };
  }
}

class AddAge extends JsonMigration<FooV1, FooV2> {
  version = 2;

  async validateInput(input: unknown): Promise<FooV1> {
    return await fooV1.parseAsync(input);
  }

  protected async migrate(input: FooV1): Promise<FooV2> {
    return {
      version: 2,
      age: 42,
      name: input.name,
    };
  }
}
