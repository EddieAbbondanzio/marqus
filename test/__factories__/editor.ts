import { uuid } from "../../src/shared/domain";
import { createNote } from "../../src/shared/domain/note";
import { EditorTab } from "../../src/shared/ui/app";

export function createTab(partial: Partial<EditorTab>): EditorTab {
  return {
    lastActive: partial.lastActive ?? new Date(),
    note: partial.note ?? createNote({ name: uuid() }),
  };
}
