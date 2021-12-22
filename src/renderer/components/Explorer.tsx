import {
  faFile,
  faBook,
  faTag,
  faStar,
  faClock,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import React from "react";
import { NotImplementedError } from "../../shared/errors";
import { ExplorerView, State } from "../../shared/domain/state";
import { Execute } from "../io/commands";
import { SetUI } from "../io/commands/types";
import { Icon } from "./shared/Icon";
import { Tab, Tabs } from "./shared/Tabs";
import { Note } from "../../shared/domain/entities";

export interface ExplorerProps {
  state: State;
  setUI: SetUI;
  execute: Execute;
}

export function Explorer({ state, setUI, execute }: ExplorerProps) {
  const active = state.ui.sidebar.explorer.view;
  const setActive = (view: ExplorerView) => () =>
    execute("sidebar.setExplorerView", view);

  const tabs = (
    <Tabs alignment="is-centered">
      <Tab title="All" isActive={active === "all"} onClick={setActive("all")}>
        <Icon icon={faFile} />
      </Tab>
      <Tab
        title="Notebooks"
        isActive={active === "notebooks"}
        onClick={setActive("notebooks")}
      >
        <Icon icon={faBook} />
      </Tab>
      <Tab
        title="Tags"
        isActive={active === "tags"}
        onClick={setActive("tags")}
      >
        <Icon icon={faTag} />
      </Tab>
      <Tab
        title="Favorites"
        isActive={active === "favorites"}
        onClick={setActive("favorites")}
      >
        <Icon icon={faStar} />
      </Tab>
      <Tab
        title="Temporary"
        isActive={active === "temp"}
        onClick={setActive("temp")}
      >
        <Icon icon={faClock} />
      </Tab>
      <Tab
        title="Trash"
        isActive={active === "trash"}
        onClick={setActive("trash")}
      >
        <Icon icon={faTrash} />
      </Tab>
    </Tabs>
  );

  /*
   * Here we load the relevant notes.
   * When view == "notebooks" we'll query
   * every notebook and then load teh notes for each one.
   *
   * Same for tags
   *
   * All will just get every note
   *
   * Temp / Trash will get all notes with relevant flags
   */

  return <div>{tabs}</div>;
}

export function getAllNotes(): Note[] {
  throw new NotImplementedError();
}
