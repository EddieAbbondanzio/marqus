import React from "react";
import { fireEvent, render } from "@testing-library/react";
import { Markdown } from "../../../src/renderer/components/Markdown";
import { uuid } from "../../../src/shared/domain";
import { useRemark } from "react-remark";
import { Protocol } from "../../../src/shared/domain/protocols";
import { createStore } from "../../__factories__/store";

test("Markdown img sets src", async () => {
  const noteId = uuid();
  const store = createStore({
    editor: {
      activeTabNoteId: noteId,
      tabs: [],
    },
  });
  render(
    <Markdown
      store={store.current}
      content="foobar"
      scroll={0}
      onScroll={jest.fn()}
    />,
  );

  const { rehypeReactOptions } = (useRemark as jest.Mock).mock.calls[0][0];
  const {
    components: { img },
  } = rehypeReactOptions;

  const renderedImg = render(
    img({
      alt: "alt-text",
      src: `website-url.com/image.jpg`,
    }),
  ).getByAltText("alt-text") as HTMLImageElement;

  const url = new URL(renderedImg.src);
  url.search = "";
  expect(url.href).toBe("http://website-url.com/image.jpg");
});

test("Markdown img sets width and height", async () => {
  const noteId = uuid();
  const store = createStore({
    editor: {
      activeTabNoteId: noteId,
      tabs: [],
    },
  });
  render(
    <Markdown
      store={store.current}
      content="foobar"
      scroll={0}
      onScroll={jest.fn()}
    />,
  );

  const { rehypeReactOptions } = (useRemark as jest.Mock).mock.calls[0][0];
  const {
    components: { img },
  } = rehypeReactOptions;

  const renderedImg = render(
    img({
      alt: "alt-text",
      src: `${Protocol.Attachment}://foo.jpg?height=300&width=200`,
    }),
  ).getByAltText("alt-text") as HTMLImageElement;

  expect(renderedImg.width).toBe(200);
  expect(renderedImg.height).toBe(300);

  const parsedSrc = new URL(renderedImg.src);
  const parsedParams = new URLSearchParams(parsedSrc.search);
  expect(parsedParams.get("noteId")).toBe(noteId);

  // Main doesn't need to know these so we unset them in the url.
  expect(parsedParams.has("height")).toBe(false);
  expect(parsedParams.has("width")).toBe(false);
});

test("Markdown attachment link", async () => {
  const store = createStore({
    editor: {
      activeTabNoteId: uuid(),
      tabs: [],
    },
  });
  render(
    <Markdown
      store={store.current}
      content="foobar"
      scroll={0}
      onScroll={jest.fn()}
    />,
  );

  const { rehypeReactOptions } = (useRemark as jest.Mock).mock.calls[0][0];
  const {
    components: { a },
  } = rehypeReactOptions;

  const renderedLink = render(
    a({
      children: ["Click me!"],
      href: `${Protocol.Attachment}://foo.jpg`,
    }),
  ).getByText("Click me!") as HTMLAnchorElement;

  expect(renderedLink.target).toBe("");

  expect(typeof renderedLink.onclick).toBe("function");
  const preventDefault = jest.fn();

  fireEvent.click(renderedLink, { preventDefault });

  expect((window as any).ipc).toHaveBeenCalledWith(
    "notes.openAttachmentFile",
    renderedLink.href,
  );
});

test("Markdown http link", async () => {
  const store = createStore({
    editor: {
      activeTabNoteId: uuid(),
      tabs: [],
    },
  });
  render(
    <Markdown
      store={store.current}
      content="foobar"
      scroll={0}
      onScroll={jest.fn()}
    />,
  );

  const { rehypeReactOptions } = (useRemark as jest.Mock).mock.calls[0][0];
  const {
    components: { a },
  } = rehypeReactOptions;

  const renderedLink = render(
    a({
      children: ["Click me!"],
      href: "http://random-website.com",
    }),
  ).getByText("Click me!") as HTMLAnchorElement;

  expect(renderedLink.target).toBe("_blank");

  // Web links shouldn't have onclick set because they use built in browser functionality.
  expect(typeof renderedLink.onclick).not.toBe("function");

  const parsedHref = new URL(renderedLink.href);
  const searchParams = new URLSearchParams(parsedHref.search);
  expect(searchParams.has("noteId")).toBe(false);

  // Passing a url without protocol will throw an error from new URL so we test for it.
  const renderedLinkNoProtocol = render(
    a({
      children: ["Click me 2!"],
      href: "random-website.com",
    }),
  ).getByText("Click me 2!") as HTMLAnchorElement;

  expect(renderedLink.target).toBe("_blank");

  // Web links shouldn't have onclick set because they use built in browser functionality.
  expect(typeof renderedLink.onclick).not.toBe("function");

  expect(renderedLinkNoProtocol.href).toBe("http://random-website.com/");
});