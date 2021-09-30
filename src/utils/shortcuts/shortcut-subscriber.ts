export type ShortcutCallback = (shortcutName: string) => any;

export class ShortcutSubscriber {
  // eslint-disable-next-line
    constructor(
        public shortcutName: string,
        private callback: ShortcutCallback,
        public el?: HTMLElement,
        public when?: () => boolean
  ) {}

  notify() {
    if (this.when == null || this.when()) {
      this.callback(this.shortcutName);
    }
  }
}
