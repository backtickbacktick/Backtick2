import { loadConsole } from './utils/actions';

const HOTKEY = '`';

(function () {
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
        loadExtension();

        return false;
    }

    function loadExtension() {
        loadConsole().then((loaded) => {
            if (loaded) {
                document.removeEventListener('keypress', onKeypress);
            }
            return true;
        });
    }
})();
