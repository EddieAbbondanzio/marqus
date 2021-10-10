import { contexts } from "@/directives/context";
import { Command } from "../types";

export class Focus extends Command<void> {
  async execute(): Promise<void> {
    contexts.focus({ name: "globalNavigation" });
  }
}
