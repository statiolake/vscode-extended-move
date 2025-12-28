import * as assert from "node:assert";
import * as vscode from "vscode";
import {
  findNextClosingBracket,
  findPreviousClosingBracket,
} from "../core/position-finders";

suite("Surrounding bracket/quote navigation", () => {
  suite("findNextClosingBracket", () => {
    // Helper function to create a real TextDocument
    async function createTestDocument(
      text: string
    ): Promise<vscode.TextDocument> {
      return await vscode.workspace.openTextDocument({
        content: text,
        language: "plaintext",
      });
    }

    test("should find closing paren when only whitespace/punctuation between cursor and bracket", async () => {
      const text = "foo(bar, )";
      const doc = await createTestDocument(text);
      // cursor at position after 'bar'
      const position = new vscode.Position(0, 7);

      const result = findNextClosingBracket(doc, position);
      assert.ok(result);
      assert.strictEqual(result!.line, 0);
      assert.strictEqual(result!.character, 9); // closing paren position
    });

    test("should find closing paren when cursor is right before it", async () => {
      const text = "foo(bar)";
      const doc = await createTestDocument(text);
      const position = new vscode.Position(0, 7); // right before ')'

      const result = findNextClosingBracket(doc, position);
      assert.ok(result);
      assert.strictEqual(result!.character, 7);
    });

    test("should return undefined when non-whitespace/punctuation char exists between cursor and closing bracket", async () => {
      const text = "foo(bar)";
      const doc = await createTestDocument(text);
      const position = new vscode.Position(0, 5); // at 'a' in 'bar'

      const result = findNextClosingBracket(doc, position);
      assert.strictEqual(result, undefined);
    });

    test("should skip comma and whitespace to find closing bracket", async () => {
      const text = "foo(a, b, )";
      const doc = await createTestDocument(text);
      const position = new vscode.Position(0, 8); // after 'b'

      const result = findNextClosingBracket(doc, position);
      assert.ok(result);
      assert.strictEqual(result!.character, 10);
    });

    test("should find closing bracket", async () => {
      const text = "arr[, ]";
      const doc = await createTestDocument(text);
      const position = new vscode.Position(0, 4);

      const result = findNextClosingBracket(doc, position);
      assert.ok(result);
      assert.strictEqual(result!.character, 6); // closing bracket
    });

    test("should find closing quote", async () => {
      const text = '"hello, "';
      const doc = await createTestDocument(text);
      const position = new vscode.Position(0, 7); // cursor after comma and space

      const result = findNextClosingBracket(doc, position);
      assert.ok(result);
      assert.strictEqual(result!.character, 8); // closing quote
    });

    test("should handle multiline with only whitespace", async () => {
      const text = "foo(\n  \n)";
      const doc = await createTestDocument(text);
      const position = new vscode.Position(0, 4); // right after opening paren

      const result = findNextClosingBracket(doc, position);
      assert.ok(result);
      assert.strictEqual(result!.line, 2);
      assert.strictEqual(result!.character, 0); // closing paren
    });

    test("should return undefined if content exists before closing bracket", async () => {
      const text = "foo(\n  bar\n)";
      const doc = await createTestDocument(text);
      const position = new vscode.Position(0, 4); // right after opening paren

      const result = findNextClosingBracket(doc, position);
      assert.strictEqual(result, undefined);
    });

    test("should return undefined if no closing bracket found", async () => {
      const text = "hello world";
      const doc = await createTestDocument(text);
      const position = new vscode.Position(0, 5);

      const result = findNextClosingBracket(doc, position);
      assert.strictEqual(result, undefined);
    });

    test("should allow multiple punctuation characters", async () => {
      const text = "foo(;:,. )";
      const doc = await createTestDocument(text);
      const position = new vscode.Position(0, 4);

      const result = findNextClosingBracket(doc, position);
      assert.ok(result);
      assert.strictEqual(result!.character, 9);
    });
  });

  suite("findPreviousClosingBracket", () => {
    // Helper function to create a real TextDocument
    async function createTestDocument(
      text: string
    ): Promise<vscode.TextDocument> {
      return await vscode.workspace.openTextDocument({
        content: text,
        language: "plaintext",
      });
    }

    test("should enter bracket when immediately after closing paren", async () => {
      const text = "foo(hello)";
      const doc = await createTestDocument(text);
      const position = new vscode.Position(0, 10); // right after ')'

      const result = findPreviousClosingBracket(doc, position);
      assert.ok(result);
      assert.strictEqual(result!.line, 0);
      assert.strictEqual(result!.character, 9); // right after 'hello', before ')'
    });

    test("should skip trailing whitespace and punctuation when entering bracket", async () => {
      const text = "foo(bar, )";
      const doc = await createTestDocument(text);
      const position = new vscode.Position(0, 10); // right after ')'

      const result = findPreviousClosingBracket(doc, position);
      assert.ok(result);
      // Should skip ', ' and land after 'bar'
      assert.strictEqual(result!.character, 7);
    });

    test("should return undefined when previous char is not a closing bracket", async () => {
      const text = "foo(hello) bar";
      const doc = await createTestDocument(text);
      const position = new vscode.Position(0, 14); // after 'bar'

      const result = findPreviousClosingBracket(doc, position);
      assert.strictEqual(result, undefined);
    });

    test("should return undefined when previous char is space", async () => {
      const text = "foo(hello) ";
      const doc = await createTestDocument(text);
      const position = new vscode.Position(0, 11); // after space

      const result = findPreviousClosingBracket(doc, position);
      assert.strictEqual(result, undefined);
    });

    test("should work with closing bracket", async () => {
      const text = "arr[0, ]";
      const doc = await createTestDocument(text);
      const position = new vscode.Position(0, 8); // right after ']'

      const result = findPreviousClosingBracket(doc, position);
      assert.ok(result);
      // Should skip ', ' and land after '0'
      assert.strictEqual(result!.character, 5);
    });

    test("should work with closing quote", async () => {
      const text = '"hello, "';
      const doc = await createTestDocument(text);
      const position = new vscode.Position(0, 9); // right after closing quote

      const result = findPreviousClosingBracket(doc, position);
      assert.ok(result);
      // Should skip ', ' and land after 'hello'
      assert.strictEqual(result!.character, 6);
    });

    test("should stop at non-punctuation character", async () => {
      const text = "foo(bar baz, )";
      const doc = await createTestDocument(text);
      const position = new vscode.Position(0, 14); // right after ')'

      const result = findPreviousClosingBracket(doc, position);
      assert.ok(result);
      // Should skip ', ' and land after 'baz'
      assert.strictEqual(result!.character, 11);
    });

    test("should handle empty brackets", async () => {
      const text = "foo()";
      const doc = await createTestDocument(text);
      const position = new vscode.Position(0, 5); // right after ')'

      const result = findPreviousClosingBracket(doc, position);
      assert.ok(result);
      // Should land right after opening paren
      assert.strictEqual(result!.character, 4);
    });

    test("should handle brackets with only whitespace/punctuation", async () => {
      const text = "foo(  , )";
      const doc = await createTestDocument(text);
      const position = new vscode.Position(0, 9); // right after ')'

      const result = findPreviousClosingBracket(doc, position);
      assert.ok(result);
      // Should skip all whitespace/punctuation and land right after opening paren
      assert.strictEqual(result!.character, 4);
    });

    test("should return undefined if at beginning of document", async () => {
      const text = "hello";
      const doc = await createTestDocument(text);
      const position = new vscode.Position(0, 0);

      const result = findPreviousClosingBracket(doc, position);
      assert.strictEqual(result, undefined);
    });

    test("should work with nested brackets - enter outer", async () => {
      const text = "foo(bar[baz])";
      const doc = await createTestDocument(text);
      const position = new vscode.Position(0, 13); // right after outer ')'

      const result = findPreviousClosingBracket(doc, position);
      assert.ok(result);
      // Should land right after ']'
      assert.strictEqual(result!.character, 12);
    });

    test("should work with nested brackets - enter inner", async () => {
      const text = "foo(bar[baz])";
      const doc = await createTestDocument(text);
      const position = new vscode.Position(0, 12); // right after ']'

      const result = findPreviousClosingBracket(doc, position);
      assert.ok(result);
      // Should land right after 'baz'
      assert.strictEqual(result!.character, 11);
    });

    test("exit and enter should be inverse operations", async () => {
      const text = "foo(bar, )";
      const doc = await createTestDocument(text);

      // Start inside the bracket after 'bar'
      const startPos = new vscode.Position(0, 7);

      // Exit: should find closing bracket at position 9
      const exitResult = findNextClosingBracket(doc, startPos);
      assert.ok(exitResult);
      assert.strictEqual(exitResult!.character, 9);

      // After exit, cursor would be at position 10 (after closing bracket)
      const afterExitPos = new vscode.Position(0, 10);

      // Enter: should go back to position 7
      const enterResult = findPreviousClosingBracket(doc, afterExitPos);
      assert.ok(enterResult);
      assert.strictEqual(enterResult!.character, 7);
    });
  });
});
