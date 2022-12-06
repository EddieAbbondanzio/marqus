import { flatten, getNoteById } from "../../shared/domain/note";
import { filterOutStaleNoteIds } from "../../shared/ui/app";
import { StoreContext } from "../store";
import { promptConfirmAction } from "./prompt";

export async function deleteNoteAfterConfirm(
  ctx: StoreContext,
  noteId: string,
): Promise<void> {
  const { notes } = ctx.getState();

  const note = getNoteById(notes, noteId);
  const confirmed = await promptConfirmAction("delete", `note ${note.name}`);
  if (confirmed) {
    await window.ipc("notes.moveToTrash", note.id);

    const otherNotes = flatten(notes).filter(n => n.id !== note.id);
    ctx.setUI(ui => filterOutStaleNoteIds(ui, otherNotes, false));

    ctx.setNotes(notes => {
      if (note.parent == null) {
        return notes.filter(t => t.id !== note.id);
      }

      const parent = getNoteById(notes, note.parent);
      parent.children = parent.children!.filter(t => t.id !== note.id);
      return notes;
    });
  }
}
