import * as vscode from "vscode";

/**
 * Find position of next whitespace occurrence
 */
export function findNextWhitespace(
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

/**
 * Find position of previous whitespace occurrence
 */
export function findPreviousWhitespace(
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

/**
 * Find position of next character occurrence
 */
export function findNextChar(
  document: vscode.TextDocument,
  position: vscode.Position,
  char: string
): vscode.Position | undefined {
  const line = document.lineAt(position.line).text;
  const index = line.indexOf(char, position.character + 1);
  return index !== -1 ? new vscode.Position(position.line, index) : undefined;
}

/**
 * Find position of previous character occurrence
 */
export function findPreviousChar(
  document: vscode.TextDocument,
  position: vscode.Position,
  char: string
): vscode.Position | undefined {
  const line = document.lineAt(position.line).text;
  const substring = line.substring(0, position.character);
  const index = substring.lastIndexOf(char);
  return index !== -1 ? new vscode.Position(position.line, index) : undefined;
}
