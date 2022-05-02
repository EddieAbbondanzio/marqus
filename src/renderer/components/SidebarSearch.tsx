import { faCross, faSearch, faTimes } from "@fortawesome/free-solid-svg-icons";
import { isEmpty } from "lodash";
import OpenColor from "open-color";
import React, { useCallback, useRef } from "react";
import styled from "styled-components";
import { px } from "../../shared/dom";
import { px1, px3, w100 } from "../css";
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
    >
      <SearchInput
        placeholder="Type to search..."
        ref={inputRef}
        value={searchString}
        onInput={onInput}
      ></SearchInput>
      <SearchIcon icon={faSearch} />
      {!isEmpty(searchString) && <ClearIcon icon={faTimes} onClick={onClear} />}
    </StyledFocusable>
  );
}

const StyledFocusable = styled(Focusable)`
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-grow: 1;
  position: relative;
`;

const SearchIcon = styled(Icon)`
  position: absolute;
  color: ${OpenColor.white};
  left: 16px;
`;

const ClearIcon = styled(Icon)`
  position: absolute;
  color: ${OpenColor.red[9]};
  right: 16px;
  cursor: pointer;
`;

const SearchInput = styled(BorderlessInput)`
  ${w100};
  height: ${px(SIDEBAR_MENU_HEIGHT + 4)};
  background-color: ${OpenColor.gray[8]};
  color: ${OpenColor.gray[1]};
  padding-left: 32px;
  padding-right: 32px;
  border-radius: 4px;
  margin: 8px;
`;
