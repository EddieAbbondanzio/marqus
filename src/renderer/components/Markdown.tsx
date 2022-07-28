import React, { useEffect } from "react";
import styled from "styled-components";
import { Store } from "../store";
import { Scrollable } from "./shared/Scrollable";
import OpenColor from "open-color";
import remarkGfm from "remark-gfm";
import { useRemark } from "react-remark";

// TODO: Add types, or update react-remark.
// React-remark isn't currently up to date with the latest version of remark so
// we are stuck using older plugins. remark-emoji never shipped types with this
// version (2.1.0)
// eslint-disable-next-line @typescript-eslint/no-var-requires
const emoji = require("remark-emoji");

export interface MarkdownProps {
  store: Store;
  content: string;
  scroll: number;
  onScroll: (newVal: number) => void;
}

// TODO: Get better typing on this.
type Props = Record<string, never>;

export function Markdown(props: MarkdownProps): JSX.Element {
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
        image: Image,
        a: (p: Props) => (
          <Link target="_blank" href={p.href} title={p.href}>
            {p.children}
          </Link>
        ),
        hr: Hr,
        br: Br,
        del: Del,
        strong: Strong,
        em: Em,
        ul: UnorderedList,
        ol: OrderedList,
        li: (p: Props) => {
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

  return (
    <StyledScrollable scroll={props.scroll} onScroll={props.onScroll}>
      {reactContent}
    </StyledScrollable>
  );
}

const StyledScrollable = styled(Scrollable)`
  overflow-x: hidden !important;

  h1,
  h2,
  h3,
  h4,
  h5,
  h6,
  p {
    word-break: break-word;
    margin-bottom: 1.6rem;
  }
`;

const H1 = styled.h1`
  font-weight: 600;

  &:not(:first-child) {
    margin-top: 1.2rem;
  }
`;
const H2 = styled.h2`
  font-weight: 600;

  &:not(:first-child) {
    margin-top: 1.2rem;
  }
`;
const H3 = styled.h3`
  font-weight: 600;

  &:not(:first-child) {
    margin-top: 1.2rem;
  }
`;
const H4 = styled.h4`
  font-weight: 600;

  &:not(:first-child) {
    margin-top: 1.2rem;
  }
`;
const H5 = styled.h5`
  font-weight: 600;

  &:not(:first-child) {
    margin-top: 1.2rem;
  }
`;
const H6 = styled.h6`
  font-weight: 600;

  &:not(:first-child) {
    margin-top: 1.2rem;
  }
`;

const Paragraph = styled.p`
  font-size: 1.6rem;
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
  font-size: 1.6rem;
  background-color: ${OpenColor.gray[3]}!important;
  border-radius: 2px;
  padding: 2px 4px;
`;

const Text = styled.span``;
const Image = styled.img`
  max-width: 100%;
  margin-top: 1rem;
  margin-bottom: 1rem;
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
const LIST_INDENT = 8;

const UnorderedList = styled.ul`
  margin-left: ${LIST_INDENT}px;
  font-size: 1.6rem;

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
  margin-left: ${LIST_INDENT}px;
  counter-reset: section ${(p) => (p.start != null ? p.start - 1 : undefined)};
  font-size: 1.6rem;

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
  margin-bottom: 4px;
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
