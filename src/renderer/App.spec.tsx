import { act, renderHook } from "@testing-library/react-hooks";
import { toggleSidebar } from "./App";
import { State, useStore } from "./store";

let initialState: State;

beforeEach(() => {
  initialState = {
    notes: [],
    shortcuts: [],
    tags: [],
    ui: {
      sidebar: {
        scroll: 0,
        width: "300px",
      },
      editor: {
        isEditting: false,
        content: "",
      },
      focused: [],
    },
  };
});

test("app.toggleSidebar", async () => {
  const { result } = renderHook(() => useStore(initialState));
  act(() => {
    const { on } = result.current;
    on("app.toggleSidebar", toggleSidebar);
  });

  await act(async () => {
    const { dispatch, state } = result.current;
    expect(state.ui.sidebar.hidden).not.toBe(true);
    await dispatch("app.toggleSidebar");
  });

  const { state } = result.current;
  expect(state.ui.sidebar.hidden).toBe(true);
});
