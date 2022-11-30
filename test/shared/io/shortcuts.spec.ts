import { fireEvent } from "@testing-library/react";
import { renderHook } from "@testing-library/react-hooks";
import {
  shouldExecute,
  useShortcuts,
} from "../../../src/renderer/io/shortcuts";
import { Shortcut } from "../../../src/shared/domain/shortcut";
import { KeyCode } from "../../../src/shared/io/keyCode";
import { Section } from "../../../src/shared/ui/app";
import * as Utils from "../../../src/shared/utils";
import { mockStore } from "../../__mocks__/store";

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

test.each([undefined, [Section.Sidebar]])(
  "shouldExecute global (current focused: (%s)",
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (focused: any) => {
    expect(shouldExecute(focused)).toBe(true);
  },
);
test("shouldExecute contextual", () => {
  expect(shouldExecute([Section.Sidebar], Section.Sidebar)).toBe(true);
  expect(shouldExecute([Section.Sidebar], Section.Editor)).toBe(false);
});

jest.useRealTimers();
