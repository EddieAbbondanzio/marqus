import { faFile, faPlusSquare } from "@fortawesome/free-solid-svg-icons";
import OpenColor from "open-color";
import React from "react";
import { PropsWithChildren } from "react";
import styled from "styled-components";
import { pb2 } from "../css";
import { log } from "../logger";
import { Store } from "../store";
import { Icon } from "./shared/Icon";

export interface SidebarNewNoteButton {
  store: Store;
}

export function SidebarNewNoteButton(
  props: PropsWithChildren<SidebarNewNoteButton>
): JSX.Element {
  const onClick = (ev: React.MouseEvent<HTMLButtonElement>) => {
    log.info("HI");
    // Stop prop otherwise we'll mess up switching focus
    ev.stopPropagation();
    props.store.dispatch("sidebar.createNote", null);
  };

  return (
    <Container>
      <GreenButton title="Create new note..." onClick={onClick}>
        {/* https://fontawesome.com/v5/docs/web/use-with/react */}
        <span className="fa-layers fa-fw">
          <Icon icon={faFile} />
          <Icon
            className="plus"
            icon={faPlusSquare}
            transform="shrink-3 down-5 right-2"
          />
        </span>
        New note
      </GreenButton>
    </Container>
  );
}

const GreenButton = styled.button`
  background-color: ${OpenColor.green[7]};
  border-radius: 0.4rem;
  border: none;
  color: ${OpenColor.gray[1]};
  font-weight: 500;
  font-size: 1.4rem;
  flex-grow: 1;
  height: 3.2rem; // Keep in sync with searchbar

  .plus {
    color: ${OpenColor.green[9]};
  }

  cursor: pointer;
`;

const Container = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  ${pb2}
`;
