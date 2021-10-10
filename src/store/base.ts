import { Id } from "@/utils";

export interface Base {
  id: Id;
  created: Date;
  modified?: Date;
}
