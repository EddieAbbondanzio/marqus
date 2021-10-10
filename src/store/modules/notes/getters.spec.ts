import { NoteGetters } from "@/store/modules/notes/getters";
import { NoteState } from "@/store/modules/notes/state";
import { inject } from "vuex-smart-module";

describe("Note getters", () => {
  let state: NoteState;
  let getters: NoteGetters;

  beforeEach(() => {
    state = new NoteState();
    getters = inject(NoteGetters, {
      state
    });
  });

  describe("byId", () => {
    it("returns matching note by id", () => {
      state.values.push({
        id: "1",
        name: "test"
      } as any);

      const note = getters.byId("1");
      expect(note).toHaveProperty("id", "1");
    });

    it("returns undefined if no note", () => {
      const note = getters.byId("1");
      expect(note).toBeUndefined();
    });

    it("throws if note not found and required was set to true", () => {
      expect(() => {
        const note = getters.byId("1", { required: true });
      }).toThrow();
    });
  });

  describe("notesByTag", () => {
    it("returns empty array if tag id is null", () => {
      expect(getters.notesByTag(null!)).toHaveLength(0);
    });

    it("returns notes that match the tag id passed", () => {
      state.values.push({
        id: "1",
        name: "test",
        tags: ["a"]
      } as any);

      state.values.push({
        id: "2",
        name: "test2",
        tags: ["b"]
      } as any);

      state.values.push({
        id: "2",
        name: "test2",
        tags: ["a"]
      } as any);

      const notes = getters.notesByTag("a");
      expect(notes).toHaveLength(2);
    });
  });

  describe("notesByNotebook", () => {
    it("returns empty array if no id passed", () => {
      expect(getters.notesByNotebook(null!)).toHaveLength(0);
    });

    it("returns notes with matching notebook", () => {
      state.values.push({
        id: "1",
        name: "test",
        notebooks: ["a"]
      } as any);

      state.values.push({
        id: "2",
        name: "test2",
        notebooks: ["b"]
      } as any);

      state.values.push({
        id: "2",
        name: "test2",
        notebooks: ["a"]
      } as any);

      const notes = getters.notesByNotebook("a");
      expect(notes).toHaveLength(2);
    });
  });
});
