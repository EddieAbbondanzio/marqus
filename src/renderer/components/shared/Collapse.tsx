import React, { useEffect, useState } from "react";

export interface CollapseProps {
  collapsed?: boolean;
}

export function Collapse(props: React.PropsWithChildren<CollapseProps>) {
  const [collapsed, setCollapsed] = useState(props.collapsed ?? false);
  const className = collapsed ? "" : "is-hidden";

  // Listen for prop changes when an external trigger is being used.
  useEffect(() => {
    setCollapsed(props.collapsed!);
  }, [props.collapsed]);

  return (
    <div>
      <div className={className}>{props.children}</div>
    </div>
  );
}
