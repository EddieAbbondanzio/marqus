import { RpcRegistry } from "../../shared/rpc";
import { tagFile } from "../fileHandlers";
import { Tag } from "../../shared/state";
import { uuid } from "../../shared/utils";

const getAllTags = async (): Promise<Tag[]> => tagFile.load();

const createTag = async ({ name }: { name: string }): Promise<Tag> => {
  const tags = await tagFile.load();

  if (tags.some((t) => t.name === name)) {
    throw Error(`Tag name ${name} already in use`);
  }

  const tag: Tag = {
    id: uuid(),
    type: "tag",
    name,
    dateCreated: new Date(),
  };

  tags.push(tag);
  await tagFile.save(tags);

  return tag;
};

const updateTag = async ({
  id,
  newName,
}: {
  id: string;
  newName: string;
}): Promise<Tag> => {
  const tags = await tagFile.load();

  if (tags.some((t) => t.name === newName && t.id !== id)) {
    throw Error(`Tag name ${name} already in use`);
  }

  const tag = tags.find((t) => t.id === id);

  if (tag == null) {
    throw Error(`No tag with id ${id} found`);
  }

  tag.name = newName;
  tag.dateUpdated = new Date();

  await tagFile.save(tags);
  return tag;
};

const deleteTag = async ({ id }: { id: string }): Promise<void> => {
  const tags = await tagFile.load();
  const index = tags.findIndex((t) => t.id === id);

  if (index !== -1) {
    tags.splice(index, 1);
  }

  await tagFile.save(tags);
};

export const tagRpcs: RpcRegistry = {
  "tags.getAll": getAllTags,
  "tags.create": createTag,
  "tags.update": updateTag,
  "tags.delete": deleteTag,
};
