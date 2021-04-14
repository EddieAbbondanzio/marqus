(global as any).expectAction = function(
    action: any,
    payload: any,
    { state, rootState }: { state?: any; rootState?: any },
    expectedMutations: string[]
) {
    const commit = jest.fn();

    action({ commit, state, rootState }, payload);

    const commitedMutations = commit.mock.calls.map((c) => c[0]);

    expect(expectedMutations).toEqual(commitedMutations);
};
