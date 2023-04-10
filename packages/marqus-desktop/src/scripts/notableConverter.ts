import matter from "gray-matter";
import { uniq } from "lodash";
import * as path from "path";
import * as fs from "fs";
import * as readline from "readline";
import { createNote, Note } from "../shared/domain/note";
import { saveNoteToFS } from "../main/ipc/plugins/notes";
import { uuid } from "../shared/domain";

// Can be ran using `npx ts-node notableConverter`

type NoteData = Pick<
  Note,
  "id" | "name" | "dateCreated" | "dateUpdated" | "content"
> & {
  parent?: string;
  children: { [noteName: string]: NoteData };
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function main() {
  const dataDirectory = await promptForInput(
    "What is the path of your data directory? ",
  );

  console.log(`Checking ${dataDirectory}`);

  const entries = await fs.promises.readdir(dataDirectory, {
    withFileTypes: true,
  });
  const markdownFiles = entries.filter(e => e.name.endsWith(".md"));

  const problematicFiles = [];
  const readyFiles = [];

  console.log(`Found ${markdownFiles.length} files to convert.`);

  // Check if any files are gonna be problematic.
  for (const markdown of markdownFiles) {
    const filePath = path.join(dataDirectory, markdown.name);
    const file = await fs.promises.readFile(filePath, {
      encoding: "utf-8",
    });

    const parsedFile = matter(file);
    const notebookTags: string[] =
      parsedFile.data?.tags?.filter((t: string) => t.startsWith("Notebooks")) ??
      [];

    if (parsedFile.data?.deleted) {
      continue;
    }
    if (parsedFile.data?.tags == null) {
      continue;
    }
    if (notebookTags.length > 1) {
      problematicFiles.push(markdown);
      continue;
    }

    readyFiles.push({ dirent: markdown, parsedFile });
  }

  // We can't support notes with multiple parents so we don't proceed unless
  // every note only has 1 tag.
  if (problematicFiles.length > 0) {
    console.error(
      "ERROR: The following files belong to multiple notebooks. Each note can only belong to one before we import them.",
    );
    console.log(problematicFiles.map(pf => pf.name));
    return;
  }

  // Attempt to rebuild the hierarchy
  const notebookTags: string[] = uniq(
    readyFiles
      .map(f => f.parsedFile.data.tags)
      .map(tagArr => tagArr[0].replace(/Notebooks/, ""))
      .filter(t => t)
      .sort((a, b) => a.localeCompare(b)),
  );

  const notes: Record<string, NoteData> = {};
  for (const notebook of notebookTags) {
    let prevParent;

    // Notebook tags start with / so we remove the first el since it'll be ''
    const split = notebook.split("/").slice(1);

    for (const n of split) {
      if (!prevParent) {
        if (!notes[n]) {
          notes[n] = {
            id: uuid(),
            name: n,
            content: "",
            dateCreated: new Date(),
            children: {},
          };
        }

        prevParent = notes[n];
      } else {
        const newParent: NoteData = {
          id: uuid(),
          name: n,
          content: "",
          dateCreated: new Date(),
          parent: prevParent.id,
          children: {},
        };

        prevParent.children[n] = newParent;
        prevParent = newParent;
      }
    }
  }

  // Map notes to parents
  for (const ready of readyFiles) {
    const { parsedFile } = ready;

    const pathStr = parsedFile.data.tags[0].split("/");
    const pathArr = pathStr.slice(1);

    const noteTitle = parsedFile.data.title as string;

    if (pathArr && pathArr.length > 0) {
      let parent;
      for (const p of pathArr) {
        if (!parent) {
          parent = notes[p];
        } else {
          parent = parent.children![p];
        }
      }

      if (!parent) {
        console.error("Known parents: ", notes);
        throw new Error(
          `No parent found for "${pathArr}". Raw path: "${pathStr}`,
        );
      }

      parent.children![noteTitle] = {
        id: uuid(),
        name: noteTitle!,
        dateCreated: parsedFile.data.created,
        dateUpdated: parsedFile.data.modified,
        content: parsedFile.content,
        parent: parent.id,
        children: {},
      };
    } else {
      if (notes[noteTitle]) {
        console.error("Known parents: ", notes);
        throw new Error(
          `Root note ${noteTitle} collides with existing parent.`,
        );
      }

      notes[noteTitle] = {
        id: uuid(),
        name: noteTitle,
        dateCreated: parsedFile.data.created,
        dateUpdated: parsedFile.data.modified,
        content: parsedFile.content,
        children: {},
      };
    }
  }

  const outputDirectory = await promptForInput("Path to save notes to: ");
  if ((await fs.promises.readdir(outputDirectory)).length > 0) {
    console.error(
      `Error: Output directory "${outputDirectory}" is not empty! Stopping.`,
    );
    return;
  }

  const notesToSave: NoteData[] = Object.values(notes);
  while (notesToSave.length > 0) {
    const currNote = notesToSave.shift()!;

    const children = Object.values(currNote.children) ?? [];
    if (children.length > 0) {
      notesToSave.push(...children);
    }

    const convertedNote = createNote({
      id: currNote.id,
      name: currNote.name,
      content: currNote.content,
      dateCreated: currNote.dateCreated,
      dateUpdated: currNote.dateUpdated,
      parent: currNote.parent,
    });

    await saveNoteToFS(outputDirectory, convertedNote);
  }
}
main().finally(() => {
  rl.close();
});

async function promptForInput(prompt: string): Promise<string> {
  return new Promise(res => {
    rl.question(prompt, ans => res(ans));
  });
}
