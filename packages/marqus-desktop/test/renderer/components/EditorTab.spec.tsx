import {
  EDITOR_TAB_ATTRIBUTE,
  getEditorTabAttribute,
} from "../../../src/renderer/components/EditorTab";

test("getEditorTabAttribute", () => {
  // None
  const none = document.createElement("h1");
  expect(getEditorTabAttribute(none)).toBe(null);

  // Direct
  const focusable = document.createElement("div");
  focusable.setAttribute(EDITOR_TAB_ATTRIBUTE, "foo");
  expect(getEditorTabAttribute(focusable)).toBe("foo");

  // Parent
  const child = document.createElement("div");
  const parent = document.createElement("div");
  parent.appendChild(child);
  parent.setAttribute(EDITOR_TAB_ATTRIBUTE, "bar");

  expect(getEditorTabAttribute(child)).toBe("bar");
});
