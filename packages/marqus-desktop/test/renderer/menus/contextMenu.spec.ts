import {
  buildNoteSortMenu,
  useContextMenu,
} from "../../../src/renderer/menus/contextMenu";
import {
  createNote,
  NoteSort,
  NOTE_SORT_LABELS,
} from "../../../src/shared/domain/note";
import { RadioMenu } from "../../../src/shared/ui/menu";
import { renderHook } from "@testing-library/react-hooks";
import { createConfig } from "../../__factories__/config";
import { createStore } from "../../__factories__/store";
import * as env from "../../../src/shared/env";
import { fireEvent } from "@testing-library/react";

// Keep in sync with useApplicationMenu
test.each([
  [false, false, false],
  [true, false, true],
  [false, true, true],
  [true, true, true],
])(
  "useContextMenu (isDevelopment: %s, developerMode: %s, shouldSeeDevMenu: %s)",
  async (isDevelopment, developerMode, shouldSeeDevMenu) => {
    jest.spyOn(env, "isDevelopment").mockReturnValue(isDevelopment);

    const store = createStore();
    const config = createConfig({ developerMode });

    renderHook(() => {
      useContextMenu(store.current, config);
    });

    fireEvent.contextMenu(window, {
      target: {
        closest: jest.fn(),
        hasAttribute: jest.fn(),
        getBoundingClientRect: jest.fn(() => ({ x: 69, y: 420 })),
      },
    });

    const items = ((window as any).ipc as jest.Mock).mock.calls[0][1];
    if (shouldSeeDevMenu) {
      expect(items).toContainEqual(
        expect.objectContaining({
          label: "Inspect element",
        }),
      );
      expect(items).toContainEqual(
        expect.objectContaining({
          label: "Open dev tools",
        }),
      );
    } else {
      expect(items).not.toContainEqual(
        expect.objectContaining({
          label: "Inspect element",
        }),
      );
      expect(items).not.toContainEqual(
        expect.objectContaining({
          label: "Open dev tools",
        }),
      );
    }
  },
);

test("buildNoteSortMenu global sort", () => {
  const menu = buildNoteSortMenu(NoteSort.AlphanumericReversed);

  expect(menu.label).toBe("Sort notes by");
  // doesn't add reset option
  expect(menu.children.length).toBe(Object.keys(NoteSort).length);

  // sets .checked on correct option.
  const checked = menu.children.find(
    c => c.type === "radio" && c.checked,
  ) as RadioMenu;
  expect(checked.label).toBe(NOTE_SORT_LABELS[NoteSort.AlphanumericReversed]);
});

test("buildNoteSortMenu note sort", () => {
  const note = createNote({ name: "A" });
  let menu = buildNoteSortMenu(NoteSort.AlphanumericReversed, note);

  expect(menu.label).toBe("Sort children by");
  // doesn't add reset option if no custom sort.
  expect(menu.children.length).toBe(Object.keys(NoteSort).length);

  note.sort = NoteSort.DateCreated;
  menu = buildNoteSortMenu(NoteSort.AlphanumericReversed, note);
  // sets .checked on correct option.
  const checked = menu.children.find(
    c => c.type === "radio" && c.checked,
  ) as RadioMenu;
  expect(checked.label).toBe(NOTE_SORT_LABELS[NoteSort.DateCreated]);

  expect(menu.children.length).toBe(Object.keys(NoteSort).length + 1);
});
