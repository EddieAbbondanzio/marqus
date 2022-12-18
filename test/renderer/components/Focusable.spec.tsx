import { fireEvent, render, RenderResult } from "@testing-library/react";
import {
  Focusable,
  FocusableProps,
  FOCUSABLE_ATTRIBUTE,
  getFocusableAttribute,
  wasInsideFocusable,
} from "../../../src/renderer/components/shared/Focusable";
import { App } from "../../../src/renderer/App";
import React, { ReactNode } from "react";
import * as store from "../../../src/renderer/store";
import { mockStore } from "../../__mocks__/store";
import { Section } from "../../../src/shared/ui/app";
import { createConfig } from "../../__factories__/config";

function init(
  props: FocusableProps,
  content: ReactNode = undefined,
): RenderResult {
  jest.spyOn(store, "useStore").mockImplementation(() => props.store);
  return render(<Focusable {...props}>{content}</Focusable>);
}

test("useFocusTracking detects clicks in focusables", async () => {
  const s = mockStore();
  jest.spyOn(store, "useStore").mockImplementation(() => s);

  const res = render(
    <App state={s.state} config={createConfig({ noteDirectory: "foo" })} />,
  );

  // Simulate a click within the sidebar search.
  const searchbar = await res.findByPlaceholderText("Type to search...");
  fireEvent.click(searchbar);

  expect(s.dispatch).toBeCalledWith("focus.push", Section.SidebarSearch);
});

test("focusable sets attribute", () => {
  const s = mockStore();
  const res = init({ section: Section.Sidebar, store: s }, "Hello World!");
  const div = res.getByText("Hello World!");

  expect(div.getAttribute(FOCUSABLE_ATTRIBUTE)).toBe(Section.Sidebar);
});

test.each([undefined, false, true])(
  "focusable focuses (focusOnRender %s)",
  focusOnRender => {
    const store = mockStore({
      state: { focused: [Section.Sidebar] },
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const el = { current: { focus: jest.fn() } } as React.MutableRefObject<any>;
    const onFocus = jest.fn();

    init(
      {
        section: Section.Sidebar,
        store: store,
        focusOnRender,
        elementRef: el,
        onFocus,
      },
      "Hello World!",
    );

    if (focusOnRender === undefined || focusOnRender === true) {
      expect(el.current.focus).toHaveBeenCalled();
    } else {
      expect(el.current.focus).not.toHaveBeenCalled();
    }

    expect(onFocus).toBeCalled();
  },
);

test.each([false, true])(
  "focusable blurs (focusOnRender %s)",
  focusOnRender => {
    const store = mockStore({ state: { focused: [Section.Editor] } });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const el = { current: { blur: jest.fn() } } as React.MutableRefObject<any>;
    const onBlur = jest.fn();

    init({
      section: Section.Sidebar,
      store,
      focusOnRender,
      elementRef: el,
      onBlur,
    });

    if (focusOnRender === undefined || focusOnRender === true) {
      expect(el.current.blur).toHaveBeenCalled();
    } else {
      expect(el.current.blur).not.toHaveBeenCalled();
    }

    expect(onBlur).toBeCalled();
  },
);

test("focusable only blurs when current has changed", async () => {
  const store = mockStore({ state: { focused: [Section.Editor] } });
  const onBlur = jest.fn();
  const res = init({
    section: Section.Sidebar,
    store,
    onBlur,
  });
  expect(onBlur).toBeCalled();

  onBlur.mockReset();
  res.rerender(
    <Focusable section={Section.Sidebar} store={store} onBlur={onBlur}>
      Hello World!
    </Focusable>,
  );
  expect(onBlur).not.toBeCalled();
});

test.each([false, true])(
  "focusable blurs on escape (blurOnEsc: %s)",
  async blurOnEsc => {
    const store = mockStore();
    const res = init(
      {
        section: Section.Sidebar,
        store,
        blurOnEsc,
      },
      <input title="random-title"></input>,
    );

    const input = res.getByTitle("random-title");
    fireEvent.keyDown(input, { code: "Escape" });

    if (blurOnEsc) {
      expect(store.dispatch).toBeCalledWith("focus.pop");
    } else {
      expect(store.dispatch).not.toBeCalled();
    }
  },
);

test("wasInsideFocusable true", () => {
  const child = document.createElement("div");
  const focusable = document.createElement("div");
  focusable.appendChild(child);
  focusable.setAttribute(FOCUSABLE_ATTRIBUTE, Section.Sidebar);

  const ev = { target: focusable } as unknown as Event;
  expect(wasInsideFocusable(ev, Section.Sidebar)).toBe(true);
});

test("wasInsideFocusable false", () => {
  const other = document.createElement("div");
  const focusable = document.createElement("div");
  focusable.setAttribute(FOCUSABLE_ATTRIBUTE, Section.Sidebar);

  const ev = { target: other } as unknown as Event;
  expect(wasInsideFocusable(ev, Section.Sidebar)).toBe(false);
});

test("getFocusableAttribute", () => {
  // Direct
  const focusable = document.createElement("div");
  focusable.setAttribute(FOCUSABLE_ATTRIBUTE, Section.Sidebar);
  expect(getFocusableAttribute(focusable)).toBe(Section.Sidebar);

  // Parent
  const child = document.createElement("div");
  const parent = document.createElement("div");
  parent.appendChild(child);
  parent.setAttribute(FOCUSABLE_ATTRIBUTE, Section.Sidebar);

  expect(getFocusableAttribute(child)).toBe(Section.Sidebar);
});
