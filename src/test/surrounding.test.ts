import * as assert from "node:assert";
import * as vscode from "vscode";
import {
  findNextClosingBracket,
  findPreviousClosingBracket,
} from "../core/position-finders";

suite("Surrounding bracket/quote navigation", () => {
  suite("findNextClosingBracket", () => {
    // Helper function to create a real TextDocument
    async function createTestDocument(text: string): Promise<vscode.TextDocument> {
      return await vscode.workspace.openTextDocument({
        content: text,
        language: "plaintext",
      });
    }

    test("should find closing paren and move cursor after it", async () => {
      const text = "foo(hello)";
      const doc = await createTestDocument(text);
      // cursor at position line=0, char=8 = 'o' in hello
      const position = new vscode.Position(0, 8);

      const result = findNextClosingBracket(doc, position);
      assert.ok(result);
      assert.strictEqual(result!.line, 0);
      assert.strictEqual(result!.character, 9); // closing paren position
    });

    test("should find closing bracket", async () => {
      const text = "arr[0]";
      const doc = await createTestDocument(text);
      const position = new vscode.Position(0, 4);

      const result = findNextClosingBracket(doc, position);
      assert.ok(result);
      assert.strictEqual(result!.character, 5); // closing bracket
    });

    test("should handle nested brackets", async () => {
      const text = "foo(bar[baz])";
      const doc = await createTestDocument(text);
      const position = new vscode.Position(0, 10); // cursor in 'baz'

      const result = findNextClosingBracket(doc, position);
      assert.ok(result);
      // Should find the bracket ] first
      assert.strictEqual(result!.character, 11);
    });

    test("should find closing quote", async () => {
      const text = 'str"hello"';
      const doc = await createTestDocument(text);
      const position = new vscode.Position(0, 5); // cursor inside quotes

      const result = findNextClosingBracket(doc, position);
      assert.ok(result);
      assert.strictEqual(result!.character, 9); // closing quote
    });

    test("should handle escaped quotes", async () => {
      const text = 'str"hel\\"lo"';
      const doc = await createTestDocument(text);
      const position = new vscode.Position(0, 5);

      const result = findNextClosingBracket(doc, position);
      assert.ok(result);
      // Should find the real closing quote at position 11, skipping escaped quote at position 8
      assert.strictEqual(result!.character, 11);
    });

    test("should handle multiline text", async () => {
      const text = "foo(\n  bar\n)";
      const doc = await createTestDocument(text);
      const position = new vscode.Position(1, 4); // cursor on line 1

      const result = findNextClosingBracket(doc, position);
      assert.ok(result);
      assert.strictEqual(result!.line, 2);
      assert.strictEqual(result!.character, 0); // closing paren
    });

    test("should return undefined if no closing bracket found", async () => {
      const text = "hello world";
      const doc = await createTestDocument(text);
      const position = new vscode.Position(0, 5);

      const result = findNextClosingBracket(doc, position);
      assert.strictEqual(result, undefined);
    });
  });

  suite("findPreviousClosingBracket", () => {
    // Helper function to create a real TextDocument
    async function createTestDocument(text: string): Promise<vscode.TextDocument> {
      return await vscode.workspace.openTextDocument({
        content: text,
        language: "plaintext",
      });
    }

    test("should find closing paren before cursor", async () => {
      const text = "foo(hello) bar";
      const doc = await createTestDocument(text);
      const position = new vscode.Position(0, 11); // after closing paren

      const result = findPreviousClosingBracket(doc, position);
      assert.ok(result);
      assert.strictEqual(result!.line, 0);
      assert.strictEqual(result!.character, 9); // closing paren
    });

    test("should find closing bracket before cursor", async () => {
      const text = "arr[0] next";
      const doc = await createTestDocument(text);
      const position = new vscode.Position(0, 7);

      const result = findPreviousClosingBracket(doc, position);
      assert.ok(result);
      assert.strictEqual(result!.character, 5); // closing bracket
    });

    test("should handle nested brackets", async () => {
      const text = "foo(bar[baz]) end";
      const doc = await createTestDocument(text);
      const position = new vscode.Position(0, 15); // after all brackets

      const result = findPreviousClosingBracket(doc, position);
      assert.ok(result);
      // Should find the closing ')' first (most recent closing bracket going backwards)
      assert.strictEqual(result!.character, 12);
    });

    test("should find closing quote before cursor", async () => {
      const text = 'str"hello" next';
      const doc = await createTestDocument(text);
      const position = new vscode.Position(0, 11);

      const result = findPreviousClosingBracket(doc, position);
      assert.ok(result);
      assert.strictEqual(result!.character, 9); // closing quote
    });

    test("should handle escaped quotes", async () => {
      const text = 'str"hel\\"lo" next';
      const doc = await createTestDocument(text);
      const position = new vscode.Position(0, 13);

      const result = findPreviousClosingBracket(doc, position);
      assert.ok(result);
      // Should find the real closing quote, not the escaped one
      assert.strictEqual(result!.character, 11);
    });

    test("should handle multiline text", async () => {
      const text = "foo(\n  bar\n)\nend";
      const doc = await createTestDocument(text);
      const position = new vscode.Position(3, 1);

      const result = findPreviousClosingBracket(doc, position);
      assert.ok(result);
      assert.strictEqual(result!.line, 2);
      assert.strictEqual(result!.character, 0); // closing paren
    });

    test("should return undefined if no closing bracket found", async () => {
      const text = "hello world";
      const doc = await createTestDocument(text);
      const position = new vscode.Position(0, 5);

      const result = findPreviousClosingBracket(doc, position);
      assert.strictEqual(result, undefined);
    });
  });
});
