import { App, normalizePath, Notice, Plugin, SuggestModal, TFile } from 'obsidian';

// Remember to rename these classes and interfaces!

interface TabCompleteSettings {
	suggestionPlaceholder: string;
	defaultSuggestionId: string;
}

interface TabCompleteSuggestion {
	path: string;
	file?: TFile;

	isDefault: boolean;
}

const DEFAULT_SETTINGS: TabCompleteSettings = {
	suggestionPlaceholder: 'Create or find note...',
	defaultSuggestionId: 'default-suggestions',
}

export default class TabCompletePlugin extends Plugin {
	settings: TabCompleteSettings;

	async onload() {
		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: 'tab-complete-create-or-find-note-command',
			name: 'Tab Complete: Create or find note',
			callback: () => {
				new TabCompleteSuggestionModal(this.app).open();
			}
		});

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, 'keydown', this.handleTabInput(this.app));
	}

	handleTabInput(app: App) {
		return (event: KeyboardEvent) => {
			if (!event.target) {
				return;
			}
			const target = event.target as HTMLInputElement
			if (target.placeholder !== DEFAULT_SETTINGS.suggestionPlaceholder) {
				return;
			}
			if (event.key === 'Tab') {
				event.preventDefault();
				const matchingSuggestions = getFiles().filter(file => file.path.indexOf(target.value) === 0);
				if (matchingSuggestions.length === 1) {
					target.value = matchingSuggestions[0].path;
				} else if (matchingSuggestions.length > 1) {
					const commonPrefix = this.getCommonPrefix(matchingSuggestions);
					target.value = commonPrefix;
					matchingSuggestions[0].path = commonPrefix
					const defaultSuggestion = document.getElementById(DEFAULT_SETTINGS.defaultSuggestionId);
					if (defaultSuggestion) {
						defaultSuggestion.innerText = commonPrefix
					}
				}
			}
		}
	}

// Helper function to get common prefix
	getCommonPrefix(arr: TabCompleteSuggestion[]) {
		const sortedArr = arr.sort();
		const first = sortedArr[0], last = sortedArr[arr.length - 1];
		const L = first.path.length;
		let i = 0;
		while (i < L && first.path.charAt(i) === last.path.charAt(i)) i++;
		return first.path.substring(0, i);
	}

	onunload() {}
}

function getFiles(): TabCompleteSuggestion[] {
	return app.vault.getFiles().map(file => ({
		path: file.path,
		file,
		isDefault: false
	}));
}

class TabCompleteSuggestionModal extends SuggestModal<TabCompleteSuggestion> {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		this.setPlaceholder(DEFAULT_SETTINGS.suggestionPlaceholder)
		this.setInstructions([
			{
				command: 'Tab',
				purpose: 'Complete to next match'
			},
			{
				command: 'Enter',
				purpose: 'Create/Open file'
			},
		])
	}

	getSuggestions (query: string): TabCompleteSuggestion[] {
		if (query.length === 0) {
			return [];
		}
		const suggestions = getFiles().filter(file => file.path.indexOf(query) === 0);
		suggestions.unshift({
			path: query,
			isDefault: true
		});
		return suggestions;
	}

	renderSuggestion (suggestion: TabCompleteSuggestion, el: HTMLElement) {
		if (suggestion.isDefault) {
			el.createEl('div', {
				text: this.inputEl.value,
				attr: {
					id: DEFAULT_SETTINGS.defaultSuggestionId
				}
			})
		} else {
			el.createEl('div', {
				text: suggestion.path,
			})
		}
	}

	async onChooseSuggestion (suggestion: TabCompleteSuggestion, event: MouseEvent | KeyboardEvent): Promise<any> {
		let note = suggestion.file
		if (!note) {
			try {
				if (suggestion.isDefault) {
					note = await this.app.vault.create(normalizePath(this.inputEl.value + '.md'), '');
				}
			} catch (error) {
				new Notice(error.message)
			}
		} else

		return await this.app.workspace
			.getLeaf()
			.openFile(
				note,
				{
					active: true
				}
			)
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}
