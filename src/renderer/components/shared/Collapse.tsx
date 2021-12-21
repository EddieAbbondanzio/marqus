import React, { useEffect, useState } from "react";

export interface CollapseProps {
  trigger?: React.ReactNode;
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

  // Listen for prop changes when an external trigger is being used.
  useEffect(() => {
    if (props.trigger != null) {
      return;
    }

    setCollapsed(props.collapsed!);
  }, [props.collapsed]);

  return (
    <div>
      {props.trigger && <div onClick={toggle}>{props.trigger}</div>}
      <div className={className}>{props.children}</div>
    </div>
  );
}
