import React from "react";
import styled from "styled-components";
import { mb2, mb3 } from "../css";
import { Button } from "./shared/Button";
import { Header } from "./shared/Header";
import { Modal } from "./shared/Modal";

export function DataDirectoryModal() {
  return (
    <Modal>
      <Content>
        <Header size={1}>Welcome!</Header>
        <StyledP>
          Please select where you'd like to save your notes to get started
        </StyledP>

        <Button
          color="is-success"
          onClick={() => window.ipc("config.selectDataDirectory")}
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
