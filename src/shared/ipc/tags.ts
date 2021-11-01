import { Tag } from "../domain/tag";

export interface Tags {
  create(name: string): Promise<Tag>;
}
