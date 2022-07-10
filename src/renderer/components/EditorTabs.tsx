import { faTimes } from "@fortawesome/free-solid-svg-icons";
import OpenColor from "open-color";
import React, { useEffect, useMemo } from "react";
import styled from "styled-components";
import { getNoteById } from "../../shared/domain/note";
import { ml2, p2, px3 } from "../css";
import { Store } from "../store";
import { Icon } from "./shared/Icon";
import * as monaco from "monaco-editor";

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
