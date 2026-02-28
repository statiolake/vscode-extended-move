import * as vscode from "vscode";
import { Direction } from "./types";
import {
  moveToWhitespace,
  moveToChar,
  moveToLastChar,
} from "./commands/movement";
import {
  exitCurrentSurrounding,
  enterPreviousSurrounding,
} from "./commands/surrounding";
import { createQuickPickItems, getTextObjectById, textObjectDefinitions } from "./textObject/textObjects";
import type { TextObjectId } from "./textObject/textObjectTypes";

/**
 * テキストオブジェクトの選択を実行する
 */
async function executeTextObjectSelection(editor: vscode.TextEditor, textObjectId: TextObjectId): Promise<void> {
  const textObject = getTextObjectById(textObjectId);
  if (!textObject) {
    vscode.window.showErrorMessage(`Unknown text object: ${textObjectId}`);
    return;
  }

  const document = editor.document;
  const newSelections: vscode.Selection[] = [];

  for (const selection of editor.selections) {
    const position = selection.active;
    const range = textObject.compute(document, position);

    if (range && !range.isEmpty) {
      newSelections.push(new vscode.Selection(range.start, range.end));
    } else {
      newSelections.push(selection);
    }
  }

  if (newSelections.length > 0) {
    editor.selections = newSelections;
    editor.revealRange(newSelections[0], vscode.TextEditorRevealType.InCenterIfOutsideViewport);
  }
}

/**
 * QuickPick を表示してテキストオブジェクトを選択
 */
async function showTextObjectQuickPick(editor: vscode.TextEditor): Promise<void> {
  const allItems = createQuickPickItems();

  const quickPick = vscode.window.createQuickPick<(typeof allItems)[0]>();
  quickPick.items = allItems;
  quickPick.placeholder = 'Select a text object (type to filter, case-sensitive for uppercase)';

  quickPick.onDidChangeValue((value) => {
    if (!value) {
      quickPick.items = allItems;
      return;
    }

    const shortcutMatches = allItems.filter((item) => {
      const shortcuts = item.description.split(' ');
      return shortcuts.some((s) => s.startsWith(value));
    });

    if (shortcutMatches.length > 0) {
      quickPick.items = shortcutMatches;
      return;
    }

    const fuzzyMatches = allItems.filter((item) => {
      const target = `${item.label} ${item.description}`.toLowerCase();
      return target.includes(value.toLowerCase());
    });
    quickPick.items = fuzzyMatches;
  });

  return new Promise((resolve) => {
    quickPick.onDidAccept(async () => {
      const selected = quickPick.selectedItems[0];
      if (selected) {
        quickPick.hide();
        await executeTextObjectSelection(editor, selected.id);
      }
      resolve();
    });

    quickPick.onDidHide(() => {
      quickPick.dispose();
      resolve();
    });

    quickPick.show();
  });
}

/**
 * vscode-extended-move.selectTextObject コマンドのハンドラ
 */
async function selectTextObjectCommand(args?: { textObject?: TextObjectId }): Promise<void> {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showErrorMessage('No active text editor');
    return;
  }

  if (args?.textObject) {
    await executeTextObjectSelection(editor, args.textObject);
  } else {
    await showTextObjectQuickPick(editor);
  }
}

/**
 * TextObjectId をコマンド ID に変換する
 * 例: inner-word → vscode-extended-move.innerWordSelect
 *     around-WORD → vscode-extended-move.aroundWORDSelect
 *     inner-double-quote → vscode-extended-move.innerDoubleQuoteSelect
 */
function textObjectCommandId(id: TextObjectId): string {
  const camelId = id.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase()).replace(/-([A-Z]+)/g, (_, c: string) => c);
  return `vscode-extended-move.${camelId}Select`;
}

export function activate(context: vscode.ExtensionContext) {
  // Whitespace-related commands
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "vscode-extended-move.cursorNextWhitespace",
      () => {
        moveToWhitespace(Direction.Forward, false);
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "vscode-extended-move.cursorPrevWhitespace",
      () => {
        moveToWhitespace(Direction.Backward, false);
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "vscode-extended-move.cursorNextWhitespaceSelect",
      () => {
        moveToWhitespace(Direction.Forward, true);
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "vscode-extended-move.cursorPrevWhitespaceSelect",
      () => {
        moveToWhitespace(Direction.Backward, true);
      }
    )
  );

  // Single character commands
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "vscode-extended-move.cursorNextChar",
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
      "vscode-extended-move.cursorPrevChar",
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
      "vscode-extended-move.cursorNextCharSelect",
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
      "vscode-extended-move.cursorPrevCharSelect",
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
      "vscode-extended-move.cursorNextCharWithLast",
      () => {
        moveToLastChar(Direction.Forward, false, context);
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "vscode-extended-move.cursorPrevCharWithLast",
      () => {
        moveToLastChar(Direction.Backward, false, context);
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "vscode-extended-move.cursorNextCharWithLastSelect",
      () => {
        moveToLastChar(Direction.Forward, true, context);
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "vscode-extended-move.cursorPrevCharWithLastSelect",
      () => {
        moveToLastChar(Direction.Backward, true, context);
      }
    )
  );

  // Exit surrounding brackets/quotes commands
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "vscode-extended-move.cursorExitSurrounding",
      () => {
        exitCurrentSurrounding();
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "vscode-extended-move.cursorEnterSurrounding",
      () => {
        enterPreviousSurrounding();
      }
    )
  );

  // Text object selection commands
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "vscode-extended-move.selectTextObject",
      selectTextObjectCommand
    )
  );

  for (const def of textObjectDefinitions) {
    const commandId = textObjectCommandId(def.id);
    context.subscriptions.push(
      vscode.commands.registerCommand(commandId, async () => {
        await selectTextObjectCommand({ textObject: def.id });
      })
    );
  }
}

export function deactivate() {}
