import { cloneDeep, first, last, uniq } from "lodash";
import * as fsp from "fs/promises";
import { ZodTypeAny } from "zod";

type Versioned<T = { version: number }> = T & { version: number };

export interface JsonFile<T> {
  // Makes it easy to send off over IPC if it's in it's own prop.
  content: Readonly<T>;
  update(partial: Partial<T>): Promise<void>;
}

/**
 * Migration to assist in converting JSON content.
 */
export abstract class JsonMigration<Input, Output> {
  /**
   * Json version of the input.
   */
  abstract version: number;

  /**
   * Validate the input and ensure it's meant for this migration.
   * Throws if invalid.
   * @param input The original input to validate.
   */
  abstract validateInput(input: unknown): Promise<Input>;

  /**
   * Migrate the JSON content and return it's updated version.
   * @param input The input to migrate.
   */
  protected abstract migrate(input: Input): Promise<Output>;

  /**
   * Attempt to migrate the JSON. Throws if the input was invalid.
   * @param input The JSON content to migrate.
   * @returns The updated content.
   */
  async run(input: unknown): Promise<Versioned<Output>> {
    const validated = await this.validateInput(input);
    const output = await this.migrate(validated);

    return {
      version: this.version,
      ...cloneDeep(output),
    };
  }
}

export async function loadJsonFile<Content>(
  filePath: string,
  schema: ZodTypeAny,
  migrations: JsonMigration<unknown, Omit<Content, "version">>[]
): Promise<JsonFile<Content>> {
  const migrationVersions = migrations.map((m) => m.version);
  if (uniq(migrationVersions).length !== migrationVersions.length) {
    throw new Error(`Duplicate migration numbers detected for ${filePath}`);
  }

  for (let i = 1; i < migrations.length; i++) {
    const prev = migrations[i - 1];
    const curr = migrations[i];

    if (prev.version > curr.version) {
      throw new Error(
        `Migration versions are out of order for ${filePath}. ${prev.version} comes before ${curr.version}`
      );
    }
  }

  const start = first(migrations)!;
  const rawContent = await fsp.readFile(filePath, { encoding: "utf-8" });
  const parsed = JSON.parse(rawContent);

  let versioned: Versioned;
  if (parsed == null || typeof parsed !== "object") {
    versioned = { version: start.version };
  } else {
    versioned = parsed as Versioned;
  }

  const content = await runMigrations<Content>(versioned, migrations);

  // We always want to run this because it'll apply defaults for any missing
  // values, and in the event the json file has been modified to the point
  // where it's unusuable, it'll throw an error instead of proceeding.
  let validatedContent = await schema.parseAsync(content);

  const update = async (partial: Partial<Content>) => {
    const validated = await schema.parseAsync(partial);
    const jsonString = JSON.stringify(validated);
    await fsp.writeFile(filePath, jsonString, { encoding: "utf-8" });
    validatedContent = validated;
  };

  return {
    content: validatedContent,
    update,
  };
}

// Should not be used outside of this file.
async function runMigrations<Output>(
  input: { version: number },
  migrations: JsonMigration<unknown, Omit<Output, "version">>[]
): Promise<Versioned<Output>> {
  const latestMigration = last(migrations)!;

  if (input.version > latestMigration.version) {
    throw new Error(
      `Input version ${input.version} is higher than latest migration ${latestMigration.version}`
    );
  }

  if (input.version === latestMigration.version) {
    return input as Versioned<Output>;
  }

  let current = input;
  for (let i = 0; i < migrations.length; i++) {
    if (current.version > migrations[i].version) {
      continue;
    }

    current = await migrations[i].run(current);
  }

  return current as Versioned<Output>;
}
