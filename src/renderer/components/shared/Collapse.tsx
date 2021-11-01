import React, { useState } from "react";

export interface CollapseProps {
  trigger: React.ReactNode;
  collapsed?: boolean;
  onCollapse?: (newCollapsed: boolean) => void;
}

export function Collapse(props: React.PropsWithChildren<CollapseProps>) {
  const [collapsed, setCollapsed] = useState(props.collapsed ?? false);
  const className = collapsed ? "" : "is-hidden";

  const toggle = () => {
    setCollapsed(!collapsed);
    props.onCollapse?.(!collapsed);
  };

  console.log("Collapsed: ", collapsed);

  return (
    <div>
      <div onClick={toggle}>{props.trigger}</div>
      <div className={className}>{props.children}</div>
    </div>
  );
}
