import DOMPurify from "dompurify";
import { isEmpty, unescape } from "lodash";
import { Lexer, marked, Tokenizer } from "marked";
import React, { useEffect, useMemo, useRef } from "react";
import styled from "styled-components";
import {
  InvalidOpError,
  NotImplementedError,
  NotSupportedError,
} from "../../shared/errors";
import { Store } from "../store";
import { Scrollable } from "./shared/Scrollable";
import { customAlphabet } from "nanoid";
import { ID_ALPHABET } from "../../shared/constants";
import { Narrow } from "../../shared/types";
import OpenColor from "open-color";
import { px } from "../../shared/dom";

const ID_LENGTH = 6;
const generateTokenId = customAlphabet(ID_ALPHABET, ID_LENGTH);
export interface MarkdownProps {
  store: Store;
  content: string;
  scroll: number;
  onScroll: (newVal: number) => void;
}

interface TaskListItem extends marked.Tokens.ListItem {
  taskIndex?: number;
  onChange?: (value: boolean) => void;
}

export function Markdown(props: MarkdownProps): JSX.Element {
  const [content, tokens] = useMemo(() => {
    const tokens = new Lexer({
      gfm: true,
      // Don't pass sanitize or sanitizer they are deprecated and don't work!
    }).lex(props.content);

    // let count = 0;

    // Allow tasks to be toggled.
    // marked.walkTokens(tokens, (t) => {
    //   if (t.type === "list_item" && t.task) {
    //     console.log("TASK ITEM!");
    //     const current = count;

    //     (t as TaskListItem).taskIndex = current;
    //     (t as TaskListItem).onChange = () => {
    //       const newContent = toggleTask(
    //         props.content,
    //         current,
    //         t.checked ?? false
    //       );
    //       props.store.dispatch("editor.setContent", newContent);
    //     };
    //     count += 1;
    //   }
    // });
    // console.log("COUNT:", count);

    return [
      <div className="content" key="content">
        {tokens.map((t) => renderToken(t))}
      </div>,
      tokens,
    ];
  }, [props.content]);

  // Allow toggling tasks by clicking on them
  useEffect(() => {
    // walkTokens() doesn't go in the right order for us so we roll our own.

    const recursiveStep = (t: marked.Token, customRaw?: string): string => {
      console.log("step: ", t);
      const { items, tokens: nestedTokens } = t as {
        tokens?: marked.Token[];
        items?: marked.Tokens.ListItem[];
      };

      if (t.type === "list_item") {
        if (nestedTokens != null && nestedTokens.length > 1) {
          const nestedList = nestedTokens.find(
            (t) => t.type === "list"
          ) as marked.Tokens.List;

          const split = t.raw.split("\n");
          return [
            split[0],
            ...split
              .slice(1)
              .map((_, i) => recursiveStep(nestedList.items[i], split[i + 1])),
          ].join("\n");
        }

        return customRaw ?? t.raw;
      }

      if (nestedTokens) {
        return nestedTokens.map((t) => recursiveStep(t)).join("");
      } else if (items) {
        return items.map((t) => recursiveStep(t)).join("");
      } else {
        return customRaw ?? t.raw;
      }
    };

    console.log("raw: ", props.content);
    console.log("rebuilt: ", tokens.map((t) => recursiveStep(t)).join(""));
    console.log(tokens);

    // const rebuildContent = (t: marked.Token) => {
    //   const { items, tokens } = t as {
    //     tokens?: marked.Token[];
    //     items?: marked.Tokens.ListItem[];
    //   };

    //   // Nothing more to do here since walkTokens will iterate over these.
    //   if (tokens) {
    //     return;
    //   }

    //   console.log("Going to add: ", t.raw);
    //   contentSoFar = `${contentSoFar}${t.raw}`;

    //   // if (items) {
    //   //   items.forEach(rebuildContent);
    //   // }

    //   // if (items) {
    //   //   contentSoFar = `${contentSoFar}${recursiveStep(items)}`
    //   // }
    // };

    // marked.walkTokens(tokens, rebuildContent);

    // console.log("Rebuilt: ", contentSoFar);

    // console.log("DONE: ", contentSoFar);
  }, [content]);

  return (
    <Scrollable scroll={props.scroll} onScroll={props.onScroll}>
      {content}
    </Scrollable>
  );
}

