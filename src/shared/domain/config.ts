export interface Config {
  dataDirectory?: string;
  windowHeight: number;
  windowWidth: number;
}

export interface ConfigWithDataDirectory extends Config {
  dataDirectory: string;
}

export const DEFAULT_CONFIG: Config = {
  windowHeight: 600,
  windowWidth: 800,
};
