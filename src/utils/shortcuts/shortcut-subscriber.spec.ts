import { ShortcutSubscriber } from "@/utils/shortcuts/shortcut-subscriber";

describe("ShortcutSubscriber", () => {
  describe("notify()", () => {
    it("notifies when no conditional", () => {
      const callback = jest.fn();
      const sub = new ShortcutSubscriber("testName", callback);

      sub.notify();
      expect(callback).toHaveBeenCalled();
    });
    it("checks when before notifying", () => {
      const callback = jest.fn();
      let when = false;
      const sub = new ShortcutSubscriber(
        "testName",
        callback,
        undefined,
        () => when
      );

      sub.notify();
      expect(callback).not.toHaveBeenCalled();

      when = true;
      sub.notify();
      expect(callback).toHaveBeenCalled();
    });
  });
});
