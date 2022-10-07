/* eslint-disable @typescript-eslint/ban-ts-comment */
export enum Action {
    'RunBacktickCommand' = 'RunBacktickCommand',
    'LoadBacktickConsole' = 'LoadBacktickConsole',
}
type Message =
    | { action: Action.LoadBacktickConsole }
    | {
          action: Action.RunBacktickCommand;
          fileName: string;
      };

function sendMessage(message: Message) {
    return new Promise((resolve) => {
        chrome.runtime.sendMessage(message, resolve);
    });
}

export function loadConsole() {
    return sendMessage({
        action: Action.LoadBacktickConsole,
    }) as Promise<boolean>;
}

export function runCommand(fileName: string) {
    return sendMessage({
        action: Action.RunBacktickCommand,
        fileName,
    }) as Promise<boolean>;
}

export function actionsListener() {
    chrome.runtime.onMessage.addListener(function (
        messageProp: Message | unknown,
        sender,
        sendResponse
    ) {
        if (
            !messageProp ||
            typeof messageProp !== 'object' ||
            !('action' in messageProp)
        )
            return;

        // @ts-ignore
        const message: Message = messageProp;

        if (message.action === Action.LoadBacktickConsole) {
            chrome.scripting.insertCSS({
                target: { tabId: sender.tab.id },
                files: ['style/main.min.css'],
            });
            chrome.scripting.executeScript({
                target: { tabId: sender.tab.id },
                files: ['script/main.js'],
            });
            sendResponse(true);
            return true;
        }

        if (message.action === Action.RunBacktickCommand) {
            chrome.scripting.executeScript({
                target: { tabId: sender.tab.id },
                files: ['commands/' + message.fileName],
            });
            sendResponse(true);
            return true;
        }

        sendResponse(false);
        return true;
    });
}
