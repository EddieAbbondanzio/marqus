import { Module } from '@/store/class-modules/decorators';
import { VuexModuleConstructor, VuexModuleDefinition } from '@/store/class-modules/vuex-module-definition';
import { moduleRegistry } from '@/store/class-modules/vuex-module-registry';

describe('@Module()', () => {
    let mockModule: VuexModuleDefinition;

    beforeEach(() => {
        mockModule = {
            namespace: 'orig',
            constructor: null!,
            actions: {},
            mutations: {}
        };
    });

    moduleRegistry.getDefinition = (ctor: VuexModuleConstructor) => {
        return mockModule;
    };

    it('sets namespace if one specified', () => {
        Module({ namespace: 'foo' })(null!);
        expect(mockModule.namespace).toBe('foo');
    });

    it('does not set namespace if none was passed', () => {
        Module()(null!);
        expect(mockModule.namespace).toBe('orig');
    });
});
