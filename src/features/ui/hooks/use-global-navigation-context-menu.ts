import { useGlobalNavigation } from '@/features/ui/store/modules/global-navigation';
import { createContextMenuHook } from '@/hooks/create-context-menu-hook';
import { climbDomHierarchy } from '@/shared/utils';
import { store } from '@/store';

export const useGlobalNavigationContextMenu = createContextMenuHook('globalNavigation', (_, p) => {
    const element = document.elementFromPoint(p.x, p.y) as HTMLElement;

    const isElementNotebook = climbDomHierarchy<boolean>(element, {
        match: (el) => el.classList.contains('global-navigation-notebook')
    });

    const isElementTag = climbDomHierarchy<boolean>(element, {
        match: (el) => el.classList.contains('global-navigation-tag')
    });

    const id = climbDomHierarchy<string>(element, {
        match: (el) => el.hasAttribute('data-id'),
        matchValue: (el) => el.getAttribute('data-id')
    });

    // we can inject menu items as needed. This is called each time we right click
    const items = [
        {
            label: 'Expand All',
            click: () => store.dispatch('ui/globalNavigation/expandAll')
        },
        {
            label: 'Collapse All',
            click: () => store.dispatch('ui/globalNavigation/collapseAll')
        },
        {
            type: 'separator' as any
        },
        {
            label: 'Create Notebook',
            click: () => {
                if (isElementNotebook) {
                    store.dispatch('ui/globalNavigation/notebookInputStart', { parentId: id });
                } else {
                    store.dispatch('ui/globalNavigation/notebookInputStart');
                }
            }
        },
        {
            label: 'Create Tag',
            click: () => store.dispatch('ui/globalNavigation/tagInputStart')
        }
    ];

    if (isElementNotebook) {
        items.push({
            label: 'Rename Notebook',
            click: () => store.dispatch('ui/globalNavigation/notebookInputStart', { id })
        });

        items.push({
            label: 'Delete Notebook',
            click: () => store.dispatch('ui/globalNavigation/notebookDelete', id)
        });
    }

    // if tag, offer option to delete
    if (isElementTag) {
        items.push({
            label: 'Rename Tag',
            click: () => store.dispatch('ui/globalNavigation/tagInputStart', { id })
        });

        items.push({
            label: 'Delete Tag',
            click: () => store.dispatch('ui/globalNavigation/tagDelete', id)
        });
    }

    items.push({
        label: 'Empty Trash',
        click: () => store.dispatch('ui/globalNavigation/emptyTrash')
    });
    return items;
});
