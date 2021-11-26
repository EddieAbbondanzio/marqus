import React, { PropsWithChildren } from "react";

export function Layout({ children }: PropsWithChildren<{}>) {
  return (
    <div
      tabIndex={-1}
      style={{ maxHeight: "100vh" }}
      className="is-flex is-flex-direction-row has-overflow-y-hidden"
    >
      {children}
    </div>
  );
}
