import styled from "styled-components";
import { p3, THEME } from "../css";
import React, { useLayoutEffect, useRef } from "react";
import { MatchData } from "fast-fuzzy";
import { Note } from "../../shared/domain/note";
import { Store } from "../store";
import { isScrolledIntoView } from "../utils/dom";

// Keep in sync with CSS below for Background
export const SEARCH_RESULT_HEIGHT = "5rem";

export interface SidebarSearchProps {
  path: string;
  selected: boolean;
  onClick: () => void;
  matchData: MatchData<Note>;
  store: Store;
}

export function SidebarSearchResult(props: SidebarSearchProps): JSX.Element {
  const { store, path, selected, onClick, matchData } = props;
  const note = matchData.item;

  const resultRef = useRef<HTMLDivElement>(null!);

  // Scroll to menu if it's selected and offscreen
  const prevSelectedRef = useRef(selected);
  useLayoutEffect(() => {
    const prevSelected = prevSelectedRef.current;
    prevSelectedRef.current = selected;

    // We only scroll to the menu when it goes from not-selected -> selected.
    if (prevSelected || !selected) {
      return;
    }

    const visCheck = isScrolledIntoView(resultRef.current);
    if (visCheck.fullyVisible) {
      return;
    }

    const prevScroll = store.state.sidebar.searchScroll ?? 0;
    void store.dispatch(
      "sidebar.updateSearchScroll",
      prevScroll + visCheck.offBy,
    );
  }, [selected, store]);

  return (
    <Background
      ref={resultRef}
      title={path}
      selected={selected}
      onClick={onClick}
    >
      <Title>{note.name}</Title>
      <Path>{path}</Path>
    </Background>
  );
}

const Background = styled.div<{ selected: boolean }>`
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
