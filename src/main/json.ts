import { cloneDeep, first, last, uniq } from "lodash";
import { ZodObject } from "zod";
import { readFile } from "./fileSystem";

export type Versioned<T> = T & { version: number };

export abstract class JsonMigration<Input, Output> {
  abstract version: number;

  // Throws if validation fails.
  abstract validate(input: unknown): Promise<Input>;

  protected abstract do(input: Input): Promise<Output>;

  async run(input: unknown): Promise<Versioned<Output>> {
    const validated = await this.validate(input);
    const output = await this.do(validated);

    return {
      version: this.version,
      ...cloneDeep(output),
    };
  }
}

export async function loadJson<Content extends {}>(
  filePath: string,
  migrations: JsonMigration<unknown, Content>[]
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

  let start = first(migrations)!;
  let content: unknown | null = await readFile(filePath, "json");

  let versioned: Versioned<{}>;
  if (content == null || typeof content !== "object") {
    versioned = { version: start.version };
  } else {
    versioned = content as Versioned<{}>;
  }

  const migrated = await _runMigrations(versioned, migrations);

  return migrated;
}

// Should not be used outside of this file.
export async function _runMigrations<Output>(
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
