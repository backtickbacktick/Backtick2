import '../style/main.scss';
import { getStore } from './utils/store';
import { runCommand } from './utils/actions';
import { $, $$ } from './utils';
import backtickListener from './utils/backtickListener';

type Result = { command: Command; relevance: number };

const svg = `<svg viewBox="0 0 6 4"><polygon id="Path" points="3.225 0.017 5.4 3.591 3.85 3.591 0.8 0.017"></polygon></svg>`;

new (class {
    public version: '1.0.1';

    commands: Command[] = [];
    rootElement: HTMLDivElement = null;
    inputElement: HTMLInputElement = null;
    noMatchElement: HTMLLIElement = null;
    resultsElement: HTMLUListElement = null;
    results: Result[] = [];

    selectedIndex = -1;

    constructor() {
        this.rootElement = document.createElement('div');
        this.rootElement.id = 'backtick-container';
        this.rootElement.style.display = 'none';
        this.rootElement.classList.add('out');
        this.rootElement.innerHTML = `
<div class="console">
    <input autocomplete="off" type="text" placeholder="Find and execute a command" spellcheck="false" name="backtick">
    <div class="icon">${svg}</div>
</div>
<div class="results">
    <ul></ul>
</div>
`;
        document.body.appendChild(this.rootElement);

        this.resultsElement = $('ul', this.rootElement);
        this.inputElement = $('input', this.rootElement);
        this.inputElement.disabled = true;

        getStore().then((commands) => {
            const url = location.href;

            const urlMatches = commands.filter(
                (command) =>
                    command.autorun === 'url' &&
                    command.url &&
                    new RegExp(command.url).test(url)
            );

            if (urlMatches.length === 1) {
                this.runCommand(urlMatches[0]);
                return;
            }

            this.loadConsole();

            this.commands = commands;

            this.inputElement.disabled = false;
        });
    }

    loadConsole() {
        this.rootElement.classList.replace('out', 'in');
        this.rootElement.style.display = 'block';

        setTimeout(() => {
            this.inputElement.disabled = false;
            this.inputElement.focus();

            this.rootElement.addEventListener('keyup', (e) =>
                this.keyupListener(e)
            );
            this.rootElement.addEventListener('click', (e) =>
                this.clickListener(e)
            );
            this.inputElement.addEventListener('input', () =>
                this.inputChange()
            );
        }, 500); // timeout for in out animation
    }

    unloadConsole() {
        this.rootElement.classList.replace('in', 'out');
        this.resultsElement.innerHTML = '';
        this.inputElement.value = '';

        this.rootElement.removeEventListener('keyup', (e) =>
            this.keyupListener(e)
        );
        this.rootElement.removeEventListener('click', (e) =>
            this.clickListener(e)
        );
        this.inputElement.removeEventListener('input', () =>
            this.inputChange()
        );

        setTimeout(() => {
            this.rootElement.style.display = 'none';
            backtickListener(() => this.loadConsole());
        }, 500); // timeout for in out animation
    }

    loadResults() {
        const { searchText, searchTextShortcut } = this.getSearchText();

        const shortcutCommand =
            searchTextShortcut &&
            this.commands.find(
                (command) => command.shortcut === searchTextShortcut
            );

        if (shortcutCommand?.autorun) {
            this.runCommand(shortcutCommand);
            return;
        }

        if (shortcutCommand)
            this.results = [{ command: shortcutCommand, relevance: 1 }];
        else
            this.results = this.commands
                .filter(({ hidden }) => !hidden)
                .map((command) => {
                    const result = { command, relevance: 0 };

                    [
                        command.description?.toLowerCase(),
                        command.fileName.toLowerCase(),
                        command.name.toLowerCase(),
                        command.shortcut?.toLowerCase(),
                    ].map((blob, relevanceIndex) => {
                        result.relevance += blob?.includes(searchText)
                            ? relevanceIndex + 1
                            : 0;
                    });

                    return result;
                });

        this.results.sort((a, b) => (a.relevance > b.relevance ? -1 : 1));

        if (this.results.some((r) => r.relevance)) {
            this.resultsElement.innerHTML = this.results
                .map(
                    ({ command }) => `
<li class="command" tabindex="0" data-command="${command.fileName}">
    <div class="active"></div><span class="name">${command.name}</span><p class="description">${command.description}</p>
</li>
            `
                )
                .join('');
        } else {
            this.resultsElement.innerHTML =
                '<li class="none">No commands found</li>';
        }
    }

    selectCommand(direction: 'ArrowUp' | 'ArrowDown') {
        const resultElements = $$('li.command', this.resultsElement);

        if (resultElements.length === 0) {
            return;
        }

        this.selectedIndex += direction === 'ArrowDown' ? 1 : -1;

        if (this.selectedIndex === -1) {
            this.inputElement.focus();
            return;
        }

        if (this.selectedIndex === -2) {
            // to high go to bottom of commands
            this.selectedIndex = resultElements.length - 1;
        }

        if (this.selectedIndex === resultElements.length) {
            // to low, go to top of commands
            this.selectedIndex = 0;
        }

        const commandElementToFocus = resultElements[this.selectedIndex];
        commandElementToFocus.focus();
    }

    getSearchText() {
        const searchText = this.inputElement.value.toLowerCase();
        const searchTextShortcutMatch = searchText?.match(/^(\w+)\s/);
        const searchTextShortcut =
            searchTextShortcutMatch?.[1]?.length && searchTextShortcutMatch[1];
        return { searchText, searchTextShortcut } as const;
    }

    async inputChange() {
        this.selectedIndex = -1;

        this.loadResults();
    }

    runCommand(command: Command) {
        runCommand(command.fileName);

        if (command.close) this.unloadConsole();
    }

    clickListener(e: MouseEvent) {
        const targetElement = e.target as HTMLElement;

        if (
            targetElement.nodeName.toLowerCase() === 'li' &&
            targetElement.dataset.command
        ) {
            this.runCommand(
                this.commands.find(
                    ({ fileName }) => targetElement.dataset.command === fileName
                )
            );
            return;
        }

        return;
    }

    keyupListener(e: KeyboardEvent) {
        const targetElement = e.target as HTMLElement;

        const targetNodeName = targetElement.nodeName.toLowerCase() as
            | 'li'
            | 'input';

        if (targetNodeName !== 'input' && targetNodeName !== 'li') return;

        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            if (targetNodeName === 'input') {
                if (e.key === 'ArrowUp') return;
                if ((targetElement as HTMLInputElement).value === '')
                    this.loadResults();
            }

            this.selectCommand(e.key);
            return;
        }

        if (e.key === 'Enter') {
            if (targetNodeName === 'li')
                this.runCommand(
                    this.commands.find(
                        ({ fileName }) =>
                            targetElement.dataset.command === fileName
                    )
                );

            if (targetNodeName === 'input') {
                const { searchTextShortcut } = this.getSearchText();

                const shortcutPrefixCommand =
                    searchTextShortcut &&
                    this.commands.find(
                        (c) => c.shortcut === searchTextShortcut
                    );

                if (shortcutPrefixCommand) {
                    this.runCommand(shortcutPrefixCommand);
                }
            }
            return;
        }

        if (e.key === 'Escape') {
            this.unloadConsole();
            return;
        }

        e.preventDefault();
        e.stopPropagation();
    }
})();
