export interface Note {
    id: string;
    title: string;
    notebook: string;
    tags: string[];
    dateCreated: Date;
    dateModified: Date;
    content: string;
}
