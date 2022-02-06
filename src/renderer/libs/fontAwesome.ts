import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faBook,
  faCoffee,
  faFile,
  faStar,
  faTag,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";

export function fontAwesomeLib() {
  library.add(faCoffee);
}

export const TAG_ICON = faTag;
export const NOTEBOOK_ICON = faBook;
export const NOTE_ICON = faFile;
export const FAVORITE_ICON = faStar;
export const TRASH_ICON = faTrash;
