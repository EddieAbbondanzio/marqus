import { splitMutationAndNamespace, getNamespacedState } from "./vuex";

describe("splitMutationAndNamespace()", () => {
  it("handles root mutation", () => {
    const [n, m] = splitMutationAndNamespace("APPLY");
    expect(n).toBe("");
    expect(m).toBe("APPLY");
  });

  it("handles namespaced mutation", () => {
    const [n, m] = splitMutationAndNamespace("namespace/APPLY");

    expect(n).toBe("namespace");
    expect(m).toBe("APPLY");
  });

  it("handles nested namespace mutation", () => {
    const [n, m] = splitMutationAndNamespace("namespace/nested/APPLY");
    expect(n).toBe("namespace/nested");
    expect(m).toBe("APPLY");
  });
});

describe("getNamespacedState()", () => {
  it("returns state for root namepsace", () => {
    const namespace = "namespaceFoo";
    const store = {
      state: {
        namespaceFoo: {
          baz: 1
        }
      }
    };

    const state = getNamespacedState(store as any, namespace);
    expect(state).toHaveProperty("baz", 1);
  });

  it("returns state for nested namespace", () => {
    const namespace = "namespaceFoo/namespaceBar";
    const store = {
      state: {
        namespaceFoo: {
          baz: 1,
          namespaceBar: {
            jazz: 2
          }
        }
      }
    };

    const state = getNamespacedState(store as any, namespace);
    expect(state).toHaveProperty("jazz", 2);
  });
});
