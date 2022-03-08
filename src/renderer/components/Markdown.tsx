import DOMPurify from "dompurify";
import { marked } from "marked";
import React from "react";

export function Markdown(props: { content: string }) {
  const rendered = marked.parse(props.content ?? "");
  const clean = DOMPurify.sanitize(rendered);
  return <div dangerouslySetInnerHTML={{ __html: clean }} />;
}
