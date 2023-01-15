export interface Config {
  version: number;
  windowHeight: number;
  windowWidth: number;
  logDirectory: string;
  noteDirectory?: string;
  developerMode?: boolean;
  autoHideAppMenu?: boolean;
}
