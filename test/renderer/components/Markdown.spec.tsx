import { marked } from "marked";
import { link, toggleTask } from "../../../src/renderer/components/Markdown";
import { fireEvent, render } from "@testing-library/react";

test("link", async () => {
  const token: marked.Tokens.Link = {
    href: "http://google.com",
    text: "Click me!",
    title: "Navigate to Google.com",
    type: "link",
    raw: undefined!,
    tokens: undefined!,
  };

  const r = render(link(token));
  const rendered = await r.findByText("Click me!");
  expect(rendered.tagName).toBe("A");
  expect(rendered.title).toBe("Navigate to Google.com");
  expect((rendered as HTMLAnchorElement).href).toBe("http://google.com/");
  expect((rendered as HTMLAnchorElement).target).toBe("_blank");
});

test("toggleTask", async () => {
  const content = `
    # Foo List
    - [ ] foo
    - [x] bar
  `;

  // Throws if no matching task
  expect(() => toggleTask(content, 3, false)).toThrow();

  // sets [ ] to [x]
  const newlyChecked = toggleTask(content, 0, false);
  expect(newlyChecked).toBe(`
    # Foo List
    - [x] foo
    - [x] bar
  `);

  // sets [x] to [ ]
  const newlyUnchecked = toggleTask(content, 1, true);
  expect(newlyUnchecked).toBe(`
    # Foo List
    - [ ] foo
    - [ ] bar
  `);
});