const TASK_ITEM_REGEX = /-\s\[[ xX]\]/g;
export function toggleTask(
  content: string,
  taskIndex: number,
  wasChecked: boolean
): string {
  const matches = Array.from(content.matchAll(TASK_ITEM_REGEX));
  const match = matches[taskIndex];

  if (match == null) {
    throw new InvalidOpError(
      `No task item match found at match index ${taskIndex}`
    );
  }

  // Match will start at - [ ]
  //                     ^
  // but we need to get between the brackets [ ] so we add 3
  //                                          ^
  const toggleIndex = match.index! + 3;

  return (
    content.substring(0, toggleIndex) +
    (wasChecked ? " " : "x") +
    content.substring(toggleIndex + 1)
  );
}

// Markdown Specs: https://daringfireball.net/projects/markdown/syntax

export function renderToken(
  token: marked.Token
): JSX.Element | string | undefined {
  switch (token.type) {
    case "blockquote":
      return blockquote(token);
    case "code":
      return code(token);
    case "heading":
      return heading(token);
    case "hr":
      return hr(token);
    case "link":
      return link(token);
    case "paragraph":
      return paragraph(token);
    case "table":
      return table(token);
    case "text":
      return textOrEscape(token);
    case "list":
      return list(token);

    // TODO: We aren't going to support html?
    case "html":
    case "space":
      return undefined;

    default:
      throw new InvalidOpError(`Invalid token type ${token.type}`);
  }
}

export function renderInlineToken(
  token: marked.Token
): JSX.Element | string | undefined {
  switch (token.type) {
    case "br":
      return br(token);
    case "codespan":
      return codespan(token);
    case "del":
      return strikethrough(token);
    case "em":
      return italics(token);
    case "image":
      return image(token);
    case "link":
      return link(token);
    case "paragraph":
      return paragraph(token);
    case "strong":
      return bold(token);
    case "escape":
    case "text":
      return textOrEscape(token);

    // We aren't going to support html
    case "html":
      return undefined;

    default:
      throw new InvalidOpError(`Invalid inline token type ${token.type}`);
  }
}

const blockquote = (t: marked.Tokens.Blockquote) => {
  const key = generateTokenId();
  const content = t.tokens.map((t) => renderInlineToken(t));
  return <Blockquote key={key}>{content}</Blockquote>;
};

const code = (t: marked.Tokens.Code) => {
  const key = generateTokenId();

  // TODO: Add lang support here from token.lang
  return <CodeBlock key={key}>{unescape(t.text)}</CodeBlock>;
};

const heading = (t: marked.Tokens.Heading) => {
  const key = generateTokenId();
  const content = t.tokens.map((t) => renderInlineToken(t));
  switch (t.depth) {
    case 1:
      return <H1 key={key}>{content}</H1>;
    case 2:
      return <H2 key={key}>{content}</H2>;
    case 3:
      return <H3 key={key}>{content}</H3>;
    case 4:
      return <H4 key={key}>{content}</H4>;
    case 5:
      return <H5 key={key}>{content}</H5>;
    case 6:
      return <H6 key={key}>{content}</H6>;

    default:
      throw new InvalidOpError(`Invalid header depth ${t.depth}`);
  }
};

const hr = (t: marked.Tokens.Hr) => {
  const key = generateTokenId();
  return <Hr key={key} />;
};

const paragraph = (t: marked.Tokens.Paragraph) => {
  const key = generateTokenId();
  const content = t.tokens.map((t) => renderInlineToken(t));
  return <Paragraph key={key}>{content}</Paragraph>;
};

export const link = (t: marked.Tokens.Link) => {
  const key = generateTokenId();

  return (
    <Link key={key} href={t.href} title={t.title} target="_blank">
      {unescape(t.text)}
    </Link>
  );
};

const textOrEscape = (
  t:
    | marked.Tokens.Text
    | marked.Tokens.Escape
    | marked.Tokens.HTML
    | marked.Tokens.Tag
) => {
  const key = generateTokenId();
  const content = t.hasOwnProperty("tokens")
    ? (t as any).tokens.map((t: any) => renderInlineToken(t))
    : unescape(t.text);
  return <Text key={key}>{content}</Text>;
};

