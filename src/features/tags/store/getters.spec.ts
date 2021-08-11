import { TagGetters } from '@/features/tags/store/getters';
import { inject } from 'vuex-smart-module';

describe('TagStore', () => {
    describe('first()', () => {
        it('returns the first element', () => {
            const getters = inject(TagGetters, {
                state: {
                    values: [
                        { id: '1', value: 'foo' },
                        { id: '2', value: 'bar' },
                        { id: '3', value: 'baz' }
                    ]
                }
            });

            const first = getters.first();
            expect(first).toHaveProperty('id', '1');
        });
    });

    describe('last()', () => {
        it('returns the last element', () => {
            const getters = inject(TagGetters, {
                state: {
                    values: [
                        { id: '1', value: 'foo' },
                        { id: '2', value: 'bar' },
                        { id: '3', value: 'baz' }
                    ]
                }
            });

            const last = getters.last();
            expect(last).toHaveProperty('id', '3');
        });
    });

    describe('byName()', () => {
        it('returns tag by name', () => {
            const getters = inject(TagGetters, {
                state: {
                    values: [
                        { id: '1', value: 'foo' },
                        { id: '2', value: 'bar' },
                        { id: '3', value: 'baz' }
                    ]
                }
            });
            const m = getters.byName('foo');
            expect(m).toHaveProperty('id', '1');
        });

        it('throws if required was set and no match', () => {
            const getters = inject(TagGetters, {
                state: {
                    values: [
                        { id: '1', value: 'foo' },
                        { id: '2', value: 'bar' },
                        { id: '3', value: 'baz' }
                    ]
                }
            });
            expect(() => {
                getters.byName('buzz', { required: true });
            }).toThrow();
        });

        it('does not throw if not required', () => {
            const getters = inject(TagGetters, {
                state: {
                    values: [
                        { id: '1', value: 'foo' },
                        { id: '2', value: 'bar' },
                        { id: '3', value: 'baz' }
                    ]
                }
            });
            expect(() => {
                getters.byName('buzz');
            }).not.toThrow();
        });
    });

    describe('byId()', () => {
        it('returns tag by id', () => {
            const getters = inject(TagGetters, {
                state: {
                    values: [
                        { id: '1', value: 'foo' },
                        { id: '2', value: 'bar' },
                        { id: '3', value: 'baz' }
                    ]
                }
            });

            const m = getters.byId('1');
            expect(m).toHaveProperty('id', '1');
        });

        it('throws if required was set and no match', () => {
            const getters = inject(TagGetters, {
                state: {
                    values: [
                        { id: '1', value: 'foo' },
                        { id: '2', value: 'bar' },
                        { id: '3', value: 'baz' }
                    ]
                }
            });

            expect(() => {
                getters.byId('4', { required: true });
            }).toThrow();
        });

        it('does not throw if not required', () => {
            const getters = inject(TagGetters, {
                state: {
                    values: [
                        { id: '1', value: 'foo' },
                        { id: '2', value: 'bar' },
                        { id: '3', value: 'baz' }
                    ]
                }
            });

            expect(() => {
                getters.byId('4');
            }).not.toThrow();
        });
    });

    describe('getPrevious()', () => {
        it('returns null if no previous', () => {
            const getters = inject(TagGetters, {
                state: {
                    values: [
                        { id: '1', value: 'foo' },
                        { id: '2', value: 'bar' },
                        { id: '3', value: 'baz' }
                    ]
                }
            });

            const prev = getters.getPrevious('1');
            expect(prev).toBeNull();
        });

        it('returns the previous', () => {
            const getters = inject(TagGetters, {
                state: {
                    values: [
                        { id: '1', value: 'foo' },
                        { id: '2', value: 'bar' },
                        { id: '3', value: 'baz' }
                    ]
                }
            });

            const prev = getters.getPrevious('2');
            expect(prev).toHaveProperty('id', '1');
        });
    });

    describe('getNext()', () => {
        it('returns null if no next', () => {
            const getters = inject(TagGetters, {
                state: {
                    values: [
                        { id: '1', value: 'foo' },
                        { id: '2', value: 'bar' },
                        { id: '3', value: 'baz' }
                    ]
                }
            });

            const prev = getters.getNext('3');
            expect(prev).toBeNull();
        });

        it('returns the next', () => {
            const getters = inject(TagGetters, {
                state: {
                    values: [
                        { id: '1', value: 'foo' },
                        { id: '2', value: 'bar' },
                        { id: '3', value: 'baz' }
                    ]
                }
            });

            const prev = getters.getNext('2');
            expect(prev).toHaveProperty('id', '3');
        });
    });
});
