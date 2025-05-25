import * as vscode from "vscode";
import { Direction } from "./types";
import {
  moveToWhitespace,
  moveToChar,
  moveToLastChar,
} from "./commands/movement";

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
