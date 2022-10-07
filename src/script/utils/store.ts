import { Command } from './types';

const BACKTICK_COMMNDS = 'BACKTICK_COMMNDS';

export function setStore(commands: Command[]) {
    return new Promise((resolve) => {
        chrome.storage.sync.set({ BACKTICK_COMMNDS: commands }, function () {
            resolve(true);
        });
    });
}

export function getStore(): Promise<Command[]> {
    return new Promise((resolve) => {
        chrome.storage.sync.get([BACKTICK_COMMNDS], function (result) {
            resolve(result?.[BACKTICK_COMMNDS] || []);
        });
    });
}
