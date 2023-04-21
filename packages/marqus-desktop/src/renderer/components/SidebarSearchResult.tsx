import styled from "styled-components";
import { p3, THEME } from "../css";
import React from "react";
import { MatchData } from "fast-fuzzy";
import { Note } from "../../shared/domain/note";

export interface SidebarSearchProps {
  path: string;
  selected: boolean;
  onClick: () => void;
  matchData: MatchData<Note>;
}

export function SidebarSearchResult(props: SidebarSearchProps): JSX.Element {
  const { path, selected, onClick, matchData } = props;
  const note = matchData.item;

  console.log("Selected?: ", selected);

  return (
    <Container title={path} selected={selected} onClick={onClick}>
      <Title>{note.name}</Title>
      <Path>{path}</Path>
    </Container>
  );
}

const Container = styled.div<{ selected: boolean }>`
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
  font-size: 1.4rem;
  ${p3}
  color: ${THEME.sidebar.search.font};

  background-color: ${p =>
    p.selected ? THEME.sidebar.search.selectedResult : ""} !important;

  &:hover {
    background-color: ${THEME.sidebar.search.resultBackgroundHover};
  }
`;

const Title = styled.h3`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex-shrink: 0;
  padding-bottom: 0.4rem;
  font-weight: bold;
`;

const Path = styled.p`
  overflow: hidden;
  display: block;
  font-family: monospace;
  font-size: 1.2rem;
  color: ${THEME.sidebar.search.path};
  text-overflow: ellipsis;
  white-space: nowrap;
`;
