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

// Find position of next whitespace
function findNextWhitespace(
  document: vscode.TextDocument,
  position: vscode.Position
): vscode.Position | undefined {
  let lineAt = position.line;
  let characterAt = position.character;

  while (lineAt < document.lineCount) {
    const line = document.lineAt(lineAt).text;
    const match = /\s+/.exec(line.substring(characterAt));

    if (match) {
      return new vscode.Position(
        lineAt,
        characterAt + match.index + match[0].length
      );
    }

    lineAt++;
    characterAt = 0;
  }

  return undefined;
}

// Find position of previous whitespace
function findPreviousWhitespace(
  document: vscode.TextDocument,
  position: vscode.Position
): vscode.Position | undefined {
  let lineAt = position.line;
  let characterAt = position.character;

  while (lineAt >= 0) {
    const line = document.lineAt(lineAt).text;
    if (characterAt < 0) characterAt = line.length;
    const substring = line.substring(0, characterAt).trimEnd();
    const match = /\s+(?=\S*$)/.exec(substring);

    if (match) {
      return new vscode.Position(lineAt, match.index + match[0].length);
    }

    lineAt--;
    characterAt = -1;
  }

  return undefined;
}

// Implementation for moving to whitespace with line boundary handling
function moveToWhitespace(direction: Direction, select: boolean) {
  if (!checkActiveEditor()) return;
  const editor = vscode.window.activeTextEditor!;
  const document = editor.document;
  const newSelections = [];

  for (const selection of editor.selections) {
    const position = selection.active;
    const newPosition =
      direction === Direction.Forward
        ? findNextWhitespace(document, position)
        : findPreviousWhitespace(document, position);

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

// Common function to update selections
function updateSelections(
  editor: vscode.TextEditor,
  findPosition: (position: vscode.Position) => vscode.Position | undefined,
  select: boolean
): { found: boolean } {
  let found = false;
  editor.selections = editor.selections.map((selection) => {
    const newPosition = findPosition(selection.active);
    if (!newPosition) return selection;

    found = true;
    return new vscode.Selection(
      select ? selection.anchor : newPosition,
      newPosition
    );
  });
  return { found };
}

// Find position of next character occurrence
function findNextChar(
  document: vscode.TextDocument,
  position: vscode.Position,
  char: string
): vscode.Position | undefined {
  const line = document.lineAt(position.line).text;
  const index = line.indexOf(char, position.character + 1);
  return index !== -1 ? new vscode.Position(position.line, index) : undefined;
}

// Find position of previous character occurrence
function findPreviousChar(
  document: vscode.TextDocument,
  position: vscode.Position,
  char: string
): vscode.Position | undefined {
  const line = document.lineAt(position.line).text;
  const substring = line.substring(0, position.character);
  const index = substring.lastIndexOf(char);
  return index !== -1 ? new vscode.Position(position.line, index) : undefined;
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

  // Update global state
  context.globalState.update(LAST_CHAR_KEY, char);
  context.globalState.update(LAST_DIRECTION_KEY, direction);

  const { found } = updateSelections(
    editor,
    (position) =>
      direction === Direction.Forward
        ? findNextChar(document, position, char)
        : findPreviousChar(document, position, char),
    select
  );

  if (!found) {
    const message =
      direction === Direction.Forward
        ? `Next char "${char}" not found`
        : `Previous char "${char}" not found`;
    vscode.window.showInformationMessage(message);
  }
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
