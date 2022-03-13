import { renderHook } from "@testing-library/react-hooks";
import { act } from "react-test-renderer";
import {
  scrollDown,
  scrollUp,
  updateScroll,
} from "../../../src/renderer/components/Explorer";
import { NAV_MENU_HEIGHT } from "../../../src/renderer/components/ExplorerItems";
import { renderStoreHook } from "../../_mocks/store";

test("sidebar.updateScroll", async () => {
  const { result } = renderStoreHook();
  act(() => {
    const store = result.current;
    store.on("sidebar.updateScroll", updateScroll);
  });

  await act(async () => {
    const store = result.current;
    expect(store.state.ui.sidebar.scroll).toBe(0);
    await store.dispatch("sidebar.updateScroll", 200);
  });

  const { state } = result.current;
  expect(state.ui.sidebar.scroll).toBe(200);
});

test("sidebar.scrollDown", () => {
  const { result } = renderStoreHook();
  act(() => {
    const store = result.current;
    store.on("sidebar.scrollDown", scrollDown);
  });

  act(() => {
    const store = result.current;
    expect(store.state.ui.sidebar.scroll).toBe(0);
    store.dispatch("sidebar.scrollDown");
    store.dispatch("sidebar.scrollDown");
    store.dispatch("sidebar.scrollDown");
  });

  const { state } = result.current;
  expect(state.ui.sidebar.scroll).toBe(NAV_MENU_HEIGHT * 3);
});

test("sidebar.scrollUp once", () => {
  const { result } = renderStoreHook({
    ui: {
      sidebar: { scroll: 120 },
    },
  });

  act(() => {
    const store = result.current;
    store.on("sidebar.scrollUp", scrollUp);
  });

  act(() => {
    const store = result.current;
    store.dispatch("sidebar.scrollUp");
  });

  const { state } = result.current;
  expect(state.ui.sidebar.scroll).toBe(90);
});

test("sidebar.scrollUp clamps", () => {
  const { result } = renderStoreHook({
    ui: {
      sidebar: { scroll: 30 },
    },
  });

  act(() => {
    const store = result.current;
    store.on("sidebar.scrollUp", scrollUp);
  });

  act(() => {
    const store = result.current;
    store.dispatch("sidebar.scrollUp");
    store.dispatch("sidebar.scrollUp");
  });

  const { state } = result.current;
  expect(state.ui.sidebar.scroll).toBe(0);
});

// test("sidebar.setSelection", () => {
//   const { result } = renderHook(() => useCommands(initialState));
//   let selected = [resourceId("tag")];
//   act(() => {
//     const [, execute] = result.current;
//     execute("sidebar.setSelection", selected);
//   });

//   const [state] = result.current;
//   expect(state.ui.sidebar.explorer.selected).toBe(selected);
// });

// test("sidebar.setSelection", () => {
//   initialState.ui.sidebar.explorer.selected = [resourceId("tag")];
//   const { result } = renderHook(() => useCommands(initialState));
//   act(() => {
//     const [, execute] = result.current;
//     execute("sidebar.clearSelection");
//   });

//   const [state] = result.current;
//   expect(state.ui.sidebar.explorer.selected).toEqual([]);
// });

// test("sidebar.setSelection stops if already clear", () => {
//   const { result } = renderHook(() => useCommands(initialState));
//   act(() => {
//     const [, execute] = result.current;
//     execute("sidebar.clearSelection");
//   });

//   // Check by reference to see if it was changed
//   const [state] = result.current;
//   expect(state.ui.sidebar.explorer.selected).toBe(
//     initialState.ui.sidebar.explorer.selected
//   );
// });

// test("sidebar.moveSelectionUp moves up", () => {
//   let tag1 = createTag({ name: "a" });
//   let tag2 = createTag({ name: "b" });
//   let tag3 = createTag({ name: "c" });
//   initialState.ui.sidebar.explorer.view = "tags";
//   initialState.tags = [tag1, tag2, tag3];
//   initialState.ui.sidebar.explorer.selected = [tag2.id];

