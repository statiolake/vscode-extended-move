import * as vscode from "vscode";

/**
 * Common function for checking if there is an active editor
 */
export function checkActiveEditor(): boolean {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showErrorMessage("Editor is not active");
    return false;
  }
  return true;
}

/**
 * Common function to update selections with new positions
 */
export function updateSelections(
  editor: vscode.TextEditor,
  findPosition: (position: vscode.Position) => vscode.Position | undefined,
  select: boolean
): { found: boolean } {
  let found = false;
  editor.selections = editor.selections.map((selection) => {
    const newPosition = findPosition(selection.active);
    if (!newPosition) {return selection;}

    found = true;
    return new vscode.Selection(
      select ? selection.anchor : newPosition,
      newPosition
    );
  });
  return { found };
}
