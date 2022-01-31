import { Entity } from "./types";

export interface Notebook extends Entity<"notebook"> {
  name: string;
  expanded?: boolean;
  parent?: Notebook;
  children?: Notebook[];
}
