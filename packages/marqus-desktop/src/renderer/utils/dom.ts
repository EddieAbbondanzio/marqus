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
