import DOMPurify from "dompurify";
import { isEmpty } from "lodash";
import { marked } from "marked";
import React, { useEffect, useMemo, useRef } from "react";
import { Store } from "../store";

marked.setOptions({
  gfm: true,
  sanitizer: DOMPurify.sanitize,
});

export interface MarkdownProps {
  store: Store;
  content: string;
}

export function Markdown(props: MarkdownProps): JSX.Element {
  const renderedMarkdown = useMemo(() => {
    if (isEmpty(props.content)) {
      return "";
    }

    return marked.parse(props.content);
  }, [props.content, props.store.state.ui.editor.noteId]);

  return (
    <div
      className="content"
      dangerouslySetInnerHTML={{ __html: renderedMarkdown }}
    />
  );
}

// function useMarked() {
//   useEffect(() => {
//     console.log("RUN THIS ONLY ONCE!");
//   }, []);
// }

// // Allow checking or unchecking todo list items via clicking them.
// function todoLists(): marked.MarkedExtension {
//   const listitem = marked.Renderer.prototype.listitem;

//   return {
//     renderer: {
//       listitem(text: string, task: boolean, checked: boolean): string | false {
//         if (!task) {
//           return listitem.call(this, text, task, checked);
//         }

//         console.log("TASK!");
//         return listitem.call(this, text, task, checked);
//       },
//     },
//   };
// }
