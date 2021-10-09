/* eslint-disable max-len */
import { PromptButton, promptUser } from "@/utils";

export async function confirmDelete(type: string, name: string): Promise<"trash" | "delete">
export async function confirmDelete(type: string, name: string, opts: { showTrash: boolean }): Promise<"trash" | "delete" | "cancel">
export async function confirmDelete(type: string, name: string, opts?: { showTrash: boolean }): Promise<any> {
  let buttons: PromptButton[];

  if (opts?.showTrash) {
    buttons = [
      { text: "Move to Trash", role: "default", value: "trash" },
      { text: "Permanently Delete", value: "delete" },
      { text: "Cancel", role: "cancel", value: "cancel" }
    ];
  } else {
    buttons = [
      { text: "Yes", role: "default", value: "delete" },
      { text: "No", role: "cancel", value: "cancel" }
    ];
  }

  const pick = await promptUser({
    type: "warning",
    text: `Are you sure you want to delete ${type} ${name}`,
    buttons
  });

  return pick.value;
}
