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
