import { faEllipsisV } from "@fortawesome/free-solid-svg-icons";
import React, { useEffect, useState } from "react";
import { classList, px } from "../../shared/dom";
import { Button } from "./shared/Button";
import { Collapse } from "./shared/Collapse";
import { Checkbox, Field, Form, Input } from "./shared/Form";
import { Icon } from "./shared/Icon";
import { Store, StoreListener } from "../store";

export interface FilterProps {
  store: Store;
}

export function Filter({ store }: FilterProps) {
  const expanded = store.state.ui.sidebar.filter.expanded ?? true;
  const searchClasses = classList("mt-1", {
    "mb-1": !expanded,
  });

  useEffect(() => {
    store.on("sidebar.toggleFilter", toggleFilter);

    return () => {
      store.off("sidebar.toggleFilter", toggleFilter);
    };
  }, [store.state]);

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
            onClick={() => store.dispatch("sidebar.toggleFilter")}
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

const toggleFilter: StoreListener<"sidebar.toggleFilter"> = (e, ctx) => {
  ctx.setUI((prev) => {
    return {
      sidebar: {
        filter: {
          expanded: !prev.sidebar.filter.expanded,
        },
      },
    };
  });
};
