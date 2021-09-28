import { caseInsensitiveCompare } from "@/utils/string";
import { Mutation, MutationTree } from "vuex";
import { Mutations } from "vuex-smart-module";
import { reach } from "yup";
import { Tag, tagNameSchema, tagSchema, TagState } from "./state";

export class TagMutations extends Mutations<TagState> {
  SET_STATE(s: TagState) {
    Object.assign(this.state, s);
  }

  CREATE(p: Partial<Tag>) {
    const { id, name } = tagSchema.validateSync(p);

    this.state.values.push({
      id,
      name,
      created: new Date()
    });
  }

  RENAME({ tag, newName }: { tag: Tag; newName: string }) {
    tagNameSchema.validateSync(newName);
    tag.name = newName;
  }

  DELETE(tag: Tag) {
    const i = this.state.values.findIndex(t => t.id === tag.id);

    if (i === -1) {
      throw Error(`No tag with id ${tag.id} found.`);
    }

    this.state.values.splice(i, 1);
  }

  DELETE_ALL() {
    this.state.values.length = 0;
  }

  SORT() {
    this.state.values.sort(caseInsensitiveCompare(v => v.name));
  }
}
