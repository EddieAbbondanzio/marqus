/* eslint-disable @typescript-eslint/no-empty-function */
import { mediator } from "@/store/plugins/mediator/mediator";

describe("mediator plugin", () => {
  beforeEach(() => {
    mediator.subscribers = {};
  });

  describe("subscribe()", () => {
    it("creates new array if none yet", () => {
      mediator.subscribe("test", () => {});
      expect(mediator.subscribers.test).toBeInstanceOf(Array);
    });

    it("throws if duplicate", () => {
      const dupe = () => {};

      mediator.subscribe("test", dupe);

      expect(() => {
        mediator.subscribe("test", dupe);
      }).toThrow();
    });

    it("adds new subscriber to end of array", () => {
      mediator.subscribe("test", () => {});
      mediator.subscribe("test", () => {});

      expect(mediator.subscribers.test).toHaveLength(2);
    });
  });

  describe("notify()", () => {
    it("notifies matching subscribers", () => {
      const notCalled = jest.fn();
      mediator.subscribe("foo", notCalled);

      const called = jest.fn();
      mediator.subscribe("bar", called);

      mediator.notify({ type: "bar", payload: null! });
      expect(notCalled).not.toHaveBeenCalled();
      expect(called).toHaveBeenCalled();
    });
  });
});
