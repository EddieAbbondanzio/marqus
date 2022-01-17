import { Tag } from "../../shared/domain/entities";
import { Service } from "./types";

export interface Tags extends Service {
  create(name: string): Promise<Tag>;
  rename(tag: Tag, name: string): Promise<Tag>;
  delete(tag: Tag): Promise<void>;
  getAll(): Promise<Tag[]>;
  getById(id: string): Promise<Tag>;
}

// Tag service will cache state AND provide easier to use getters
// for interacting with the main thread. THIS is why we should
// live with 1 more layer.

let cache: Tag[] = [];

export const tags: Tags = {
  async initialize(): Promise<void> {
    if (cache.length === 0) {
      cache = await window.rpc("tags.getAll");
    }
  },
  async create(name: string): Promise<Tag> {
    const tag = await window.rpc("tags.create", { name });
    cache.push(tag);

    return tag;
  },
  async rename(tag: Tag, name: string): Promise<Tag> {
    const updated = await window.rpc("tags.update", { id: tag.id, name });
    const index = cache.findIndex((t) => t.id === updated.id);
    cache[index] = updated;

    return updated;
  },
  async delete(tag: Tag): Promise<void> {
    await window.rpc("tags.delete", { id: tag.id });
    const index = cache.findIndex((t) => t.id === tag.id);
    cache.splice(index, 1);
  },
  async getAll(): Promise<Tag[]> {
    return cache;
  },
  async getById(id: string): Promise<Tag> {
    const match = cache.find((t) => t.id === id);
    if (match == null) {
      throw Error(`Tag with id ${id} not found.`);
    }

    return match;
  },
};
