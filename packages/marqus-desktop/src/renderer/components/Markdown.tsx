import React, { useEffect } from "react";
import styled from "styled-components";
import { Scrollable } from "./shared/Scrollable";
import OpenColor from "open-color";
import remarkGfm from "remark-gfm";
import { useRemark } from "react-remark";
import { getProtocol, Protocol } from "../../shared/domain/protocols";
import { omit } from "lodash";
import { Listener, Store } from "../store";

// TODO: Add types, or update react-remark.
// React-remark isn't currently up to date with the latest version of remark so
// we are stuck using older plugins. remark-emoji never shipped types with this
// version (2.1.0)
// eslint-disable-next-line @typescript-eslint/no-var-requires
const emoji = require("remark-emoji");

const LINE_HEIGHT = 30;

type ImageAlign = "left" | "right" | "center";

export interface MarkdownProps {
  store: Store;
  content: string;
  scroll: number;
}

export function Markdown(props: MarkdownProps): JSX.Element {
  const { store } = props;
  const noteId = store.state.editor.activeTabNoteId;

  // Check for update so we can migrate to newer versions of remarkGFM
  // https://github.com/remarkjs/react-remark/issues/50
  const [reactContent, setMarkdownSource] = useRemark({
    remarkPlugins: [remarkGfm, emoji],
    remarkToRehypeOptions: { allowDangerousHtml: false },
    rehypeReactOptions: {
      components: {
        h1: H1,
        h2: H2,
        h3: H3,
        h4: H4,
        h5: H5,
        h6: H6,
        p: Paragraph,
        blockquote: Blockquote,
        pre: CodeBlock,
        code: CodeSpan,
        span: Text,
        img: (props: any) => {
          if (noteId == null) {
            throw new Error(`Cannot render links without a noteId.`);
          }

          const otherProps = omit(props, "src");

          let src;
          let title;
          let height: string | number | undefined = undefined;
          let width: string | number | undefined = undefined;
          let align: ImageAlign | undefined = undefined;

          if (props.src != null) {
            const url = tryGetURL(props.src);
            if (url != null) {
              const originalParams = new URLSearchParams(url.search);

              url.search = "";
              url.searchParams.set("noteId", noteId);

              title = url.pathname;
              src = url.href;

              if (originalParams.has("height")) {
                height = originalParams.get("height")!;
              }
              if (originalParams.has("width")) {
                width = originalParams.get("width")!;
              }

              if (originalParams.has("align")) {
                const rawAlign = originalParams.get("align");
                if (
                  rawAlign != null &&
                  ["left", "right", "center"].includes(rawAlign)
                ) {
                  align = rawAlign as ImageAlign;
                }
              }
            }
          }

          return (
            <Image
              {...otherProps}
              src={src}
              height={height}
              width={width}
              align={align}
              title={title}
            />
          );
        },
        a: (props: any) => {
          if (noteId == null) {
            throw new Error(`Cannot render links without a noteId.`);
          }

          const { children, ...otherProps } = props;

          let href: string;
          let target = "";
          let onClick: ((ev: MouseEvent) => void) | undefined;
          const url = tryGetURL(props.href);

          if (url) {
            switch (url.protocol) {
              case `${Protocol.Attachment}:`:
                url.searchParams.set("noteId", noteId);
                href = url.href;

                onClick = (ev: MouseEvent) => {
                  ev.preventDefault();
                  void window.ipc("notes.openAttachmentFile", href);
                };
                break;

              case "note:":
                onClick = (ev: MouseEvent) => {
                  ev.preventDefault();

                  const decodedHref = decodeURI(url.href);
                  void store.dispatch("editor.openTab", {
                    note: decodedHref,
                    active: decodedHref,
                  });
                };
                break;

              default:
                href = url.href;
                target = "_blank";
                break;
            }
          }

          return (
            <Link
              {...otherProps}
              target={target}
              href={url?.href}
              onClick={onClick}
              title={url?.href}
            >
              {children}
            </Link>
          );
        },
        hr: Hr,
        br: Br,
        del: Del,
        strong: Strong,
        em: Em,
        ul: UnorderedList,
        ol: OrderedList,
        li: (p: any) => {
          if (p.className === "task-list-item") {
            return <Li className="task">{p.children}</Li>;
          } else {
            return <Li>{p.children}</Li>;
          }
        },
        table: Table,
      },
    },
  });

  useEffect(() => {
    setMarkdownSource(props.content);
  }, [props.content, setMarkdownSource]);

  useEffect(() => {
    store.on("editor.updateScroll", updateScroll);

    return () => {
      store.off("editor.updateScroll", updateScroll);
    };
  }, [store]);

  return (
    <StyledScrollable
      delayedSetScroll={true}
      className="markdown"
      scroll={props.scroll}
      onScroll={newVal => store.dispatch("editor.updateScroll", newVal)}
    >
      {reactContent}
    </StyledScrollable>
  );
}

