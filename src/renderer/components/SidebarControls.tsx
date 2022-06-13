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
import { m0, m1, mx1, mx2, p1, p2 } from "../css";
import { Store } from "../store";
import { Icon } from "./shared/Icon";

export interface SidebarControlProps {
  store: Store;
}

export function SidebarControls(props: PropsWithChildren<SidebarControlProps>) {
  return (
    <Container>
      <NotesHeader>Notes</NotesHeader>

      <ActionButtons>
        <GreenButton>
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
      </ActionButtons>
    </Container>
  );
}

const GreenButton = styled.button`
  background-color: ${OpenColor.green[7]};
  border-radius: 4px;
  ${p2}
  border: none;
  color: ${OpenColor.gray[1]};
  font-weight: 500;
  font-size: 0.8rem;

  .plus {
    color: ${OpenColor.green[9]};
  }
`;

const NotesHeader = styled.p`
  font-weight: bold;
  font-size: 0.8rem;
  color: ${OpenColor.gray[6]};
  text-transform: uppercase;
`;

const ActionButtons = styled.div`
  display: flex;
  flex-direction: row;
`;

interface SidebarButtonProps {
  title: string;
  icon: IconDefinition;
  onClick: () => void;
}

export function SidebarButton(props: SidebarButtonProps) {
  const onClick = (ev: React.MouseEvent<HTMLAnchorElement>) => {
    // Stop prop otherwise we'll mess up switching focus
    ev.stopPropagation();
    props.onClick();
  };

  return (
    <a title={props.title} onClick={onClick}>
      <StyledIcon icon={props.icon} />
    </a>
  );
}

const StyledIcon = styled(Icon)`
  height: 32px;
  width: 32px;
  color: ${OpenColor.gray[3]};
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  font-size: 1rem;
  ${m0}

  &:hover {
    cursor: pointer;
    background-color: ${OpenColor.gray[8]};
  }
`;
const Container = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  ${m1}
`;
