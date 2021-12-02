import React, { useMemo } from "react";
import { PropsWithChildren } from "react";
import { px } from "../../../shared/dom/units";

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

export interface NavigationMenuProps {
  trigger: JSX.Element;
  collapsed: boolean;
  parent?: NavigationMenuProps;
}

export function NavigationMenu(props: PropsWithChildren<NavigationMenuProps>) {
  const indent = useMemo(
    () => calculateIndent(props),
    [props.children, props.parent]
  );

  return (
    <div style={{ paddingLeft: indent }}>
      {props.trigger}
      {props.children}
    </div>
  );
}

// export function NavigationMenu(props: NavigationMenuProps) {
//   const [state, setState] = useState<NavigationMenuInputState>({
//     value: props.label,
//     wasFinished: false,
//     wasFocused: false,
//   });

//   let inputRef = useRef(null as unknown as HTMLInputElement);
//   const keyboard = useKeyboard(inputRef);

//   // Root menu labels are ALL CAPS
//   const formattedLabel =
//     props.parent == null ? props.label.toUpperCase() : props.label;

//   useEffect(() => {
//     const input = inputRef.current;

//     // Input ref will be null if not in input mode
//     if (input == null) {
//       return;
//     }

//     if (!state.wasFocused) {
//       input.focus();
//       setState({
//         ...state,
//         wasFocused: true,
//       });
//     }

//     const finish = (calledFrom: "blur" | "keydown.enter" | "keydown.esc") => {
//       if (state.wasFinished) {
//         return;
//       }

//       switch (calledFrom) {
//         case "blur":
//           if (!isBlank(state.value)) {
//             props.onInputConfirm?.(state.value);
//           } else {
//             props.onInputCancel?.();
//           }
//           break;

//         case "keydown.enter":
//           props.onInputConfirm?.(state.value);
//           break;

//         case "keydown.esc":
//           props.onInputCancel?.();
//           break;

//         default:
//           throw new UnsupportedError(`Invalid calledFrom: ${calledFrom}`);
//       }

//       setState({
//         ...state,
//         wasFinished: true,
//       });
//     };

//     keyboard.listen(
//       { event: "keydown", keys: [KeyCode.Enter, KeyCode.Escape] },
//       (_, key: KeyCode.Enter | KeyCode.Escape) => finish(`keydown.${key}`)
//     );

//     const onBlur = () => finish("blur");
//     input.addEventListener("blur", onBlur);
//     return () => {
//       input.removeEventListener("blur", onBlur);
//     };
//   });

//   const onInput = (ev: FormEvent) => {
//     const value = (ev.target as HTMLInputElement).value;
//     setState({
//       ...state,
//       value,
//     });
//   };

//   return (
//     <div style={{ paddingLeft: indent }}>
//       <div className="m-1 is-flex is-flex-row is-align-items-center">
//         {props.icon && (
//           <Icon icon={props.icon} className="mr-1 has-text-grey" />
//         )}
//         {!props.enableInput ? (
//           <div className="is-size-7">{formattedLabel}</div>
//         ) : (
//           <input ref={inputRef} value={state.value} onInput={onInput} />
//         )}
//       </div>
//       {props.children}
//     </div>
//   );
// }
