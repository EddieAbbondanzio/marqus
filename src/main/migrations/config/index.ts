import { Config } from "../../../shared/domain/config";
import { JsonMigration } from "../../json";
import { ConfigInitialDefinition } from "./1_initialDefinition";

export const CONFIG_MIGRATIONS: JsonMigration<unknown, Config>[] = [
  new ConfigInitialDefinition(),
];
