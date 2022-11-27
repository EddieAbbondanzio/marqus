// Monaco doesn't play nice with jest so we mock it. Otherwise jest will throw
// an error saying it can't find module "monaco-editor".
// https://github.com/react-monaco-editor/react-monaco-editor/issues/176#issuecomment-737173085

export const editor = {
  create: jest.fn(),
  createModel: jest.fn(),
};
