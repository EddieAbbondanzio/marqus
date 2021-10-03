/* eslint-disable @typescript-eslint/no-empty-function */
import { DirectiveBinding } from "vue";
import {
  mouse,
  mouseObjectPublisher,
  getDirectiveAction,
  getDirectiveCallback,
  getDirectiveButton
} from "./mouse";

describe("v-mouse", () => {
  describe("beforeMount()", () => {
    it("creates MouseObject for element", () => {
      const el = document.createElement("a");
      const binding = ({
        arg: "click",
        value: () => {},
        modifiers: { left: true }
      } as any) as DirectiveBinding;

      mouse.beforeMount(el, binding);
      expect(mouseObjectPublisher.objects).toHaveLength(1);
    });
  });
});

describe("getAction()", () => {
  it("accepts click", () => {
    expect(getDirectiveAction("click")).toBe("click");
  });

  it("accepts hold", () => {
    expect(getDirectiveAction("hold")).toBe("hold");
  });

  it("accepts release", () => {
    expect(getDirectiveAction("release")).toBe("release");
  });

  it("accepts drag", () => {
    expect(getDirectiveAction("drag")).toBe("drag");
  });

  it("throws on all else", () => {
    expect(() => getDirectiveAction("foo")).toThrow();
  });
});

describe("getButton()", () => {
  it("returns left", () => {
    expect(getDirectiveButton({ left: true })).toBe("left");
  });

  it("returns right", () => {
    expect(getDirectiveButton({ right: true })).toBe("right");
  });

  it("defaults to either", () => {
    expect(getDirectiveButton({})).toBe("either");
  });
});

describe("getCallback()", () => {
  it("throws error if value is not a function", () => {
    expect(() => {
      getDirectiveCallback(1);
    }).toThrow();
  });

  it("accepts functions", () => {
    expect(getDirectiveCallback(() => {})).toBeTruthy();
  });
});

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

