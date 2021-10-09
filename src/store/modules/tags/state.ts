import { Base } from "@/store/base";

export interface Tag extends Base {
  name: string;
}

export class TagState {
  values: Tag[] = [];
}
