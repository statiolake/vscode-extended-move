# Extended Move for VS Code

A Visual Studio Code extension that provides Vim-style cursor movement and text object selection features.

> **Migration Notice**: This extension supersedes [vscode-extended-selects](https://github.com/statiolake/vscode-extended-selects). If you're using that extension, please switch to Extended Move for continued updates.

## Features

This extension provides two main categories of commands:

### 1. Cursor Movement

Commands for moving the cursor with precision:

- **Whitespace Movement**: Move to next/previous whitespace characters
- **Character Movement**: Jump to specific characters with input prompts
- **Last Character Movement**: Reuse the last searched character
- **Surrounding Navigation**: Exit or enter bracket/quote pairs

### 2. Text Object Selection

Vim-style text objects for selecting inner/around regions:

| ID | Shortcut | Description |
|---|---|---|
| inner/around-word | iw/aw | Word |
| inner/around-WORD | iW/aW | WORD (whitespace-delimited) |
| inner/around-paren | i(/a( | Parentheses `()` |
| inner/around-brace | i{/a{ | Braces `{}` |
| inner/around-bracket | i[/a[ | Brackets `[]` |
| inner/around-angle | i</a< | Angle brackets `<>` |
| inner/around-double-quote | i"/a" | Double quotes |
| inner/around-single-quote | i'/a' | Single quotes |
| inner/around-backtick | i`/a` | Backticks |
| inner/around-tag | it/at | HTML/XML tags |
| inner/around-paragraph | ip/ap | Paragraph |
| inner/around-argument | ia/aa | Function argument |
| inner/around-indent | ii/ai | Indent block |
| inner/around-entire | ie/ae | Entire document |

## Installation

1. Open Visual Studio Code
2. Click the Extensions icon in the sidebar
3. Search for "Extended Move"
4. Click Install

## Usage

### Text Object Selection

1. Run `Extended Move: Select Text Object` from Command Palette
2. Type to filter text objects (e.g., `ip` for inner paragraph)
3. Press Enter to select

Or bind individual commands directly to keybindings.

### Cursor Movement

All cursor movement commands are available via Command Palette and can be bound to keys.

## Keybinding Configuration

This extension does not provide default keybindings. Configure your preferred keybindings in `keybindings.json`:

```json
{
  // Text Object Selection
  { "key": "alt+s", "command": "vscode-extended-move.selectTextObject" },

  // Cursor Movement
  { "key": "alt+]", "command": "vscode-extended-move.cursorNextWhitespace" },
  { "key": "alt+[", "command": "vscode-extended-move.cursorPrevWhitespace" },
  { "key": "alt+]", "command": "vscode-extended-move.cursorExitSurrounding" },
  { "key": "alt+[", "command": "vscode-extended-move.cursorEnterSurrounding" }
}
```

See the [full command list](#commands) for all available commands.

## Commands

### Text Object Selection
- `vscode-extended-move.selectTextObject` - Open QuickPick to select text object
- `vscode-extended-move.innerWordSelect` - Select inner word
- `vscode-extended-move.aroundWordSelect` - Select around word
- ... (and more for each text object type)

### Cursor Movement
- `vscode-extended-move.cursorNextWhitespace` - Move to next whitespace
- `vscode-extended-move.cursorPrevWhitespace` - Move to previous whitespace
- `vscode-extended-move.cursorNextChar` - Move to next specified character
- `vscode-extended-move.cursorPrevChar` - Move to previous specified character
- `vscode-extended-move.cursorExitSurrounding` - Exit current surrounding brackets/quotes
- `vscode-extended-move.cursorEnterSurrounding` - Enter previous surrounding brackets/quotes

## License

MIT License

## Source Code

[GitHub Repository](https://github.com/statiolake/vscode-extended-move)

## Feedback

Please report bugs or request features through [GitHub Issues](https://github.com/statiolake/vscode-extended-move/issues).
