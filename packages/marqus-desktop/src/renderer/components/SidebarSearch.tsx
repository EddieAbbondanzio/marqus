import { faSearch, faTimes } from "@fortawesome/free-solid-svg-icons";
import { FullOptions, Searcher } from "fast-fuzzy";
import { isEmpty } from "lodash";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import styled from "styled-components";
import { flatten, getFullPath, Note } from "../../shared/domain/note";
import { KeyCode, parseKeyCode } from "../../shared/io/keyCode";
import { Section } from "../../shared/ui/app";
import { mb0, px3, THEME, w100, ZIndex } from "../css";
import { Listener, Store } from "../store";
import { Focusable } from "./shared/Focusable";
import { Icon } from "./shared/Icon";

export const FUZZY_OPTIONS: FullOptions<Note> & { returnMatchData: true } = {
  ignoreCase: true,
  returnMatchData: true,
  keySelector: n => [n.name, n.content],
};

export interface SidebarSearchProps {
  store: Store;
}

export function SidebarSearch(props: SidebarSearchProps): JSX.Element {
  const { store } = props;
  const { state } = store;
  const { notes } = state;
  const { searchString = "", searchResults, searchSelected } = state.sidebar;

  const fuzzySearcher = useMemo(() => {
    const flatNotes = flatten(notes);
    const searcher = new Searcher(flatNotes, FUZZY_OPTIONS);

    return searcher;
  }, [notes]);

  const search: Listener<"sidebar.search"> = useCallback(
    ({ value: searchString = "" }, ctx) => {
      const matches = fuzzySearcher.search(searchString);

      ctx.setUI({
        sidebar: {
          searchString,
          searchSelected: undefined,
          searchResults: matches,
        },
      });
    },
    [fuzzySearcher],
  );

  const inputRef = useRef(null as HTMLInputElement | null);

  const onInput = useCallback(
    async (ev: React.FormEvent) => {
      await store.dispatch(
        "sidebar.search",
        (ev.target as HTMLInputElement).value,
      );
    },
    [store],
  );

  const onClear = useCallback(async () => {
    await store.dispatch("sidebar.search", "");
  }, [store]);

  const renderedResults = useMemo(() => {
    if (searchResults == null || searchResults.length === 0) {
      return undefined;
    }

    return searchResults.map(match => {
      const n = match.item;
      const path = getFullPath(notes, n);

      return (
        <SearchResult
          key={n.id}
          title={path}
          selected={searchSelected === n.id}
          onClick={() =>
            void store.dispatch("editor.openTab", {
              note: n.id,
              active: n.id,
              focus: true,
              scrollTo: true,
            })
          }
        >
          <TruncatedText>{n.name}</TruncatedText>
        </SearchResult>
      );
    });
  }, [searchResults, searchSelected, notes, store]);

  const searchHasFocus = state.focused[0] === Section.SidebarSearch;

  useEffect(() => {
    store.on("sidebar.moveSelectedSearchResultDown", moveDown);
    store.on("sidebar.moveSelectedSearchResultUp", moveUp);
    store.on("sidebar.search", search);

    return () => {
      store.off("sidebar.moveSelectedSearchResultDown", moveDown);
      store.off("sidebar.moveSelectedSearchResultUp", moveUp);
      store.off("sidebar.search", search);
    };
  }, [store, search]);

  return (
    <StyledFocusable
      store={store}
      section={Section.SidebarSearch}
      elementRef={inputRef}
      blurOnEsc={true}
    >
      <SearchInput
        placeholder="Type to search..."
        ref={inputRef}
        value={searchString}
        onInput={onInput}
        roundBottomCorners={!searchHasFocus || notes.length === 0}
        onKeyDown={(ev: React.KeyboardEvent<HTMLInputElement>) => {
          const key = parseKeyCode(ev.code);

          if (key !== null && key === KeyCode.Enter) {
            if (searchResults == null || searchSelected == null) {
              return;
            }

            void store.dispatch("editor.openTab", {
              note: searchSelected,
              active: searchSelected,
              focus: true,
            });

            ev.stopPropagation();
          }
        }}
      ></SearchInput>
      <SearchIcon icon={faSearch} />
      {!isEmpty(searchString) && (
        <DeleteIcon icon={faTimes} onClick={onClear} />
      )}
      {searchHasFocus && <SearchOverlay>{renderedResults}</SearchOverlay>}
    </StyledFocusable>
  );
}

