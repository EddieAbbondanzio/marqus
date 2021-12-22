import {
  faFile,
  faBook,
  faTag,
  faStar,
  faClock,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import React from "react";
import { State } from "../../../shared/state";
import { Execute } from "../../io/commands";
import { SetUI } from "../../io/commands/types";
import { Icon } from "./Icon";

export interface ExplorerProps {
  state: State;
  setUI: SetUI;
  execute: Execute;
}

export function Explorer({ state, setUI, execute }: ExplorerProps) {
  return (
    <div className="tabs is-centered">
      <ul>
        <li className="is-active">
          <a className="p-3" title="All">
            <Icon icon={faFile} />
          </a>
        </li>
        <li>
          <a className="p-3" title="Notebooks">
            <Icon icon={faBook} />
          </a>
        </li>
        <li>
          <a className="p-3" title="Tags">
            <Icon icon={faTag} />
          </a>
        </li>
        <li>
          <a className="p-3" title="Favorites">
            <Icon icon={faStar} />
          </a>
        </li>
        <li>
          <a className="p-3" title="Temporary">
            <Icon icon={faClock} />
          </a>
        </li>
        <li>
          <a className="p-3" title="Trash">
            <Icon icon={faTrash} />
          </a>
        </li>
      </ul>
    </div>
  );
}
