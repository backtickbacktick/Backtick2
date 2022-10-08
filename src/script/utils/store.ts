const BACKTICK_COMMANDS = 'BACKTICK_COMMANDS';

export function setStore(commands: Command[]) {
    return new Promise((resolve) => {
        chrome.storage.sync.set({ BACKTICK_COMMANDS: commands }, function () {
            resolve(true);
        });
    });
}

export function getStore(): Promise<Command[]> {
    return new Promise((resolve) => {
        chrome.storage.sync.get([BACKTICK_COMMANDS], function (result) {
            resolve(result?.[BACKTICK_COMMANDS] || []);
        });
    });
}
