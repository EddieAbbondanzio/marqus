import { Getters } from "vuex-smart-module";
import { Note } from "../notes/state";
import { Tag, TagState } from "./state";

export class TagGetters extends Getters<TagState> {
  get count() {
    return this.state.values.length;
  }

  first() {
    return this.state.values[0];
  }

  last() {
    return this.state.values[this.state.values.length - 1];
  }

  tagsForNote(note: Note) {
    if (note == null) {
      return [];
    }

    return this.state.values.filter(
      t => note.tags != null && note.tags.some(tagId => t.id === tagId)
    );
  }

  byName(name: string): Tag | undefined;
  byName(name: string, opts: { required: true }): Tag;
  byName(name: string, opts: { required?: boolean } = {}) {
    const tag = this.state.values.find(t => t.name === name);

    if (opts.required && tag == null) {
      throw Error(`No tag with name ${name} found.`);
    }

    return tag;
  }

  byId(id: string): Tag | undefined;
  byId(id: string, opts: { required: true }): Tag;
  byId(id: string, opts: { required?: boolean } = {}) {
    const tag = this.state.values.find(t => t.id === id);

    for (const t of this.state.values) {
      console.log(t.id, " ", id);
    }

    if (opts.required && tag == null) {
      throw Error(`No tag with id ${id} found.`);
    }

    return tag;
  }

  getPrevious(id: string) {
    const index = this.state.values.findIndex(t => t.id === id);

    if (index <= 0) {
      return null;
    }

    return this.state.values[index - 1];
  }

  getNext(id: string) {
    const index = this.state.values.findIndex(t => t.id === id);

    if (index >= this.state.values.length - 1) {
      return null;
    }

    return this.state.values[index + 1];
  }
}
