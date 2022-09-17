import { JsonMigration } from "../../json";
import { Shortcuts } from "../../shortcuts";
import { ShortcutsInitialDefinition } from "./1_initialDefinition";

export const SHORTCUT_FILE_MIGRATIONS: JsonMigration<unknown, Shortcuts>[] = [
  new ShortcutsInitialDefinition(),
];
