export interface Config {
  version: number;
  windowHeight: number;
  windowWidth: number;
  logDirectory: string;
  dataDirectory?: string;
  developerMode?: boolean;
  autoHideAppMenu?: boolean;
}
