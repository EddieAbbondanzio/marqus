import React from "react";

export function Scrollable({ children }: React.PropsWithChildren<{}>) {
  const styles: React.CSSProperties = {
    overflowY: "scroll",
  };

  return <div style={styles}>{children}</div>;
}
