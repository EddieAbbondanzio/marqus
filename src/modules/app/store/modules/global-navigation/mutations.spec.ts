import { EventHistory } from '@/common/store/plugins/undo/event-history';
import { apply, undo } from '@/modules/app/store/modules/global-navigation/mutations';
import { GlobalNavigation, GlobalNavigationEvent } from '@/modules/app/store/modules/global-navigation/state';

describe('GlobalNavigation mutations', () => {
    let state: GlobalNavigation;

    beforeEach(() => {
        state = {
            width: '100px',
            history: new EventHistory(),
            notebooks: { expanded: false },
            tags: { expanded: false }
        };
    });

    describe('apply()', () => {
        describe('activeChanged', () => {
            it('sets active', () => {
                const event: GlobalNavigationEvent = {
                    type: 'activeChanged',
                    newValue: 'all'
                };

                apply(state, event);

                expect(state.active).toBe('all');
            });
        });

        describe('tagsExpanded', () => {
            it('sets expanded', () => {
                const event: GlobalNavigationEvent = {
                    type: 'tagsExpanded',
                    newValue: true,
                    oldValue: false
                };

                apply(state, event);
                expect(state.tags.expanded).toBeTruthy();
            });
        });

        describe('widthUpdated', () => {
            it('sets width', () => {
                const event: GlobalNavigationEvent = {
                    type: 'widthUpdated',
                    newValue: '400px',
                    oldValue: '90px'
                };

                apply(state, event);
                expect(state.width).toBe('400px');
            });
        });

        describe('tagInputUpdated', () => {
            it('sets tag input', () => {
                state.tags.input = {
                    mode: 'create',
                    value: ''
                };

                const event: GlobalNavigationEvent = {
                    type: 'tagInputUpdated',
                    newValue: 'foo',
                    oldValue: 'bar'
                };

                apply(state, event);
                expect(state.tags.input!.value).toBe('foo');
            });
        });

        describe('tagInputStarted', () => {
            it('sets mode and value on create', () => {
                const event: GlobalNavigationEvent = {
                    type: 'tagInputStarted'
                };

                apply(state, event);
                expect(state.tags.input).toHaveProperty('mode', 'create');
                expect(state.tags.input).toHaveProperty('value');
            });

            it('sets id, mode, and value on update', () => {
                const event: GlobalNavigationEvent = {
                    type: 'tagInputStarted',
                    tag: {
                        id: '1',
                        value: 'foo'
                    }
                };

                apply(state, event);
                expect(state.tags.input).toHaveProperty('id', '1');
                expect(state.tags.input).toHaveProperty('mode', 'update');
                expect(state.tags.input).toHaveProperty('value');
            });
        });

        describe('tagInputCleared', () => {
            it('clears input', () => {
                state.tags.input = {
                    id: '1',
                    mode: 'update',
                    value: ''
                };

                const event: GlobalNavigationEvent = {
                    type: 'tagInputCleared',
                    oldValue: null!
                };

                apply(state, event);
                expect(state.tags.input).toBeUndefined();
            });
        });

        describe('notebooksExpanded', () => {
            it('sets expanded', () => {
                const event: GlobalNavigationEvent = {
                    type: 'notebooksExpanded',
                    newValue: true,
                    oldValue: false
                };

                apply(state, event);
                expect(state.notebooks.expanded).toBeTruthy();
            });
        });

        describe('notebookInputStarted', () => {
            it('sets mode, value, and parentId on create', () => {
                const e: GlobalNavigationEvent = {
                    type: 'notebookInputStarted',
                    parentId: '1'
                };

                apply(state, e);
                expect(state.notebooks.input).toHaveProperty('mode', 'create');
                expect(state.notebooks.input).toHaveProperty('value', '');
            });

            it('sets id, mode, value, and parentId on update', () => {
                const e: GlobalNavigationEvent = {
                    type: 'notebookInputStarted',
                    notebook: { id: '1', value: 'foo' },
                    parentId: '1'
                };

                apply(state, e);
                expect(state.notebooks.input).toHaveProperty('id', '1');
                expect(state.notebooks.input).toHaveProperty('parentId', '1');
            });
        });

        describe('notebookInputCleared', () => {
            it('clears notebook input', () => {
                state.notebooks.input = {
                    mode: 'create',
                    value: ''
                };

                const e: GlobalNavigationEvent = {
                    type: 'notebookInputCleared',
                    oldValue: null!
                };

                apply(state, e);
                expect(state.notebooks.input).toBeUndefined();
            });
        });

        describe('notebookInputUpdated', () => {
            it('sets value of notebook input', () => {
                state.notebooks.input = {
                    mode: 'create',
                    value: ''
                };

                const e: GlobalNavigationEvent = {
                    type: 'notebookInputUpdated',
                    newValue: 'foo',
                    oldValue: 'bar'
                };

                apply(state, e);
                expect(state.notebooks.input.value).toBe('foo');
            });
        });

        describe('notebookDraggingUpdated', () => {
            it('sets dragging id', () => {
                const e: GlobalNavigationEvent = {
                    type: 'notebookDraggingUpdated',
                    newValue: '1'
                };

                apply(state, e);
                expect(state.notebooks.dragging).toBe('1');
            });
        });
    });

    describe('undo()', () => {
        describe('activeChanged', () => {
            it('undos active', () => {
                state.active = 'favorites';

                const e: GlobalNavigationEvent = {
                    type: 'activeChanged',
                    oldValue: 'trash'
                };

                undo(state, e);
                expect(state.active).toBe('trash');
            });
        });

        describe('tagsExpanded', () => {
            it('undos expanded', () => {
                state.tags.expanded = true;

                const e: GlobalNavigationEvent = {
                    type: 'tagsExpanded',
                    oldValue: false,
                    newValue: true
                };

                undo(state, e);
                expect(state.tags.expanded).toBeFalsy();
            });
        });

        describe('widthUpdated', () => {
            it('undos width', () => {
                state.width = '200px';

                const e: GlobalNavigationEvent = {
                    type: 'widthUpdated',
                    newValue: '200px',
                    oldValue: '105px'
                };

                undo(state, e);
                expect(state.width).toBe('105px');
            });
        });

        describe('tagInputUpdated', () => {
            it('undos tag input', () => {
                state.tags.input = {
                    mode: 'create',
                    value: 'foo'
                };

                const e: GlobalNavigationEvent = {
                    type: 'tagInputUpdated',
                    newValue: 'foo',
                    oldValue: 'bar'
                };

                undo(state, e);
                expect(state.tags.input).toHaveProperty('value', 'bar');
            });
        });

        describe('tagInputStarted', () => {
            it('sets input back to undefined', () => {
                state.tags.input = {
                    mode: 'create',
                    value: 'foo'
                };

                const e: GlobalNavigationEvent = {
                    type: 'tagInputStarted'
                };

                undo(state, e);
                expect(state.tags.input).toBeUndefined();
            });
        });

        describe('tagInputCleared', () => {
            it('restores tag input', () => {
                const e: GlobalNavigationEvent = {
                    type: 'tagInputCleared',
                    oldValue: {
                        mode: 'create',
                        value: 'foo'
                    }
                };

                undo(state, e);
                expect(state.tags.input).toHaveProperty('mode', 'create');
                expect(state.tags.input).toHaveProperty('value', 'foo');
            });
        });

        describe('notebooksExpanded', () => {
            it('undoes expanded', () => {
                state.notebooks.expanded = true;

                const e: GlobalNavigationEvent = {
                    type: 'notebooksExpanded',
                    newValue: true,
                    oldValue: false
                };

                undo(state, e);
                expect(state.notebooks.expanded).toBeFalsy();
            });
        });

        describe('notebookInputStarted', () => {
            it('deletes notebook input', () => {
                state.notebooks.input = {
                    mode: 'create',
                    value: 'foo'
                };

                const e: GlobalNavigationEvent = {
                    type: 'notebookInputStarted'
                };

                undo(state, e);
                expect(state.notebooks.input).toBeUndefined();
            });
        });

        describe('notebookInputCleared', () => {
            it('restores input', () => {
                const e: GlobalNavigationEvent = {
                    type: 'notebookInputCleared',
                    oldValue: {
                        mode: 'create',
                        value: 'foo'
                    }
                };

                undo(state, e);
                expect(state.notebooks.input).toHaveProperty('mode', 'create');
                expect(state.notebooks.input).toHaveProperty('value', 'foo');
            });
        });

        describe('notebookInputUpdated', () => {
            it('undoes value change', () => {
                state.notebooks.input = {
                    mode: 'create',
                    value: 'foo'
                };

                const e: GlobalNavigationEvent = {
                    type: 'notebookInputUpdated',
                    newValue: 'foo',
                    oldValue: 'bar'
                };

                undo(state, e);
                expect(state.notebooks.input.value).toBe('bar');
            });
        });

        describe('notebookDraggingUpdated', () => {
            it('undoes dragging', () => {
                state.notebooks.dragging = '1';

                const e: GlobalNavigationEvent = {
                    type: 'notebookDraggingUpdated',
                    oldValue: '2',
                    newValue: '1'
                };

                undo(state, e);
                expect(state.notebooks.dragging).toBe('2');
            });
        });
    });
});
