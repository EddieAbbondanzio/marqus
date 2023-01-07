// We don't need to test remark specific stuff so it's easier to just mock
// it out.

export const useRemark = jest.fn(() => ["", jest.fn()]);
