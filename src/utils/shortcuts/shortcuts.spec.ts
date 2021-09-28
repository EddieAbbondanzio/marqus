import { KeyCode } from "@/utils/shortcuts/key-code";
import { Shortcut } from "@/utils/shortcuts/shortcut";
import { shortcuts, _onKeyDown, _onKeyUp } from "@/utils/shortcuts/shortcuts";

describe("_onKeyDown", () => {
  beforeEach(() => {
    shortcuts.reset();
  });

  it("prevents default for arrow keys", () => {
    const preventDefault = jest.fn();

    _onKeyDown({ code: "ArrowUp", preventDefault } as any);
    _onKeyDown({ code: "ArrowDown", preventDefault } as any);
    _onKeyDown({ code: "ArrowLeft", preventDefault } as any);
    _onKeyDown({ code: "ArrowRight", preventDefault } as any);

    expect(preventDefault).toHaveBeenCalledTimes(4);
  });

  it("only notifies matching shortcut subscribers", () => {
    shortcuts.register(new Shortcut("test", [KeyCode.Control, KeyCode.Space]));
    shortcuts.register(new Shortcut("test2", [KeyCode.Space]));

    const controlSpace = jest.fn();
    const space = jest.fn();

    shortcuts.subscribe("test", controlSpace);
    shortcuts.subscribe("test2", space);

    _onKeyDown({ code: "ControlLeft", preventDefault: jest.fn() } as any);
    _onKeyDown({ code: "Space", preventDefault: jest.fn() } as any);

    expect(controlSpace).toHaveBeenCalled();
    expect(space).not.toHaveBeenCalled();
  });

  it("notifies every subscriber of a shortcut", () => {
    shortcuts.register(new Shortcut("test", [KeyCode.Control, KeyCode.Space]));

    const sub1 = jest.fn();
    const sub2 = jest.fn();

    shortcuts.subscribe("test", sub1);
    shortcuts.subscribe("test", sub2);

    _onKeyDown({ code: "ControlLeft", preventDefault: jest.fn() } as any);
    _onKeyDown({ code: "Space", preventDefault: jest.fn() } as any);

    expect(sub1).toHaveBeenCalled();
    expect(sub2).toHaveBeenCalled();
  });

  it("accounts for keys being released", () => {
    shortcuts.register(new Shortcut("test", [KeyCode.Control, KeyCode.Space]));

    const sub1 = jest.fn();

    shortcuts.subscribe("test", sub1);

    _onKeyDown({ code: "ControlLeft", preventDefault: jest.fn() } as any);
    _onKeyUp({ code: "ControlLeft", preventDefault: jest.fn() } as any);
    _onKeyDown({ code: "Space", preventDefault: jest.fn() } as any);

    expect(sub1).not.toHaveBeenCalled();
  });
});
