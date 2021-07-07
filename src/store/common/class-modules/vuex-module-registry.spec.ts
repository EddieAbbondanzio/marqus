import { VuexModule } from '@/store/common/class-modules/vuex-module';
import { VuexModuleDefinition } from '@/store/common/class-modules/vuex-module-definition';
import { VuexModuleRegistry } from '@/store/common/class-modules/vuex-module-registry';
import { Store } from 'vuex';

describe('VuexModuleRegistry', () => {
    describe('ctor()', () => {
        it('instantiates the map', () => {
            const registry = new VuexModuleRegistry();
            expect(registry['_definitions']).toBeInstanceOf(Map);
        });
    });

    describe('getDefinition()', () => {
        it('creates new definition if none found', () => {
            const registry = new VuexModuleRegistry();
            const def = registry.getDefinition(TestModule);

            expect(def).toBeInstanceOf(VuexModuleDefinition);
            expect(registry['_definitions'].get(TestModule)).not.toBeNull();
        });

        it('returns existing one, if found', () => {
            const registry = new VuexModuleRegistry();
            const def1 = registry.getDefinition(TestModule);
            const def2 = registry.getDefinition(TestModule);

            expect(def1).toBe(def2);
        });

        class TestModule extends VuexModule {
            constructor(store: Store<any>) {
                super(store);
            }
        }
    });
});
