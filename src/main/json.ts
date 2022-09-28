import { cloneDeep, isEmpty, isEqual, last } from "lodash";
import * as fsp from "fs/promises";
import * as fs from "fs";
import { ZodSchema } from "zod";
import { DeepPartial } from "tsdef";
import { deepUpdate } from "../shared/deepUpdate";

export interface Versioned {
  version: number;
}

export interface JsonOptions<T> {
  defaultContent?: T;
}

export async function loadJson<Content extends Versioned>(
  filePath: string,
  schemas: Record<number, ZodSchema>,
  opts?: JsonOptions<Content>
): Promise<Content> {
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
    originalContent = opts?.defaultContent;

    if (originalContent == null) {
      throw new Error(
        `No json was found for ${filePath} and no default was provided.`
      );
    }
  }

  const { content, wasUpdated } = await runSchemas(schemas, originalContent);

  // Save changes to file if any were made while migrating to latest.
  if (wasUpdated) {
    const jsonContent = JSON.stringify(content, null, 2);
    await fsp.writeFile(filePath, jsonContent, { encoding: "utf-8" });
  }

  return content;
}

export interface JsonFile<T> {
  content: Readonly<T>;
  update(partial: DeepPartial<T>): Promise<void>;
}

export async function loadJsonFile<Content extends Versioned>(
  filePath: string,
  schemas: Record<number, ZodSchema>,
  opts?: JsonOptions<Content>
): Promise<JsonFile<Content>> {
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
    originalContent = opts?.defaultContent;

    if (originalContent == null) {
      throw new Error(
        `No json was found for ${filePath} and no default was provided.`
      );
    }
  }

  const { content, latestSchema, wasUpdated } = await runSchemas(
    schemas,
    originalContent
  );

  // Save changes to file if any were made while migrating to latest.
  if (wasUpdated) {
    const jsonContent = JSON.stringify(content, null, 2);
    await fsp.writeFile(filePath, jsonContent, { encoding: "utf-8" });
  }

  const update = async (partial: DeepPartial<Content>) => {
    const updated = deepUpdate(content, partial);

    // Validate against latest schema when saving to ensure we have valid content.
    const validated = await latestSchema.parseAsync(updated);

    // Don't write to file if no changes were made.
    if (isEqual(content, validated)) {
      return;
    }

    const jsonString = JSON.stringify(updated, null, 2);

    fileHandler.content = validated;
    await fsp.writeFile(filePath, jsonString, { encoding: "utf-8" });
  };

  const fileHandler = {
    content,
    update,
  };
  return fileHandler;
}

export async function runSchemas<Content extends Versioned>(
  schemas: Record<number, ZodSchema>,
  content: Content
): Promise<{ content: Content; latestSchema: ZodSchema; wasUpdated: boolean }> {
  const schemaArray = Object.entries(schemas)
    .map<[number, ZodSchema]>(([version, schema]) => [
      Number.parseInt(version, 10),
      schema,
    ])
    .sort(([a], [b]) => (a > b ? 1 : -1));

  if (schemaArray.length === 0) {
    throw new Error(`Expected at least 1 schema in order to validate content.`);
  }

  // Always include current version schema so we can validate against it.
  const relevantSchemas = schemaArray.filter(
    ([version]) => content!.version <= version
  );
  const [, latestSchema] = last(relevantSchemas)!;

  if (relevantSchemas.length === 0) {
    throw new Error(
      `No schema(s) to run. Loaded content version was: ${content.version} but last schema had version: ${latestSchema}`
    );
  }

  let validatedContent = cloneDeep(content);
  for (const [, schema] of relevantSchemas) {
    validatedContent = await schema.parseAsync(content);
  }

  return {
    content: validatedContent,
    latestSchema,
    wasUpdated: validatedContent.version > content.version,
  };
}
