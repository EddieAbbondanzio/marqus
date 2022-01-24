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
  const [state, setState] = useState<Record<string, Subscriber>>({});

  const subscribe = (msg: string, sub: Subscriber) => {
    if (state[msg] == null) {
      setState((prev) => {
        const next = {
          ...prev,
          [msg]: sub,
        };
        return next;
      });
    } else {
      setState((prev) => ({
        ...prev,
        [msg]: sub,
      }));
    }
  };

  const unsubscribe = (msg: string, sub: Subscriber) => {
    if (state[msg] == null) {
      return;
    }

    setState((prev) => {
      const newState = { ...prev };
      delete newState[msg];
      return newState;
    });
  };

  const publish = (msg: string) => {
    const sub = state[msg];
    if (sub == null) {
      console.warn(`PubSub: No subs for ${msg}`, state);
      return;
    }

    sub(msg);
  };

  return (
    <PubSubContext.Provider value={{ subscribe, unsubscribe, publish }}>
      {children}
    </PubSubContext.Provider>
  );
}