const StyledFocusable = styled(Focusable)`
  display: flex;
  flex-direction: row;
  align-items: center;
  position: relative;
  margin-bottom: 0.8rem;
  position: relative;
`;

const SearchIcon = styled(Icon)`
  position: absolute;
  color: ${THEME.sidebar.search.icon};
  left: 0.5rem;
  font-size: 1.6rem;
`;

const DeleteIcon = styled(Icon)`
  position: absolute;
  color: ${THEME.sidebar.search.deleteIcon};
  right: 0.8rem;
  cursor: pointer;

  &:hover {
    color: ${THEME.sidebar.search.deleteIconHover};
  }
`;

const SearchInput = styled.input<{ roundBottomCorners: boolean }>`
  height: 3.2rem !important; // Keep in sync with height of new note button
  ${w100};
  padding: 0 3.2rem;
  ${mb0};
  border: none;
  outline: none;
  -webkit-appearance: none;
  background-color: ${THEME.sidebar.search.background};
  color: ${THEME.sidebar.search.font};
  font-size: 1.4rem;

  border-top-left-radius: 0.4rem;
  border-top-right-radius: 0.4rem;
  border-bottom-left-radius: ${p => (p.roundBottomCorners ? "0.4rem" : "0")};
  border-bottom-right-radius: ${p => (p.roundBottomCorners ? "0.4rem" : "0")};
`;

const SearchOverlay = styled.div`
  position: absolute;
  top: 3.2rem;
  width: 100%;
  background-color: ${THEME.sidebar.search.background};
  z-index: ${ZIndex.SearchOverlay};

  border-bottom-left-radius: 0.4rem;
  border-bottom-right-radius: 0.4rem;
`;

const SearchResult = styled.div<{ selected: boolean }>`
  height: 3.2rem;
  display: flex;
  align-items: center;
  font-size: 1.4rem;
  ${px3}
  min-width: 0;

  background-color: ${p =>
    p.selected ? THEME.sidebar.search.selectedResult : ""} !important;

  &:hover {
    background-color: ${THEME.sidebar.search.resultBackgroundHover};
  }
`;

const TruncatedText = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const moveDown: Listener<"sidebar.moveSelectedSearchResultDown"> = (
  _,
  ctx,
) => {
  const { searchResults, searchSelected } = ctx.getState().sidebar;

  if (searchResults == null || searchResults.length === 0) {
    return;
  }

  let currIndex = searchResults.findIndex(s => s.item.id === searchSelected);
  if (currIndex === -1 || currIndex + 1 > searchResults.length - 1) {
    currIndex = 0;
  } else {
    currIndex += 1;
  }

  ctx.setUI({
    sidebar: {
      searchSelected: searchResults[currIndex].item.id,
    },
  });
};

export const moveUp: Listener<"sidebar.moveSelectedSearchResultUp"> = (
  _,
  ctx,
) => {
  const { searchResults, searchSelected } = ctx.getState().sidebar;

  if (searchResults == null || searchResults.length === 0) {
    return;
  }

  let currIndex = searchResults.findIndex(s => s.item.id === searchSelected);
  if (currIndex === -1 || currIndex - 1 < 0) {
    currIndex = searchResults.length - 1;
  } else {
    currIndex -= 1;
  }

  ctx.setUI({
    sidebar: {
      searchSelected: searchResults[currIndex].item.id,
    },
  });
};
