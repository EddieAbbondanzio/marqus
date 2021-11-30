import { IconDefinition } from "@fortawesome/fontawesome-common-types";
import React, {
  PropsWithChildren,
  ReactNode,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { px } from "../../../shared/dom/units";
import { isBlank } from "../../../shared/utils/string";
import { Icon } from "./Icon";

export interface NavigationMenuProps {
  icon?: IconDefinition;
  label: string;
  path?: string;
  parent?: NavigationMenuProps;
  children?: any[];
  expanded?: boolean;
  enableInput?: boolean;
  onInputConfirm?: (input: string) => void;
  onInputCancel?: () => void;
}

export function NavigationMenu(props: NavigationMenuProps) {
  // Root menu labels are ALL CAPS
  const formattedLabel =
    props.parent == null ? props.label.toUpperCase() : props.label;

  const indent = useMemo(
    () => calculateIndent(props),
    [props.children, props.parent]
  );

  let inputRef = useRef(null as unknown as HTMLInputElement);

  const labelEl = !props.enableInput ? (
    <div className="is-size-7">{formattedLabel}</div>
  ) : (
    <input ref={inputRef} value={props.label} onInput={() => 1} />
  );

  useEffect(() => {
    const input = inputRef.current;

    if (input == null) {
      return;
    }

    input.focus();
    const onBlur = () => {
      if (!isBlank(input.value)) {
        if (props.onInputConfirm != null) {
          props?.onInputConfirm(input.value);
        }
      } else {
        if (props.onInputCancel != null) {
          props.onInputCancel();
        }
      }
    };

    const onKeyDown = (ev: KeyboardEvent) => {
      console.log(ev.key);
    };

    input.addEventListener("blur", onBlur);
    window.addEventListener("keydown", onKeyDown);

    return () => {
      input.removeEventListener("blur", onBlur);
    };
  }, []);

  return (
    <div style={{ paddingLeft: indent }}>
      <div className="m-1 is-flex is-flex-row is-align-items-center">
        {props.icon && (
          <Icon icon={props.icon} className="mr-1 has-text-grey" />
        )}
        {labelEl}
      </div>
      {props.children}
    </div>
  );
}

export function addChild(
  parent: NavigationMenuProps,
  child: NavigationMenuProps
) {
  parent.children ??= [];
  parent.children?.push(child);
  child.parent = parent;
}

const INDENT_PIXELS = 20;

export function calculateIndent(menu: NavigationMenuProps) {
  let indent = 0;
  let curr;

  curr = menu;
  while (curr.parent != null) {
    indent++;
    curr = curr.parent;
  }

  return px(indent * INDENT_PIXELS);
}
