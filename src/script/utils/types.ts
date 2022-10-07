export interface Command {
    fileName: string;
    name?: string;
    description?: string;
    shortcut?: string;
    hidden?: boolean;
    url?: string;
    autorun?: 'url' | 'shortcut';
    close?: boolean;
}
