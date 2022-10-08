export function $<T = HTMLElement>(
    selectors: string,
    root: HTMLElement | Document = document
) {
    return root.querySelector(selectors) as T;
}

export function $$<T = HTMLElement>(
    selectors: string,
    root: HTMLElement | Document = document
) {
    return Array.from(root.querySelectorAll(selectors)) as T[];
}
