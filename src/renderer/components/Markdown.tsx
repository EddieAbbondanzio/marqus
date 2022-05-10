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

const ID_LENGTH = 6;
const generateTokenId = customAlphabet(ID_ALPHABET, ID_LENGTH);
export interface MarkdownProps {
  store: Store;
  content: string;
  scroll: number;
  onScroll: (newVal: number) => void;
}

export function Markdown(props: MarkdownProps): JSX.Element {
  // Re-use same instance for every render
  const lexer = useMemo(
    () =>
      new Lexer({
        gfm: true,
        // Don't pass sanitize or sanitizer they are deprecated and don't work!
      }),
    []
  );

  const content = useMemo(() => {
    const tokens = lexer.lex(props.content);
    return <>{tokens.map((t) => renderToken(t))}</>;
  }, [props.content, lexer]);

  return (
    <Scrollable scroll={props.scroll} onScroll={props.onScroll}>
      {content}
    </Scrollable>
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

    // We aren't going to support html
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
  return (
    <Pre key={key}>
      <CodeSpan>{unescape(t.text)}</CodeSpan>
    </Pre>
  );
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
  const onClick = () => window.ipc("app.openInWebBrowser", t.href);

  // Links will default to href="#" because we open them externally in the users
  // preferred browser.
  return (
    <Link key={key} href="#" title={t.title} onClick={onClick}>
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
  // TODO: Implement!
  throw new NotImplementedError();
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

// TODO: Add styling

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
const Blockquote = styled.blockquote``;
const Pre = styled.pre``;

const CodeSpan = styled.code``;

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
