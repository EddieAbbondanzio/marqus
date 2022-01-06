import { faPlus, faChevronDown } from "@fortawesome/free-solid-svg-icons";
import React, { useState } from "react";
import { px } from "../../shared/dom";
import { Dropdown } from "./shared/Dropdown";
import { Icon } from "./shared/Icon";

export type NewButtonOption = "note" | "temporaryNote" | "tag" | "notebook";

export interface NewButtonProps {
  onClick?: (option: NewButtonOption) => any;
}

// Dumb component
export function NewButton(props: NewButtonProps) {
  let [dropdownActive, setDropdownActive] = useState(false);
  let onClick = (ev: React.MouseEvent<HTMLElement>) => {
    ev.stopPropagation();

    const target = ev.target as HTMLElement;
    if (!target.classList.contains("dropdown-item")) {
      props.onClick?.("note");
    } else {
      const optType = target.getAttribute(
        "data-new-option"
      ) as NewButtonOption | null;

      if (optType != null) {
        props.onClick?.(optType);
      }
    }
  };

  let trigger = (
    <div className="buttons has-addons my-0 mr-1 is-inline-block">
      <button
        className="button is-small py-2 px-1 mb-0"
        style={{ height: px(30) }}
        onClick={onClick}
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
      <Dropdown trigger={trigger} active={dropdownActive} onSelect={onClick}>
        {/* <a className="dropdown-item" data-new-option="temporaryNote">
          New temporary note
        </a> */}
        <a className="dropdown-item" data-new-option="tag">
          New tag
        </a>
        <a className="dropdown-item" data-new-option="notebook">
          New notebook
        </a>
      </Dropdown>
    </div>
  );
}
