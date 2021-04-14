declare function expectAction(
    action: any,
    payload: any,
    { state, rootState }: { state?: any; rootState?: any },
    expectedMutations: string[]
);
