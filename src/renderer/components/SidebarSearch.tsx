import { faSearch, faTimes } from "@fortawesome/free-solid-svg-icons";
import { fuzzy } from "fast-fuzzy";
import { cloneDeep, isEmpty } from "lodash";
import React, { useCallback, useRef } from "react";
import styled from "styled-components";
import { flatten, Note } from "../../shared/domain/note";
import { Section } from "../../shared/ui/app";
import { isBlank } from "../../shared/utils";
import { mb0, THEME, w100 } from "../css";
import { Store } from "../store";
import { Focusable } from "./shared/Focusable";
import { Icon } from "./shared/Icon";

export const MATCH_THRESHOLD = 0.6;

export interface SidebarSearchProps {
  store: Store;
}

export function SidebarSearch(props: SidebarSearchProps): JSX.Element {
  const { store } = props;
  const { state } = store;

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
      ></SearchInput>
      <SearchIcon icon={faSearch} />
      {!isEmpty(searchString) && (
        <DeleteIcon icon={faTimes} onClick={onClear} />
      )}
    </StyledFocusable>
  );
}

const StyledFocusable = styled(Focusable)`
  display: flex;
  flex-direction: row;
  align-items: center;
  position: relative;
  margin-bottom: 0.8rem;
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
  right: 0.5rem;
  cursor: pointer;
`;

const SearchInput = styled.input`
  height: 3.2rem !important; // Keep in sync with height of new note button
  ${w100};
  padding: 0 3.2rem;
  ${mb0};
  border: none;
  outline: none;
  -webkit-appearance: none;
  border-radius: 4px;
  background-color: ${THEME.sidebar.search.background};
  color: ${THEME.sidebar.search.font};
  font-size: 1.4rem;
`;

export function searchNotes(notes: Note[], searchString?: string): Note[] {
  // Don't bother searching if string is empty or just whitespace
  if (isBlank(searchString)) {
    return notes;
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
