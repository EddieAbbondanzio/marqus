export type Id = string;

export interface Base {
  id: Id;
  created: Date;
  modified?: Date;
}
