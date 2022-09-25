import { ConfigV1 } from "../../../src/main/schemas/config/1_initialDefinition";
import { runSchemas } from "../../../src/main/json";
import { CONFIG_SCHEMAS } from "../../../src/main/schemas/config";
import { app } from "electron";

test("CONFIG_SCHEMAS migrate from 1 to latest", async () => {
  (app.getPath as jest.Mock).mockReturnValue("foo");

  const start: ConfigV1 = {
    version: 1,
    windowHeight: 200,
    windowWidth: 400,
    dataDirectory: "foo",
  };

  // TODO: Add better check than just if an error is thrown.
  const res = await runSchemas(CONFIG_SCHEMAS, start);
  expect(res.wasUpdated).toBe(true);
});
