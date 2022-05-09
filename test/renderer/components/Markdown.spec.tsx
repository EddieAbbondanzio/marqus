import { marked } from "marked";
import { link } from "../../../src/renderer/components/Markdown";
import { fireEvent, render } from "@testing-library/react";

test("link", async () => {
  const token: marked.Tokens.Link = {
    href: "google.com",
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
  expect((rendered as HTMLAnchorElement).href).toBe("http://localhost/#");
});
