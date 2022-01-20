import React from "react";
import { createContext, PropsWithChildren, useState } from "react";

export type Publish = (message: string) => void;
export type Subscriber = (message: string) => void;
export interface PubSub {
  publish(message: string): void;
  subscribe(message: string, cb: Subscriber): void;
  unsubscribe(message: string, cb: Subscriber): void;
}

export const PubSubContext = createContext<PubSub>({} as any);

export function PubSub({ children }: PropsWithChildren<{}>) {
  const [state, setState] = useState<Record<string, Subscriber[]>>({});

  const subscribe = (msg: string, sub: Subscriber) => {
    console.log("Add a sub: ");
    if (state[msg] == null) {
      setState((prev) => {
        const next = {
          ...prev,
          [msg]: [sub],
        };

        console.log(next);
        return next;
      });
    } else {
      setState((prev) => ({
        ...prev,
        [msg]: [...prev[msg], sub],
      }));
    }
  };

  const unsubscribe = (msg: string, sub: Subscriber) => {
    if (state[msg] == null) {
      return;
    }

    const index = state[msg].findIndex((s) => s === sub);
    if (index === -1) {
      return;
    }

    setState((prev) => ({
      ...prev,
      [msg]: [...prev[msg].filter((s) => s !== sub)],
    }));
  };

  const publish = (msg: string) => {
    const subs = state[msg];
    if (subs == null || subs.length == 0) {
      console.warn(`PubSub: No subs for ${msg}`);
      return;
    }

    subs.forEach((s) => s(msg));
  };

  return (
    <PubSubContext.Provider value={{ subscribe, unsubscribe, publish }}>
      {children}
    </PubSubContext.Provider>
  );
}
