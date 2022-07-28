import { cloneDeep, first, last, uniq } from "lodash";
import { readFile } from "./fileSystem";

export type Versioned<T = { version: number }> = T & { version: number };

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

export async function loadAndMigrateJson<Content extends Versioned>(
  filePath: string,
  migrations: JsonMigration<unknown, unknown>[]
): Promise<Versioned<Content>> {
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
  const content: unknown | null = await readFile(filePath, "json");

  let versioned: Versioned;
  if (content == null || typeof content !== "object") {
    versioned = { version: start.version };
  } else {
    versioned = content as Versioned;
  }

  const migrated = await runMigrations(versioned, migrations);

  return migrated as Versioned<Content>;
}

// Should not be used outside of this file.
async function runMigrations<Output>(
  input: { version: number },
  migrations: JsonMigration<unknown, Output>[]
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
