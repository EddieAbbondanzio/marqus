import { State } from "../../../shared/state";

export interface ExecutionContext {
  setState: (state: State) => void;
  getState: () => State;
}

export type Command<Input = void> = (
  context: ExecutionContext,
  // Payload is optional to support running as a shortcut
  payload?: Input
) => Promise<void>;

export interface CommandSchema {
  "app.openDevTools": Command;
  "app.reload": Command;
  "app.toggleFullScreen": Command;
}
export type CommandType = keyof CommandSchema;

export type CommandRegistry = Partial<{
  [key in CommandType]: Command<key>;
}>;
