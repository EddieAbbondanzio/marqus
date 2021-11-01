import { UserResource } from "./userResource";

export interface Notebook extends UserResource {
  name: string;
  expanded?: boolean;
  parent?: Notebook;
  children?: Notebook[];
}
