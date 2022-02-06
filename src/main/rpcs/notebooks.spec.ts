import { resourceId } from "../../shared/domain/id";
import {
  addChild,
  createNotebook,
  Notebook,
} from "../../shared/domain/notebook";
import { deserialize, serialize, SerializedNotebook } from "./notebooks";

test("serialize is recursive", () => {
  const parent = createNotebook({ name: "parent " });
  const child1 = createNotebook({ name: "child" });
  const child2 = createNotebook({ name: "child" });
  addChild(parent, child1);
  addChild(parent, child2);

  const serialized = serialize(parent);
  const [serializedChild1, serializedChild2] = serialized.children!;

  expect(serialized).not.toHaveProperty("type");
  expect(serializedChild1).not.toHaveProperty("parent");
  expect(serializedChild1).not.toHaveProperty("type");
  expect(serializedChild2).not.toHaveProperty("parent");
  expect(serializedChild2).not.toHaveProperty("type");
});

test("deserialize is recursive", () => {
  const parent: SerializedNotebook = {
    id: resourceId("notebook").split(".")[1],
    name: "Parent",
    dateCreated: new Date(),
    dateUpdated: new Date(),
    children: [
      {
        id: resourceId("notebook").split(".")[1],
        name: "Parent",
        dateCreated: new Date(),
      },
      {
        id: resourceId("notebook").split(".")[1],
        name: "Parent",
        dateCreated: new Date(),
      },
    ],
  };

  const deserialized = deserialize(parent);
  const [deserializedChild1, deserializedChild2] = deserialized.children!;
  expect(deserialized).toHaveProperty("type", "notebook");
  expect(deserialized.dateCreated).toBeInstanceOf(Date);
  expect(deserialized.dateUpdated).toBeInstanceOf(Date);
  expect(deserializedChild1).toHaveProperty("type", "notebook");
  expect(deserializedChild1.dateCreated).toBeInstanceOf(Date);
  expect(deserializedChild2).toHaveProperty("type", "notebook");
  expect(deserializedChild2.dateCreated).toBeInstanceOf(Date);
});
