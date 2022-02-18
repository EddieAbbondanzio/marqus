import { DeepPartial } from "tsdef";
import { State } from "../../src/renderer/state";
import { StoreControls } from "../../src/renderer/store";

export function createStoreControls(state?: DeepPartial<State>): StoreControls {
  return {
    setUI: jest.fn().mockImplementation((cb) => cb(state?.ui)),
    setTags: jest.fn().mockImplementation((cb) => cb(state?.tags ?? [])),
    setNotebooks: jest
      .fn()
      .mockImplementation((cb) => cb(state?.notebooks ?? [])),
    setNotes: jest.fn().mockImplementation((cb) => cb(state?.notes ?? [])),
    setShortcuts: jest
      .fn()
      .mockImplementation((cb) => cb(state?.shortcuts ?? [])),
    getState: jest.fn().mockImplementation(() => state),
  };
}
