import { DeepPartial } from "tsdef";
import { Store, State } from "../../src/renderer/store";
import { createState } from "./state";

type CreateStore = Partial<Omit<Store, "state">> & {
  state?: DeepPartial<State>;
};
export function createStore(partial?: CreateStore): Store {
  return {
    on: partial?.on ?? jest.fn(),
    off: partial?.off ?? jest.fn(),
    dispatch: partial?.dispatch ?? jest.fn(),
    state: createState(partial?.state),
  };
}
