import { Entity } from '@/store';

export interface Notebook extends Entity {
    value: string;
    parent?: Notebook;
    children?: Notebook[];
    expanded: boolean;
}
