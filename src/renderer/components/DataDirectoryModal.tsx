import OpenColor from "open-color";
import React from "react";
import styled from "styled-components";
import { mb3 } from "../css";
import { Store } from "../store";
import { Button } from "./shared/Button";
import { Modal } from "./shared/Modal";

export interface DataDirectoryModalProps {
  store: Store;
}

export function DataDirectoryModal({
  store,
}: DataDirectoryModalProps): JSX.Element {
  return (
    <Modal>
      <Content>
        <h1>Welcome!</h1>
        <StyledP>
          Please select where you would like to save your notes to get started
        </StyledP>

        <Button
          color={OpenColor.white}
          backgroundColor={OpenColor.green[6]}
          onClick={() => store.dispatch("app.selectDataDirectory")}
        >
          Select a directory
        </Button>
      </Content>
    </Modal>
  );
}

export const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-grow: 1;
`;

export const StyledP = styled.p`
  ${mb3}
`;
