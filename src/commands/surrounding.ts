import * as vscode from "vscode";
import { checkActiveEditor, updateSelections } from "../core/utils";
import {
  findNextClosingBracket,
  findPreviousClosingBracket,
} from "../core/position-finders";

/**
 * Exit the current surrounding brackets/quotes
 * Moves cursor forward to just after the next closing bracket/quote
 */
export function exitCurrentSurrounding() {
  if (!checkActiveEditor()) {return;}
  const editor = vscode.window.activeTextEditor!;
  const document = editor.document;

  updateSelections(editor, (position) => {
    const closingPos = findNextClosingBracket(document, position);
    if (closingPos) {
      // Move to the position after the closing bracket
      return new vscode.Position(closingPos.line, closingPos.character + 1);
    }
    return undefined;
  }, false);
}

/**
 * Enter the previous surrounding brackets/quotes
 * Moves cursor backward to just before the previous closing bracket/quote
 */
export function enterPreviousSurrounding() {
  if (!checkActiveEditor()) {return;}
  const editor = vscode.window.activeTextEditor!;
  const document = editor.document;

  updateSelections(editor, (position) => {
    const closingPos = findPreviousClosingBracket(document, position);
    if (closingPos) {
      // Move to just before the closing bracket
      return closingPos;
    }
    return undefined;
  }, false);
}
