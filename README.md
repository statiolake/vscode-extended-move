# Extended Move for VS Code

A Visual Studio Code extension that enhances cursor movement capabilities. This extension provides precise cursor movement features such as moving to whitespace characters and jumping to specific characters.

## Features

This extension provides 12 commands in 3 categories:

### 1. Whitespace Movement

Commands for moving to whitespace characters (spaces, tabs):

- `vscode-extended-move.moveToNextWhitespace`: Move to next whitespace
- `vscode-extended-move.moveToPreviousWhitespace`: Move to previous whitespace
- `vscode-extended-move.moveToNextWhitespaceSelect`: Move to next whitespace with selection
- `vscode-extended-move.moveToPreviousWhitespaceSelect`: Move to previous whitespace with selection

### 2. Character Movement

Commands for moving to a specified single character:

- `vscode-extended-move.moveToNextChar`: Move to next occurrence of specified character
- `vscode-extended-move.moveToPreviousChar`: Move to previous occurrence of specified character
- `vscode-extended-move.moveToNextCharSelect`: Move to next occurrence of specified character with selection
- `vscode-extended-move.moveToPreviousCharSelect`: Move to previous occurrence of specified character with selection

### 3. Last Character Movement

Commands for moving to the last used character:

- `vscode-extended-move.moveToNextCharWithLast`: Move to next occurrence of last used character
- `vscode-extended-move.moveToPreviousCharWithLast`: Move to previous occurrence of last used character
- `vscode-extended-move.moveToNextCharWithLastSelect`: Move to next occurrence of last used character with selection
- `vscode-extended-move.moveToPreviousCharWithLastSelect`: Move to previous occurrence of last used character with selection

## Installation

1. Open Visual Studio Code
2. Click the Extensions icon in the sidebar
3. Search for "Extended Move"
4. Click Install

## Keybinding Configuration

This extension does not provide default keybindings. Users can configure their preferred keybindings.

To configure keybindings:

1. Open Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`)
2. Search for "Preferences: Open Keyboard Shortcuts"
3. Find the command you want to bind and set your preferred key combination

Example keybinding configuration:

```json
{
  // Whitespace Movement
  { "key": "alt+]", "command": "vscode-extended-move.moveToNextWhitespace" },
  { "key": "alt+[", "command": "vscode-extended-move.moveToPreviousWhitespace" },
  { "key": "alt+shift+]", "command": "vscode-extended-move.moveToNextWhitespaceSelect" },
  { "key": "alt+shift+[", "command": "vscode-extended-move.moveToPreviousWhitespaceSelect" },

  // Character Movement
  { "key": "alt+;", "command": "vscode-extended-move.moveToNextChar" },
  { "key": "alt+j", "command": "vscode-extended-move.moveToPreviousChar" },
  { "key": "alt+shift+;", "command": "vscode-extended-move.moveToNextCharSelect" },
  { "key": "alt+shift+j", "command": "vscode-extended-move.moveToPreviousCharSelect" },

  // Last Character Movement
  { "key": "alt+p", "command": "vscode-extended-move.moveToNextCharWithLast" },
  { "key": "alt+n", "command": "vscode-extended-move.moveToPreviousCharWithLast" },
  { "key": "alt+shift+p", "command": "vscode-extended-move.moveToNextCharWithLastSelect" },
  { "key": "alt+shift+n", "command": "vscode-extended-move.moveToPreviousCharWithLastSelect" }
}
```

## Usage Examples

1. Whitespace Movement

   - Quickly navigate between indented sections in your code
   - Combine with selection to easily select indented blocks
   - Useful for navigating through structured text or code

2. Character Movement

   - Jump directly to specific characters in a line (like commas or semicolons)
   - When executing the command, you'll be prompted to enter a single character to move to

3. Last Character Movement
   - Reuse the last character you searched for
   - Convenient when repeatedly moving to the same character
   - No need to re-enter the character for subsequent moves

## License

MIT License

## Source Code

[GitHub Repository](https://github.com/statiolake/vscode-extended-move)

## Feedback

Please report bugs or request features through [GitHub Issues](https://github.com/statiolake/vscode-extended-move/issues).
