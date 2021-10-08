import { undo } from "@/store/plugins/undo";

undo.registerContext({
  name: "commandConsole",
  namespace: "ui/commandConsole",
  stateCacheInterval: 1000
});
