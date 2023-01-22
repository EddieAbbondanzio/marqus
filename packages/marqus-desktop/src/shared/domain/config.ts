export interface Config {
  version: number;
  windowHeight: number;
  windowWidth: number;
  logDirectory: string;
  noteDirectory?: string;
  developerMode?: boolean;
  autoHideAppMenu?: boolean;
  // Default is 4 (comes from Monaco)
  tabSize?: number;
}
