import {
  faEdit,
  faPaperclip,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import OpenColor from "open-color";
import React, { useCallback, useEffect } from "react";
import styled from "styled-components";
import { flatten, getNoteById } from "../../shared/domain/note";
import { filterOutStaleNoteIds, Section } from "../../shared/ui/app";
import { PromptOptions } from "../../shared/ui/prompt";
import { p2, px2, rounded, THEME } from "../css";
import { Listener, Store } from "../store";
import { deleteNoteIfConfirmed } from "../utils/deleteNoteIfConfirmed";
import { promptConfirmAction } from "../utils/prompt";
import { Focusable } from "./shared/Focusable";
import { Icon } from "./shared/Icon";

export interface EditorToolbarProps {
  store: Store;
}

export function EditorToolbar(props: EditorToolbarProps): JSX.Element {
  const { store } = props;

  const openAttachments = useCallback(async () => {
    const { activeTabNoteId } = store.state.editor;

    if (activeTabNoteId == null) {
      return;
    }

    await store.dispatch("app.openNoteAttachments", activeTabNoteId);
  }, [store]);

  useEffect(() => {
    store.on("editor.deleteNote", deleteNote);

    return () => {
      store.off("editor.deleteNote", deleteNote);
    };
  }, [store]);

  return (
    <StyledFocusable section={Section.EditorToolbar} store={store}>
      <StyledButton
        title="Toggle edit/view mode"
        onClick={async () => await store.dispatch("editor.toggleView")}
        highlighted={store.state.editor.isEditing}
      >
        <Icon icon={faEdit} />
      </StyledButton>

      <div>
        <StyledButton title="Open attachments" onClick={openAttachments}>
          <Icon icon={faPaperclip} />
        </StyledButton>

        <StyledButton
          title="Delete note"
          onClick={async () => await store.dispatch("editor.deleteNote")}
        >
          <Icon icon={faTrash} />
        </StyledButton>
      </div>
    </StyledFocusable>
  );
}

const StyledFocusable = styled(Focusable)`
  ${px2}
  height: 3.7rem;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  color: ${THEME.editor.toolbar.font};
  background-color: ${THEME.editor.toolbar.background};
  border-bottom: 1px solid ${THEME.editor.toolbar.border};
`;

const StyledButton = styled.button<{ highlighted?: boolean }>`
  border: none;
  ${p2}
  ${rounded}
  font-size: 1.6rem;

  i {
    color: ${p =>
      p.highlighted ? OpenColor.orange[7] : THEME.editor.toolbar.font};
  }

  &:hover {
    cursor: pointer;
    background-color: ${THEME.editor.toolbar.hoveredButtonBackground};
  }
`;

const deleteNote: Listener<"editor.deleteNote"> = async (_, ctx) => {
  const {
    editor: { activeTabNoteId },
  } = ctx.getState();
  if (activeTabNoteId == null) {
    return;
  }

  await deleteNoteIfConfirmed(ctx, activeTabNoteId);
};
