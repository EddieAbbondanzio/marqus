export interface LoadConfig {
  name: string;
}

export interface SaveConfig {
  name: string;
  content: any;
}

export interface Config {
  load(params: LoadConfig): Promise<any>;
  save(params: SaveConfig): Promise<any>;
}
