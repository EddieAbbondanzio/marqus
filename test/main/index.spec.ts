import { setCspHeader } from "../../src/main";

test("setCspHeader", () => {
  const callback = jest.fn();
  setCspHeader({} as any, callback);
  expect(callback).toHaveBeenCalledWith({
    responseHeaders: {
      "Content-Security-Policy": [`img-src * attachment://*`],
    },
  });
});
