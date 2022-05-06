# Unit Testing

Use React Testing Library (@testing-library/react)
https://testing-library.com/docs/react-testing-library/intro/
https://reactjs.org/docs/test-utils.html

React Testing Library is a higher level helper that wraps some of test-utils functionalities and adds some new ones. Ideally we'll work with React Testing Library unless something warrants working with test-utils directly.

`render()` and `renderHook()` should be more than enough to test components plus utils.

\*\*We need both @testing-library/react and @testing-library/react-hooks because we use React 17. These libraries merged in React 18+ but Electron Forge doesn't support React 18 yet.

React Testing Library 12.1.5 docs: https://github.com/testing-library/react-testing-library/tree/0c4aabe0da1587754229f7614a2ddfdaddd0b1aa#hooks
