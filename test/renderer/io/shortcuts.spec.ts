import {
  activeKeysToArray,
  doesSectionHaveFocus,
  getShortcutLabels,
} from "../../../src/renderer/io/shortcuts";
import { Section } from "../../../src/shared/ui/app";
import { fireEvent } from "@testing-library/react";
import { renderHook } from "@testing-library/react-hooks";
import { useShortcuts } from "../../../src/renderer/io/shortcuts";
import { Shortcut } from "../../../src/shared/domain/shortcut";
import { KeyCode } from "../../../src/shared/io/keyCode";
import * as Utils from "../../../src/shared/utils";
import { mockStore } from "../../__mocks__/store";
import { BrowserWindowEvent, IpcChannel } from "../../../src/shared/ipc";

beforeAll(() => {
  jest.useFakeTimers();
});

afterAll(() => {
  jest.useRealTimers();
});

const sleep = jest.fn().mockImplementation(() => Promise.resolve({}));
jest.spyOn(Utils, "sleep").mockImplementation(sleep);

test("useShortcuts dispatches shortcut", () => {
  const shortcut: Shortcut = {
    name: "app.toggleSidebar",
    event: "app.toggleSidebar",
    keys: [KeyCode.Control, KeyCode.LetterB],
  };
  const dispatch = jest.fn();
  const store = mockStore({ dispatch, state: { shortcuts: [shortcut] } });
  const res = renderHook(() => useShortcuts(store));

  fireEvent.keyDown(window, { code: "ControlLeft" });
  fireEvent.keyDown(window, { code: "KeyB" });

  res.rerender();
  expect(dispatch).toBeCalledWith("app.toggleSidebar", undefined);
  dispatch.mockReset();

  // Render again to ensure the shortcut wasn't fired twice.
  res.rerender();
  expect(dispatch).not.toBeCalledWith("app.toggleSidebar");
});

test("doesSectionHaveFocus", () => {
  expect(doesSectionHaveFocus(null, null)).toBe(true);
  expect(doesSectionHaveFocus([], null)).toBe(true);

  expect(doesSectionHaveFocus([], Section.Editor)).toBe(false);
  expect(doesSectionHaveFocus([Section.Editor], Section.Editor)).toBe(true);

  expect(doesSectionHaveFocus([Section.Editor], Section.EditorToolbar)).toBe(
    false,
  );
  expect(doesSectionHaveFocus([Section.EditorToolbar], Section.Editor)).toBe(
    true,
  );
});

test("useShortcuts clears active keys on window blur", async () => {
  const shortcut: Shortcut = {
    name: "app.toggleSidebar",
    event: "app.toggleSidebar",
    keys: [KeyCode.Control, KeyCode.LetterB],
  };

  const dispatch = jest.fn();
  const store = mockStore({ dispatch, state: { shortcuts: [shortcut] } });
  const res = renderHook(() => useShortcuts(store));

  fireEvent.keyDown(window, { code: "Delete" });
  fireEvent(
    window,
    new CustomEvent(IpcChannel.BrowserWindow, {
      detail: {
        event: BrowserWindowEvent.Blur,
      },
    }),
  );

  res.rerender();
  fireEvent.keyDown(window, { code: "ControlLeft" });
  fireEvent.keyDown(window, { code: "KeyB" });

  // app.toggleSidebar won't be triggered if the active keys aren't cleared on
  // blur because delete will be stuck.
  expect(dispatch).toBeCalledWith("app.toggleSidebar", undefined);
});

test("activeKeysToArray", () => {
  const keys = activeKeysToArray({
    [KeyCode.LetterA]: true,
    [KeyCode.Control]: true,
    [KeyCode.Shift]: undefined,
    [KeyCode.Alt]: false,
  });

  expect(keys).toEqual([KeyCode.Control, KeyCode.LetterA]);
});

test("getShortcutLabels", () => {
  const shortcuts: Shortcut[] = [
    {
      keys: [KeyCode.Control, KeyCode.LetterK],
      name: "foo",
      event: "app.inspectElement",
    },
    {
      keys: [KeyCode.Control, KeyCode.LetterQ],
      name: "bar",
      event: "app.openConfig",
    },
  ];

  const labels = getShortcutLabels(shortcuts);
  expect(labels["app.inspectElement"]).toEqual("control+k");
  expect(labels["app.openConfig"]).toEqual("control+q");
});
