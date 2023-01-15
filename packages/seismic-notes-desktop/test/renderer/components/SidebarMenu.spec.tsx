import {
  getSidebarMenuAttribute,
  SIDEBAR_MENU_ATTRIBUTE,
} from "../../../src/renderer/components/SidebarMenu";

test("getSidebarMenuAttribute", () => {
  // No attribute
  const random = document.createElement("h1");
  expect(getSidebarMenuAttribute(random)).toBe(null);

  // Direct element
  const el = document.createElement("div");
  el.setAttribute(SIDEBAR_MENU_ATTRIBUTE, "foo");

  const attr1 = getSidebarMenuAttribute(el);
  expect(attr1).toBe("foo");

  // On parent
  const child = document.createElement("div");
  const parent = document.createElement("div");
  parent.appendChild(child);
  parent.setAttribute(SIDEBAR_MENU_ATTRIBUTE, "bar");

  const attr = getSidebarMenuAttribute(child);
  expect(attr).toBe("bar");
});
