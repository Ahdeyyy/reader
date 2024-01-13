import { createToaster } from '@melt-ui/svelte';
type ToastData = {
    title: string;
    description: string;
    color: string;
};

const {
    elements: { content, title, description, close },
    helpers: { addToast },
    states: { toasts },
    actions: { portal }
} = createToaster<ToastData>();

export {
    content,
    title,
    description,
    close,
    addToast,
    toasts,
    portal
}
