import { MouseObject } from "./mouse-object";
import { getButton } from "./mouse-button";
import { store } from "@/store";

export class MouseObjectManager {
    objects: MouseObject[];
    active: MouseObject | null = null;

    onMouseMoveListener: (e: MouseEvent) => any;
    onClickListener: (e: MouseEvent) => any;
    onKeyUpListener: (e: KeyboardEvent) => any;

    cancelled = false;

    constructor() {
      this.objects = [];

      this.onMouseMoveListener = this.onMouseMove.bind(this);
      this.onClickListener = this.onMouseUp.bind(this);
      this.onKeyUpListener = this.onKeyUp.bind(this);

      /**
         * Click event is used instead of mouseup because then we can stop
         * events from bubbling up from children if desired.
         */
      window.addEventListener("click", this.onClickListener);
      window.addEventListener("mousemove", this.onMouseMoveListener);
      window.addEventListener("keyup", this.onKeyUpListener);
    }

    dispose() {
      window.removeEventListener("click", this.onClickListener);
      window.removeEventListener("mousemove", this.onMouseMoveListener);
      window.removeEventListener("keyup", this.onKeyUpListener);
    }

    add(obj: MouseObject) {
      this.objects.push(obj);
    }

    get(el: HTMLElement) {
      return this.objects.find((o) => o.element === el);
    }

    remove(obj: MouseObject) {
      this.objects = this.objects.filter((o) => o !== obj);
      obj.dispose();
    }

    onKeyUp(event: KeyboardEvent) {
      if (this.active == null || !this.active.holding) {
        return;
      }

      if (event.key === "Escape") {
        this.cancelled = true;

        this.active.notify("dragcancel", this.active.activeButton!, null!);
        store.dispatch("ui/cursorDraggingStop");
      }
    }

    /**
     * Mouse is dragging an element.
     * @param event MouseEvent details
     */
    onMouseMove(event: MouseEvent) {
      if (this.active == null) {
        return;
      }

      // Don't trigger event if self option is set, and trigger element was different.
      if (this.active.self && this.active.element !== event.target) {
        return;
      }

      event.stopImmediatePropagation();

      // If mouse is down, and moved assume drag
      if (this.active.mouseDown) {
        const button = getButton(event.button);

        if (!this.active.holding) {
          this.active.holding = true;
          this.active.notify("hold", button, event);

          store.dispatch("ui/cursorDraggingStart");
        }

        this.active.notify("drag", button, event);
      }
    }

    /**
     * Mouse button was released event handler.
     * @param event MouseEvent details
     */
    onMouseUp(event: MouseEvent) {
      if (this.active == null) {
        return;
      }

      // Don't trigger event if self option is set, and trigger element was different.
      if (this.active.self && this.active.element !== event.target) {
        return;
      }

      event.stopImmediatePropagation();
      const button = getButton(event.button);

      if (!this.active.holding) {
        this.active.notify("click", button, event);
      } else {
        if (!this.cancelled) {
          this.active.notify("release", button, event);
        }

        store.dispatch("ui/cursorDraggingStop");
      }

      this.active.holding = false;
      this.active.mouseDown = false;
      this.active.activeButton = undefined;
      this.active = null;
      this.cancelled = false;
    }
}
