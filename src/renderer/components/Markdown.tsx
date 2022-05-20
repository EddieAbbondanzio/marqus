import DOMPurify from "dompurify";
import { isEmpty, unescape } from "lodash";
import React, { useEffect, useMemo, useRef } from "react";
import styled from "styled-components";
import {
  InvalidOpError,
  NotImplementedError,
  NotSupportedError,
} from "../../shared/errors";
import { Store } from "../store";
import { Scrollable } from "./shared/Scrollable";
import { Narrow } from "../../shared/types";
import OpenColor from "open-color";
import { px } from "../../shared/dom";
import remarkGfm from "remark-gfm";
import { Remark, useRemark } from "react-remark";

export interface MarkdownProps {
  store: Store;
  content: string;
  scroll: number;
  onScroll: (newVal: number) => void;
}

export function Markdown(props: MarkdownProps): JSX.Element {
  // Check for update so we can migrate to newer versions of remarkGFM
  // https://github.com/remarkjs/react-remark/issues/50
  const [reactContent, setMarkdownSource] = useRemark({
    remarkPlugins: [remarkGfm],
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
        link: Link,
        hr: Hr,
        br: Br,
        del: Del,
        strong: Strong,
        em: Em,
        ul: UnorderedList,
        ol: OrderedList,
        li: (p: any) => {
          if (p.className === "task-list-item") {
            return <li className="task">{p.children}</li>;
          } else {
            return <li>{p.children}</li>;
          }
        },
      },
    },
  });

  useEffect(() => {
    setMarkdownSource(props.content);
  }, [props.content]);

  return (
    <Scrollable
      scroll={props.scroll}
      onScroll={props.onScroll}
      className="markdown"
    >
      {reactContent}
    </Scrollable>
  );
}

const H1 = styled.h1`
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 1.2rem;

  &:not(:first-child) {
    margin-top: 1.2rem;
  }
`;
const H2 = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;

  &:not(:first-child) {
    margin-top: 1.2rem;
  }
`;
const H3 = styled.h3`
  font-size: 1.333rem;
  font-weight: 600;
  margin-bottom: 1rem;

  &:not(:first-child) {
    margin-top: 1.2rem;
  }
`;
const H4 = styled.h4`
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;

  &:not(:first-child) {
    margin-top: 1.2rem;
  }
`;
const H5 = styled.h5`
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1rem;

  &:not(:first-child) {
    margin-top: 1.2rem;
  }
`;
const H6 = styled.h6`
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 1rem;

  &:not(:first-child) {
    margin-top: 1.2rem;
  }
`;

const Paragraph = styled.p``;
const Blockquote = styled.blockquote`
  display: flex;
  color: ${OpenColor.gray[7]};
  margin-top: 1rem;
  margin-bottom: 1rem;

  &:before {
    width: 4px;
    background-color: ${OpenColor.gray[6]}!important;
    content: " ";
    margin-right: 1rem;
  }
`;

const CodeBlock = styled.pre`
  font-family: monospace;
  background-color: ${OpenColor.gray[3]}!important;
  border-radius: 2px;
  margin-top: 1rem;
  margin-bottom: 1rem;
  padding: 0.5rem;
`;

const CodeSpan = styled.code`
  font-family: monospace;
  background-color: ${OpenColor.gray[3]}!important;
  border-radius: 2px;
`;

const Text = styled.span``;
const Image = styled.img`
  max-width: 100%;
  margin-top: 1rem;
  margin-bottom: 1rem;
`;
const Link = styled.a``;
const Hr = styled.hr``;
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

const LIST_ITEM_MARKER_WIDTH = 16;
const LIST_INDENT = 8;

const UnorderedList = styled.ul`
  margin-left: ${px(LIST_INDENT)};

  li:not(.task):before {
    content: "•";
    color: ${OpenColor.black};
    width: ${px(LIST_ITEM_MARKER_WIDTH)};
    display: inline-flex;
    justify-content: center;
  }

  li.task {
    input[type="checkbox"] {
      width: ${px(LIST_ITEM_MARKER_WIDTH)};
      margin: 0;
    }
  }
`;

const OrderedList = styled.ol`
  margin-left: ${px(LIST_INDENT)};
  counter-reset: section;

  li {
    display: flex;

    &:before {
      counter-increment: section;
      width: ${px(LIST_ITEM_MARKER_WIDTH)};
      content: counter(section) ".";
      justify-content: center;
    }
  }
`;
