/* eslint-disable @typescript-eslint/no-empty-function */
import { MouseObjectPublisher } from ".";
import { getButton, MouseObject, MouseObjectSubscriber } from "./mouse-object";

describe("getButton", () => {
  it("returns left for 0", () => {
    expect(getButton(0)).toBe("left");
  });

  it("returns right for 2", () => {
    expect(getButton(2)).toBe("right");
  });

  it("defaults to either", () => {
    expect(getButton(13)).toBe("either");
  });
});

describe("MouseObject", () => {
  const mouseObjectManager = new MouseObjectPublisher();

  describe("subscriberCount", () => {
    it("returns length of subscribers", () => {
      const el = document.createElement("div");

      const obj = new MouseObject(el, false, mouseObjectManager);
      obj.subscribers.push(null!);
      obj.subscribers.push(null!);

      expect(obj.subscriberCount).toBe(2);
    });
  });

  describe("dispose()", () => {
    it("removes event listener", () => {
      const el = ({
        addEventListener: jest.fn(),
        removeEventListener: jest.fn()
      } as any) as HTMLElement;

      const obj = new MouseObject(el, false, mouseObjectManager);
      obj.dispose();

      expect(el.removeEventListener).toHaveBeenCalled();
    });
  });

  describe("notify()", () => {
    it("triggers callbatch of matches", () => {
      const el = document.createElement("div");
      const obj = new MouseObject(el, false, mouseObjectManager);
      const sub = new MouseObjectSubscriber("click", "left", jest.fn());

      obj.subscribers.push(sub);
      obj.notify("click", "left", null!);

      expect(sub.callback).toHaveBeenCalled();
    });

    it("skips subscribers that don' match", () => {
      const el = document.createElement("div");
      const obj = new MouseObject(el, false, mouseObjectManager);
      const sub = new MouseObjectSubscriber("click", "right", jest.fn());

      obj.subscribers.push(sub);
      obj.notify("click", "left", null!);

      expect(sub.callback).not.toHaveBeenCalled();
    });
  });

  describe("subscribe()", () => {
    it("adds subscriber", () => {
      const el = document.createElement("div");
      const obj = new MouseObject(el, false, mouseObjectManager);

      const cb = jest.fn();

      obj.subscribe("click", "left", cb);

      expect(obj.subscriberCount).toBe(1);
    });

    it("throws if duplicate found", () => {
      const el = document.createElement("div");
      const obj = new MouseObject(el, false, mouseObjectManager);

      const cb = jest.fn();

      obj.subscribe("click", "left", cb);

      expect(() => {
        obj.subscribe("click", "left", cb);
      }).toThrow();
    });
  });

  describe("unsubscribe()", () => {
    it("removes subscriber that matches", () => {
      const el = document.createElement("div");
      const obj = new MouseObject(el, false, mouseObjectManager);

      const cb = jest.fn();
      const cb2 = jest.fn();

      obj.subscribe("click", "left", cb);
      obj.subscribe("click", "right", cb2);

      obj.unsubscribe("click", "left", cb);

      expect(obj.subscriberCount).toBe(1);
    });
  });

  describe("onMouseDown()", () => {
    it("doesn't set active if no subscribers have button pressed", () => {
      const el = document.createElement("a");
      const manager = {} as any;
      const obj = new MouseObject(el, false, manager);

      obj.onMouseDown({ button: 0 } as MouseEvent);
      expect(manager.active).toBeFalsy();
    });

    it("sets active if any subscribers have the button that was pressed", () => {
      const el = document.createElement("a");
      const manager = {} as any;
      const obj = new MouseObject(el, false, manager);
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      obj.subscribe("click", "left", () => {});

      obj.onMouseDown(({
        button: 0,
        stopImmediatePropagation: jest.fn()
      } as any) as MouseEvent);
      expect(manager.active).toBe(obj);
    });
  });
});

describe("MouseObjectSubscriber", () => {
  describe("isMatch()", () => {
    it("returns true if action and button match", () => {
      const sub = new MouseObjectSubscriber("click", "left", () => {});
      expect(sub.isMatch("click", "left")).toBeTruthy();
    });

    it("returns true if action match and button is either", () => {
      const sub = new MouseObjectSubscriber("click", "either", () => {});
      expect(sub.isMatch("click", "left")).toBeTruthy();
    });

    it("returns false if buttons don't match", () => {
      const sub = new MouseObjectSubscriber("click", "right", () => {});
      expect(sub.isMatch("click", "left")).toBeFalsy();
    });

    it("returns false if actions don't match", () => {
      const sub = new MouseObjectSubscriber("click", "right", () => {});
      expect(sub.isMatch("hold", "left")).toBeFalsy();
    });
  });
});
