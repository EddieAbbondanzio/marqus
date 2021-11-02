import { Layout } from "../../renderer/components/Layout";
import { Tag } from "../../shared/domain/tag";
import { IpcHandler, TagIpcType } from "../../shared/ipc/ipc";
import { Tags } from "../../shared/ipc/tags";

const getAllTags = async (): Promise<Tag[]> => {
  throw Error();
};

const createTag = async (name: string): Promise<Tag> => {
  throw Error();
};

const updateTag = async ({
  id,
  newName,
}: {
  id: string;
  newName: string;
}): Promise<Tag> => {
  throw Error();
};

const deleteTag = async (id: string): Promise<void> => {
  throw Error();
};

export const tagHandlers: Record<TagIpcType, IpcHandler<any>> = {
  "tags.getAll": getAllTags,
  "tags.create": createTag,
  "tags.update": updateTag,
  "tags.delete": deleteTag,
};
