import {
  faAngleDoubleDown,
  faAngleDoubleUp,
  faEllipsisV,
  faFile,
  faPlus,
  faPlusCircle,
  faPlusSquare,
  faSort,
  IconDefinition,
} from "@fortawesome/free-solid-svg-icons";
import OpenColor from "open-color";
import React from "react";
import { PropsWithChildren } from "react";
import styled from "styled-components";
import { m0, m1, mt2, mx1, mx2, p1, p2, pb2, pt1, pt2, py2 } from "../css";
import { Store } from "../store";
import { Icon } from "./shared/Icon";

export interface SidebarNewNoteButton {
  store: Store;
}

export function SidebarNewNoteButton(
  props: PropsWithChildren<SidebarNewNoteButton>
) {
  const onClick = (ev: React.MouseEvent<HTMLButtonElement>) => {
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
  height: 3.2rem;
  ${mt2}

  .plus {
    color: ${OpenColor.green[9]};
  }

  cursor: pointer;
`;

const NotesHeader = styled.p`
  font-weight: bold;
  font-size: 0.75rem;
  color: ${OpenColor.gray[6]};
  text-transform: uppercase;
`;

const Container = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  ${pb2}
`;
