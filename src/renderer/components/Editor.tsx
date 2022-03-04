import React from "react";
import { Store } from "../store";
import { Focusable } from "./shared/Focusable";

export interface EditorProps {
  store: Store;
}

export function Editor({ store }: EditorProps) {
  const noteContent = "";


  return (
    <Focusable store={store} name="editor">

    </Focusable>
  );
}
