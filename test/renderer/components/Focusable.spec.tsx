import { fireEvent, render } from "@testing-library/react";
import {
  Focusable,
  FOCUSABLE_ATTRIBUTE,
  getFocusableAttribute,
  wasInsideFocusable,
} from "../../../src/renderer/components/shared/Focusable";
import { App } from "../../../src/renderer/App";
import { createState, createStore } from "../../__mocks__/store";
import React from "react";
import * as store from "../../../src/renderer/store";

const dispatch = jest.fn();
jest.spyOn(store, "useStore").mockImplementation(() => ({
  on: jest.fn(),
  off: jest.fn(),
  dispatch,
  state: createState(),
}));

test("useFocusTracking detects clicks in focusables", async () => {
  const initialState = createState();
  const res = render(
    <App initialState={initialState} needDataDirectory={false} />
  );

  // Simulate a click within the sidebar search.
  const searchbar = await res.findByPlaceholderText("Type to search...");
  fireEvent.click(searchbar);

  expect(dispatch).toBeCalledWith("focus.push", "sidebarSearch");
});

test("focusable sets attribute", () => {
  const store = createStore();
  const res = render(
    <Focusable name="sidebar" store={store}>
      Hello World!
    </Focusable>
  );
  const div = res.getByText("Hello World!");
  expect(div.getAttribute(FOCUSABLE_ATTRIBUTE)).toBe("sidebar");
});

test.each([undefined, false, true])(
  "focusable focuses (focusOnRender %s)",
  (focusOnRender) => {
    const store = createStore({ state: { ui: { focused: ["sidebar"] } } });
    const el = { current: { focus: jest.fn() } } as React.MutableRefObject<any>;
    const onFocus = jest.fn();
    const res = render(
      <Focusable
        name="sidebar"
        store={store}
        focusOnRender={focusOnRender}
        elementRef={el}
        onFocus={onFocus}
      >
        Hello World!
      </Focusable>
    );

    if (focusOnRender === undefined || focusOnRender === true) {
      expect(el.current.focus).toHaveBeenCalled();
    } else {
      expect(el.current.focus).not.toHaveBeenCalled();
    }

    expect(onFocus).toBeCalled();
  }
);

test.each([false, true])(
  "focusable blurs (focusOnRender %s)",
  (focusOnRender) => {
    const store = createStore({ state: { ui: { focused: ["editor"] } } });
    const el = { current: { blur: jest.fn() } } as React.MutableRefObject<any>;
    const onBlur = jest.fn();
    const res = render(
      <Focusable
        name="sidebar"
        store={store}
        focusOnRender={focusOnRender}
        elementRef={el}
        onBlur={onBlur}
      >
        Hello World!
      </Focusable>
    );

    if (focusOnRender === undefined || focusOnRender === true) {
      expect(el.current.blur).toHaveBeenCalled();
    } else {
      expect(el.current.blur).not.toHaveBeenCalled();
    }

    expect(onBlur).toBeCalled();
  }
);

test("focusable only blurs when current has changed", async () => {
  const store = createStore({ state: { ui: { focused: ["editor"] } } });
  const onBlur = jest.fn();
  const res = render(
    <Focusable name="sidebar" store={store} onBlur={onBlur}>
      Hello World!
    </Focusable>
  );
  expect(onBlur).toBeCalled();

  onBlur.mockReset();
  res.rerender(
    <Focusable name="sidebar" store={store} onBlur={onBlur}>
      Hello World!
    </Focusable>
  );
  expect(onBlur).not.toBeCalled();
});

test.each([false, true])(
  "focusable blurs on escape (blurOnEsc: %s)",
  async (blurOnEsc) => {
    const dispatch = jest.fn();
    const store = createStore({ dispatch });
    const res = render(
      <Focusable name="sidebar" store={store} blurOnEsc={blurOnEsc}>
        <input title="random-title"></input>
      </Focusable>
    );

    const input = res.getByTitle("random-title");
    fireEvent.keyDown(input, { code: "Escape" });

    if (blurOnEsc) {
      expect(dispatch).toBeCalledWith("focus.pop");
    } else {
      expect(dispatch).not.toBeCalled();
    }
  }
);

test("wasInsideFocusable true", () => {
  const child = document.createElement("div");
  const focusable = document.createElement("div");
  focusable.appendChild(child);
  focusable.setAttribute(FOCUSABLE_ATTRIBUTE, "sidebar");

  const ev = { target: focusable } as unknown as Event;
  expect(wasInsideFocusable(ev, "sidebar")).toBe(true);
});

test("wasInsideFocusable false", () => {
  const other = document.createElement("div");
  const focusable = document.createElement("div");
  focusable.setAttribute(FOCUSABLE_ATTRIBUTE, "sidebar");

  const ev = { target: other } as unknown as Event;
  expect(wasInsideFocusable(ev, "sidebar")).toBe(false);
});

test("getFocusableAttribute", () => {
  const focusable = document.createElement("div");
  focusable.setAttribute(FOCUSABLE_ATTRIBUTE, "sidebar");
  expect(getFocusableAttribute(focusable)).toBe("sidebar");
});

test("getFocusableAttribute parent", () => {
  const child = document.createElement("div");
  const focusable = document.createElement("div");
  focusable.appendChild(child);
  focusable.setAttribute(FOCUSABLE_ATTRIBUTE, "sidebar");

  expect(getFocusableAttribute(child)).toBe("sidebar");
});