//   const { result } = renderHook(() => useCommands(initialState));
//   act(() => {
//     const [, execute] = result.current;
//     execute("sidebar.moveSelectionUp");
//   });

//   const [state] = result.current;
//   expect(state.ui.sidebar.explorer.selected).toEqual([tag1.id]);
// });

// test("sidebar.moveSelectionUp clamps", () => {
//   let tag1 = createTag({ name: "a" });
//   let tag2 = createTag({ name: "b" });
//   let tag3 = createTag({ name: "c" });
//   initialState.ui.sidebar.explorer.view = "tags";
//   initialState.tags = [tag1, tag2, tag3];
//   initialState.ui.sidebar.explorer.selected = [tag1.id];

//   const { result } = renderHook(() => useCommands(initialState));
//   act(() => {
//     const [, execute] = result.current;
//     execute("sidebar.moveSelectionUp");
//   });

//   const [state] = result.current;
//   expect(state.ui.sidebar.explorer.selected).toEqual([tag1.id]);
// });

// test("sidebar.moveSelectionUp starts at top", () => {
//   let tag1 = createTag({ name: "a" });
//   let tag2 = createTag({ name: "b" });
//   let tag3 = createTag({ name: "c" });
//   initialState.ui.sidebar.explorer.view = "tags";
//   initialState.tags = [tag1, tag2, tag3];

//   const { result } = renderHook(() => useCommands(initialState));
//   act(() => {
//     const [, execute] = result.current;
//     execute("sidebar.moveSelectionUp");
//   });

//   const [state] = result.current;
//   expect(state.ui.sidebar.explorer.selected).toEqual([tag1.id]);
// });

// test("sidebar.moveSelectionDown moves down", () => {
//   let tag1 = createTag({ name: "a" });
//   let tag2 = createTag({ name: "b" });
//   let tag3 = createTag({ name: "c" });
//   initialState.ui.sidebar.explorer.view = "tags";
//   initialState.tags = [tag1, tag2, tag3];
//   initialState.ui.sidebar.explorer.selected = [tag2.id];

//   const { result } = renderHook(() => useCommands(initialState));
//   act(() => {
//     const [, execute] = result.current;
//     execute("sidebar.moveSelectionDown");
//   });

//   const [state] = result.current;
//   expect(state.ui.sidebar.explorer.selected).toEqual([tag3.id]);
// });

// test("sidebar.moveSelectionDown clamps", () => {
//   let tag1 = createTag({ name: "a" });
//   let tag2 = createTag({ name: "b" });
//   let tag3 = createTag({ name: "c" });
//   initialState.ui.sidebar.explorer.view = "tags";
//   initialState.tags = [tag1, tag2, tag3];
//   initialState.ui.sidebar.explorer.selected = [tag3.id];

//   const { result } = renderHook(() => useCommands(initialState));
//   act(() => {
//     const [, execute] = result.current;
//     execute("sidebar.moveSelectionDown");
//   });

//   const [state] = result.current;
//   expect(state.ui.sidebar.explorer.selected).toEqual([tag3.id]);
// });

// test("sidebar.moveSelectionDown starts at top", () => {
//   let tag1 = createTag({ name: "a" });
//   let tag2 = createTag({ name: "b" });
//   let tag3 = createTag({ name: "c" });
//   initialState.ui.sidebar.explorer.view = "tags";
//   initialState.tags = [tag1, tag2, tag3];

//   const { result } = renderHook(() => useCommands(initialState));
//   act(() => {
//     const [, execute] = result.current;
//     execute("sidebar.moveSelectionDown");
//   });

//   const [state] = result.current;
//   expect(state.ui.sidebar.explorer.selected).toEqual([tag1.id]);
// });

// test("sidebar.setExplorerView", () => {
//   const { result } = renderHook(() => useCommands(initialState));
//   act(() => {
//     const [, execute] = result.current;
//     execute("sidebar.setExplorerView", "favorites");
//   });

//   const [state] = result.current;
//   expect(state.ui.sidebar.explorer.view).toBe("favorites");
// });

//   const [state] = result.current;
//   expect(state.ui.sidebar.explorer.expanded).toEqual([tag]);
// });
