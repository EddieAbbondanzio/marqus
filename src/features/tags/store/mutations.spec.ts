import { Tag } from '@/features/tags/shared/tag';
import { TagMutations } from '@/features/tags/store/mutations';
import { TagState } from '@/features/tags/store/state';
import { inject, Mutations } from 'vuex-smart-module';

describe('Tag mutations', () => {
    let state: TagState;
    let mutations: TagMutations;

    beforeEach(() => {
        state = {
            values: []
        };

        mutations = inject(TagMutations, {
            state
        });
    });

    describe('SET_STATE', () => {
        it('sets state', () => {
            mutations.SET_STATE({
                values: [
                    { id: '1', name: 'foo' },
                    { id: '2', name: 'bar' }
                ]
            });

            expect(state.values).toHaveLength(2);
        });
    });

    describe('CREATE', () => {
        it('throws if id is blank', () => {
            expect(() => {
                mutations.CREATE({
                    value: {
                        id: '',
                        name: 'foo'
                    }
                });
            }).toThrow();
        });

        it('throws if name is blank', () => {
            expect(() => {
                mutations.CREATE({
                    value: {
                        id: '1',
                        name: ''
                    }
                });
            }).toThrow();
        });

        it('throws if name is too long', () => {
            expect(() => {
                mutations.CREATE({
                    value: {
                        id: '1',
                        name: '0123456789001234567890012345678900123456789001234567890012345678900123456789001234567890'
                    }
                });
            }).toThrow();
        });

        it('creates new tag and adds to state', () => {
            mutations.CREATE({
                value: {
                    id: '1',
                    name: 'foo'
                }
            });

            expect(state.values[0]).toHaveProperty('id', '1');
            expect(state.values[0]).toHaveProperty('name', 'foo');
        });
    });

    describe('SET_NAME', () => {
        it('throws if name is blank', () => {
            mutations.CREATE({
                value: {
                    id: '1',
                    name: 'foo'
                }
            });

            expect(() => {
                mutations.SET_NAME({
                    value: {
                        tag: state.values[0],
                        newName: ''
                    }
                });
            }).toThrow();
        });

        it('throws if name is too long', () => {
            mutations.CREATE({
                value: {
                    id: '1',
                    name: 'foo'
                }
            });

            expect(() => {
                mutations.SET_NAME({
                    value: {
                        tag: state.values[0],
                        newName:
                            '0123456789001234567890012345678900123456789001234567890012345678900123456789001234567890'
                    }
                });
            }).toThrow();
        });

        it('sets new name', () => {
            mutations.CREATE({
                value: {
                    id: '1',
                    name: 'foo'
                }
            });

            mutations.SET_NAME({
                value: {
                    tag: state.values[0],
                    newName: 'bar'
                }
            });

            expect(state.values[0]).toHaveProperty('name', 'bar');
        });
    });

    describe('DELETE', () => {
        it('throws if tag is not found', () => {
            expect(() => {
                mutations.DELETE({ value: '1' });
            }).toThrow();
        });

        it('removes tag from state', () => {
            mutations.CREATE({
                value: {
                    id: '1',
                    name: 'foo'
                }
            });

            mutations.CREATE({
                value: {
                    id: '2',
                    name: 'bar'
                }
            });

            mutations.DELETE({ value: '1' });

            expect(state.values).toHaveLength(1);
            expect(state.values[0]).toHaveProperty('id', '2');
        });
    });

    describe('DELETE_ALL', () => {
        it('removes every tag', () => {
            mutations.CREATE({
                value: {
                    id: '1',
                    name: 'foo'
                }
            });

            mutations.CREATE({
                value: {
                    id: '2',
                    name: 'bar'
                }
            });

            mutations.DELETE_ALL({});

            expect(state.values).toHaveLength(0);
        });
    });

    describe('SORT', () => {
        it('sorts alphabetically', () => {
            mutations.CREATE({
                value: {
                    id: '1',
                    name: 'foo'
                }
            });

            mutations.CREATE({
                value: {
                    id: '2',
                    name: 'bar'
                }
            });

            mutations.CREATE({
                value: {
                    id: '3',
                    name: 'baz'
                }
            });

            mutations.SORT();

            expect(state.values[0]).toHaveProperty('id', '2');
            expect(state.values[1]).toHaveProperty('id', '3');
            expect(state.values[2]).toHaveProperty('id', '1');
        });
    });
});