export const updateScroll: Listener<"editor.updateScroll"> = (
  { value: scroll },
  ctx,
) => {
  if (scroll == null) {
    throw Error();
  }

  const state = ctx.getState();
  if (state.editor.isEditing) {
    return;
  }

  ctx.setUI({
    editor: {
      scroll,
    },
  });
};

function tryGetURL(src: string): URL | null {
  try {
    let url: URL;
    // Assume links with no protocol are http
    if (getProtocol(src) == null) {
      url = new URL(`http://${src}`);
    } else {
      url = new URL(src);
    }

    return url;
  } catch (err) {
    return null;
  }
}

const StyledScrollable = styled(Scrollable)`
  overflow-x: hidden !important;

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    font-weight: 600;
  }

  // Indented lists use nested ol's and ul's so we can only apply margin to the
  // topmost ones.
  > p,
  > ul,
  > ol {
    word-break: break-word;
    margin-bottom: 1.6rem !important;
  }

  line-height: 1.4;
`;

const H1 = styled.h1`
  &:not(:first-child) {
    margin-top: 2rem;
  }

  font-size: 4rem;
  padding-bottom: 1.2rem;
  border-bottom: 1px solid ${OpenColor.gray[3]};
  margin-bottom: 1.2rem;
`;
const H2 = styled.h2`
  &:not(:first-child) {
    margin-top: 2rem;
  }

  font-size: 3.2rem;
  padding-bottom: 1.2rem;
  border-bottom: 1px solid ${OpenColor.gray[3]};
  margin-bottom: 1.2rem;
`;
const H3 = styled.h3`
  &:not(:first-child) {
    margin-top: 1.2rem;
  }

  font-size: 2.4rem;
  margin-bottom: 1.6rem;
`;
const H4 = styled.h4`
  &:not(:first-child) {
    margin-top: 1.2rem;
  }

  font-size: 2rem;
  margin-bottom: 1.6rem;
`;
const H5 = styled.h5`
  &:not(:first-child) {
    margin-top: 1.2rem;
  }

  font-size: 1.8rem;
  margin-bottom: 1.6rem;
`;
const H6 = styled.h6`
  &:not(:first-child) {
    margin-top: 1.2rem;
  }

  font-size: 1.6rem;
  margin-bottom: 1.6rem;
`;

const Paragraph = styled.p`
  font-size: 1.6rem;

  // Makes links render nicely when rendered in an paragraph, or when there's
  // one link per line in a pseudo list.
  white-space: pre-wrap;
`;

const Blockquote = styled.blockquote`
  display: flex;
  flex-direction: column;
  color: ${OpenColor.gray[7]};

  border-left: 4px solid ${OpenColor.gray[5]};
  margin-top: 1rem;

  p {
    margin-left: 1rem;
  }

  > blockquote {
    margin-left: 1rem;
  }
`;

