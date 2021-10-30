import React from "react";

export function Layout(props: React.PropsWithChildren<{}>) {
  return (
    <div
      style={{ maxHeight: "100vh" }}
      className="is-flex is-flex-direction-row has-overflow-y-hidden"
    >
      {props.children}
    </div>
  );
}
