# Obsidian Tab Complete Plugin

Tab Complete is intended to work provide tab-completion support to Obsidian's file suggestion modal.

## How to use
- Clone this repo.
- `npm i` or `yarn` to install dependencies
- `npm run dev` to start compilation in watch mode.
- In your settings you will have access to a new option labeled `Tab Complete: Create or find note` which you can assign a hotkey to - either a new one, or unassign and utilize the existing `Gui+o`/`Ctrl+o` shortcut.
- Start typing and hit `Tab` to fill up to the next conflicting character in the file tree.

## Manually installing the plugin

- Copy over `main.js`, `styles.css`, `manifest.json` to your vault `VaultFolder/.obsidian/plugins/obsidian-tab-complete/`.
