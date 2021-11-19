import { Command } from "../types";

export const create: Command<string> = async (context, name: string) => {
  const tag = await context.state;
  throw Error();
};

export interface TagUpdate {
  id: string;
  newName: string;
}
export const update: Command<TagUpdate> = async (
  context,
  { id, newName }: TagUpdate
) => {
  throw Error();
};

export const deleteTag: Command<string> = async (context, id: string) => {
  throw Error();
};

export const TAG_REGISTRY = {
  create,
  update,
  delete: deleteTag,
};
