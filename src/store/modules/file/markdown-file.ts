import { Version } from './version';

export interface MarkdownFile {
    id: string;
    date: Date;
    version: Version;
    pinned: boolean;
    content: string;
}
