import { SelectAndRun } from "./select-and-run";
import { Hide } from "./hide";
import { MoveSelectionDown } from "./move-selection-down";
import { MoveSelectionUp } from "./move-selection-up";
import { Show } from "./show";
import { Select } from "./select";
import { Toggle } from "./toggle";
import { Run } from "./run";

/**
 * Don't export commands here unless you want a circular
 * dependency issue.
 */

export const COMMAND_CONSOLE_REGISTRY = {
  hide: Hide,
  show: Show,
  toggle: Toggle,
  moveSelectionDown: MoveSelectionDown,
  moveSelectionUp: MoveSelectionUp,
  select: Select,
  selectAndRun: SelectAndRun,
  run: Run,
};
