import { Tag } from "../../shared/domain/tag";
import { IpcPlugin } from "../../shared/ipc/ipc";
import { Tags } from "../../shared/ipc/tags";

export const tagsPlugin: IpcPlugin<Tags> = (sendIpc) => ({
  async create(name: string): Promise<Tag> {
    // Stub
    return {
      id: "1",
      name,
      dateCreated: new Date(),
    };
  },
});
