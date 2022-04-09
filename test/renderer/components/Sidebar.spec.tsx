import { act } from "react-test-renderer";
import { resizeWidth } from "../../../src/renderer/components/Sidebar";
import { px } from "../../../src/renderer/utils/dom";
import { renderStoreHook } from "../../_mocks/store";

test("sidebar.resizeWidth", () => {
  const { result } = renderStoreHook({ ui: { sidebar: { width: px(100) } } });
  act(() => {
    const store = result.current;
    store.on("sidebar.resizeWidth", resizeWidth);
  });
  /*  */
  act(() => {
    const store = result.current;
    store.dispatch("sidebar.resizeWidth", px(250));
  });

  const { state } = result.current;
  expect(state.ui.sidebar.width).toBe(px(250));
});
