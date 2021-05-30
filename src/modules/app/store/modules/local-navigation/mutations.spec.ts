import { apply } from '@/modules/app/local-navigation/store/mutations';
import { LocalNavigation } from '@/modules/app/local-navigation/store/state';

describe('LocalNavigation mutations', () => {
    describe('apply', () => {
        describe('activeChanged', () => {
            it('sets active', () => {
                const s: LocalNavigation = {
                    active: '1',
                    width: '1px',
                    history: null!,
                    notes: { input: {} }
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
                    notes: {
                        input: {}
                    },
                    width: null!
                };

                apply(s, {
                    type: 'noteInputStarted'
                });

                expect(s.notes.input.id).not.toBeNull();
                expect(s.notes.input.name).toBe('');
                expect(s.notes.input.dateCreated).toBeInstanceOf(Date);
                expect(s.notes.input.dateModified).toBeInstanceOf(Date);
                expect(s.notes.input.mode).toBe('create');
            });

            it('on create sets notebook when notebook is active', () => {
                const s: LocalNavigation = {
                    history: null!,
                    notes: { input: {} },
                    width: null!
                };

                apply(s, {
                    type: 'noteInputStarted',
                    active: {
                        id: '1',
                        type: 'notebook'
                    }
                });

                expect(s.notes.input.notebooks).toHaveLength(1);
                expect(s.notes.input.notebooks![0]).toBe('1');
            });

            it("on create sets tag when tag is active'", () => {
                const s: LocalNavigation = {
                    history: null!,
                    notes: {
                        input: {}
                    },
                    width: null!
                };

                apply(s, {
                    type: 'noteInputStarted',
                    active: {
                        id: '1',
                        type: 'tag'
                    }
                });

                expect(s.notes.input.tags).toHaveLength(1);
                expect(s.notes.input.tags![0]).toBe('1');
            });

            it('sets update properties', () => {
                const s: LocalNavigation = {
                    history: null!,
                    notes: {
                        input: {}
                    },
                    width: null!
                };

                apply(s, {
                    type: 'noteInputStarted',
                    note: {
                        id: '1',
                        dateCreated: new Date(),
                        dateModified: new Date(),
                        tags: ['1', '2'],
                        name: 'name',
                        notebooks: ['3', '4']
                    }
                });

                expect(s.notes.input.id).toBe('1');
                expect(s.notes.input.dateCreated).not.toBeNull();
                expect(s.notes.input.dateModified).not.toBeNull();
                expect(s.notes.input.tags).toEqual(['1', '2']);
                expect(s.notes.input.name).toBe('name');
                expect(s.notes.input.notebooks).toEqual(['3', '4']);
            });
        });

        describe('noteInputUpdated', () => {
            it('sets name', () => {
                const s: LocalNavigation = {
                    history: null!,
                    notes: {
                        input: {}
                    },
                    width: null!
                };

                apply(s, {
                    type: 'noteInputUpdated',
                    newValue: 'cat'
                });

                expect(s.notes.input.name).toBe('cat');
            });
        });

        describe('noteInputCleared', () => {
            it('clears input', () => {
                const s: LocalNavigation = {
                    history: null!,
                    notes: {
                        input: {}
                    },
                    width: null!
                };

                apply(s, {
                    type: 'noteInputCleared'
                });

                expect(s.notes.input).toEqual({});
            });
        });

        describe('widthUpdated', () => {
            it('sets width', () => {
                const s: LocalNavigation = {
                    history: null!,
                    notes: {
                        input: {}
                    },
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
});
