import React, { useCallback, useRef } from "react";
import styled from "styled-components";
import { px } from "../../shared/dom";
import { w100 } from "../css";
import { Store } from "../store";
import { Focusable } from "./shared/Focusable";
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

  return (
    <StyledFocusable
      store={props.store}
      name="sidebarSearch"
      elementRef={inputRef}
    >
      <SearchInput
        placeholder="Type to search..."
        type="search"
        ref={inputRef}
        value={props.store.state.ui.sidebar.searchString ?? ""}
        onInput={onInput}
      ></SearchInput>
    </StyledFocusable>
  );
}

const StyledFocusable = styled(Focusable)`
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-grow: 1;
`;

const SearchInput = styled(BorderlessInput)`
  ${w100};
  height: ${px(SIDEBAR_MENU_HEIGHT)};
`;
