export interface Logger {
  info(message: string): Promise<void>;
  warn(message: string): Promise<void>;
  error(message: string, err?: Error): Promise<void>;
  debug(message: string): Promise<void>;
}
