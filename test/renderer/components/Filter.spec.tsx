// test.each([
//   [undefined, true],
//   [false, true],
//   [true, false],
// ])("sidebar.toggleFilter works for each case", (input, output) => {
//   initialState.ui.sidebar.filter.expanded = input;
//   const { result } = renderHook(() => useCommands(initialState));
//   act(() => {
//     const [, execute] = result.current;
//     execute("sidebar.toggleFilter");
//   });

//   const [state] = result.current;
//   expect(state.ui.sidebar.filter.expanded).toBe(output);
// });
