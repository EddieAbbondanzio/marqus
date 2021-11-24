// import contextMenu from "electron-context-menu";
// import { useEffect } from "react";
// import { findParent } from "./findParent";

// export const CONTEXT_MENU_ATTRIBUTE = "data-context-menu";
// export type ContextMenu = contextMenu.Options["menu"];

// export const createContextMenu = (name: string, menu: ContextMenu) => () =>
//   useEffect(() =>
//     contextMenu({
//       menu,
//       shouldShowMenu: (e, p) => {
//         const target = document.elementFromPoint(
//           p.x,
//           p.y
//         ) as HTMLElement | null;

//         if (target == null) {
//           return false;
//         }

//         const menuAttr = findParent(
//           target,
//           (el) => el.hasAttribute(CONTEXT_MENU_ATTRIBUTE),
//           {
//             matchValue: (el) => el.getAttribute(CONTEXT_MENU_ATTRIBUTE),
//           }
//         );

//         return menuAttr != null && menuAttr === name;
//       },
//     })
//   );
