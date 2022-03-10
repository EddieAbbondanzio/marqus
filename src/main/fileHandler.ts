import { debounce, cloneDeep } from "lodash";
import { writeFile, readFile } from "./fileSystem";
import * as yup from "yup";
import { getConfig } from "./ipc/config";
import * as path from "path";
import { isDevelopment } from "../shared/env";

export type FileName =
  | "tags.json"
  | "notebooks.json"
  | "shortcuts.json"
  | "ui.json";

export interface FileHandlerOpts<Content> {
  defaultValue?: Content;
  serialize?: (c: Content) => any;
  deserialize?: (c: Content) => Content | null;
}

const DEBOUNCE_INTERVAL_MS = 250;

function isValidFileName(fileName: FileName) {
  return (
    fileName === "tags.json" ||
    fileName === "notebooks.json" ||
    fileName === "ui.json" ||
    fileName === "shortcuts.json"
  );
}

interface FileHandler<Content> {
  save(content: Content): Promise<Content>;
  load(): Promise<Content>;
}

export function createFileHandler<Content>(
  /**
   * The name of the file. Should include extension (.json)
   */
  name: FileName,
  /**
   * Validation occurs before saving file contents, and after deserializing
   * when loading file contents
   */
  schema: yup.AnySchema,
  opts?: {
    /**
     * Return value in the event the file was empty or not found.
     */
    defaultValue?: Content;
    /**
     * Convert the content of the file before saving it.
     */
    serialize?: (c: Content) => any;
    /**
     * Parse the content of the file after loading it.
     */
    deserialize?: (c?: any) => Content | undefined;
  }
): FileHandler<Content> {
  if (!isValidFileName(name)) {
    throw Error(`Invalid file name ${name}`);
  }

  /*
   * Cache off last read state to save from having to load from file if
   * nothing has changed.
   */
  let readCache: Content;

  const save: any = debounce(async (content?: Content): Promise<Content> => {
    if (content == null) {
      throw Error(`${name} file content cannot be null.`);
    }

    await schema.validate(content);

    let c;
    if (opts?.serialize != null) {
      c = opts.serialize(content);
    } else {
      c = content;
    }

    const { dataDirectory } = await getConfig({ required: true });
    const filePath = path.join(dataDirectory, name);
    await writeFile(filePath, c, "json");
    readCache = cloneDeep(content);

    return content;
  }, DEBOUNCE_INTERVAL_MS);

  const load = async () => {
    // File will never change unless we save it, so we can return cached state.
    if (readCache != null) {
      return readCache;
    }

    const { dataDirectory } = await getConfig({ required: true });
    const filePath = path.join(dataDirectory, name);
    const content = await readFile(filePath, "json");

    let c;
    if (opts?.deserialize != null) {
      c = opts.deserialize(content);
    } else {
      c = content;
    }

    if (c != null) {
      try {
        await schema.validate(c);
      } catch (e) {
        if (isDevelopment()) {
          console.log("Failed validation: ", JSON.stringify(c));
        }

        throw e;
      }
    } else {
      c = opts?.defaultValue;
    }

    if (c == null) {
      throw Error(
        `Content for ${name} was null and no default value was provided.`
      );
    }

    return c;
  };

  return {
    save,
    load,
  };
}
