import { renderHook } from "@testing-library/react-hooks";
import { EditorTabs } from "../../../src/renderer/components/EditorTabs";
import { act, fireEvent, render } from "@testing-library/react";
import React from "react";
import { createStore } from "../../__factories__/store";

test("openTab opens selected note by default", async () => {});

test("openTab opens tabs passed", async () => {
  // Test it sets last tab active
  // Tet it sets active tab passed.
});

test("closeTab closes active tab by default", async () => {
  // Test it changes active note to second last note by history
});

test("closeTab closes tab passed", async () => {
  // Test it changes active note by history
});

test("setActiveTab sets active tab", async () => {});

test("updateTabsScroll scrolls tabs", async () => {
  const store = createStore();
  render(<EditorTabs store={store.current} />);

  await act(async () => {
    await store.current.dispatch("editor.updateTabsScroll", 3);
  });

  const { editor } = store.current.state;
  expect(editor.tabsScroll).toBe(3);
});
