import { renderHook, RenderResult } from "@testing-library/react-hooks";
import { DeepPartial } from "tsdef";
import { State, Store, useStore } from "../../src/renderer/store";
import { Cache } from "../../src/shared/ui/app";
import { createCache, createState } from "./state";

export function createStore(
  state?: DeepPartial<State>,
  cache?: Partial<Cache>,
): RenderResult<Store> {
  const rendered = renderHook(() =>
    useStore(createState(state), createCache(cache)),
  );
  return rendered.result;
}
