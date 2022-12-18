import OpenColor from "open-color";
import React from "react";
import styled from "styled-components";
import { mb2, mb3 } from "../css";
import { Store } from "../store";
import { Button } from "./shared/Button";
import { Modal } from "./shared/Modal";

export interface NoteDirectoryModalProps {
  store: Store;
}

export function NoteDirectoryModal({
  store,
}: NoteDirectoryModalProps): JSX.Element {
  return (
    <Modal>
      <Content>
        <Header>Welcome!</Header>
        <StyledP>
          Please select where you would like to save your notes to get started
        </StyledP>

        <Button
          color={OpenColor.white}
          backgroundColor={OpenColor.green[6]}
          onClick={() => store.dispatch("app.selectNoteDirectory")}
        >
          Select a directory
        </Button>
      </Content>
    </Modal>
  );
}

const Header = styled.h1`
  font-size: 4rem;
  ${mb2}
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-grow: 1;
`;

const StyledP = styled.p`
  ${mb3}
`;
