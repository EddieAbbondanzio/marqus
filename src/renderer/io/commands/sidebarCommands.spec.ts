import { useCommands } from ".";
import { sidebarCommands } from "./sidebarCommands";
import { renderHook, act } from "@testing-library/react-hooks";
import { State } from "../../../shared/domain/state";

let initialState: State;

beforeEach(() => {
  // Lots of commands call this internally so we stub it.
  window.rpc = jest.fn();

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
});

test("sidebar.focus", () => {
  const { result } = renderHook(() => useCommands(initialState));
  act(() => {
    const [, execute] = result.current;
    execute("sidebar.focus");
  });

  const [state] = result.current;
  expect(state.ui.focused).toEqual(["sidebar"]);
});
