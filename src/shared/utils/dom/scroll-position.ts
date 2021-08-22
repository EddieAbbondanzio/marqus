export function isElementAboveScroll(container: HTMLElement, target: HTMLElement) {
    const topOfScroll = container.scrollTop;
    return target.offsetTop < topOfScroll;
}

export function isElementBelowScroll(container: HTMLElement, target: HTMLElement) {
    const bottomOfScroll = container.scrollTop + container.offsetHeight;
    return target.offsetTop >= bottomOfScroll;
}
