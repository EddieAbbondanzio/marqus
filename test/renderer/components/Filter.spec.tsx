import { DeepPartial } from "tsdef";
import { toggleFilter } from "../../../src/renderer/components/Filter";
import { UI } from "../../../src/renderer/state";
import { createStoreControls } from "../../_factories/storeControls";

test.each([
  [undefined, true],
  [false, true],
  [true, false],
])("sidebar.toggleFilter works for each case", (expanded, output) => {
  const controls = createStoreControls({
    ui: {
      sidebar: {
        filter: {
          expanded,
        },
      },
    },
  });

  toggleFilter(undefined!, controls);
  expect(controls.setUI as jest.Mock).toReturnWith<DeepPartial<UI>>({
    sidebar: {
      filter: {
        expanded: output,
      },
    },
  });
});
