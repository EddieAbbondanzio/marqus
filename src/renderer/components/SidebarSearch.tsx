import { faSearch, faTimes } from "@fortawesome/free-solid-svg-icons";
import { isEmpty } from "lodash";
import React, { useCallback, useRef } from "react";
import styled from "styled-components";
import { Section } from "../../shared/ui/app";
import { mb0, mb3, pb0, THEME, w100 } from "../css";
import { Store } from "../store";
import { Focusable } from "./shared/Focusable";
import { Icon } from "./shared/Icon";

export interface SidebarSearchProps {
  store: Store;
}

export function SidebarSearch(props: SidebarSearchProps): JSX.Element {
  const { store } = props;
  const { state } = store;

  const inputRef = useRef(null as HTMLInputElement | null);

  const onInput = useCallback(
    (ev: React.FormEvent) => {
      store.dispatch(
        "sidebar.setSearchString",
        (ev.target as HTMLInputElement).value
      );
    },
    [store]
  );

  const onClear = useCallback(() => {
    store.dispatch("sidebar.setSearchString", "");
  }, [store]);

  const { searchString = "" } = state.sidebar;

  return (
    <StyledFocusable
      store={store}
      name={Section.SidebarSearch}
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
  ${mb3}
  ${pb0}
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
