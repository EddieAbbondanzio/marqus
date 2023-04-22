export function getClosestAttribute(
  attr: string,
  element: HTMLElement,
): string | null {
  const parent = element.closest(`[${attr}]`);
  if (parent != null) {
    return parent.getAttribute(attr);
  }

  return null;
}

export function getOffsetRelativeTo(
  event: MouseEvent,
  parentElement: HTMLElement,
): [number, number] {
  const { offsetX, offsetY } = event;

  const parentRect = parentElement.getBoundingClientRect();
  const targetRect = (event.target as HTMLElement).getBoundingClientRect();

  return [
    targetRect.left - parentRect.left + offsetX,
    targetRect.top - parentRect.top + offsetY,
  ];
}

export type ViewCheck =
  | { fullyVisible: true }
  | { fullyVisible: false; offBy: number };

export function isScrolledIntoView(el: HTMLElement): ViewCheck {
  const parentEl = el.parentElement as HTMLElement;
  const { scrollTop } = parentEl;

  // Check if element is above view
  const elTop = el.offsetTop - parentEl.offsetTop;
  if (elTop < scrollTop) {
    return { fullyVisible: false, offBy: elTop - scrollTop };
  }

  // Check if element is below view
  const elBottom = elTop + el.offsetHeight;
  const scrollBottom = parentEl.offsetHeight + scrollTop;
  if (elBottom > scrollBottom) {
    return { fullyVisible: false, offBy: elBottom - scrollBottom };
  }

  return { fullyVisible: true };
}
