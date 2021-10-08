import { caseInsensitiveCompare } from "@/utils/string";
import { tagNameSchema, tagSchema } from "@/validation/tag-schema";
import { Mutations } from "vuex-smart-module";
import { Tag, TagState } from "./state";

export class TagMutations extends Mutations<TagState> {
  SET_STATE(s: TagState): void {
    Object.assign(this.state, s);
  }

  CREATE(p: Partial<Tag>): void {
    const { id, name } = tagSchema.validateSync(p);

    this.state.values.push({
      id,
      name,
      created: new Date()
    });
  }

  RENAME({ tag, newName }: { tag: Tag; newName: string }): void {
    tagNameSchema.validateSync(newName);
    tag.name = newName;
  }

  DELETE(tag: Tag): void {
    const i = this.state.values.findIndex(t => t.id === tag.id);

    if (i === -1) {
      throw Error(`No tag with id ${tag.id} found.`);
    }
    this.state.values.splice(i, 1);
  }

  DELETE_ALL(): void {
    this.state.values.length = 0;
  }

  SORT(): void{
    this.state.values.sort(caseInsensitiveCompare(v => v.name));
  }
}
