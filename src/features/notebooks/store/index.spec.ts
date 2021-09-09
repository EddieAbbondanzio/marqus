import { notebooks } from "@/features/notebooks/store";

describe('notebooks', () => {
    it('sets namespaced as true', () => {
        expect(notebooks.options.namespaced).toBeTruthy();
    });
});

