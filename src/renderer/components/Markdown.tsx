import DOMPurify from "dompurify";
import { isEmpty, unescape } from "lodash";
import { Lexer, marked, Tokenizer } from "marked";
import React, { useEffect, useMemo, useRef } from "react";
import styled from "styled-components";
import { InvalidOpError } from "../../shared/errors";
import { Store } from "../store";
import { Scrollable } from "./shared/Scrollable";
import { customAlphabet } from "nanoid";
import { ID_ALPHABET } from "../../shared/constants";

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
    return render(tokens);
  }, [props.content, lexer]);

  return (
    <Scrollable scroll={props.scroll} onScroll={props.onScroll}>
      {/* <div dangerouslySetInnerHTML={{ __html: renderedMarkdown }} />; */}
      {content}
    </Scrollable>
  );
}

export function render(tokens: marked.TokensList): JSX.Element {
  const rendered: (JSX.Element | string)[] = [];

  for (const token of tokens) {
    // Hack, but good enough. Randomly generating keys for children components
    // will come at a penalty cost of react being forced to do a complete render
    // but we can re-visit this later on. It should be safe since we are using
    // useMemo so we render when changes occur.
    const key = generateTokenId();

    switch (token.type) {
      case "space":
        // Nothing to do...
        break;

      case "paragraph":
        rendered.push(
          <Paragraph key={key}>{renderInlines(token.tokens)}</Paragraph>
        );
        break;

      case "text":
        // TODO: Is this good?
        const content = token.hasOwnProperty("tokens")
          ? renderInlines((token as any).tokens)
          : unescape(token.text);
        rendered.push(<Text key={key}>{content}</Text>);
        break;

      case "blockquote":
        const quote = renderInlines(token.tokens);
        rendered.push(<Blockquote key={key}>{quote}</Blockquote>);
        break;

      case "code":
        rendered.push(
          <Pre key={key}>
            <CodeSpan>{unescape(token.text)}</CodeSpan>
          </Pre>
        );
        break;

      case "html":
        // TODO: Does this work?
        rendered.push(token.text);
        break;

      case "hr":
        rendered.push(<Hr key={key} />);
        break;

      case "link":
        // TODO: Add rel image support
        rendered.push(
          <Link key={key} href={token.href} title={token.title} target="_blank">
            {unescape(token.text)}
          </Link>
        );
        break;

      case "heading":
        const header = renderInlines(token.tokens);
        switch (token.depth) {
          case 1:
            rendered.push(<H1 key={key}>{header}</H1>);
            break;
          case 2:
            rendered.push(<H2 key={key}>{header}</H2>);
            break;
          case 3:
            rendered.push(<H3 key={key}>{header}</H3>);
            break;
          case 4:
            rendered.push(<H4 key={key}>{header}</H4>);
            break;
          case 5:
            rendered.push(<H5 key={key}>{header}</H5>);
            break;
          case 6:
            rendered.push(<H6 key={key}>{header}</H6>);
            break;

          default:
            throw new InvalidOpError(`Invalid header depth ${token.depth}`);
        }
        break;

      case "list":
      case "table":
        // TODO: Add support
        console.log("Add support for ", token.type);
        break;

      default:
        throw new InvalidOpError(`Invalid token ${token.type}`);
    }
  }

  return <>{rendered}</>;
}

export function renderInlines(tokens: marked.Token[]): JSX.Element {
  const rendered: (JSX.Element | string)[] = [];

  for (const token of tokens) {
    // See comment above about key
    const key = generateTokenId();

    switch (token.type) {
      case "br":
        rendered.push(<Br key={key} />);
        break;

      case "codespan":
        rendered.push(<CodeSpan key={key}>{unescape(token.text)}</CodeSpan>);
        break;

      case "del":
        rendered.push(<Del key={key}>{unescape(token.text)}</Del>);
        break;

      case "escape":
      case "text":
        rendered.push(<Text key={key}>{unescape(token.text)}</Text>);
        break;

      case "em":
        rendered.push(<Em key={key}>{unescape(token.text)}</Em>);
        break;

      case "html":
        // TODO: Does this work?
        rendered.push(token.text);
        break;

      case "image":
        // TODO: Add rel image support
        rendered.push(<Image key={key} href={token.href} />);
        break;

      case "link":
        // TODO: Add rel image support
        rendered.push(
          <Link key={key} href={token.href} title={token.title} target="_blank">
            {unescape(token.text)}
          </Link>
        );
        break;

      case "strong":
        rendered.push(<Strong key={key}>{unescape(token.text)}</Strong>);
        break;

      case "paragraph":
        rendered.push(
          <Paragraph key={key}>{renderInlines(token.tokens)}</Paragraph>
        );
        break;

      default:
        throw new InvalidOpError(`Invalid inline token ${token.type}`);
    }
  }

  return <>{rendered}</>;
}

// TODO: Add styling

const Paragraph = styled.p``;
const Blockquote = styled.blockquote``;
const Hr = styled.hr``;
const H1 = styled.h1``;
const H2 = styled.h2``;
const H3 = styled.h3``;
const H4 = styled.h4``;
const H5 = styled.h5``;
const H6 = styled.h6``;
const Pre = styled.pre``;

const Br = styled.br``;
const CodeSpan = styled.code``;
const Del = styled.del``;
const Em = styled.em``;
const Text = styled.span``;
const Image = styled.image``;
const Link = styled.a``;
const Strong = styled.strong``;
