import { doesSectionHaveFocus } from "../../../src/renderer/io/shortcuts";
import { Section } from "../../../src/shared/ui/app";

test("doesSectionHaveFocus", () => {
  expect(doesSectionHaveFocus(null, null)).toBe(true);
  expect(doesSectionHaveFocus([], null)).toBe(true);

  expect(doesSectionHaveFocus([], Section.Editor)).toBe(false);
  expect(doesSectionHaveFocus([Section.Editor], Section.Editor)).toBe(true);

  expect(doesSectionHaveFocus([Section.Editor], Section.EditorTabs)).toBe(
    false,
  );
  expect(doesSectionHaveFocus([Section.EditorTabs], Section.Editor)).toBe(true);
});
