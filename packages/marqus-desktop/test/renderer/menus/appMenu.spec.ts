import { createConfig } from "../../__factories__/config";
import { createStore } from "../../__factories__/store";
import { useApplicationMenu } from "../../../src/renderer/menus/appMenu";
import { renderHook } from "@testing-library/react-hooks";
import * as env from "../../../src/shared/env";
import { Menu, SubMenu } from "../../../src/shared/ui/menu";

// Keep in sync with useContextMenu
test.each([
  [false, false, false],
  [true, false, true],
  [false, true, true],
  [true, true, true],
])(
  "useApplicationMenu (isDevelopment: %s, developerMode: %s, shouldSeeDevMenu: %s)",
  async (isDevelopment, developerMode, shouldSeeDevMenu) => {
    jest.spyOn(env, "isDevelopment").mockReturnValue(isDevelopment);

    const store = createStore();
    const config = createConfig({ developerMode });

    renderHook(() => {
      useApplicationMenu(store.current, config);
    });

    // Second argument of first call.
    const options: Menu[] = ((window as any).ipc as jest.Mock).mock.calls[0][1];
    const devMenu = options.find(m => (m as SubMenu).label === "&Developer");

    if (shouldSeeDevMenu) {
      expect(devMenu).not.toBe(undefined);
    } else {
      expect(devMenu).toBe(undefined);
    }
  },
);
