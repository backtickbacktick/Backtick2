import '../style/popup.scss';
import { $ } from './utils';
import { setStore, getStore } from './utils/store';

const TypeOf = {
    undefined: 'undefined',
    object: 'object',
    boolean: 'boolean',
    number: 'number',
    bigint: 'bigint',
    string: 'string',
    symbol: 'symbol',
    function: 'function',
} as const;

const validators = {
    isTypeOf: (types: (keyof typeof TypeOf)[]) => (value: unknown) =>
        types.includes(typeof value),
    isOneOf: (values: unknown[]) => (value: unknown) => values.includes(value),
} as const;

const schema: Record<
    string,
    { isTypeOf: (keyof typeof TypeOf)[] } | { isOneOf: unknown[] }
> = {
    name: {
        isTypeOf: [TypeOf.string],
    },
    autorun: {
        isOneOf: ['url', 'shortcut', undefined],
    },
    close: {
        isTypeOf: [TypeOf.boolean, TypeOf.undefined],
    },
    description: {
        isTypeOf: [TypeOf.string, TypeOf.undefined],
    },
    hidden: {
        isTypeOf: [TypeOf.boolean, TypeOf.undefined],
    },
    shortcut: {
        isTypeOf: [TypeOf.string, TypeOf.undefined],
    },
    url: {
        isTypeOf: [TypeOf.string, TypeOf.undefined],
    },
};

new (class {
    pageElement = $('#page');
    buttonElement = $<HTMLButtonElement>('button');

    commands: Command[] = [];

    constructor() {
        this.pageElement.innerHTML = `<div class="_bt-loading">Loading commands...</div>`;

        getStore().then((commands) => {
            this.commands = commands;

            this.shouldReload().then((shouldReload) => {
                if (!commands.length || shouldReload) {
                    this.pageElement.innerHTML = `<div class="_bt-loading">Reloading commands...</div>`;

                    this.reloadCommands();
                } else {
                    this.displayCommands();
                }

                this.buttonElement.addEventListener('click', () => {
                    this.reloadCommands();
                });
            });
        });
    }

    async shouldReload() {
        const actualCommands = await this.getCommandsFromFiles();

        if (this.commands.length !== actualCommands.length) return true;

        const commandKeys = Object.keys(schema);

        const shouldReload = this.commands.some((command) => {
            const actualCommand = actualCommands.find(
                ({ fileName }) => command.fileName === fileName
            );

            return (
                !actualCommand ||
                commandKeys.some((key) => actualCommand[key] !== command[key])
            );
        });

        return shouldReload;
    }

    async displayCommands() {
        const commandsList = this.commands
            .map(
                (command: Command) =>
                    `<li class="${command.error && '_bt-error'}">${
                        command.error || command.name || command.fileName
                    }</li>`
            )
            .join('');

        const shouldReload = await this.shouldReload();

        this.pageElement.innerHTML = `<div class="_bt-commands"><h3>Commands Loaded</h3><ul>${commandsList}</ul></div>${
            shouldReload ? `<div></div>` : ''
        }`;

        this.buttonElement.style.display = 'block';
    }

    async reloadCommands() {
        this.pageElement.innerHTML = `<div class="_bt-loading">Reloading commands...</div>`;

        this.buttonElement.style.display = 'none';

        this.commands = await this.getCommandsFromFiles();

        await setStore(this.commands);

        this.displayCommands();
    }

    /**
     * A super simple jsdoc parser
     */
    jsDocParser(fileContent: string): Partial<Command> {
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

            return props as Command;
        }

        return null;
    }

    getFiles(): Promise<{ fileName: string; content: string }[]> {
        return new Promise((resolve) => {
            chrome.runtime.getPackageDirectoryEntry((root) => {
                root.getDirectory(
                    'commands',
                    {},
                    (fileSystemDirectoryEntry) => {
                        fileSystemDirectoryEntry
                            .createReader()
                            .readEntries(async (entries) =>
                                resolve(
                                    Promise.all(
                                        entries.map(async (entry) => ({
                                            fileName: entry.name,
                                            content: await (
                                                await fetch(
                                                    chrome.runtime.getURL(
                                                        'commands/' + entry.name
                                                    )
                                                )
                                            ).text(),
                                        }))
                                    )
                                )
                            );
                    }
                );
            });
        });
    }

    async getCommandsFromFiles(): Promise<Command[]> {
        const files = await this.getFiles();

        return files.map(({ content, fileName }) => {
            const jsDoc = this.jsDocParser(content);

            const invalidFields = Object.entries(schema)
                .map(([key, fieldSchema]) => {
                    let error: string | undefined;

                    const value = jsDoc[key];

                    if ('isOneOf' in fieldSchema) {
                        if (!validators.isOneOf(fieldSchema.isOneOf)(value))
                            error = `one of ${fieldSchema.isOneOf.join(', ')}`;
                    }

                    if ('isTypeOf' in fieldSchema) {
                        if (!validators.isTypeOf(fieldSchema.isTypeOf)(value))
                            error = `a type of
                            ${fieldSchema.isTypeOf.join(', ')}`;
                    }

                    return error && `${key} (${value}) is not ${error}`;
                })
                .filter(Boolean);

            return {
                fileName,
                ...jsDoc,
                error:
                    invalidFields.length &&
                    `${fileName} has invalid fields: ${invalidFields}`,
            };
        });
    }
})();
