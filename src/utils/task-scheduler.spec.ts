import { TaskScheduler } from "@/utils";

describe("TaskScheduler", () => {
  describe("ctor()", () => {
    it("throws if queue size is less than 1.", () => {
      expect(() => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const ts = new TaskScheduler(0);
      }).toThrow();
    });

    it("initializes queue", () => {
      const ts = new TaskScheduler(1);
      expect((ts as any).queue).toBeTruthy();
    });
  });

  describe("hasTasks", () => {
    it("returns false if queue is empty", () => {
      const ts = new TaskScheduler(2);
      expect(ts.hasTasks).toBeFalsy();
    });

    it("to be true if queue length is greater than 0", () => {
      const ts = new TaskScheduler(2);
      (ts as any).queue.push(null, null, null);

      expect(ts.hasTasks).toBeTruthy();
    });
  });

  describe("schedule()", () => {
    it("respects queueSize limit", () => {
      const ts = new TaskScheduler(1);
      (ts as any).queue.push(null);

      const task = jest.fn();
      ts.schedule(task);
      expect((ts as any).queue).toHaveLength(1);
    });

    it("starts task if no active task", () => {
      const ts = new TaskScheduler(3);
      const task = jest.fn();

      ts.schedule(task);
      expect(task).toHaveBeenCalled();
    });

    it("doesn't start task if active task is already running", () => {
      const ts = new TaskScheduler(3);
      const slowTask = async () => await timeout(1000);

      ts.schedule(slowTask);

      const secondTask = jest.fn();

      ts.schedule(secondTask);
      expect(secondTask).not.toHaveBeenCalled();
    });

    it("sets hasActiveTask when running a task", async () => {
      const ts = new TaskScheduler(3);
      const slowTask = async () => await timeout(500);

      ts.schedule(slowTask);
      expect(ts.hasActiveTask).toBeTruthy();
      await timeout(750);
      expect(ts.hasActiveTask).toBeFalsy();
    });

    it("calls next task if queue isn't empty", async () => {
      const ts = new TaskScheduler(3);
      const task1 = async () => await timeout(500);
      const task2 = jest.fn();

      ts.schedule(task1);
      ts.schedule(task2);

      await timeout(750);

      expect(task2).toHaveBeenCalled();
    });
  });
});

function timeout(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
