import { getImgSrcCsp } from "../../src/main";
import { Protocol } from "../../src/shared/domain/protocols";

test("getImgSrcCsp", () => {
  const srcs = getImgSrcCsp().split(" ");
  expect(srcs[0]).toBe("*");
  expect(srcs[1]).toBe(`${Protocol.Attachments}://*`);
});
