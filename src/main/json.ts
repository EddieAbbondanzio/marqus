import { cloneDeep, last } from "lodash";
import * as fsp from "fs/promises";
import * as fs from "fs";
import { ZodSchema } from "zod";
import { DeepPartial } from "tsdef";
import { deepUpdate } from "../shared/deepUpdate";

export interface JsonFile<T> {
  content: Readonly<T>;
  update(partial: DeepPartial<T>): Promise<void>;
}

export async function loadJsonFile<Content extends { version: number }>(
  filePath: string,
  schemas: Record<number, ZodSchema>,
  defaultContent: Content
): Promise<JsonFile<Content>> {
  const schemaArray = Object.entries(schemas)
    .map<[number, ZodSchema]>(([version, schema]) => [
      Number.parseInt(version, 10),
      schema,
    ])
    .sort(([a], [b]) => (a > b ? 1 : -1));

  if (schemaArray.length === 0) {
    throw new Error(`Expected at least 1 schema in order to validate content.`);
  }

  let originalContent: Content | undefined;
  if (fs.existsSync(filePath)) {
    const raw = await fsp.readFile(filePath, { encoding: "utf-8" });
    originalContent = JSON.parse(raw);
  }

  // Apply default content if no content found, or if it had no versioning.
  if (
    originalContent == null ||
    !originalContent.hasOwnProperty("version") ||
    typeof originalContent.version !== "number"
  ) {
    originalContent = defaultContent;
  }

  // Always include current version schema so we can validate against it.
  const relevantSchemas = schemaArray.filter(
    ([version]) => originalContent!.version <= version
  );
  if (relevantSchemas.length === 0) {
    throw new Error(
      `File ${filePath} has no schemas to run. Loaded content version was: ${originalContent.version}`
    );
  }

  let content = cloneDeep(originalContent);
  for (const [, schema] of relevantSchemas) {
    content = await schema.parseAsync(content);
  }

  // Save changes to file if any were made while migrating to latest.
  if (content.version !== originalContent.version) {
    const jsonContent = JSON.stringify(content);
    await fsp.writeFile(filePath, jsonContent, { encoding: "utf-8" });
  }

  const [latestVersion, latestSchema] = last(relevantSchemas)!;
  if (defaultContent.version !== latestVersion) {
    throw new Error(
      `Default content doesn't match latest version ${latestVersion}. Did you mean to update the default?`
    );
  }

  const update = async (partial: DeepPartial<Content>) => {
    const updated = deepUpdate(content, partial);

    // Validate against latest schema when saving to ensure we have valid content.
    const validated = await latestSchema.parseAsync(updated);

    const jsonString = JSON.stringify(updated);
    fileHandler.content = validated;
    await fsp.writeFile(filePath, jsonString, { encoding: "utf-8" });
  };

  const fileHandler = {
    content,
    update,
  };
  return fileHandler;
}
