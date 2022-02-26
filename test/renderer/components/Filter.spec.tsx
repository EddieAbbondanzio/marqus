import { act } from "react-test-renderer";
import { DeepPartial } from "tsdef";
import { toggleFilter } from "../../../src/renderer/components/Filter";
import { renderStoreHook } from "../../_mocks/store";

test.each([
  [undefined, true],
  [false, true],
  [true, false],
])("sidebar.toggleFilter", (input, output) => {
  const { result } = renderStoreHook({
    ui: {
      sidebar: {
        filter: { expanded: input },
      },
    },
  });

  act(() => {
    const store = result.current;
    store.on("sidebar.toggleFilter", toggleFilter);
  });

  act(() => {
    const store = result.current;
    store.dispatch("sidebar.toggleFilter");
  });

  const { state } = result.current;
  expect(state.ui.sidebar.filter.expanded).toBe(output);
});