const CodeBlock = styled.pre`
  font-size: 1.6rem;
  font-family: monospace;
  background-color: ${OpenColor.gray[3]}!important;
  border-radius: 2px;
  margin-top: 1rem;
  margin-bottom: 1rem;
  padding: 0.5rem;

  > code {
    padding: 0 !important ;
  }
`;

const CodeSpan = styled.code`
  font-family: monospace;
  font-size: max(inherit, 1.6rem);
  background-color: ${OpenColor.gray[3]}!important;
  border-radius: 2px;
  padding: 2px 4px;
`;

const Text = styled.span``;

const Image = styled.img<{ align?: "left" | "right" | "center" }>`
  max-width: 80%;
  margin-top: 1rem;
  margin-bottom: 1rem;
  display: block;
  ${p =>
    p.align && ["left", "center"].includes(p.align)
      ? `margin-right: auto;`
      : ""}
  ${p =>
    p.align && ["right", "center"].includes(p.align)
      ? `margin-left: auto;`
      : ""}
`;
const Link = styled.a`
  text-decoration: none;
  color: ${OpenColor.blue[9]};

  &:active {
    color: ${OpenColor.blue[5]};
  }
`;

const Hr = styled.hr`
  border: none;
  border-radius: 2px;
  border-top: 1px solid ${OpenColor.gray[5]};
`;
const Br = styled.br``;
const Strong = styled.strong`
  font-weight: bold;
`;
const Del = styled.del`
  text-decoration: line-through;
`;
const Em = styled.em`
  font-style: italic;
`;

const LIST_ITEM_MARKER_WIDTH = 32;
const LIST_INDENT = 16;

const UnorderedList = styled.ul`
  font-size: 1.6rem;

  ul {
    margin-left: ${LIST_INDENT}px;
  }

  li:not(.task) {
    &:before {
      content: "•";
      color: ${OpenColor.black};
      width: ${LIST_ITEM_MARKER_WIDTH}px;
      display: inline-flex;
      justify-content: center;
      text-align: end;
      margin-right: 4px;
    }
    ul > li {
      &:before {
        content: "◦";
      }

      ul > li:before {
        content: "🞍";
      }
    }
  }

  li.task {
    input[type="checkbox"] {
      width: ${LIST_ITEM_MARKER_WIDTH}px;
      margin: 0;
    }
  }
`;

const OrderedList = styled.ol`
  counter-reset: section ${p => (p.start != null ? p.start - 1 : undefined)};
  font-size: 1.6rem;

  ol {
    margin-left: ${LIST_INDENT}px;
  }

  li {
    display: flex;
    position: relative;

    &:before {
      counter-increment: section;
      width: ${LIST_ITEM_MARKER_WIDTH}px;
      content: counter(section) ".";
      justify-content: center;
      margin-right: 4px;
      text-align: end;
    }
  }
`;

const Li = styled.li`
  margin-top: 4px;
  font-size: 1.6rem;

  &:before {
    color: ${OpenColor.black};
  }

  color: ${OpenColor.gray[9]};
`;

const Table = styled.table`
  margin-top: 1rem;
  margin-bottom: 1rem;

  td,
  th {
    padding: 8px;
  }

  tr:last-of-type {
    th:first-of-type {
      border-top-left-radius: 4px;
    }

    th:last-of-type {
      border-top-right-radius: 4px;
    }
  }

  tr:last-of-type {
    td:first-of-type {
      border-bottom-left-radius: 4px;
    }

    td:last-of-type {
      border-bottom-right-radius: 4px;
    }
  }

  tbody {
    tr:not(:last-of-type) {
      border-bottom: 1px solid ${OpenColor.gray[5]};
    }
  }

  th {
    font-weight: 500;
    background-color: ${OpenColor.gray[7]};
    color: ${OpenColor.white};
  }

  td {
    background-color: ${OpenColor.gray[3]};
    color: ${OpenColor.gray[7]};
  }
`;
