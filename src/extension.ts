import * as vscode from "vscode";

// Global state key definitions
const LAST_CHAR_KEY = "lastChar";
const LAST_DIRECTION_KEY = "lastDirection";

// Direction definitions
const enum Direction {
  Forward,
  Backward,
}

// Common function for error handling
function checkActiveEditor(): boolean {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showErrorMessage("Editor is not active");
    return false;
  }
  return true;
}

// Base implementation for cursor movement
function moveCursor(
  editor: vscode.TextEditor,
  newPosition: vscode.Position,
  select: boolean
) {
  editor.selection = select
    ? new vscode.Selection(editor.selection.anchor, newPosition)
    : new vscode.Selection(newPosition, newPosition);
}

// Implementation for moving to whitespace with line boundary handling
function moveToWhitespace(direction: Direction, select: boolean) {
  if (!checkActiveEditor()) return;
  const editor = vscode.window.activeTextEditor!;
  const document = editor.document;
  const newSelections = [];

  for (const selection of editor.selections) {
    const position = selection.active;
    let newPosition: vscode.Position | undefined = undefined;

    if (direction === Direction.Forward) {
      let lineAt = position.line;
      let characterAt = position.character;
      while (lineAt < document.lineCount) {
        const line = document.lineAt(lineAt).text;
        const match = /\s+/.exec(line.substring(characterAt));

        if (match) {
          newPosition = new vscode.Position(
            lineAt,
            characterAt + match.index + match[0].length
          );

          break;
        }

        lineAt++;
        characterAt = 0;
      }
    } else {
      let lineAt = position.line;
      let characterAt = position.character;
      while (lineAt >= 0) {
        const line = document.lineAt(lineAt).text;
        if (characterAt < 0) characterAt = line.length;
        const substring = line.substring(0, characterAt).trimEnd();
        const match = /\s+(?=\S*$)/.exec(substring);

        if (match) {
          newPosition = new vscode.Position(
            lineAt,
            match.index + match[0].length
          );
          break;
        }

        lineAt--;
        characterAt = -1;
      }
    }

    if (newPosition) {
      if (select) {
        newSelections.push(new vscode.Selection(selection.anchor, newPosition));
      } else {
        newSelections.push(new vscode.Selection(newPosition, newPosition));
      }
    } else {
      newSelections.push(selection);
    }
  }

  editor.selections = newSelections;
}

// Implementation for moving to specified character
function moveToChar(
  char: string,
  direction: Direction,
  select: boolean,
  context: vscode.ExtensionContext
) {
  if (!checkActiveEditor()) return;
  const editor = vscode.window.activeTextEditor!;
  const document = editor.document;
  const position = editor.selection.active;
  const line = document.lineAt(position.line).text;
  let newPosition: vscode.Position;

  // Update global state
  context.globalState.update(LAST_CHAR_KEY, char);
  context.globalState.update(LAST_DIRECTION_KEY, direction);

  if (direction === Direction.Forward) {
    const index = line.indexOf(char, position.character + 1);
    if (index === -1) {
      vscode.window.showInformationMessage(`Next char "${char}" not found`);
      return;
    }
    newPosition = new vscode.Position(position.line, index);
  } else {
    const substring = line.substring(0, position.character);
    const index = substring.lastIndexOf(char);
    if (index === -1) {
      vscode.window.showInformationMessage(`Previous char "${char}" not found`);
      return;
    }
    newPosition = new vscode.Position(position.line, index);
  }

  moveCursor(editor, newPosition, select);
}

// Implementation for moving to last used character
function moveToLastChar(
  direction: Direction,
  select: boolean,
  context: vscode.ExtensionContext
) {
  const lastChar = context.globalState.get<string>(LAST_CHAR_KEY);
  if (!lastChar) {
    vscode.window.showErrorMessage("Last character not found");
    return;
  }
  moveToChar(lastChar, direction, select, context);
}

export function activate(context: vscode.ExtensionContext) {
  // Whitespace-related commands
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "vscode-extended-move.moveToNextWhitespace",
      () => {
        moveToWhitespace(Direction.Forward, false);
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "vscode-extended-move.moveToPreviousWhitespace",
      () => {
        moveToWhitespace(Direction.Backward, false);
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "vscode-extended-move.moveToNextWhitespaceSelect",
      () => {
        moveToWhitespace(Direction.Forward, true);
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "vscode-extended-move.moveToPreviousWhitespaceSelect",
      () => {
        moveToWhitespace(Direction.Backward, true);
      }
    )
  );

  // Single character commands
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "vscode-extended-move.moveToNextChar",
      async () => {
        const char = await vscode.window.showInputBox({
          prompt: "Input the character to move to",
          placeHolder: "Single character",
        });
        if (char && char.length === 1) {
          moveToChar(char, Direction.Forward, false, context);
        }
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "vscode-extended-move.moveToPreviousChar",
      async () => {
        const char = await vscode.window.showInputBox({
          prompt: "Input the character to move to",
          placeHolder: "Single character",
        });
        if (char && char.length === 1) {
          moveToChar(char, Direction.Backward, false, context);
        }
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "vscode-extended-move.moveToNextCharSelect",
      async () => {
        const char = await vscode.window.showInputBox({
          prompt: "Input the character to move to",
          placeHolder: "Single character",
        });
        if (char && char.length === 1) {
          moveToChar(char, Direction.Forward, true, context);
        }
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "vscode-extended-move.moveToPreviousCharSelect",
      async () => {
        const char = await vscode.window.showInputBox({
          prompt: "Input the character to move to",
          placeHolder: "Single character",
        });
        if (char && char.length === 1) {
          moveToChar(char, Direction.Backward, true, context);
        }
      }
    )
  );

  // History reuse commands
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "vscode-extended-move.moveToNextCharWithLast",
      () => {
        moveToLastChar(Direction.Forward, false, context);
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "vscode-extended-move.moveToPreviousCharWithLast",
      () => {
        moveToLastChar(Direction.Backward, false, context);
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "vscode-extended-move.moveToNextCharWithLastSelect",
      () => {
        moveToLastChar(Direction.Forward, true, context);
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "vscode-extended-move.moveToPreviousCharWithLastSelect",
      () => {
        moveToLastChar(Direction.Backward, true, context);
      }
    )
  );
}

export function deactivate() {}
