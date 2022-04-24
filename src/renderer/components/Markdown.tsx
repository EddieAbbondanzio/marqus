import DOMPurify from "dompurify";
import { marked } from "marked";
import React from "react";

marked.setOptions({
  gfm: true,
});

export function Markdown(props: { content: string }): JSX.Element {
  const rendered = marked.parse(props.content ?? "");
  const clean = DOMPurify.sanitize(rendered);
  return (
    <div className="content" dangerouslySetInnerHTML={{ __html: clean }} />
  );
}
