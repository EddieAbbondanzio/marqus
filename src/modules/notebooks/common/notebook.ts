import { Entity } from '@/core/store/entity';

export interface Notebook extends Entity {
    value: string;
    parent?: Notebook;
    children?: Notebook[];
    expanded: boolean;
}
