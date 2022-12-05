import { faPencilAlt } from "@fortawesome/free-solid-svg-icons";
import OpenColor from "open-color";
import React from "react";
import styled from "styled-components";
import { Section } from "../../shared/ui/app";
import { p2, px2, rounded, THEME } from "../css";
import { Store } from "../store";
import { Focusable } from "./shared/Focusable";
import { Icon } from "./shared/Icon";

export interface EditorToolbarProps {
  store: Store;
}

export function EditorToolbar(props: EditorToolbarProps): JSX.Element {
  const { store } = props;

  return (
    <StyledFocusable section={Section.EditorToolbar} store={store}>
      <StyledButton
        onClick={() => void store.dispatch("editor.toggleView")}
        highlighted={store.state.editor.isEditing}
      >
        <Icon icon={faPencilAlt} />
      </StyledButton>
    </StyledFocusable>
  );
}

const StyledFocusable = styled(Focusable)`
  ${px2}
  height: 3.7rem;
  display: flex;
  flex-direction: row;
  align-items: center;
  color: ${THEME.editor.toolbar.font};
  background-color: ${THEME.editor.toolbar.background};
  border-bottom: 1px solid ${THEME.editor.toolbar.border};
`;

const StyledButton = styled.button<{ highlighted: boolean }>`
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