const list = (t: marked.Tokens.List) => {
  const items = t.items.map((i) => {
    if (i.task) {
      const { onChange } = i as TaskListItem;

      return (
        <TodoListItem key={generateTokenId()}>
          <input
            type="checkbox"
            checked={i.checked}
            onChange={(ev) => onChange?.(ev.target.checked)}
          />
          {i.tokens?.map((t) => renderToken(t)) ?? i.text}
        </TodoListItem>
      );
    } else {
      if (t.ordered) {
        return (
          <OrderedListItem key={generateTokenId()}>
            {i.tokens.map((t) => renderToken(t))}
          </OrderedListItem>
        );
      } else {
        return (
          <UnorderedListItem key={generateTokenId()}>
            {i.tokens.map((t) => renderToken(t))}
          </UnorderedListItem>
        );
      }
    }
  });

  if (t.ordered) {
    return <OrderedList key={generateTokenId()}>{items}</OrderedList>;
  } else {
    return <UnorderedList key={generateTokenId()}>{items}</UnorderedList>;
  }
};

const table = (t: marked.Tokens.Table) => {
  // TODO: Implement!
  throw new NotImplementedError();
};

const br = (t: marked.Tokens.Br) => {
  const key = generateTokenId();
  return <Br key={key} />;
};

const codespan = (t: marked.Tokens.Codespan) => {
  const key = generateTokenId();
  return <CodeSpan key={key}>{unescape(t.text)}</CodeSpan>;
};

const strikethrough = (t: marked.Tokens.Del) => {
  const key = generateTokenId();
  return <Del key={key}>{unescape(t.text)}</Del>;
};

const bold = (t: marked.Tokens.Strong) => {
  const key = generateTokenId();
  return <Strong key={key}>{unescape(t.text)}</Strong>;
};

const italics = (t: marked.Tokens.Em) => {
  const key = generateTokenId();
  return <Em key={key}>{unescape(t.text)}</Em>;
};

const image = (t: marked.Tokens.Image) => {
  const key = generateTokenId();
  return <Image key={key} src={t.href} />;
};

const H1 = styled.h1`
  font-size: 2em;
  font-weight: 600;
  margin-bottom: 1.2rem;

  &:not(:first-child) {
    margin-top: 1.2rem;
  }
`;
const H2 = styled.h2`
  font-size: 1.5em;
  font-weight: 600;
  margin-bottom: 1rem;

  &:not(:first-child) {
    margin-top: 1.2rem;
  }
`;
const H3 = styled.h3`
  font-size: 1.333em;
  font-weight: 600;
  margin-bottom: 1rem;

  &:not(:first-child) {
    margin-top: 1.2rem;
  }
`;
const H4 = styled.h4`
  font-size: 1.25em;
  font-weight: 600;
  margin-bottom: 1rem;

  &:not(:first-child) {
    margin-top: 1.2rem;
  }
`;
const H5 = styled.h5`
  font-size: 1.125em;
  font-weight: 600;
  margin-bottom: 1rem;

  &:not(:first-child) {
    margin-top: 1.2rem;
  }
`;
const H6 = styled.h6`
  font-size: 1em;
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

const CodeBlock = styled.code`
  font-family: monospace;
  background-color: ${OpenColor.gray[3]}!important;
  border-radius: 2px;
  display: block;
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
`;

const UnorderedListItem = styled.li`
  &:before {
    content: "•";
    color: ${OpenColor.black};
    width: ${px(LIST_ITEM_MARKER_WIDTH)};
    display: inline-flex;
    justify-content: center;
  }
`;

const OrderedList = styled.ol`
  margin-left: ${px(LIST_INDENT)};
  counter-reset: section;
`;

const OrderedListItem = styled.li`
  counter-increment: section;

  &:before {
    width: ${px(LIST_ITEM_MARKER_WIDTH)};
    content: counter(section) ".";
    display: inline-flex;
    justify-content: center;
  }
`;
const TodoListItem = styled.li`
  input[type="checkbox"] {
    width: ${px(LIST_ITEM_MARKER_WIDTH)};
    margin: 0;
  }
`;