describe("MouseObjectManager", () => {
  const mockCommit = jest.fn();
  store.commit = mockCommit;

  beforeEach(() => {
    mockCommit.mockReset();
  });

  describe("ctor()", () => {
    it("adds event listener on mouse up", () => {
      const mockAddEventListener = jest.fn();
      window.addEventListener = mockAddEventListener;

      const m = new MouseObjectPublisher();

      expect(mockAddEventListener).toHaveBeenCalledTimes(3);
      expect(mockAddEventListener.mock.calls[0][0]).toBe("click");
      expect(mockAddEventListener.mock.calls[0][1]).toBe(m.onClickListener);
      expect(mockAddEventListener.mock.calls[1][0]).toBe("mousemove");
      expect(mockAddEventListener.mock.calls[1][1]).toBe(m.onMouseMoveListener);
      expect(mockAddEventListener.mock.calls[2][0]).toBe("keyup");
      expect(mockAddEventListener.mock.calls[2][1]).toBe(m.onKeyUpListener);
    });
  });

  describe("dispose()", () => {
    it("releases event listeners", () => {
      const mockAddEventListener = jest.fn();
      const mockRemoveEventListener = jest.fn();
      window.addEventListener = mockAddEventListener;
      window.removeEventListener = mockRemoveEventListener;

      const m = new MouseObjectPublisher();
      m.dispose();

      expect(mockRemoveEventListener).toHaveBeenCalledTimes(3);
      expect(mockRemoveEventListener.mock.calls[0][0]).toBe("click");
      expect(mockRemoveEventListener.mock.calls[0][1]).toBe(m.onClickListener);
      expect(mockRemoveEventListener.mock.calls[1][0]).toBe("mousemove");
      expect(mockRemoveEventListener.mock.calls[1][1]).toBe(
        m.onMouseMoveListener
      );
      expect(mockRemoveEventListener.mock.calls[2][0]).toBe("keyup");
      expect(mockRemoveEventListener.mock.calls[2][1]).toBe(m.onKeyUpListener);
    });
  });

  describe("add()", () => {
    it("adds object to array", () => {
      const m = new MouseObjectPublisher();
      m.add(null!);

      expect(m.objects).toHaveLength(1);
    });
  });

  describe("get()", () => {
    it("returns mouse object by matching html element", () => {
      const m = new MouseObjectPublisher();
      const el = document.createElement("div");
      const obj = new MouseObject(el, false, m);
      m.add(obj);

      const found = m.get(el);
      expect(found).toBe(obj);
    });

    it("returns null if no match", () => {
      const m = new MouseObjectPublisher();
      const el = document.createElement("div");

      const found = m.get(el);
      expect(found).toBeFalsy();
    });
  });

  describe("remove()", () => {
    it("removes object from array", () => {
      const m = new MouseObjectPublisher();
      const el = document.createElement("div");
      const obj = new MouseObject(el, false, m);
      m.add(obj);

      const obj2 = new MouseObject(document.createElement("a"), false, m);
      m.add(obj2);

      m.remove(obj);

      expect(m.objects).toHaveLength(1);
    });

    it("calls dispose of object to prevent memory leak", () => {
      const m = new MouseObjectPublisher();
      const el = document.createElement("div");
      const obj = new MouseObject(el, false, m);
      obj.dispose = jest.fn();

      m.add(obj);
      m.remove(obj);

      expect(obj.dispose).toHaveBeenCalled();
    });
  });

  describe("onKeyUp()", () => {
    it("does nothing if active is null", () => {
      const m = new MouseObjectPublisher();

      m.onKeyUp({ key: "Escape" } as any);
      expect(m.cancelled).toBeFalsy();
    });

    it("does nothing if not holding", () => {
      const m = new MouseObjectPublisher();
      const el = document.createElement("div");

      const obj = new MouseObject(el, false, m);

      m.active = obj;

      m.onKeyUp({ key: "Escape" } as any);
      expect(m.cancelled).toBeFalsy();
    });

    it("sets cancelled as true when escape is pressed", () => {
      const m = new MouseObjectPublisher();
      const el = document.createElement("div");

      const obj = new MouseObject(el, false, m);
      obj.holding = true;

      m.active = obj;

      m.onKeyUp({ key: "Escape" } as any);
      expect(m.cancelled).toBeTruthy();
    });

    it("notifies active of dragcancel event", () => {
      const m = new MouseObjectPublisher();
      const el = document.createElement("div");

      const obj = new MouseObject(el, false, m);
      obj.holding = true;

      const mockNotify = jest.fn();

      obj.notify = mockNotify;

      m.active = obj;

      m.onKeyUp({ key: "Escape" } as any);
      expect(mockNotify).toHaveBeenCalled();
      expect(mockNotify.mock.calls[0][0]).toBe("dragcancel");
    });

    it("resets cursor icon", () => {
      const m = new MouseObjectPublisher();
      const el = document.createElement("div");

      const obj = new MouseObject(el, false, m);
      obj.holding = true;

      const mockNotify = jest.fn();

      obj.notify = mockNotify;

      m.active = obj;

      m.onKeyUp({ key: "Escape" } as any);

      expect(mockCommit).toHaveBeenCalled();
      expect(mockCommit.mock.calls[0][0]).toBe("ui/RESET_CURSOR_ICON");
    });
  });

  describe("onMouseMove()", () => {
    it("checks to see if active object exists first", () => {
      const m = new MouseObjectPublisher();
      const mockEvent = {
        stopImmediatePropagation: jest.fn()
      } as any;

      m.onMouseMove(mockEvent);

      // We use this as a way to see if we made it passed the null check.
      expect(mockEvent.stopImmediatePropagation).not.toHaveBeenCalled();
    });

    it("stops propagation", () => {
      const manager = new MouseObjectPublisher();
      const mockEvent = {
        stopImmediatePropagation: jest.fn()
      } as any;

      // Set active as a quick hack
      const obj = new MouseObject(document.createElement("a"), false, manager);
      manager.active = obj;

      manager.onMouseMove(mockEvent);

      // We use this as a way to see if we made it passed the null check.
      expect(mockEvent.stopImmediatePropagation).toHaveBeenCalled();
    });

    it("stops if mouseDown is false", () => {
      const manager = new MouseObjectPublisher();
      const mockEvent = {
        stopImmediatePropagation: jest.fn()
      } as any;

      const obj = new MouseObject(document.createElement("a"), false, manager);
      obj.notify = jest.fn();

      manager.active = obj;

      manager.onMouseMove(mockEvent);

      expect(obj.notify).not.toHaveBeenCalled();
    });

    it("sets holding to true if not already, and notifies hold + drag", () => {
      const manager = new MouseObjectPublisher();
      const mockEvent = {
        stopImmediatePropagation: jest.fn()
      } as any;

      const obj = new MouseObject(document.createElement("a"), false, manager);
      const mockNotify = jest.fn();
      obj.notify = mockNotify;
      obj.mouseDown = true;

      manager.active = obj;

      manager.onMouseMove(mockEvent);

      expect(obj.holding).toBeTruthy();
      expect(mockNotify).toHaveBeenCalledTimes(2);
      expect(mockNotify.mock.calls[0][0]).toBe("hold");
      expect(mockNotify.mock.calls[1][0]).toBe("drag");
    });

    it("notifies drag subscribers, but not hold if already holding", () => {
      const manager = new MouseObjectPublisher();
      const mockEvent = {
        stopImmediatePropagation: jest.fn()
      } as any;

      const obj = new MouseObject(document.createElement("a"), false, manager);
      const mockNotify = jest.fn();
      obj.notify = mockNotify;
      obj.mouseDown = true;
      obj.holding = true;

      manager.active = obj;

      manager.onMouseMove(mockEvent);

      expect(obj.holding).toBeTruthy();
      expect(mockNotify).toHaveBeenCalledTimes(1);
      expect(mockNotify.mock.calls[0][0]).toBe("drag");
    });
  });

  describe("onMouseUp()", () => {
    it("checks to see if active object exists first", () => {
      const m = new MouseObjectPublisher();
      const mockEvent = {
        stopImmediatePropagation: jest.fn()
      } as any;

      m.onMouseUp(mockEvent);

      // We use this as a way to see if we made it passed the null check.
      expect(mockEvent.stopImmediatePropagation).not.toHaveBeenCalled();
    });

    it("stops propagation", () => {
      const m = new MouseObjectPublisher();
      const mockEvent = {
        stopImmediatePropagation: jest.fn()
      } as any;

      // Set active as a quick hack
      const obj = new MouseObject(document.createElement("a"), false, m);
      m.active = obj;

      m.onMouseUp(mockEvent);

      expect(mockEvent.stopImmediatePropagation).toHaveBeenCalled();
    });

    it("notifies click subscribers if not holding", () => {
      const m = new MouseObjectPublisher();
      const mockEvent = {
        stopImmediatePropagation: jest.fn()
      } as any;

      // Set active as a quick hack
      const obj = new MouseObject(document.createElement("a"), false, m);
      const mockNotify = jest.fn();
      obj.notify = mockNotify;

      m.active = obj;

      m.onMouseUp(mockEvent);

      expect(mockNotify).toHaveBeenCalledTimes(1);
      expect(mockNotify.mock.calls[0][0]).toBe("click");
    });

    it("notifies release subscribers if holding", () => {
      const m = new MouseObjectPublisher();
      const mockEvent = {
        stopImmediatePropagation: jest.fn()
      } as any;

      // Set active as a quick hack
      const obj = new MouseObject(document.createElement("a"), false, m);
      const mockNotify = jest.fn();
      obj.notify = mockNotify;
      obj.holding = true;

      m.active = obj;

      m.onMouseUp(mockEvent);

      expect(mockNotify).toHaveBeenCalledTimes(1);
      expect(mockNotify.mock.calls[0][0]).toBe("release");
    });

    it("resets holding, mouseDown, and active", () => {
      const m = new MouseObjectPublisher();
      const mockEvent = {
        stopImmediatePropagation: jest.fn()
      } as any;

      // Set active as a quick hack
      const obj = new MouseObject(document.createElement("a"), false, m);
      obj.holding = true;

      m.active = obj;

      m.onMouseUp(mockEvent);

      expect(obj.holding).toBeFalsy();
      expect(obj.mouseDown).toBeFalsy();
      expect(obj.activeButton).toBeUndefined();
      expect(m.active).toBeFalsy();
      expect(m.cancelled).toBeFalsy();
    });

    it("does not notify release event subscribers if cancelled", () => {
      const m = new MouseObjectPublisher();
      const mockEvent = {
        stopImmediatePropagation: jest.fn()
      } as any;

      // Set active as a quick hack
      const obj = new MouseObject(document.createElement("a"), false, m);
      const mockNotify = jest.fn();
      obj.notify = mockNotify;
      obj.holding = true;

      m.active = obj;

      m.cancelled = true;

      m.onMouseUp(mockEvent);

      expect(mockNotify).not.toHaveBeenCalledTimes(1);
    });
  });
});
