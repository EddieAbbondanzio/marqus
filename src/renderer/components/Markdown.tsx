import DOMPurify from "dompurify";
import { isEmpty } from "lodash";
import { marked } from "marked";
import React, { useEffect, useMemo, useRef } from "react";
import styled from "styled-components";
import { Store } from "../store";
import { Scrollable } from "./shared/Scrollable";

marked.setOptions({
  gfm: true,
  sanitizer: DOMPurify.sanitize,
});

export interface MarkdownProps {
  store: Store;
  content: string;
  scroll: number;
  onScroll: (newVal: number) => void;
}

export function Markdown(props: MarkdownProps): JSX.Element {
  const renderedMarkdown = useMemo(() => {
    if (isEmpty(props.content)) {
      return "";
    }

    return marked.parse(props.content);
  }, [props.content, props.store.state.ui.editor.noteId]);

  return (
    <Scrollable scroll={props.scroll} onScroll={props.onScroll}>
      <div dangerouslySetInnerHTML={{ __html: renderedMarkdown }} />;
    </Scrollable>
  );
}
