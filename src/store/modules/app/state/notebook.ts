export class Notebook {
    constructor(
        public id: string,
        public value: string,
        public expanded: boolean = false,
        public parent: Notebook | null = null,
        public children: Notebook[] | null = null
    ) {}

    toggleExpanded() {
        this.expanded = !this.expanded;
    }

    findNotebook(id: string): Notebook | null {
        // Check ourselves first
        if (this.id === id) {
            return this;
        }

        // Handle any possibilities of nothing to be found
        if (this.children == null) {
            return null;
        } else if (this.children.length == 0) {
            return null;
        }

        // Now check the children
        for (let i = 0; i < this.children.length; i++) {
            const match = this.children[i].findNotebook(id);

            if (match != null) return match;
        }

        return null;
    }

    addChild(child: Notebook) {
        // Do we need to remove it from another parent first?
        if (child.parent != null) {
            child.parent.removeChild(child);
        }

        if (this.children == null) {
            this.children = [];
        }

        this.children.push(child);
        child.parent = this;
    }

    removeChild(child: Notebook) {
        const i = this.children?.findIndex((c) => c.id === child.id);

        if (i == null || i < 0) {
            return;
        }

        child.parent = null;
        this.children?.splice(i!, 1);
    }

    toJSON() {
        return {
            id: this.id,
            value: this.value,
            expanded: this.expanded,
            children: this.children
        };
    }
}
