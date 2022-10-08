declare interface Command extends Record<string, string | boolean> {
    fileName: string;
    name?: string;
    description?: string;
    shortcut?: string;
    hidden?: boolean;
    url?: string;
    autorun?: 'url' | 'shortcut';
    close?: boolean;
    error?: string;
}
