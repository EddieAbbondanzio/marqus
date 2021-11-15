import { debounce } from "lodash";
import { Tag, tagSchema } from "../../shared/domain/tag";
import { fileExists, readFile, writeFile } from "../fileSystem";
import { onReady } from "../events";
import * as yup from "yup";
import { generateId } from "../../shared/domain/id";
import { IpcHandler } from "../../shared/ipc";

const FILE_NAME = "tags.json";

const save = debounce(async (tags: Tag[]) => {
  await writeFile(FILE_NAME, tags, "json");
}, 1000);

let tags: Tag[] = [];

const TAG_FILE_SCHEMA = yup.array(tagSchema);

/*
 * Load tags from file on startup
 */
onReady(async () => {
  if (!fileExists(FILE_NAME)) {
    return;
  }

  const raw = await readFile(FILE_NAME, "json");

  await TAG_FILE_SCHEMA.validate(raw);
  tags = raw as Tag[];
});

const getAllTags = async (): Promise<Tag[]> => tags;

const createTag = async ({ name }: { name: string }): Promise<Tag> => {
  if (tags.some((t) => t.name === name)) {
    throw Error(`Tag name ${name} already in use`);
  }

  const tag: Tag = {
    id: generateId(),
    name,
    dateCreated: new Date(),
  };

  tags.push(tag);
  await save(tags);

  return tag;
};

const updateTag = async ({
  id,
  newName,
}: {
  id: string;
  newName: string;
}): Promise<Tag> => {
  if (tags.some((t) => t.name === newName && t.id !== id)) {
    throw Error(`Tag name ${newName} already in use`);
  }

  const tag = tags.find((t) => t.id === id);

  if (tag == null) {
    throw Error(`No tag with id ${id} found`);
  }

  tag.name = newName;
  tag.dateUpdated = new Date();

  await save(tags);

  return tag;
};

const deleteTag = async (id: string): Promise<void> => {
  const index = tags.findIndex((t) => t.id === id);

  if (index !== -1) {
    tags.splice(index, 1);
  }

  await save(tags);
};

export const tagHandlers: Record<string, IpcHandler<any>> = {
  "tags.getAll": getAllTags,
  "tags.create": createTag,
  "tags.update": updateTag,
  "tags.delete": deleteTag,
};
