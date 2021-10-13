import { Getters } from "vuex-smart-module";
import { Focusable, UserInterfaceState } from "./state";

export class UserInterfaceGetters extends Getters<UserInterfaceState> {
  focusableById(id: string): Focusable | undefined;
  focusableById(id: string, opts: { required: true }): Focusable;
  focusableById(id: string, opts: { required?: boolean } = {}) {
    const focusable = this.state.focusables.find((t) => t.id === id);

    if (opts.required && focusable == null) {
      throw Error(`No focusable with id ${id} found.`);
    }

    return focusable;
  }

  focusableByName(name: string): Focusable | undefined;
  focusableByName(name: string, opts: { required: true }): Focusable;
  focusableByName(name: string, opts: { required?: boolean } = {}) {
    const focusable = this.state.focusables.find((t) => t.name === name);

    if (opts.required && focusable == null) {
      throw Error(`No focusable with name ${name} found.`);
    }

    return focusable;
  }
}
