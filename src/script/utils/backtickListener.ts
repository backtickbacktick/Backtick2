import { HOTKEY } from '../../config';

export default (callback: () => void) => {
    document.addEventListener('keypress', onKeypress);

    function onKeypress(event: KeyboardEvent) {
        const key = event.key;
        const activeElement = document.activeElement! as HTMLElement;
        const nodeName = activeElement.nodeName.toLowerCase();

        if (
            HOTKEY !== key ||
            activeElement.isContentEditable ||
            'input' === nodeName ||
            'textarea' === nodeName ||
            'select' === nodeName
        ) {
            return;
        }
        callback();
        document.removeEventListener('keypress', onKeypress);

        return false;
    }
};
