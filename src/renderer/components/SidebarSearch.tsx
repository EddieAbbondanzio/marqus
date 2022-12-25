import { faSearch, faTimes } from "@fortawesome/free-solid-svg-icons";
import { fuzzy } from "fast-fuzzy";
import { clamp, cloneDeep, isEmpty } from "lodash";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import styled from "styled-components";
import { flatten, getFullPath, Note } from "../../shared/domain/note";
import { Section } from "../../shared/ui/app";
import { isBlank } from "../../shared/utils";
import { mb0, px3, THEME, w100, ZIndex } from "../css";
import { Listener, Store } from "../store";
import { Focusable } from "./shared/Focusable";
import { Icon } from "./shared/Icon";

export const MATCH_THRESHOLD = 0.6;

export interface SidebarSearchProps {
  store: Store;
}

export function SidebarSearch(props: SidebarSearchProps): JSX.Element {
  const { store } = props;
  const { state } = store;

  const selectedIndex = useRef(0);
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

  const { searchString = "" } = state.sidebar;
  const notes = useMemo(
    () => searchNotes(store.state.notes, searchString ?? ""),
    [searchString, store],
  );

  useEffect(() => {
    selectedIndex.current = 0;
  }, [notes]);

  const renderedResults = notes.map((n, i) => {
    const path = getFullPath(store.state.notes, n);

    return (
      <SearchResult
        key={n.id}
        title={path}
        selected={selectedIndex.current === i}
        onClick={() =>
          store.dispatch("editor.openTab", {
            note: n.id,
            active: n.id,
            focus: true,
          })
        }
      >
        {n.name}
      </SearchResult>
    );
  });

  const searchHasFocus = state.focused[0] === Section.SidebarSearch;

  const moveDown: Listener<"sidebar.moveSelectedSearchResultDown"> =
    useCallback(() => {
      if (selectedIndex.current === -1) {
        selectedIndex.current = 0;
      } else if (selectedIndex.current + 1 > notes.length) {
        selectedIndex.current = 0;
      } else {
        selectedIndex.current += 1;
      }
    }, [selectedIndex, notes]);

  const moveUp: Listener<"sidebar.moveSelectedSearchResultUp"> =
    useCallback(() => {
      if (selectedIndex.current === -1) {
        selectedIndex.current = 0;
      } else if (selectedIndex.current - 1 < 0) {
        selectedIndex.current = notes.length - 1;
      } else {
        selectedIndex.current -= 1;
      }
    }, [selectedIndex, notes]);

  useEffect(() => {
    store.on("sidebar.moveSelectedSearchResultDown", moveDown);
    store.on("sidebar.moveSelectedSearchResultUp", moveUp);

    return () => {
      store.off("sidebar.moveSelectedSearchResultDown", moveDown);
      store.off("sidebar.moveSelectedSearchResultUp", moveUp);
    };
  }, [store, moveUp, moveDown]);

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
`;

const SearchResult = styled.div<{ selected: boolean }>`
  height: 3.2rem;
  display: flex;
  align-items: center;
  font-size: 1.4rem;
  ${px3}

  background-color: ${p =>
    p.selected ? THEME.sidebar.search.selectedResult : ""} !important;

  &:hover {
    background-color: ${THEME.sidebar.search.resultBackgroundHover};
  }
`;

export function searchNotes(notes: Note[], searchString?: string): Note[] {
  // Don't bother searching if string is empty or just whitespace
  if (isBlank(searchString)) {
    return [];
  }

  const clonedNotes = cloneDeep(notes);
  const matchedNotes: { note: Note; score: number }[] = [];

  for (const note of clonedNotes) {
    const score = calculateMatchScore(note, searchString!);
    if (score > MATCH_THRESHOLD) {
      matchedNotes.push({ note, score });
    }
  }

  for (const match of matchedNotes) {
    // Matched children should be sorted by relevance so we re-use searchNotes
    match.note.children = searchNotes(match.note.children, searchString);
  }

  // When searching at the root level, check every note that we didn't match to
  // ensure we search every nested note even if their parent didn't match. If
  // we find a nested note that matches, we'll show it as a root note.
  if (clonedNotes.length > 0 && clonedNotes.every(n => n.parent == null)) {
    const alreadyMatchedIds = flatten(matchedNotes.map(m => m.note)).map(
      n => n.id,
    );
    const otherNotes = flatten(clonedNotes).filter(
      n => !alreadyMatchedIds.includes(n.id),
    );

    for (const note of otherNotes) {
      const score = calculateMatchScore(note, searchString!);
      if (score > MATCH_THRESHOLD) {
        matchedNotes.push({ note, score });
      }
    }
  }

  return matchedNotes.sort((a, b) => a.score - b.score).map(({ note }) => note);
}

function calculateMatchScore(note: Note, term: string): number {
  const nameScore = fuzzy(term, note.name);
  const contentScore = fuzzy(term, note.content);

  return Math.max(nameScore, contentScore);
}
