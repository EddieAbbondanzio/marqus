import { faFile, faTimes } from "@fortawesome/free-solid-svg-icons";
import React from "react";
import styled from "styled-components";
import { m0, mr2, p2, px2, THEME } from "../css";
import { Icon } from "./shared/Icon";

export const EDITOR_TAB_ATTRIBUTE = "data-editor-tab";

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
    // Need to stop prop otherwise it'll trigger onClick of tab.
    ev.stopPropagation();
    props.onClose(noteId);
  };

  return (
    <StyledTab
      key={noteId}
      title={noteName}
      onClick={() => props.onClick(noteId)}
      {...{ [EDITOR_TAB_ATTRIBUTE]: noteId }}
      active={active}
    >
      <FlexRow>
        <StyledNoteIcon icon={faFile} size="lg" />
        <StyledText>{noteName}</StyledText>
      </FlexRow>
      <StyledDelete
        icon={faTimes}
        onClick={onDeleteClick}
        className="delete"
        title={`Close ${noteName}`}
      />
    </StyledTab>
  );
}

const StyledNoteIcon = styled(Icon)`
  margin-right: 1rem;
  color: ${THEME.editor.toolbar.tabFont};
`;

const FlexRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const StyledTab = styled.a<{ active?: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  width: 12rem;
  ${px2}
  ${mr2}
  margin-top: 0.8rem; // Add 3px for scrollbar
  margin-bottom: 0.5rem;

  border-radius: 0.4rem;
  height: 2.9rem;

  background-color: ${p =>
    p.active ? THEME.editor.toolbar.activeTabBackground : ""};

  &:hover {
    background-color: ${THEME.editor.toolbar.hoveredTabBackground};

    .delete {
      display: block;
    }
  }
`;

const StyledText = styled.span`
  font-size: 1.2rem;
  font-weight: 500;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
`;

const StyledDelete = styled(Icon)`
  border-radius: 0.4rem;
  ${p2}
  ${m0}
  color: ${THEME.editor.toolbar.deleteColor};

  &:hover {
    cursor: pointer;
    color: ${THEME.editor.toolbar.deleteHoverColor};
    background-color: ${THEME.editor.toolbar.deleteHoverBackground};
  }
`;

export function getEditorTabAttribute(element: HTMLElement): string | null {
  const parent = element.closest(`[${EDITOR_TAB_ATTRIBUTE}]`);
  if (parent != null) {
    return parent.getAttribute(EDITOR_TAB_ATTRIBUTE);
  }

  return null;
}
