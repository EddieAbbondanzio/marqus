import {
  faBook,
  faFile,
  faStar,
  faTag,
  faTrash,
  IconDefinition,
} from "@fortawesome/free-solid-svg-icons";
import { ResourceType } from "../../shared/domain/types";

export const TAG_ICON = faTag;
export const NOTEBOOK_ICON = faBook;
export const NOTE_ICON = faFile;
export const FAVORITE_ICON = faStar;
export const TRASH_ICON = faTrash;

export const RESOURCE_ICONS: Record<ResourceType, IconDefinition> = {
  note: NOTE_ICON,
  tag: TAG_ICON,
  notebook: NOTEBOOK_ICON,
};
