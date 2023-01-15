import { JsonFile } from "../../src/main/json";

export function createJsonFile<T>(content: T): JsonFile<T> {
  return {
    content,
    update: jest.fn(),
  };
}
