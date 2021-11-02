import { Tag } from "../../shared/domain/tag";
import { IpcPlugin } from "../../shared/ipc/ipc";
import { Tags } from "../../shared/ipc/tags";

export const tagsPlugin: IpcPlugin<Tags> = (sendIpc) => ({
  async getAll(): Promise<Tag[]> {
    const tags = await sendIpc("tags.getAll");
    return tags;
  },
  async create(name: string): Promise<Tag> {
    const tag = await sendIpc("tags.create", { name });
    return tag;
  },
  async update(id: string, newName: string): Promise<Tag> {
    const tag = await sendIpc("tags.update", { id, name: newName });
    return tag;
  },
  async delete(id: string): Promise<void> {
    await sendIpc("tags.delete", { id });
  },
});
