import { Version } from './version';

export interface MarkdownFile {
    id: string;
    header: {
        date: Date;
        version: Version;
        pinned: boolean;
    };
    content: string;
}
