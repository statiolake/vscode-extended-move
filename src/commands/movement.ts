import * as vscode from "vscode";
import { Direction, LAST_CHAR_KEY } from "../types";
import { checkActiveEditor, updateSelections } from "../core/utils";
import {
  findNextWhitespace,
  findPreviousWhitespace,
  findNextChar,
  findPreviousChar,
} from "../core/position-finders";

/**
 * Move cursor to next/previous whitespace
 */
export function moveToWhitespace(direction: Direction, select: boolean) {
  if (!checkActiveEditor()) return;
  const editor = vscode.window.activeTextEditor!;
  const document = editor.document;

  updateSelections(
    editor,
    (position) =>
   direction === Direction.Forward
        ? findNextWhitespace(document, position)
        : findPreviousWhitespace(document, position),
    select
  );
}

/**
 * Move cursor to next/previous occurrence of specified character
 */
export function moveToChar(
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

/**
 * Move cursor to next/previous occurrence of last used character
 */
export function moveToLastChar(
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
