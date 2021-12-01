import { IconDefinition } from "@fortawesome/fontawesome-common-types";
import React, {
  PropsWithChildren,
  ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { px } from "../../../shared/dom/units";
import { KeyCode } from "../../../shared/io/keyCode";
import { isBlank } from "../../../shared/utils/string";
import { useKeyboard } from "../../io/keyboard";
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
  const keyboard = useKeyboard(inputRef);

  const labelEl = !props.enableInput ? (
    <div className="is-size-7">{formattedLabel}</div>
  ) : (
    <input ref={inputRef} />
  );

  useEffect(() => {
    const input = inputRef.current;

    // Input ref will be null if not in input mode
    if (input == null) {
      return;
    }

    // On first render focus it
    if (props.enableInput) {
      input.focus();
    }

    const onBlur = () => {
      // If we already cancelled out on esc key down, stop.
      if (input !== document.activeElement) {
        return;
      }

      if (!isBlank(input.value)) {
        if (props.onInputConfirm != null) {
          props.onInputConfirm(input.value);
        }
      } else {
        if (props.onInputCancel != null) {
          props.onInputCancel();
        }
      }
    };

    keyboard.listen(
      { event: "keydown", keys: [KeyCode.Enter, KeyCode.Escape] },
      (_, key) => {
        input.blur();

        switch (key) {
          case KeyCode.Enter:
            console.log("enter key trigged blur");
            if (props.onInputConfirm != null) {
              props.onInputConfirm(input.value);
            }
            break;

          case KeyCode.Escape:
            console.log("esc key trigged blur");
            if (props.onInputCancel != null) {
              props.onInputCancel();
            }
            break;
        }
      }
    );

    input.addEventListener("blur", onBlur);

    console.log(props.label, " rendered");
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
