export interface Config {
  version: number;
  windowHeight: number;
  windowWidth: number;
  dataDirectory?: string;
  logDirectory: string;
  developerMode?: boolean;
  autoHideAppMenu?: boolean;
}
