import { MissingDataDirectoryError } from "../errors";
import * as path from "path";

// Config isn't sent across IPC so it's safe to be a class.

export class Config {
  constructor(
    public windowHeight: number,
    public windowWidth: number,
    public dataDirectory?: string
  ) {}

  getPath(...parts: string[]): string {
    if (this.dataDirectory == null) {
      throw new MissingDataDirectoryError();
    }

    return path.join(this.dataDirectory, ...parts);
  }
}
