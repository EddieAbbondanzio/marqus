import { faTimes } from "@fortawesome/free-solid-svg-icons";
import OpenColor from "open-color";
import React, { useEffect, useMemo, useRef } from "react";
import styled from "styled-components";
import { getNoteById } from "../../shared/domain/note";
import { ml2, p2, px3 } from "../css";
import { Listener, Store } from "../store";
import { Icon } from "./shared/Icon";
import { isEmpty, last, orderBy, wrap } from "lodash";
import { Section } from "../../shared/ui/app";
import { isAfter } from "date-fns";
import { KeyCode, parseKeyCode } from "../../shared/io/keyCode";

export interface EditorTabsProps {
  store: Store;
}

export function EditorTabs(props: EditorTabsProps): JSX.Element {
  const { store } = props;
  const { state } = store;
  const { notes, editor } = state;

  const tabs = useMemo(() => {
    const rendered = [];
    const { activeTabNoteId } = editor;

    const onClick = (noteId: string) => {
      store.dispatch("editor.setActiveTab", noteId);
    };

    const onClose = (noteId: string) => {
      store.dispatch("editor.closeTab", noteId);
    };

    for (const tab of editor.tabs) {
      const note = getNoteById(notes, tab.noteId);

      rendered.push(
        <EditorTab
          key={note.id}
          noteId={note.id}
          noteName={note.name}
          active={activeTabNoteId === note.id}
          onClick={onClick}
          onClose={onClose}
        />
      );
    }

    return rendered;
  }, [notes, editor.tabs]);

  // Track control key being down to allow users to tab through their tab history
  // Chain will continue until the user releases control.
  const controlIsDown = useRef(false);
  const offset = useRef(0);
  const onKeyDown = (ev: KeyboardEvent) => {
    const key = parseKeyCode(ev.code);
    if (key === KeyCode.Control) {
      controlIsDown.current = true;
    }
  };
  const onKeyUp = (ev: KeyboardEvent) => {
    const key = parseKeyCode(ev.code);
    if (key === KeyCode.Control) {
      controlIsDown.current = false;
      offset.current = 0;
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  const nextTab: Listener<"editor.nextTab"> = (_, ctx) => {
    if (controlIsDown.current) {
      offset.current += 1;
    }

    const ordered = orderBy(editor.tabs, ["lastActive"], ["desc"]);
    const wrappedOffset = Math.abs(offset.current % ordered.length);

    ctx.setUI({
      editor: {
        activeTabNoteId: ordered[wrappedOffset].noteId,
      },
    });
  };

  const previousTab: Listener<"editor.previousTab"> = (_, ctx) => {
    if (controlIsDown.current) {
      offset.current -= 1;
    }

    const ordered = orderBy(editor.tabs, ["lastActive"], ["desc"]);
    const wrappedOffset = Math.abs(offset.current % ordered.length);

    ctx.setUI({
      editor: {
        activeTabNoteId: ordered[wrappedOffset].noteId,
      },
    });
  };

  useEffect(() => {
    store.on("editor.openTab", openTab);
    store.on("editor.setActiveTab", setActiveTab);
    store.on("editor.closeTab", closeTab);
    store.on("editor.nextTab", nextTab);
    store.on("editor.previousTab", previousTab);

    return () => {
      store.off("editor.openTab", openTab);
      store.off("editor.setActiveTab", setActiveTab);
      store.off("editor.closeTab", closeTab);
      store.off("editor.nextTab", nextTab);
      store.off("editor.previousTab", previousTab);
    };
  }, [store]);

  return <StyledContainer>{tabs}</StyledContainer>;
}

const StyledContainer = styled.div`
  display: flex;
  flex-direction: row;
  height: 3.2rem;
  background-color: ${OpenColor.gray[2]};
`;

export interface EditorTabProps {
  noteId: string;
  noteName: string;
  active?: boolean;
  onClick: (noteId: string) => void;
  onClose: (noteId: string) => void;
}

export function EditorTab(props: EditorTabProps): JSX.Element {
  const { noteId, noteName, active } = props;

  const onDeleteClick = (ev: React.MouseEvent<HTMLElement>) => {
    // Need to stop prop otherwise it'll trigger on click of tab.
    ev.stopPropagation();
    props.onClose(noteId);
  };

  // TODO: Is there a cleaner way to do this? Feels silly with how similar
  // StyledSelectedTab and StyledTab are.
  if (active) {
    return (
      <StyledSelectedTab
        key={noteId}
        title={noteName}
        onClick={() => props.onClick(noteId)}
      >
        <StyledIndicator />
        <StyledText>{noteName}</StyledText>
        <StyledDelete icon={faTimes} onClick={onDeleteClick} />
      </StyledSelectedTab>
    );
  } else {
    return (
      <StyledTab
        key={noteId}
        title={noteName}
        onClick={() => props.onClick(noteId)}
      >
        <StyledText>{noteName}</StyledText>
        <StyledDelete icon={faTimes} onClick={onDeleteClick} />
      </StyledTab>
    );
  }
}

const StyledTab = styled.a`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 8rem;
  cursor: pointer;
  ${px3}
`;

const StyledSelectedTab = styled(StyledTab)`
  background-color: ${OpenColor.white};
  position: relative;
`;

const StyledIndicator = styled.div`
  background-color: ${OpenColor.orange[3]};
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 0.2rem;
`;

const StyledText = styled.div`
  font-size: 1.2rem;
  font-weight: 500;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
`;

const StyledDelete = styled(Icon)`
  color: ${OpenColor.red[7]};
  border-radius: 0.4rem;
  ${p2}
  ${ml2}

  &:hover {
    cursor: pointer;
    background-color: ${OpenColor.gray[3]};
  }
`;

const openTab: Listener<"editor.openTab"> = async (ev, ctx) => {
  const { sidebar, editor } = ctx.getState();

  // If no note id was passed, we'll attempt to open the sidebar's selected note.
  let noteIds: string[];
  if (ev.value == null) {
    // User could accidentally press delete when nothing is selected so we
    // don't throw here.
    const { selected } = sidebar;
    if (isEmpty(selected)) {
      return;
    }

    noteIds = selected ?? [];
  } else {
    noteIds = Array.isArray(ev.value) ? ev.value : [ev.value];
  }

  if (noteIds.length === 0) {
    return;
  }

  let tabs = [...editor.tabs];

  for (const noteId of noteIds) {
    let tab = editor.tabs.find((t) => t.noteId === noteId);
    if (tab == null) {
      tab = {
        noteId,
        noteContent: undefined!,
        lastActive: new Date(),
      };
    }

    tab.noteContent = (await window.ipc("notes.loadContent", noteId)) ?? "";

    if (tabs.findIndex((t) => t.noteId === noteId) === -1) {
      tabs.push(tab);
    }
  }

  ctx.setUI({
    editor: {
      activeTabNoteId: last(noteIds),
      tabs,
    },
  });

  // When the selected note is opened we need to change focus to the editor
  // because it means the user wants to start editting the note.
  if (ev.value == null) {
    ctx.focus([Section.Editor], { overwrite: true });
  }
};

const closeTab: Listener<"editor.closeTab"> = async (
  { value: noteId },
  ctx
) => {
  // If no note id was passed assume we want to close active tab
  if (noteId == null) {
    const {
      editor: { activeTabNoteId },
    } = ctx.getState();
    if (activeTabNoteId == null) {
      return;
    }

    noteId = activeTabNoteId;
  }

  const { editor } = ctx.getState();
  if (editor.tabs.every((t) => t.noteId !== noteId)) {
    throw new Error(`No tab for note ${noteId} found.`);
  }

  ctx.setUI((prev) => {
    let activeTabNoteId = prev.editor.activeTabNoteId;

    // Check if it was active tab
    if (activeTabNoteId != null && activeTabNoteId === noteId) {
      const lastActiveTab = orderBy(prev.editor.tabs, ["lastActive"], ["desc"]);
      activeTabNoteId = lastActiveTab[1]?.noteId;
    }

    return {
      ...prev,
      editor: {
        activeTabNoteId,
        tabs: prev.editor.tabs.filter((t) => t.noteId !== noteId),
      },
    };
  });
};

const setActiveTab: Listener<"editor.setActiveTab"> = async (
  { value: noteId },
  ctx
) => {
  if (noteId == null) {
    return;
  }

  const { editor } = ctx.getState();
  if (editor.activeTabNoteId === noteId) {
    return;
  }

  ctx.setUI((prev) => {
    const tab = prev.editor.tabs.find((t) => t.noteId === noteId);
    tab!.lastActive = new Date();

    return {
      editor: {
        activeTabNoteId: noteId,
        tabs: [...prev.editor.tabs],
      },
    };
  });
};
