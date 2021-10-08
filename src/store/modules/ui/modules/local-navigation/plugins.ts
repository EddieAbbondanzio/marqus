import { undo } from "@/store/plugins/undo";

undo.registerContext({
  name: "localNavigation",
  namespace: "ui/localNavigation",
  stateCacheInterval: 100
});
