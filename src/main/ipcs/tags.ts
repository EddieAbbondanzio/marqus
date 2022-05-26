import {
  createFileHandler,
  FileHandler,
  getPathInDataDirectory,
} from "../fileHandler";
import * as yup from "yup";
import { createTag, getTagSchema, Tag } from "../../shared/domain/tag";
import { Config } from "../../shared/domain/config";
import { IpcPlugin } from "../../shared/ipc";
import { parseJSON } from "date-fns";

const TAG_FILE = "tags.json";

export const useTagIpcs: IpcPlugin = (ipc, config) => {
  ipc.handle(
    "tags.getAll",
    async (): Promise<Tag[]> => getTagFileHandler(config).load()
  );

  ipc.handle("tags.create", async (name): Promise<Tag> => {
    const tagFile = getTagFileHandler(config);

    const tags = await tagFile.load();
    if (tags.some((t) => t.name === name)) {
      throw Error(`Tag name ${name} already in use`);
    }

    const tag = createTag({
      name,
    });

    tags.push(tag);
    await tagFile.save(tags);

    return tag;
  });

  ipc.handle("tags.rename", async (id, name): Promise<Tag> => {
    const tagFile = getTagFileHandler(config);

    const tags = await tagFile.load();
    if (tags.some((t) => t.name === name && t.id !== id)) {
      throw Error(`Tag name ${name} already in use`);
    }

    const tag = tags.find((t) => t.id === id);
    if (tag == null) {
      throw Error(`No tag with id ${id} found`);
    }

    tag.name = name;
    tag.dateUpdated = new Date();

    await tagFile.save(tags);
    return tag;
  });

  ipc.handle("tags.delete", async (id): Promise<void> => {
    const tagFile = getTagFileHandler(config);

    const tags = await tagFile.load();
    const index = tags.findIndex((t) => t.id === id);
    if (index === -1) {
      throw Error(`No tag with id ${id} found`);
    }

    tags.splice(index, 1);
    await tagFile.save(tags);
  });
};

export function getTagFileHandler(config: Config): FileHandler<Tag[]> {
  const serialize = (c: Tag[]) => c.map(({ type, ...t }) => t);

  const deserialize = (c?: Omit<Tag, "type">[]) =>
    (c ?? []).map(({ dateCreated, dateUpdated, ...props }) => {
      const tag = {
        type: "tag",
        ...props,
      } as Tag;

      tag.dateCreated = parseJSON(dateCreated);
      if (dateUpdated != null) {
        tag.dateUpdated = parseJSON(dateUpdated);
      }

      return tag;
    });

  return createFileHandler<Tag[]>(
    getPathInDataDirectory(config, TAG_FILE),
    yup.array(getTagSchema()).optional(),
    {
      defaultValue: [],
      serialize,
      deserialize,
    }
  );
}
