import { UISection } from "../../shared/domain";

export const FOCUSABLE_ATTRIBUTE = "data-focusable";

export interface FocusableProps {
  [FOCUSABLE_ATTRIBUTE]: UISection;
  tabIndex: -1;
}

export function focusable(name: UISection): FocusableProps {
  return {
    [FOCUSABLE_ATTRIBUTE]: name,
    tabIndex: -1,
  };
}
