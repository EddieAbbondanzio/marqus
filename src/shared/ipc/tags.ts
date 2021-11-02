import { Tag } from "../domain/tag";

export interface Tags {
  getAll(): Promise<Tag[]>;
  create(name: string): Promise<Tag>;
  update(id: string, newName: string): Promise<Tag>;
  delete(id: string): Promise<void>;
}
