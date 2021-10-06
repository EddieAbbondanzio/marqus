import { Hide } from "./hide";
import { MoveSelectionDown } from "./move-selection-down";
import { MoveSelectionUp } from "./move-selection-up";
import { Show } from "./show";
import { Toggle } from "./toggle";

export * from "./show";
export * from "./hide";
export * from "./toggle";
export * from "./move-selection-down";
export * from "./move-selection-up";

export const COMMAND_CONSOLE_REGISTRY = {
  hide: Hide,
  show: Show,
  toggle: Toggle,
  moveSelectionDown: MoveSelectionDown,
  moveSelectionUp: MoveSelectionUp
};
