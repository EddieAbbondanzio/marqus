import { fireEvent } from "@testing-library/react";
import { renderHook } from "@testing-library/react-hooks";
import {
  shouldExecute,
  useShortcuts,
} from "../../../src/renderer/io/shortcuts";
import { Shortcut } from "../../../src/shared/domain/shortcut";
import { Section, UI } from "../../../src/shared/domain/ui/sections";
import { KeyCode } from "../../../src/shared/io/keyCode";
import * as Utils from "../../../src/shared/utils";
import { createStore } from "../../__factories__/store";

jest.useFakeTimers();

const sleep = jest.fn().mockImplementation(() => Promise.resolve({}));
jest.spyOn(Utils, "sleep").mockImplementation(sleep);

test("useShortcuts dispatches shortcut", () => {
  const shortcut: Shortcut = {
    name: "app.toggleSidebar",
    event: "app.toggleSidebar",
    keys: [KeyCode.Control, KeyCode.LetterB],
  };
  const dispatch = jest.fn();
  const store = createStore({ dispatch, state: { shortcuts: [shortcut] } });
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

test.each([undefined, [Section.Sidebar]])(
  "shouldExecute global (current focused: (%s)",
  (focused: any) => {
    const ui = {
      focused,
    } as unknown as UI;
    expect(shouldExecute(ui)).toBe(true);
  }
);
test("shouldExecute contextual", () => {
  const ui = {
    focused: [Section.Sidebar],
  } as unknown as UI;
  expect(shouldExecute(ui, Section.Sidebar)).toBe(true);
  expect(shouldExecute(ui, Section.Editor)).toBe(false);
});

jest.useRealTimers();
