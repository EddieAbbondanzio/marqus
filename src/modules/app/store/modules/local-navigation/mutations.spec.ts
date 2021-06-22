import { apply, undo } from '@/modules/app/store/modules/local-navigation/mutations';
import { LocalNavigation, LocalNavigationEvent } from '@/modules/app/store/modules/local-navigation/state';

describe('LocalNavigation mutations', () => {
    describe('apply', () => {
        describe('activeChanged', () => {
            it('sets active', () => {
                const s: LocalNavigation = {
                    active: '1',
                    width: '1px',
                    history: null!,
                    notes: {}
                };

                apply(s, {
                    type: 'activeChanged',
                    newValue: '2'
                });

                expect(s.active).toBe('2');
            });
        });

        describe('noteInputStarted', () => {
            it('on create it defaults properties', () => {
                const s: LocalNavigation = {
                    history: null!,
                    notes: {},
                    width: null!
                };

                apply(s, {
                    type: 'noteInputStarted'
                });

                expect(s.notes.input!.id).not.toBeNull();
                expect(s.notes.input!.name).toBe('');
                expect(s.notes.input!.mode).toBe('create');
            });

            it('on create sets notebook when notebook is active', () => {
                const s: LocalNavigation = {
                    history: null!,
                    notes: {},
                    width: null!
                };

                apply(s, {
                    type: 'noteInputStarted',
                    active: {
                        id: '1',
                        type: 'notebook'
                    }
                });

                expect(s.notes.input!.notebooks).toHaveLength(1);
                expect(s.notes.input!.notebooks![0]).toBe('1');
            });

            it("on create sets tag when tag is active'", () => {
                const s: LocalNavigation = {
                    history: null!,
                    notes: {},
                    width: null!
                };

                apply(s, {
                    type: 'noteInputStarted',
                    active: {
                        id: '1',
                        type: 'tag'
                    }
                });

                expect(s.notes.input!.tags).toHaveLength(1);
                expect(s.notes.input!.tags![0]).toBe('1');
            });

            // it('sets update properties', () => {
            //     const s: LocalNavigation = {
            //         history: null!,
            //         notes: {},
            //         width: null!
            //     };

            //     apply(s, {
            //         type: 'noteInputStarted',
            //         note: {
            //             id: '1',
            //             tags: ['1', '2'],
            //             name: 'name',
            //             notebooks: ['3', '4']
            //         }
            //     });

            //     expect(s.notes.input!.id).toBe('1');
            //     expect(s.notes.input!.name).toBe('name');
            // });
        });

        describe('noteInputUpdated', () => {
            it('sets name', () => {
                const s: LocalNavigation = {
                    history: null!,
                    notes: {
                        input: {
                            name: ''
                        }
                    },
                    width: null!
                };

                apply(s, {
                    type: 'noteInputUpdated',
                    newValue: 'cat',
                    oldValue: 'horse'
                });

                expect(s.notes.input!.name).toBe('cat');
            });
        });

        describe('noteInputCleared', () => {
            it('clears input', () => {
                const s: LocalNavigation = {
                    history: null!,
                    notes: {},
                    width: null!
                };

                apply(s, {
                    type: 'noteInputCleared',
                    oldValue: s.notes.input!
                });

                expect(s.notes.input).toBeUndefined();
            });
        });

        describe('widthUpdated', () => {
            it('sets width', () => {
                const s: LocalNavigation = {
                    history: null!,
                    notes: {},
                    width: null!
                };

                apply(s, {
                    type: 'widthUpdated',
                    newValue: '120px',
                    oldValue: '1px'
                });

                expect(s.width).toBe('120px');
            });
        });
    });

    describe('undo', () => {
        describe('activeChanged', () => {
            it('resets active to old value', () => {
                const state: LocalNavigation = {
                    history: null!,
                    width: '100px',
                    notes: {}
                };

                undo(state, {
                    type: 'activeChanged',
                    oldValue: '1'
                });

                expect(state.active).toBe('1');
            });
        });

        describe('noteInputStarted', () => {
            it('resets input back to empty object', () => {
                const state: LocalNavigation = {
                    history: null!,
                    width: '100px',
                    notes: {
                        input: {
                            id: '1',
                            name: 'cat'
                        }
                    }
                };

                undo(state, {
                    type: 'noteInputStarted'
                });

                expect(state.notes.input).toBeUndefined();
            });
        });

        describe('noteInputUpdated', () => {
            it('resets name to old value', () => {
                const state: LocalNavigation = {
                    history: null!,
                    width: '100px',
                    notes: {
                        input: {
                            name: 'foo'
                        }
                    }
                };

                undo(state, {
                    type: 'noteInputUpdated',
                    newValue: '',
                    oldValue: 'bar'
                });

                expect(state.notes.input!.name).toBe('bar');
            });
        });

        describe('noteInputCleared', () => {
            it('resets input to old value', () => {
                const state: LocalNavigation = {
                    history: null!,
                    width: '100px',
                    notes: {}
                };

                undo(state, {
                    type: 'noteInputCleared',
                    oldValue: {
                        id: '1',
                        name: 'foobar'
                    }
                });

                expect(state.notes.input!.id).toBe('1');
                expect(state.notes.input!.name).toBe('foobar');
            });
        });

        describe('widthUpdated', () => {
            it('resets width', () => {
                const state: LocalNavigation = {
                    history: null!,
                    width: '100px',
                    notes: {}
                };

                undo(state, {
                    type: 'widthUpdated',
                    oldValue: '101px',
                    newValue: '102px'
                });

                expect(state.width).toBe('101px');
            });
        });
    });
});
