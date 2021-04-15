(global as any).expectAction = async function(
    action: any,
    payload: any,
    { state, rootState }: { state?: any; rootState?: any },
    expectedMutations: string[]
) {
    const commit = jest.fn();
    await action({ commit, state, rootState }, payload);

    const commitedMutations = commit.mock.calls.map((c) => c[0]);
    expect(commitedMutations).toEqual(expectedMutations);
};
