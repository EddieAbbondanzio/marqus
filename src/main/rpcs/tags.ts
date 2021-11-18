// import { debounce } from "lodash";
// import { fileExists, readFile, writeFile } from "../fileSystem";
// import { onReady } from "../events";
// import * as yup from "yup";
// import { RpcHandler, RpcRegistry } from "../../shared/rpc";

// const save = debounce(async (tags: Tag[]) => {
//   await writeFile(FileName.TAGS, tags, "json");
// }, 1000);

// let tags: Tag[] = [];

// /*
//  * Load tags from file on startup
//  */
// onReady(async () => {
//   if (!fileExists(FileName.TAGS)) {
//     return;
//   }

//   const raw = await readFile(FileName.TAGS, "json");

//   await TAG_FILE_SCHEMA.validate(raw);
//   tags = raw as Tag[];
// });

// const getAllTags = async (): Promise<Tag[]> => tags;

// const createTag = async ({ name }: { name: string }): Promise<Tag> => {
//   if (tags.some((t) => t.name === name)) {
//     throw Error(`Tag name ${name} already in use`);
//   }

//   const tag: Tag = {
//     id: generateId(),
//     name,
//     dateCreated: new Date(),
//   };

//   tags.push(tag);
//   await save(tags);

//   return tag;
// };

// const updateTag = async ({
//   id,
//   name,
// }: {
//   id: string;
//   newName: string;
// }): Promise<Tag> => {
//   if (tags.some((t) => t.name === name && t.id !== id)) {
//     throw Error(`Tag name ${name} already in use`);
//   }

//   const tag = tags.find((t) => t.id === id);

//   if (tag == null) {
//     throw Error(`No tag with id ${id} found`);
//   }

//   tag.name = name;
//   tag.dateUpdated = new Date();

//   await save(tags);

//   return tag;
// };

// const deleteTag = async (id: string): Promise<void> => {
//   const index = tags.findIndex((t) => t.id === id);

//   if (index !== -1) {
//     tags.splice(index, 1);
//   }

//   await save(tags);
// };

// export const tagHandlers: RpcRegistry = {
//   "tags.getAll": getAllTags,
//   "tags.create": createTag,
//   "tags.update": updateTag,
//   "tags.delete": deleteTag,
// };
