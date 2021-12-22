import { faEllipsisV } from "@fortawesome/free-solid-svg-icons";
import React, { useState } from "react";
import { classList, px } from "../../shared/dom";
import { State } from "../../shared/state";
import { Execute } from "../io/commands";
import { SetUI } from "../io/commands/types";
import { Button } from "./shared/Button";
import { Collapse } from "./shared/Collapse";
import { Checkbox, Field, Form, Input } from "./shared/Form";
import { Icon } from "./shared/Icon";

export interface FilterProps {
  state: State;
  setUI: SetUI;
  execute: Execute;
}

export function Filter({ state, execute }: FilterProps) {
  const expanded = state.ui.sidebar.filter.expanded ?? true;

  const searchClasses = classList("mt-1", {
    "mb-1": !expanded,
  });

  return (
    <div className="has-border-bottom-1-light p-2">
      <Form>
        <Field className={searchClasses} size="is-small" isHorizontal isGrouped>
          <Input
            className="mr-2"
            size="is-small"
            placeholder="Type to search..."
          />
          <Button
            className="p-1"
            size="is-small"
            color="is-light"
            title="Toggle advanced filter options"
            onClick={() => execute("sidebar.toggleFilter")}
          >
            <Icon icon={faEllipsisV}></Icon>
          </Button>
        </Field>

        <Collapse collapsed={expanded}>
          <Field label={buildLabel("Tag")} size="is-small" isHorizontal>
            <Input size="is-small" />
          </Field>

          <Field label={buildLabel("Notebook")} size="is-small" isHorizontal>
            <Input size="is-small" />
          </Field>

          <Field label={buildLabel("Status")} isHorizontal>
            <Field>
              <Checkbox label="Trashed" size="is-small" className="mr-1" />
              <Checkbox label="Favorited" size="is-small" className="mr-1" />
              <Checkbox label="Temp" size="is-small" />
            </Field>
          </Field>

          <div className="is-flex is-flex-column is-justify-content-center">
            <Button color="is-text" type="reset" size="is-small">
              Reset filters
            </Button>
          </div>
        </Collapse>
      </Form>
    </div>
  );
}

const buildLabel = (text: string) => (
  <label
    className="field-label is-small mr-2 has-text-weight-bold"
    style={{ minWidth: px(60) }}
  >
    {text}
  </label>
);
