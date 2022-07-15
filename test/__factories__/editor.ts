import { uuid } from "../../src/shared/domain";
import { EditorTab } from "../../src/shared/ui/app";

export function createTab(partial: Partial<EditorTab>): EditorTab {
  return {
    lastActive: partial.lastActive ?? new Date(),
    noteContent: partial.noteContent ?? "",
    noteId: partial.noteId ?? uuid(),
  };
}
