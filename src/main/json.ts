import { cloneDeep, last, uniq } from "lodash";
import * as fsp from "fs/promises";
import * as fs from "fs";
import { ZodTypeAny } from "zod";
import { deepUpdate } from "../shared/deepUpdate";
import { DeepPartial } from "tsdef";

type Versioned<T = { version: number }> = T & { version: number };

export interface JsonFile<T> {
  // Makes it easy to send off over IPC if it's in it's own prop.
  content: Readonly<T>;
  update(partial: DeepPartial<T>): Promise<void>;
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

  let originalContent;
  if (fs.existsSync(filePath)) {
    const raw = await fsp.readFile(filePath, { encoding: "utf-8" });
    originalContent = JSON.parse(raw);
  }

  let versioned: Versioned;
  if (originalContent == null || typeof originalContent !== "object") {
    versioned = { version: migrations[0].version };
  } else {
    versioned = originalContent as Versioned;
  }

  const migratedContent = await runMigrations<Content>(versioned, migrations);

  // We always want to run this because it'll apply defaults for any missing
  // values, and in the event the json file has been modified to the point
  // where it's unusable, it'll throw an error instead of proceeding.
  const content = await schema.parseAsync(migratedContent);

  const update = async (partial: DeepPartial<Content>) => {
    const updated = deepUpdate(content, partial);
    const validated = await schema.parseAsync(updated);

    const jsonString = JSON.stringify(updated);
    obj.content = validated;
    await fsp.writeFile(filePath, jsonString, { encoding: "utf-8" });
  };

  const obj = {
    content,
    update,
  };

  return obj;
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
