import { faEllipsisV } from "@fortawesome/free-solid-svg-icons";
import React from "react";
import { px } from "../../shared/dom";
import { Checkbox, Field, Form, Input } from "./shared/Form";
import { IconButton } from "./shared/Icon";

export function Filter() {
  return (
    <div className="has-border-bottom-1-light p-2">
      <Form>
        <Field size="is-small" isHorizontal isGrouped>
          <Input
            className="mr-2"
            size="is-small"
            placeholder="Type to search..."
          />
          <IconButton
            title="Filter"
            icon={faEllipsisV}
            className="is-small is-light"
          />
        </Field>

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
