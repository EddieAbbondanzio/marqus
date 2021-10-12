import { notebooks } from "@/store/modules/notebooks";
import { notes } from "@/store/modules/notes";
import { shortcuts } from "@/store/modules/shortcuts";
import { tags } from "@/store/modules/tags";
import { commandConsole } from "@/store/modules/ui/modules/commandConsole";
import { editor } from "@/store/modules/ui/modules/editor";
import { globalNavigation } from "@/store/modules/ui/modules/globalNavigation";
import { localNavigation } from "@/store/modules/ui/modules/localNavigation";
import { createComposable } from "vuex-smart-module";

export const useNotebooks = createComposable(notebooks);
export const useNotes = createComposable(notes);
export const useShortcuts = createComposable(shortcuts);
export const useTags = createComposable(tags);
export const useCommandConsole = createComposable(commandConsole);
export const useEditor = createComposable(editor);
export const useGlobalNavigation = createComposable(globalNavigation);
export const useLocalNavigation = createComposable(localNavigation);
