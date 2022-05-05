import { faCross, faSearch, faTimes } from "@fortawesome/free-solid-svg-icons";
import { isEmpty } from "lodash";
import OpenColor from "open-color";
import React, { useCallback, useEffect, useRef } from "react";
import styled from "styled-components";
import { px } from "../../shared/dom";
import { KeyCode, parseKeyCode } from "../../shared/io/keyCode";
import { px1, px3, THEME, w100 } from "../css";
import { Store } from "../store";
import { Focusable } from "./shared/Focusable";
import { Icon } from "./shared/Icon";
import { BorderlessInput } from "./shared/styled";
import { SIDEBAR_MENU_HEIGHT } from "./SidebarMenu";

export interface SidebarSearchProps {
  store: Store;
}

export function SidebarSearch(props: SidebarSearchProps): JSX.Element {
  const inputRef = useRef(null as HTMLInputElement | null);

  const onInput = useCallback(
    (ev: React.FormEvent) => {
      props.store.dispatch(
        "sidebar.setSearchString",
        (ev.target as HTMLInputElement).value
      );
    },
    [props.store]
  );

  const onClear = useCallback(() => {
    props.store.dispatch("sidebar.setSearchString", "");
  }, [props.store]);

  const { searchString = "" } = props.store.state.ui.sidebar;

  return (
    <StyledFocusable
      store={props.store}
      name="sidebarSearch"
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
`;

const SearchIcon = styled(Icon)`
  position: absolute;
  color: ${THEME.sidebar.search.icon};
  left: 16px;
`;

const DeleteIcon = styled(Icon)`
  position: absolute;
  color: ${THEME.sidebar.search.deleteIcon};
  right: 16px;
  cursor: pointer;
`;

const SearchInput = styled(BorderlessInput)`
  ${w100};
  height: ${px(SIDEBAR_MENU_HEIGHT + 4)};
  background-color: ${THEME.sidebar.search.background};
  color: ${THEME.sidebar.search.font};
  padding-left: 32px;
  padding-right: 32px;
  border-radius: 4px;
  margin: 8px;
`;
