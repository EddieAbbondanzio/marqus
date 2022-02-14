import { act, renderHook } from "@testing-library/react-hooks";
import { toggleSidebar } from "./App";
import { useStore } from "./store";
import { State } from "./state";

let initialState: State;

beforeEach(() => {
  initialState = {
    notebooks: [],
    notes: [],
    shortcuts: [],
    tags: [],
    ui: {
      sidebar: {
        explorer: {
          view: "all",
        },
        filter: {},
        scroll: 0,
        width: "300px",
      },
      focused: [],
    },
  };

  // Lots of commands call this internally so we stub it.
  window.rpc = jest.fn();
});

test("sidebar.toggle", async () => {
  const { result } = renderHook(() => useStore(initialState));
  act(() => {
    const { on } = result.current;
    on("sidebar.toggle", toggleSidebar);
  });

  await act(async () => {
    const { dispatch, state } = result.current;
    expect(state.ui.sidebar.hidden).not.toBe(true);
    await dispatch("sidebar.toggle");
  });

  const { state } = result.current;
  expect(state.ui.sidebar.hidden).toBe(true);
});
