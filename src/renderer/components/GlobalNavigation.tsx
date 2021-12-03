// import {
//   faBook,
//   faFile,
//   faStar,
//   faTag,
//   faTrash,
//   IconDefinition,
// } from "@fortawesome/free-solid-svg-icons";
// import React, { useContext } from "react";
// import { px } from "../../shared/dom/units";
// import { State } from "../../shared/state";
// // import { AppContext, SaveState } from "../App";
// import { Execute } from "../commands";
// import { ContextMenu } from "./shared/ContextMenu";
// import { Focusable } from "./shared/Focusable";
// import { Icon } from "./shared/Icon";
// import { NavigationMenu } from "./shared/NavigationMenu";
// import { NavigationMenuInput } from "./shared/NavigationMenuInput";
// import { Resizable } from "./shared/Resizable";
// import { Scrollable } from "./shared/Scrollable";

// export function GlobalNavigation(): JSX.Element {
//   console.log("GlobalNavigation()");
//   // const { state, execute, saveState } = useContext(AppContext)!;

//   const execute = () => 1;

//   // const all = (
//   //   <NavigationMenu
//   //     collapsed={false}
//   //     trigger={buildTrigger("ALL", faFile)}
//   //     key="all"
//   //   ></NavigationMenu>
//   // );

//   // const notebooks = (
//   //   <NavigationMenu
//   //     collapsed={false}
//   //     trigger={buildTrigger("NOTEBOOKS", faBook)}
//   //     key="notebooks"
//   //   ></NavigationMenu>
//   // );

//   // const tagsChildren = [];
//   // for (const tag of state.tags.values) {
//   //   tagsChildren.push(
//   //     <NavigationMenu
//   //       collapsed={false}
//   //       trigger={buildTrigger(tag.name)}
//   //       depth={1}
//   //       key={`tags/${tag.name}`}
//   //     ></NavigationMenu>
//   //   );
//   // }

//   // const tagsInput = state.tags.input;
//   // if (tagsInput?.mode === "create") {
//   //   const onInput = (val: string) => {
//   //     const s: State = {
//   //       ...state,
//   //       tags: {
//   //         ...state.tags,
//   //         input: { ...tagsInput, value: val },
//   //       },
//   //     };

//   //     saveState(s);
//   //   };

//   //   tagsChildren.push(
//   //     <NavigationMenu
//   //       collapsed={false}
//   //       trigger={
//   //         <NavigationMenuInput
//   //           value={tagsInput.value}
//   //           onInput={onInput}
//   //           onConfirm={tagsInput.confirm}
//   //           onCancel={tagsInput.cancel}
//   //         />
//   //       }
//   //       depth={1}
//   //       key="tags/input"
//   //     />
//   //   );
//   // }

//   // const tags = (
//   //   <NavigationMenu
//   //     collapsed={false}
//   //     trigger={buildTrigger("TAGS", faTag)}
//   //     key="tags"
//   //   >
//   //     {tagsChildren}
//   //   </NavigationMenu>
//   // );

//   // const favorites = (
//   //   <NavigationMenu
//   //     collapsed={false}
//   //     trigger={buildTrigger("FAVORITES", faStar)}
//   //     key="favorites"
//   //   ></NavigationMenu>
//   // );

//   // const trash = (
//   //   <NavigationMenu
//   //     collapsed={false}
//   //     trigger={buildTrigger("TRASH", faTrash)}
//   //     key="trash"
//   //   ></NavigationMenu>
//   // );

//   // // TODO: Allow user to customize order
//   // const menus = [all, notebooks, tags, favorites, trash];

//   // // Recursively render the menus
//   // // const mapper = (item: NavigationMenuProps & { path: string }) => (
//   // //   <NavigationMenu collapsed={false} key={item.path} parent={item.parent} />
//   // // );

//   // const { width, scroll } = state.ui.globalNavigation;

//   // let contextMenuItems = (t: HTMLElement) => [
//   //   {
//   //     text: "Create tag",
//   //     command: "globalNavigation.createTag",
//   //   },
//   // ];

//   return (
//     <Resizable
//       width={width}
//       onResize={(newWidth) => execute("globalNavigation.resizeWidth", newWidth)}
//     >
//       <Scrollable
//         scroll={scroll}
//         onScroll={(newScroll) =>
//           execute("globalNavigation.updateScroll", newScroll)
//         }
//       >
//         <Focusable name="globalNavigation">
//           <ContextMenu
//             name="globalNavigation"
//             items={contextMenuItems}
//             state={state}
//             execute={execute}
//           >
//             {}
//           </ContextMenu>
//         </Focusable>
//       </Scrollable>
//     </Resizable>
//   );
// }

// export function buildTrigger(text: string, icon?: IconDefinition): JSX.Element {
//   return (
//     <div className="m-1 is-flex is-flex-row is-align-items-center has-text-grey is-size-7">
//       {icon != null && <Icon icon={icon} className="mr-1" />}
//       <span style={icon == null ? { paddingLeft: px(16) } : {}}>{text}</span>
//     </div>
//   );
// }
