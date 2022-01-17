import { NoteFlag } from "../../shared/domain/entities";
import { NoteGroup, NoteMetadata } from "../../shared/domain/valueObjects";
import { NotImplementedError } from "../../shared/errors";
import { RpcHandler } from "../../shared/rpc";
import { tagFile } from "../fileHandlers";

const getNotes: RpcHandler<"notes.getAll"> = async (filter: {
  groupBy?: "tag" | "notebook";
  where?: { flags: NoteFlag };
}): Promise<Array<NoteMetadata | NoteGroup>> => {
  let items: Array<NoteMetadata | NoteGroup> = [];

  console.log(
    "getNotes() is currently stubbed. Need to implement loading notes..."
  );

  switch (filter.groupBy) {
    // By tag
    case "tag":
      const tags = await tagFile.load();
      for (const tag of tags) {
        const group = {
          name: tag.name,
          children: [], // Populate list of notes with that tag
        };

        items.push(group);
      }
      break;

    // By notebook
    case "notebook":
      throw new NotImplementedError();
      break;

    // Wide open
    default:
      throw new NotImplementedError();
      break;
  }

  return items;
};
