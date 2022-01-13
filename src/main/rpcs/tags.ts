import { RpcHandler, RpcRegistry, RpcSchema } from "../../shared/rpc";
import { tagFile } from "../fileHandlers";
import { uuid } from "../../shared/utils";
import { Tag } from "../../shared/domain/entities";

const getAllTags = async (): Promise<Tag[]> => tagFile.load();

const createTag: RpcHandler<"tags.create"> = async ({
  name,
}: {
  name: string;
}): Promise<Tag> => {
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
  name,
}: {
  id: string;
  name: string;
}): Promise<Tag> => {
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
