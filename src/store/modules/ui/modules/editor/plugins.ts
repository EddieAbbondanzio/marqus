import { undo } from "@/store/plugins/undo";

undo.registerContext({
  name: "editor",
  namespace: "ui/editor",
  setStateAction: "setState",
  stateCacheInterval: 1000
});
