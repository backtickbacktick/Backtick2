import '../style/main.scss';
import { Command } from './utils/types';
import { getStore } from './utils/store';
import { runCommand } from './utils/actions';
import { $$ } from './utils';

type CommandElement = Command & {
    element: HTMLLIElement;
    blob: string;
};

new (class {
    public version: '1.0.1';

    commands: CommandElement[] = [];
    container: HTMLDivElement = null;
    inputElement: HTMLInputElement = null;
    noMatchElement: HTMLLIElement = null;

    selectedCommandIndex = -1;

    constructor() {
        this.container = document.createElement('div');
        this.container.id = 'backtick-container';
        this.container.classList.add('loading');
        this.container.innerHTML = `
    <div class="console in">
        <div class="icon"></div>
        <input type="text" placeholder="Find and execute a command" spellcheck="false" name="backtick">
    </div>
    <div class="results">
        <ul></ul>
    </div>
    `;
        document.body.appendChild(this.container);

        this.inputElement = $$('input', this.container);
        this.inputElement.disabled = true;

        this.container.addEventListener('keyup', (e) =>
            this.keyUpEventListener(e)
        );

        this.inputElement.addEventListener('input', () => this.inputChange());

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

            const ul = $$('ul', this.container);

            this.noMatchElement = document.createElement('li');
            this.noMatchElement.classList.add('none', 'hidden');
            this.noMatchElement.innerText = 'No commands found';
            ul.appendChild(this.noMatchElement);

            commands.forEach((command, index) => {
                const element = document.createElement('li');
                element.tabIndex = 0;
                element.classList.add('command', 'hidden');
                element.dataset.commandIndex = index.toString();

                // TODO: track commands by uid not index once sorting is in place

                element.innerHTML = `<span class="name">${command.name}</span><p class="description">${command.description}</p>`;

                ul.appendChild(element);

                this.commands.push({
                    ...command,
                    element,
                    blob: [
                        command.shortcut,
                        command.name,
                        command.description,
                        command.fileName,
                    ]
                        .join(' ')
                        .toLowerCase(),
                });

                this.inputElement.disabled = false;
                this.inputElement.focus();

                this.container.classList.remove('loading');
            });
        });
    }

    selectCommand(direction: 'ArrowUp' | 'ArrowDown') {
        if (direction === 'ArrowUp' && this.selectedCommandIndex === 0) {
            this.inputElement.focus();
            this.selectedCommandIndex = -1;
            return;
        }

        const commandsNotHidden = this.commands.filter(
            (command) => !command.element.classList.contains('hidden')
        );

        if (commandsNotHidden.length === 0) return;

        const lastCommandSelectded =
            this.selectedCommandIndex === commandsNotHidden.length - 1;

        let nextIndex = 0;

        if (lastCommandSelectded && direction === 'ArrowDown') {
            nextIndex = 0;
        } else {
            nextIndex =
                direction === 'ArrowUp'
                    ? this.selectedCommandIndex - 1
                    : this.selectedCommandIndex + 1;
        }

        commandsNotHidden[nextIndex].element.focus();

        this.selectedCommandIndex = nextIndex;
    }

    unloadContainer() {
        const console = $$('.console', this.container);

        console.classList.remove('in');
        console.classList.add('out');

        this.container.removeEventListener('keyup', (e) =>
            this.keyUpEventListener(e)
        );
        this.container.removeEventListener('change', () => this.inputChange());

        setTimeout(() => this.container.remove(), 1000);
    }

    getSearchText() {
        const searchText = this.inputElement.value.toLowerCase();
        const searchTextShortcut = searchText.split(' ')[0];
        return { searchText, searchTextShortcut } as const;
    }

    async inputChange() {
        this.selectedCommandIndex = -1;

        const { searchText, searchTextShortcut } = this.getSearchText();

        let noMatches = true;

        const shortcutCommand = this.commands.find(
            (command) => command.shortcut === searchTextShortcut
        );

        if (shortcutCommand?.autorun) {
            this.runCommand(shortcutCommand);
            return;
        }

        // TODO: sort commands based on searchterm relative

        this.commands.forEach((command) => {
            const showing =
                !!shortcutCommand ||
                (!command.hidden && command.blob.includes(searchText));

            command.element.classList[showing ? 'remove' : 'add']('hidden');
            noMatches = noMatches || showing;
        });

        if (noMatches) this.noMatchElement.classList.remove('hidden');
        else this.noMatchElement.classList.add('hidden');
    }

    async keyUpEventListener(e: KeyboardEvent) {
        const targetElement = e.target as HTMLElement;

        const targetNodeName = targetElement.nodeName.toLowerCase();

        if (targetNodeName !== 'input' && targetNodeName !== 'li') return;

        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            if (e.key === 'ArrowUp' && targetNodeName === 'input') return;
            this.selectCommand(e.key);
            return;
        }

        if (e.key === 'Enter') {
            if (targetNodeName === 'li')
                this.runCommand(
                    this.commands[Number(targetElement.dataset.commandIndex)]
                );

            if (targetNodeName === 'input') {
                const { searchTextShortcut } = this.getSearchText();

                const shortcutPrefixCommand = this.commands.find(
                    (c) => c.shortcut === searchTextShortcut
                );

                if (shortcutPrefixCommand) {
                    this.runCommand(shortcutPrefixCommand);
                }
            }
            return;
        }

        if (e.key === 'Escape') {
            this.unloadContainer();
            return;
        }
    }

    runCommand(command: Command) {
        runCommand(command.fileName);

        if (command.close) this.unloadContainer();
    }
})();
