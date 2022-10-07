import '../style/popup.scss';
import { Command } from './utils/types';
import { setStore } from './utils/store';

function getEntries(): Promise<FileSystemEntry[]> {
    return new Promise((resolve) => {
        chrome.runtime.getPackageDirectoryEntry((root) => {
            root.getDirectory('commands', {}, (fileSystemDirectoryEntry) => {
                fileSystemDirectoryEntry.createReader().readEntries(resolve);
            });
        });
    });
}

async function App() {
    document.body.innerHTML = `
        <div class="loading">Reloading commands...</div>
    `;

    const entries = await getEntries();

    const commands = await Promise.all(
        entries.map(async (entry) => {
            const content = await fetch(
                chrome.runtime.getURL('commands/' + entry.name)
            ).then((response) => response.text());
            return {
                fileName: entry.name,
                ...jsDocParser(content),
            };
        })
    );

    /**
     * TODO: commands data cleanup
     * validate & display errors
     * assign defaults
     */

    await setStore(commands);

    const commandsList = commands
        .map(
            (command: Command) => `<li>${command.name || command.fileName}</li>`
        )
        .join('');

    setTimeout(() => {
        document.body.innerHTML = `
            <div class="commands">
                <h3>Commands Loaded</h3>
                <ul>
                    ${commandsList}
                </ul>
            </div>
            `;
    }, 750);
}

App();

/**
 * A super simple jsdoc parser
 */
function jsDocParser(fileContent: string): Partial<Command> {
    const doRegex = new RegExp(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/);

    const data = fileContent.match(doRegex);

    if (data[0]) {
        const lines = data[0].split('\n');

        const varRegex = new RegExp(/@([a-zA-Z]+)\s([^\n]+)$/);

        const props: Record<string, string | boolean | number> = {};

        lines.forEach((line) => {
            const varMatch = line.match(varRegex);

            if (varMatch?.length > 2) {
                const [_, prop, valueStr] = varMatch;

                let value: string | boolean | number = valueStr.trim();

                if (valueStr === 'true') value = true;

                props[prop] = value;
            }
        });

        return props;
    }

    return null;
}
