import {
  renderHook,
  RenderHookResult,
  RenderResult,
} from "@testing-library/react-hooks";
import { DeepPartial } from "tsdef";
import { State, Store, useStore } from "../../src/renderer/store";
import { createState } from "./state";

export function createStore(state?: DeepPartial<State>): RenderResult<Store> {
  const rendered = renderHook(() => useStore(createState(state)));
  return rendered.result;
}
