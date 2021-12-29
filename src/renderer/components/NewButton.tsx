import { faPlus, faChevronDown } from "@fortawesome/free-solid-svg-icons";
import React from "react";
import { px } from "../../shared/dom";
import { State } from "../../shared/domain/state";
import { Execute } from "../io/commands";
import { SetUI } from "../io/commands/types";
import { Dropdown } from "./shared/Dropdown";
import { Icon } from "./shared/Icon";

export interface NewButtonProps {
  state: State;
  setUI: SetUI;
  execute: Execute;
}

export function NewButton(props: NewButtonProps) {
  let trigger = (
    <div className="buttons has-addons my-0 mr-1 is-inline-block">
      <button
        className="button is-small py-2 px-1 mb-0"
        style={{ height: px(30) }}
        onClick={(ev) => ev.stopPropagation()}
      >
        <Icon icon={faPlus} size="is-small" />
        New note
      </button>
      <button
        className="button is-small py-2 p-0 mb-0"
        style={{ height: px(30) }}
      >
        <Icon icon={faChevronDown} size="is-small" />
      </button>
    </div>
  );

  return (
    <div>
      <Dropdown trigger={trigger}>
        <div className="dropdown-item">New temporary note</div>
        <div className="dropdown-item">New tag</div>
        <div className="dropdown-item">New notebook</div>
      </Dropdown>
    </div>
  );
}
