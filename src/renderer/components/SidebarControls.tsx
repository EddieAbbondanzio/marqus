import {
  faAngleDoubleDown,
  faAngleDoubleUp,
  faEllipsisV,
  faPlus,
  faSort,
  IconDefinition,
} from "@fortawesome/free-solid-svg-icons";
import OpenColor from "open-color";
import React from "react";
import { PropsWithChildren } from "react";
import styled from "styled-components";
import { m1, mx1, mx2, p1 } from "../css";
import { Store } from "../store";
import { Icon } from "./shared/Icon";

const HEIGHT = `16px`;

export interface SidebarControlProps {
  store: Store;
}

export function SidebarControls(props: PropsWithChildren<SidebarControlProps>) {
  return (
    <Container>
      <SidebarButton
        icon={faPlus}
        title="New note"
        onClick={() => props.store.dispatch("sidebar.createNote", null)}
      />

      <SidebarButton
        icon={faAngleDoubleDown}
        title="Expand all"
        onClick={() => props.store.dispatch("sidebar.expandAll")}
      />

      <SidebarButton
        icon={faAngleDoubleUp}
        title="Collapse all"
        onClick={() => props.store.dispatch("sidebar.collapseAll")}
      />
    </Container>
  );
}

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
  height: ${HEIGHT};
  color: ${OpenColor.gray[3]};
  margin: 0;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  width: 16px;
  border-radius: 4px;
  font-size: 0.8rem;

  &:hover {
    cursor: pointer;
    background-color: ${OpenColor.gray[8]};
  }
`;
const Container = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: end;
  ${m1}
`;
